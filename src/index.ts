import * as path from 'path';
import * as ts from 'typescript';
import { isDefined, isMatch } from './lib';
import { ExportedItem, GetDocOptions, UNSUPPORTED_SYMBOLS } from './type';

const getRelativePath = (rootDir: string, targetPath: string) =>
  path
    .relative(rootDir, targetPath.replace(/^"|"$/g, ''))
    .replace(new RegExp(`\\${path.sep}`, 'g'), '/');

export function tsDoc(options: GetDocOptions) {
  const rootDir = (require.main && path.dirname(require.main.filename)) || '';

  // (1) Create the program
  const program = ts.createProgram({
    options: {
      target: ts.ScriptTarget.ESNext,
    },
    rootNames: options.files.map(file => path.resolve(rootDir, file)),
  });

  // (2) Get the non-declaration (.d.ts) source files (.ts)
  const nonDeclFiles = program
    .getSourceFiles()
    .filter(sf => !sf.isDeclarationFile);

  // (3) get the type-checker
  const checker = program.getTypeChecker();

  /**
   * (4) use the type checker to obtain the
   * -   appropriate ts.Symbol for each SourceFile
   */
  const sfSymbols = nonDeclFiles
    .map(
      f =>
        [checker.getSymbolAtLocation(f), f.fileName] as [
          ts.Symbol | undefined,
          string
        ]
    )
    .filter(
      ([f, absoluteFilePath]) =>
        isDefined(f) &&
        (!options.excludes ||
          !isMatch(
            getRelativePath(rootDir, absoluteFilePath),
            options.excludes
          ))
    ) as Array<[ts.Symbol, string]>;

  // (5) for each SourceFile Symbol
  return sfSymbols
    .map(([sfSymbol, absoluteFilePath]) => {
      const { exports: fileExports } = sfSymbol;

      if (!fileExports) {
        return;
      }

      const items: ExportedItem[] = [];

      const relativePath = getRelativePath(rootDir, sfSymbol.name);

      fileExports.forEach((value, key) => {
        const jsDocTags = value.getJsDocTags();

        if (
          UNSUPPORTED_SYMBOLS.includes(value.getFlags()) ||
          (!options.showPrivate &&
            jsDocTags.some(tag => tag.name === 'private'))
        ) {
          return;
        }

        const type = checker.getTypeAtLocation(value.valueDeclaration);

        const signatures = type.getCallSignatures();
        if (signatures.length > 1) {
          console.info(
            `Multiple signature available for ${key.toString()}, we will only take the first one`
          );
        }
        const signature = signatures[0];
        const returnType = signature && signature.getReturnType();
        const paramTypes =
          (signature &&
            signature.getParameters().map(parameterSymbol => ({
              name: parameterSymbol.name,
              type: checker.typeToString(
                checker.getTypeAtLocation(parameterSymbol.valueDeclaration)
              ),
            }))) ||
          [];

        items.push({
          name: key.toString(),
          typeString: checker.typeToString(
            checker.getTypeAtLocation(value.valueDeclaration)
          ),
          comments: value.getDocumentationComment(checker).map(cm => cm.text),
          params: paramTypes.map(param => ({
            name: param.name,
            type: param.type,
            description: jsDocTags
              .filter(tag => tag.name === 'param' && !!tag.text)
              .map(tag => {
                const [name, ...rest] = (tag.text as string).split(' ');
                return {
                  name,
                  description: rest.join(' '),
                };
              })
              .filter(({ name }) => name === param.name)
              .map(({ description }) => description)[0],
          })),
          returns: {
            type: returnType && checker.typeToString(returnType),
            description: jsDocTags
              .filter(tag => tag.name === 'returns')
              .map(tag => tag.text)[0],
          },
          jsDocTags,
        });
      });

      const fileInfo = path.parse(absoluteFilePath);

      return {
        items,
        relativePath,
        /** absolute path of the source code, you can extract the required info using `path.parse` */
        absoluteFilePath,
        fileName: fileInfo.name,
      };
    })
    .filter(isDefined);
}

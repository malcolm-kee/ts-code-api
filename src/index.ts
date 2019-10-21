import * as path from 'path';
import * as ts from 'typescript';
import { isDefined, isMatch } from './lib';
import { ExportedItem, GetDocOptions, UNSUPPORTED_SYMBOLS } from './type';

const getRelativePath = (rootDir: string, targetPath: string) =>
  path
    .relative(rootDir, targetPath.replace(/^"|"$/g, ''))
    .replace(new RegExp(`\\${path.sep}`, 'g'), '/');

export function tsDoc({
  files,
  excludes,
  showPrivate,
  warnIfParamMissingJsDoc = true,
}: GetDocOptions) {
  const rootDir = (require.main && path.dirname(require.main.filename)) || '';

  // (1) Create the program
  const program = ts.createProgram({
    options: {
      target: ts.ScriptTarget.ESNext,
    },
    rootNames: files.map(file => path.resolve(rootDir, file)),
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
        [checker.getSymbolAtLocation(f), f.fileName, f] as [
          ts.Symbol | undefined,
          string,
          ts.SourceFile
        ]
    )
    .filter(
      ([f, absoluteFilePath]) =>
        isDefined(f) &&
        (!excludes ||
          !isMatch(getRelativePath(rootDir, absoluteFilePath), excludes))
    ) as Array<[ts.Symbol, string, ts.SourceFile]>;

  // (5) for each SourceFile Symbol
  return sfSymbols
    .map(([sfSymbol, absoluteFilePath, sourceFile]) => {
      const { exports: fileExports } = sfSymbol;

      if (!fileExports) {
        return;
      }
      const fileInfo = path.parse(absoluteFilePath);

      const allSourceCode = sourceFile.getFullText();
      const leadingComment = ts.getLeadingCommentRanges(allSourceCode, 0);

      /**
       * @todo: Use non-standard `// overview:` convention because typescript doesn't support this type of comment AFAIK
       */
      const fileComment =
        leadingComment &&
        leadingComment
          .filter(
            range =>
              range.kind === ts.SyntaxKind.SingleLineCommentTrivia &&
              range.pos === 0 &&
              /@overview:/.test(allSourceCode.substring(range.pos, range.end))
          )
          .map(range =>
            allSourceCode
              .substring(range.pos + 2, range.end)
              .split('@overview:')[1]
              .trim()
          )[0];

      const items: ExportedItem[] = [];

      const relativePath = getRelativePath(rootDir, sfSymbol.name);

      fileExports.forEach((value, key) => {
        const jsDocTags = value.getJsDocTags();

        if (
          UNSUPPORTED_SYMBOLS.includes(value.getFlags()) ||
          (!showPrivate && jsDocTags.some(tag => tag.name === 'private'))
        ) {
          return;
        }

        const type = checker.getTypeAtLocation(value.valueDeclaration);

        const callSignatures = type.getCallSignatures();

        if (callSignatures.length === 0) {
          items.push({
            isFunction: false,
            name: key.toString(),
            typeString: checker.typeToString(
              checker.getTypeAtLocation(value.valueDeclaration)
            ),
            comments: value.getDocumentationComment(checker).map(cm => cm.text),
            jsDocTags,
          });
        } else {
          if (callSignatures.length > 1) {
            console.info(
              `Multiple signature available for ${key.toString()}, we will take the last one`
            );
          }
          const callSignature = callSignatures[callSignatures.length - 1];
          const returnType = callSignature && callSignature.getReturnType();
          const paramTypes =
            (callSignature &&
              callSignature.getParameters().map(parameterSymbol => ({
                name: parameterSymbol.name,
                type: checker.typeToString(
                  checker.getTypeAtLocation(parameterSymbol.valueDeclaration)
                ),
              }))) ||
            [];

          const paramJsDocs = jsDocTags
            .filter(tag => tag.name === 'param' && !!tag.text)
            .map(tag => {
              const [name, ...rest] = (tag.text as string).split(' ');
              return {
                name,
                description: rest.join(' '),
              };
            });

          items.push({
            isFunction: true,
            name: key.toString(),
            typeString: checker.typeToString(
              checker.getTypeAtLocation(value.valueDeclaration)
            ),
            comments: value.getDocumentationComment(checker).map(cm => cm.text),
            params: paramTypes.map(param => {
              const associatedJsDocTag = paramJsDocs.find(
                jsDoc => jsDoc.name === param.name
              );

              if (warnIfParamMissingJsDoc && !associatedJsDocTag) {
                console.warn(
                  `Jsdoc comment not found for ${key.toString()} parameter ${
                    param.name
                  } in ${fileInfo.base}`
                );
              }

              return {
                name: param.name,
                type: param.type,
                description:
                  associatedJsDocTag && associatedJsDocTag.description,
              };
            }),
            returns: {
              type: returnType && checker.typeToString(returnType),
              description: jsDocTags
                .filter(tag => tag.name === 'returns')
                .map(tag => tag.text)[0],
            },
            jsDocTags,
          });
        }
      });

      return {
        items,
        relativePath,
        /** absolute path of the source code, you can extract the required info using `path.parse` */
        absoluteFilePath,
        fileComment,
        fileName: fileInfo.name,
      };
    })
    .filter(isDefined);
}

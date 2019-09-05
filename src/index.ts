import * as ts from 'typescript';
import * as path from 'path';

function isDefined<T>(x: T | undefined): x is T {
  return typeof x !== 'undefined';
}

interface GetDocOptions {
  files: string[];
}

interface ItemParams {
  type: string;
  description: string;
}

interface ExportedItem {
  name: string;
  typeString: string;
  comments: string[];
  params: ItemParams[];
  returns?: string;
  jsDocTags: ts.JSDocTagInfo[];
}

export function tsDoc({ files }: GetDocOptions) {
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
    .map(f => checker.getSymbolAtLocation(f))
    .filter(isDefined); // here's the type guard to filter out undefined

  // (5) for each SourceFile Symbol
  return sfSymbols
    .map(sfSymbol => {
      const { exports: fileExports } = sfSymbol;

      if (!fileExports) {
        return;
      }

      const items: ExportedItem[] = [];

      const relativePath = path
        .relative(rootDir, sfSymbol.name.replace(/^"|"$/g, ''))
        .replace(new RegExp(`\\${path.sep}`, 'g'), '/');

      fileExports.forEach((value, key) => {
        const jsDocTags = value.getJsDocTags();
        items.push({
          name: key.toString(),
          typeString: checker.typeToString(
            checker.getTypeAtLocation(value.valueDeclaration)
          ),
          comments: value.getDocumentationComment(checker).map(cm => cm.text),
          params: jsDocTags
            .filter(tag => tag.name === 'param' && !!tag.text)
            .map(tag => {
              const [type, ...rest] = (tag.text as string).split(' ');
              return {
                type,
                description: rest.join(' '),
              };
            }),
          returns: jsDocTags
            .filter(tag => tag.name === 'returns')
            .map(tag => tag.text)[0],
          jsDocTags,
        });
      });

      return {
        items,
        fileName: relativePath,
      };
    })
    .filter(Boolean);
}

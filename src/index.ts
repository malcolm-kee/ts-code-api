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
      ([f, fileName]) =>
        isDefined(f) &&
        (!options.excludes ||
          !isMatch(getRelativePath(rootDir, fileName), options.excludes))
    ) as Array<[ts.Symbol, string]>;

  // (5) for each SourceFile Symbol
  return sfSymbols
    .map(([sfSymbol]) => {
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

        // const type = checker.getTypeAtLocation(value.valueDeclaration);

        // const signatures = type.getCallSignatures();
        // signatures.forEach(signature => {
        //   const returnType = signature.getReturnType();
        //   console.log(`returnType: ${checker.typeToString(returnType)}`);
        //   const paramSymbols = signature.getParameters();
        //   paramSymbols.forEach(pSymbol => {
        //     console.log(`paramName: ${pSymbol.name}`);
        //     const paramType = checker.getTypeAtLocation(
        //       pSymbol.valueDeclaration
        //     );

        //     console.log(`paramType flags: ${paramType.getFlags()}`);

        //     const paramTypeSymbol = paramType.getSymbol();

        //     if (paramTypeSymbol) {
        //       console.log(`paramType symbol: ${paramTypeSymbol.getFlags()}`);
        //       const paramSymbolDeclaration = paramTypeSymbol.getDeclarations();
        //       if (paramSymbolDeclaration) {
        //         paramSymbolDeclaration.forEach(dec => {
        //           console.log(
        //             `is interface: ${ts.isInterfaceDeclaration(dec)}`
        //           );
        //           if (ts.isInterfaceDeclaration(dec) && dec.name) {
        //             const interfaceSymbol = checker.getSymbolAtLocation(
        //               dec.name
        //             );
        //             if (interfaceSymbol) {
        //               const interfaceType = checker.getTypeAtLocation(
        //                 interfaceSymbol.valueDeclaration
        //               );

        //               console.log(`interfaceSymbol: ${interfaceType}`);
        //             }
        //             dec.members.forEach(member => {
        //               console.log(`memberText: ${member.getText()}`);
        //             });
        //           }
        //         });
        //       }
        //     }

        //     console.log(`paramType: ${checker.typeToString(paramType)}`);
        //   });
        // });

        items.push({
          name: key.toString(),
          typeString: checker.typeToString(
            checker.getTypeAtLocation(value.valueDeclaration)
          ),
          comments: value.getDocumentationComment(checker).map(cm => cm.text),
          params: jsDocTags
            .filter(tag => tag.name === 'param' && !!tag.text)
            .map(tag => {
              const [name, ...rest] = (tag.text as string).split(' ');
              return {
                name,
                description: rest.join(' '),
              };
            }),
          returns: jsDocTags
            .filter(tag => tag.name === 'returns')
            .map(tag => tag.text)[0],
          jsDocTags,
          flags: value.getFlags(),
        });
      });

      return {
        items,
        fileName: relativePath,
      };
    })
    .filter(isDefined);
}

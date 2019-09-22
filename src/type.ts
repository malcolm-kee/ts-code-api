import * as ts from 'typescript';

export interface GetDocOptions {
  files: string[];
  /**
   * Make members tagged with `@private` to be exported.
   * Default to `false`.
   */
  showPrivate?: boolean;
  excludes?: string[];
  /**
   * Warn if function parameter could not find is associated jsdoc comment.
   * Default to `true`.
   */
  warnIfParamMissingJsDoc?: boolean;
}

export interface ItemParams {
  name: string;
  type: string;
  description?: string;
}

export type ExportedItem =
  | {
      isFunction: true;
      name: string;
      typeString: string;
      comments: string[];
      params: ItemParams[];
      returns?: {
        type: string;
        description?: string;
      };
      jsDocTags: ts.JSDocTagInfo[];
    }
  | {
      isFunction: false;
      name: string;
      typeString: string;
      comments: string[];
      jsDocTags: ts.JSDocTagInfo[];
    };

/**
 * Unsupported exports for now.
 *
 * May be I may consider to expose them once I figure out the best way.
 */
export const UNSUPPORTED_SYMBOLS = [
  ts.SymbolFlags.Interface,
  ts.SymbolFlags.TypeAlias,
  ts.SymbolFlags.Type,
  ts.SymbolFlags.AliasExcludes,
];

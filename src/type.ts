import * as ts from 'typescript';

export interface GetDocOptions {
  files: string[];
  /**
   * By default, members tagged with `@private` will not be exported.
   * Set this to true to export `@private` members as well.
   */
  showPrivate?: boolean;
  excludes?: string[];
}

export interface ItemParams {
  name: string;
  type: string;
  description?: string;
}

export interface ExportedItem {
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

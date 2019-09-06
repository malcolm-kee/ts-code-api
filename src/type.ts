import * as ts from 'typescript';

export interface GetDocOptions {
  files: string[];
  /**
   * By default, members tagged with `@private` will not be exported.
   * Set this to true to export `@private` members as well.
   */
  showPrivate?: boolean;
  excludes: string[];
}

export interface ItemParams {
  type: string;
  description: string;
}

export interface ExportedItem {
  name: string;
  typeString: string;
  comments: string[];
  params: ItemParams[];
  returns?: string;
  jsDocTags: ts.JSDocTagInfo[];
}

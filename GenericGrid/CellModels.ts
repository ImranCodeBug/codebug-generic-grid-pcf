export interface IEmailCell {
  kind: "email";
  value: string;
}

export interface IPosition {
  latitude: number;
  longitude: number;
}

export interface IImage {
  kind: "image";
  url: string;
}

export interface ILinkCell {
  kind: "link";
  url: string;
}

export interface ITextArray {
  kind: "text-array";
  values: string[];
}

export interface ICrmObject {
  entityname: string;
  id: string;
  name?: string;
}

export type IGridCell = string | number | boolean | IEmailCell | IPosition | IImage | ILinkCell | ITextArray | ICrmObject;
export type IGridRow = IGridCell[];
export type TCellType = "text" | "email" | "crmLink" | "number" | "boolean" | "array" | "location" | "image" | "link";
export type TSortDirection = "ascending" | "descending";

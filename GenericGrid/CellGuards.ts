import { ICrmObject, IEmailCell, IGridCell, IImage, ILinkCell, IPosition, ITextArray } from "./CellModels";

export const isEmailCell = (cellValue: IGridCell): cellValue is IEmailCell => {
  return typeof cellValue === "object" && cellValue !== null && "kind" in cellValue && cellValue.kind === "email";
};

export const isImageCell = (cellValue: IGridCell): cellValue is IImage => {
  return typeof cellValue === "object" && cellValue !== null && "kind" in cellValue && cellValue.kind === "image";
};

export const isLinkCell = (cellValue: IGridCell): cellValue is ILinkCell => {
  return typeof cellValue === "object" && cellValue !== null && "kind" in cellValue && cellValue.kind === "link";
};

export const isTextArrayCell = (cellValue: IGridCell): cellValue is ITextArray => {
  return typeof cellValue === "object" && cellValue !== null && "kind" in cellValue && cellValue.kind === "text-array";
};

export const isPositionObject = (value: unknown): value is IPosition => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const keys = Object.keys(value as Record<string, unknown>);
  if (keys.length !== 2 || !keys.includes("latitude") || !keys.includes("longitude")) {
    return false;
  }

  const candidate = value as { latitude?: unknown; longitude?: unknown };
  return typeof candidate.latitude === "number" && typeof candidate.longitude === "number";
};

export const isPositionCell = (cellValue: IGridCell): cellValue is IPosition => {
  return isPositionObject(cellValue);
};

export const isCrmObjectCell = (cellValue: IGridCell): cellValue is ICrmObject => {
  if (typeof cellValue !== "object" || cellValue === null || Array.isArray(cellValue)) {
    return false;
  }

  const candidate = cellValue as unknown as Record<string, unknown>;
  const rawEntityName = candidate.entityname ?? candidate.entityName;
  return typeof rawEntityName === "string" && rawEntityName.trim().length > 0 && typeof candidate.id === "string" && candidate.id.trim().length > 0;
};

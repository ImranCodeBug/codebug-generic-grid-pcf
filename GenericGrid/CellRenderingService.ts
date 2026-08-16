import { isCrmObjectCell, isEmailCell, isImageCell, isLinkCell, isPositionCell, isPositionObject, isTextArrayCell } from "./CellGuards";
import { ICrmObject, IEmailCell, IGridCell, IImage, ILinkCell, ITextArray, TCellType } from "./CellModels";

const crmUrl = "https://methods-automation.crm11.dynamics.com/";

export const createEmailCell = (value: string): IEmailCell => {
  return {
    kind: "email",
    value
  };
};

export const createImageCell = (url: string): IImage => {
  return {
    kind: "image",
    url
  };
};

export const createLinkCell = (url: string): ILinkCell => {
  return {
    kind: "link",
    url
  };
};

export const createTextArrayCell = (values: string[]): ITextArray => {
  return {
    kind: "text-array",
    values
  };
};

export const createCrmObjectCell = (value: unknown): ICrmObject | null => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const rawEntityName = candidate.entityname ?? candidate.entityName;

  if (typeof rawEntityName !== "string" || rawEntityName.trim().length === 0 || typeof candidate.id !== "string" || candidate.id.trim().length === 0) {
    return null;
  }

  return {
    entityname: rawEntityName.trim(),
    id: candidate.id.trim(),
    name: typeof candidate.name === "string" ? candidate.name.trim() : undefined
  };
};

export const getCrmRecordUrl = (crmObjectCell: ICrmObject): string => {
  return `${crmUrl}main.aspx?etn=${encodeURIComponent(crmObjectCell.entityname)}&pagetype=entityrecord&id=${encodeURIComponent(crmObjectCell.id)}`;
};

export const createCellForType = (value: unknown, columnType?: string): IGridCell => {
  const cellType = columnType?.trim().toLowerCase() as Lowercase<TCellType> | undefined;

  switch (cellType) {
    case "email":
      return createEmailCell(typeof value === "string" ? value.trim() : "");
    case "crmlink":
      return createCrmObjectCell(value) ?? "";
    case "number":
      return typeof value === "number" ? value : "";
    case "boolean":
      return typeof value === "boolean" ? value : "";
    case "array":
      return Array.isArray(value) && value.every((item) => typeof item === "string")
        ? createTextArrayCell(value)
        : createTextArrayCell([]);
    case "location":
      return isPositionObject(value) ? value : "";
    case "image":
      return createImageCell(typeof value === "string" ? value.trim() : "");
    case "link":
      return createLinkCell(typeof value === "string" ? value.trim() : "");
    case "text":
    default:
      return typeof value === "string" ? value : "";
  }
};

export const getCellText = (cellValue: IGridCell): string => {
  if (isEmailCell(cellValue)) {
    return cellValue.value;
  }

  if (isImageCell(cellValue) || isLinkCell(cellValue)) {
    return cellValue.url;
  }

  if (isTextArrayCell(cellValue)) {
    return cellValue.values.join(", ");
  }

  if (isPositionCell(cellValue)) {
    return `${cellValue.latitude},${cellValue.longitude}`;
  }

  if (isCrmObjectCell(cellValue)) {
    return cellValue.name && cellValue.name.length > 0 ? cellValue.name : "unknown";
  }

  return String(cellValue);
};

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "@fluentui/react-components";
import * as React from "react";
import dummyData from "./dummyData.json";

interface IMainContainerComponentProps {
  data: string;
  columns: string[];
  isSortable: boolean;
  pageSize: number;
}

type IdDataRow = (typeof dummyData)[number];

interface IEmailCell {
  kind: "email";
  value: string;
}

interface IPosition {
  latitude: number;
  longitude: number;
}

interface IImage {
  kind: "image";
  url: string;
}

interface ITextArray {
  kind: "text-array";
  values: string[];
}

interface ICrmObject {
  entityname: string;
  id: string;
  name?: string;
}

const crmUrl = "https://methods-automation.crm11.dynamics.com/";

type IGridCell = string | number | boolean | IEmailCell | IPosition | IImage | ITextArray | ICrmObject;
type IGridRow = [ IGridCell, IGridCell, IGridCell, IGridCell, IGridCell, IGridCell, IGridCell, IGridCell, IGridCell];

type TCellTypeHint = "default" | "image";

const createEmailCell = (value: string): IEmailCell => {
  return {
    kind: "email",
    value
  };
};

const createImageCell = (url: string): IImage => {
  return {
    kind: "image",
    url
  };
};

const createTextArrayCell = (values: string[]): ITextArray => {
  return {
    kind: "text-array",
    values
  };
};

const isEmailCell = (cellValue: IGridCell): cellValue is IEmailCell => {
  return typeof cellValue === "object" && cellValue !== null && "kind" in cellValue && cellValue.kind === "email";
};

const isImageCell = (cellValue: IGridCell): cellValue is IImage => {
  return typeof cellValue === "object" && cellValue !== null && "kind" in cellValue && cellValue.kind === "image";
};

const isTextArrayCell = (cellValue: IGridCell): cellValue is ITextArray => {
  return typeof cellValue === "object" && cellValue !== null && "kind" in cellValue && cellValue.kind === "text-array";
};

const isPositionObject = (value: unknown): value is { latitude: number; longitude: number } => {
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

const isPositionCell = (cellValue: IGridCell): cellValue is IPosition => {
  return isPositionObject(cellValue);
};

const IsCRMObjectCell = (cellValue: IGridCell): cellValue is ICrmObject => {
  if (typeof cellValue !== "object" || cellValue === null || Array.isArray(cellValue)) {
    return false;
  }

  const candidate = cellValue as unknown as Record<string, unknown>;
  const rawEntityName = candidate.entityname ?? candidate.entityName;
  return typeof rawEntityName === "string" && rawEntityName.trim().length > 0 && typeof candidate.id === "string" && candidate.id.trim().length > 0;
};

const createCrmObjectCell = (value: unknown): ICrmObject | null => {
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

const getCrmRecordUrl = (crmObjectCell: ICrmObject): string => {
  return `${crmUrl}main.aspx?etn=${encodeURIComponent(crmObjectCell.entityname)}&pagetype=entityrecord&id=${encodeURIComponent(crmObjectCell.id)}`;
};

const getCellType = (value: unknown, hint: TCellTypeHint = "default"): IGridCell => {
  if (hint === "image") {
    if (typeof value === "string") {
      return createImageCell(value.trim());
    }

    return createImageCell("");
  }

  if (isPositionObject(value)) {
    return value;
  }

  if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
    return createTextArrayCell(value);
  }

  const crmObjectCell = createCrmObjectCell(value);
  if (crmObjectCell) {
    return crmObjectCell;
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();
    const isEmailValue = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue);
    return isEmailValue ? createEmailCell(trimmedValue) : value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  return "";
};

const getCellText = (cellValue: IGridCell): string => {
  if (isEmailCell(cellValue)) {
    return cellValue.value;
  }

  if (isImageCell(cellValue)) {
    return cellValue.url;
  }

  if (isTextArrayCell(cellValue)) {
    return cellValue.values.join(", ");
  }

  if (isPositionCell(cellValue)) {
    return `${cellValue.latitude},${cellValue.longitude}`;
  }

  if (IsCRMObjectCell(cellValue)) {
    return cellValue.name && cellValue.name.length > 0 ? cellValue.name : "unknown";
  }

  return String(cellValue);
};

const gridData: IGridRow[] = dummyData.map((item: IdDataRow) => {
  return [
    getCellType(item.picture, "image"),
    getCellType(item.name),    
    getCellType(item.email),
    getCellType(item.crmObject),
    getCellType(item.phone),
    getCellType(item.age),
    getCellType(item.balance),
    getCellType(item.isActive),
    getCellType(item.tags)
    
  ];
});

const minColumnWidthPx = 64;
const imageColumnWidthPercent = 4;
type TSortDirection = "ascending" | "descending";

const getInitialColumnWidths = (columnCount: number, imageColumnIndex: number): number[] => {
  if (columnCount <= 0) {
    return [];
  }

  if (imageColumnIndex < 0 || imageColumnIndex >= columnCount) {
    return Array.from({ length: columnCount }, () => 100 / columnCount);
  }

  if (columnCount === 1) {
    return [100];
  }

  const remainingWidthPercent = 100 - imageColumnWidthPercent;
  const otherColumnWidthPercent = remainingWidthPercent / (columnCount - 1);
  const widths = Array.from({ length: columnCount }, () => otherColumnWidthPercent);
  widths[imageColumnIndex] = imageColumnWidthPercent;
  return widths;
};

const getSortValue = (row: IGridRow, columnIndex: number): string | number | boolean => {
  const cellValue = row[columnIndex];

  if (cellValue === undefined) {
    return "";
  }

  if (isEmailCell(cellValue)) {
    return cellValue.value;
  }

  if (isImageCell(cellValue)) {
    return cellValue.url;
  }

  if (isTextArrayCell(cellValue)) {
    return cellValue.values.join(", ");
  }

  if (isPositionCell(cellValue)) {
    return getCellText(cellValue);
  }

  if (IsCRMObjectCell(cellValue)) {
    return cellValue.name && cellValue.name.length > 0 ? cellValue.name : "unknown";
  }

  return cellValue;
};

const MainContainerComponent: React.FunctionComponent<IMainContainerComponentProps> = ({ data, columns, isSortable, pageSize }) => {
  const imageColumnIndex = React.useMemo(() => {
    const firstRow = gridData[0];

    if (!firstRow) {
      return -1;
    }

    const detectedIndex = firstRow.findIndex((cellValue) => isImageCell(cellValue));
    return detectedIndex >= 0 && detectedIndex < columns.length ? detectedIndex : -1;
  }, [columns.length]);

  const gridRef = React.useRef<HTMLDivElement | null>(null);
  const dragStateRef = React.useRef<{
    columnIndex: number;
    startX: number;
    startWidths: number[];
    tableWidth: number;
  } | null>(null);
  const [columnWidths, setColumnWidths] = React.useState<number[]>(() => getInitialColumnWidths(columns.length, imageColumnIndex));
  const [sortState, setSortState] = React.useState<{ columnIndex: number; direction: TSortDirection } | null>(null);
  const [currentPage, setCurrentPage] = React.useState<number>(1);

  React.useEffect(() => {
    setColumnWidths(getInitialColumnWidths(columns.length, imageColumnIndex));
  }, [columns.length, imageColumnIndex]);

  const sortedRows = React.useMemo(() => {
    if (!sortState) {
      return gridData;
    }

    const sortedRows = [...gridData].sort((leftRow, rightRow) => {
      const leftValue = getSortValue(leftRow, sortState.columnIndex);
      const rightValue = getSortValue(rightRow, sortState.columnIndex);

      if (typeof leftValue === "number" && typeof rightValue === "number") {
        return leftValue - rightValue;
      }

      return String(leftValue).localeCompare(String(rightValue));
    });

    return sortState.direction === "ascending" ? sortedRows : sortedRows.reverse();
  }, [sortState]);

  const isPagingEnabled = pageSize > 0;
  const totalPages = isPagingEnabled ? Math.max(1, Math.ceil(sortedRows.length / pageSize)) : 1;

  React.useEffect(() => {
    if (!isPagingEnabled) {
      setCurrentPage(1);
      return;
    }

    setCurrentPage((previousPage) => Math.min(previousPage, totalPages));
  }, [isPagingEnabled, totalPages]);

  const rows = React.useMemo(() => {
    if (!isPagingEnabled) {
      return sortedRows;
    }

    const startIndex = (currentPage - 1) * pageSize;
    return sortedRows.slice(startIndex, startIndex + pageSize);
  }, [sortedRows, currentPage, pageSize, isPagingEnabled]);

  const handleResizeMouseMove = React.useCallback((event: MouseEvent) => {
    const dragState = dragStateRef.current;

    if (!dragState) {
      return;
    }

    const deltaPercent = ((event.clientX - dragState.startX) / dragState.tableWidth) * 100;
    const minWidthPercent = (minColumnWidthPx / dragState.tableWidth) * 100;
    const nextWidths = [...dragState.startWidths];
    const currentIndex = dragState.columnIndex;
    const nextIndex = currentIndex + 1;
    const proposedCurrentWidth = nextWidths[currentIndex] + deltaPercent;
    const proposedNextWidth = nextWidths[nextIndex] - deltaPercent;

    if (proposedCurrentWidth < minWidthPercent || proposedNextWidth < minWidthPercent) {
      return;
    }

    nextWidths[currentIndex] = proposedCurrentWidth;
    nextWidths[nextIndex] = proposedNextWidth;
    setColumnWidths(nextWidths);
  }, []);

  const stopResize = React.useCallback(() => {
    dragStateRef.current = null;
    window.removeEventListener("mousemove", handleResizeMouseMove);
    window.removeEventListener("mouseup", stopResize);
  }, [handleResizeMouseMove]);

  React.useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handleResizeMouseMove);
      window.removeEventListener("mouseup", stopResize);
    };
  }, [handleResizeMouseMove, stopResize]);

  const handleResizeMouseDown = (event: React.MouseEvent<HTMLButtonElement>, columnIndex: number): void => {
    const tableWidth = gridRef.current?.getBoundingClientRect().width ?? 0;

    if (tableWidth <= 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    dragStateRef.current = {
      columnIndex,
      startX: event.clientX,
      startWidths: columnWidths,
      tableWidth
    };

    window.addEventListener("mousemove", handleResizeMouseMove);
    window.addEventListener("mouseup", stopResize);
  };

  const getColumnWidthStyle = (columnIndex: number): React.CSSProperties => {
    return {
      width: `${columnWidths[columnIndex]}%`
    };
  };

  const handleHeaderClick = (columnIndex: number): void => {
    if(isSortable === false) { 
      return;
    }

    setCurrentPage(1);
    setSortState((currentSortState) => {
      if (currentSortState?.columnIndex === columnIndex) {
        return {
          columnIndex,
          direction: currentSortState.direction === "ascending" ? "descending" : "ascending"
        };
      }

      return {
        columnIndex,
        direction: "ascending"
      };
    });
  };

  const ImageCell: React.FunctionComponent<{ imageCell: IImage; altText: string }> = ({ imageCell, altText }) => {
    const [isBroken, setIsBroken] = React.useState<boolean>(imageCell.url.length === 0);

    if (isBroken) {
      return <span className="cg-grid__image-fallback" aria-label="Image unavailable">?</span>;
    }

    return (
      <img
        className="cg-grid__image"
        src={imageCell.url}
        alt={altText}
        onError={() => setIsBroken(true)}
      />
    );
  };

  return (
    <div className="cg-grid" ref={gridRef}>
      <Table aria-label="Dynamics style subgrid" className="cg-grid__table">
        <TableHeader>
          <TableRow>
            {columns.map((column, columnIndex) => {
              const isImageColumn = columnIndex === imageColumnIndex;
              const nextIsImageColumn = columnIndex + 1 === imageColumnIndex;
              const isResizable = columnIndex < columns.length - 1 && !isImageColumn && !nextIsImageColumn;
              const isSortedColumn = sortState?.columnIndex === columnIndex;
              const sortGlyph = sortState?.direction === "ascending" ? "▲" : "▼";

              return (
                <TableHeaderCell key={column} className="cg-grid__header-cell" style={getColumnWidthStyle(columnIndex)}>
                  <div className="cg-grid__header-content">
                    <button
                      type="button"
                      className="cg-grid__sort-button"
                      onClick={() => handleHeaderClick(columnIndex)}
                      aria-label={`Sort by ${column}`}
                    >
                      <span className="cg-grid__sort-label">{column}</span>
                      {isSortedColumn ? <span className="cg-grid__sort-icon" aria-hidden="true">{sortGlyph}</span> : null}
                    </button>
                  </div>
                  {isResizable ? (
                    <button
                      type="button"
                      className="cg-grid__resize-handle"
                      onMouseDown={(event) => handleResizeMouseDown(event, columnIndex)}
                      aria-label={`Resize ${column} column`}
                      tabIndex={-1}
                    />
                  ) : null}
                </TableHeaderCell>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={`${getCellText(row[1])}-${getCellText(row[3])}`} className="cg-grid__row">
              {row.slice(0, columns.length).map((cellValue, columnIndex) => (
                <TableCell
                  key={`${getCellText(row[1])}-${columnIndex}`}
                  className={
                    columnIndex === imageColumnIndex
                      ? "cg-grid__cell cg-grid__cell--image"
                      : columnIndex === 1
                        ? "cg-grid__cell cg-grid__cell--name"
                        : "cg-grid__cell"
                  }
                  style={getColumnWidthStyle(columnIndex)}
                >
                  {isImageCell(cellValue)
                    ? <ImageCell imageCell={cellValue} altText={`${getCellText(row[1])} image`} />
                    : isEmailCell(cellValue)
                    ? <a className="cg-grid__cell-link" href={`mailto:${cellValue.value}`}>{cellValue.value}</a>
                    : isTextArrayCell(cellValue)
                    ? cellValue.values.join(", ")
                    : IsCRMObjectCell(cellValue)
                      ? (
                        <a
                          className="cg-grid__cell-link"
                          href={getCrmRecordUrl(cellValue)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {cellValue.name && cellValue.name.length > 0 ? cellValue.name : "unknown"}
                        </a>
                      )
                    : isPositionCell(cellValue)
                      ? (
                        <a
                          className="cg-grid__cell-link cg-grid__cell-link--map"
                          href={`https://www.google.com/maps?q=${cellValue.latitude},${cellValue.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open location in Google Maps (${cellValue.latitude}, ${cellValue.longitude})`}
                        >
                          <svg className="cg-grid__map-icon" width="16" height="16" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                            <path d="M6.25 4.75a1.5 1.5 0 0 0-1.5 1.5v11.5a1.5 1.5 0 0 0 1.5 1.5h11.5a1.5 1.5 0 0 0 1.5-1.5v-4a1 1 0 1 1 2 0v4a3.5 3.5 0 0 1-3.5 3.5H6.25a3.5 3.5 0 0 1-3.5-3.5V6.25a3.5 3.5 0 0 1 3.5-3.5h4a1 1 0 1 1 0 2h-4Zm6.5-1a1 1 0 0 1 1-1h6.5a1 1 0 0 1 1 1v6.5a1 1 0 1 1-2 0V6.164l-4.793 4.793a1 1 0 1 1-1.414-1.414l4.793-4.793H13.75a1 1 0 0 1-1-1Z" fill="currentColor"/>
                          </svg>
                        </a>
                      )
                    : typeof cellValue === "boolean" ? (cellValue ? "Yes" : "No") : cellValue}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {isPagingEnabled ? (
        <div className="cg-grid__pagination" role="navigation" aria-label="Pagination">
          <button
            type="button"
            className="cg-grid__page-button cg-grid__page-button--nav"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={currentPage === 1}
            aria-label="Go to previous page"
          >
            Previous
          </button>
          <div className="cg-grid__page-list">
            {Array.from({ length: totalPages }, (_, index) => {
              const pageNumber = index + 1;
              const isCurrentPage = currentPage === pageNumber;

              return (
                <button
                  key={pageNumber}
                  type="button"
                  className={isCurrentPage ? "cg-grid__page-button cg-grid__page-button--current" : "cg-grid__page-button"}
                  onClick={() => setCurrentPage(pageNumber)}
                  aria-current={isCurrentPage ? "page" : undefined}
                  aria-label={`Go to page ${pageNumber}`}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className="cg-grid__page-button cg-grid__page-button--nav"
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            disabled={currentPage === totalPages}
            aria-label="Go to next page"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default MainContainerComponent;

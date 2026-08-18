import { Table } from "@fluentui/react-components";
import * as React from "react";
import { isImageCell } from "./CellGuards";
import { IGridRow, TSortDirection } from "./CellModels";
import { createCellForType, getCellText } from "./CellRenderingService";
import PaginationComponent from "./PaginationComponent";
import SearchComponent from "./SearchComponent";
import TableBodyComponent from "./TableBodyComponent";
import TableHeaderComponent from "./TableHeaderComponent";

interface IMainContainerComponentProps {
  crmUrl: string;
  data: string;
  columns: string[];
  columnTypes: string[];
  isSortable: boolean;
  isSearchEnabled: boolean;
  pageSize: number;
}

const createGridRows = (data: string, columnTypes: string[], columnCount: number): IGridRow[] => {
  try {
    const parsedData: unknown = JSON.parse(data);

    if (!Array.isArray(parsedData)) {
      return [];
    }

    return parsedData.map((item) => {
      if (typeof item !== "object" || item === null || Array.isArray(item)) {
        return [];
      }

      const values = Object.values(item as Record<string, unknown>).slice(0, columnCount);

      return values.map((value, columnIndex) => createCellForType(value, columnTypes[columnIndex]));
    });
  } catch {
    return [];
  }
};

const minColumnWidthPx = 64;
const imageColumnWidthPercent = 4;

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

  return typeof cellValue === "number" || typeof cellValue === "boolean" ? cellValue : getCellText(cellValue);
};

const MainContainerComponent: React.FunctionComponent<IMainContainerComponentProps> = ({ crmUrl, data, columns, columnTypes, isSortable, isSearchEnabled, pageSize }) => {
  const gridData = React.useMemo(() => createGridRows(data, columnTypes, columns.length), [data, columnTypes, columns.length]);

  const imageColumnIndex = React.useMemo(() => {
    const firstRow = gridData[0];

    if (!firstRow) {
      return -1;
    }

    const detectedIndex = firstRow.findIndex((cellValue) => isImageCell(cellValue));
    return detectedIndex >= 0 && detectedIndex < columns.length ? detectedIndex : -1;
  }, [columns.length, gridData]);

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
  const [searchText, setSearchText] = React.useState<string>("");

  React.useEffect(() => {
    setColumnWidths(getInitialColumnWidths(columns.length, imageColumnIndex));
  }, [columns.length, imageColumnIndex]);

  const filteredRows = React.useMemo(() => {
    const normalizedSearchText = searchText.trim().toLowerCase();

    if (normalizedSearchText.length === 0) {
      return gridData;
    }

    return gridData.filter((row) => row.some((cellValue) => getCellText(cellValue).toLowerCase().includes(normalizedSearchText)));
  }, [gridData, searchText]);

  const sortedRows = React.useMemo(() => {
    if (!sortState) {
      return filteredRows;
    }

    const sortedRows = [...filteredRows].sort((leftRow, rightRow) => {
      const leftValue = getSortValue(leftRow, sortState.columnIndex);
      const rightValue = getSortValue(rightRow, sortState.columnIndex);

      if (typeof leftValue === "number" && typeof rightValue === "number") {
        return leftValue - rightValue;
      }

      return String(leftValue).localeCompare(String(rightValue));
    });

    return sortState.direction === "ascending" ? sortedRows : sortedRows.reverse();
  }, [filteredRows, sortState]);

  const handleSearchTextChange = (nextSearchText: string): void => {
    setSearchText(nextSearchText);
    setSortState(null);
    setCurrentPage(1);
  };

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

  return (
    <div className="cg-grid" ref={gridRef}>
      <div className="cg-grid__toolbar">
        <SearchComponent isSearchEnabled={isSearchEnabled} searchText={searchText} onSearchTextChange={handleSearchTextChange} />
      </div>
      <Table aria-label="Dynamics style subgrid" className="cg-grid__table">
        <TableHeaderComponent
          columns={columns}
          imageColumnIndex={imageColumnIndex}
          columnWidths={columnWidths}
          sortState={sortState}
          onHeaderClick={handleHeaderClick}
          onResizeMouseDown={handleResizeMouseDown}
        />
        <TableBodyComponent crmUrl={crmUrl} rows={rows} columns={columns} columnWidths={columnWidths} imageColumnIndex={imageColumnIndex} />
      </Table>
      {isPagingEnabled ? (
        <PaginationComponent currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      ) : null}
    </div>
  );
};

export default MainContainerComponent;

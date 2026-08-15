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

type IGridRow = [string, string, string, string, number, string, boolean];

const gridData: IGridRow[] = dummyData.map((item: IdDataRow) => {
  return [
    item.name,
    item.company,
    item.email,
    item.phone,
    item.age,
    item.balance,
    item.isActive 
  ];
});

const minColumnWidthPx = 64;
type TSortDirection = "ascending" | "descending";

const getInitialColumnWidths = (columnCount: number): number[] => {
  if (columnCount <= 0) {
    return [];
  }

  return Array.from({ length: columnCount }, () => 100 / columnCount);
};

const getSortValue = (row: IGridRow, columnIndex: number): string | number | boolean => {
  return row[columnIndex] ?? "";
};

const MainContainerComponent: React.FunctionComponent<IMainContainerComponentProps> = ({ data, columns, isSortable, pageSize }) => {
  const gridRef = React.useRef<HTMLDivElement | null>(null);
  const dragStateRef = React.useRef<{
    columnIndex: number;
    startX: number;
    startWidths: number[];
    tableWidth: number;
  } | null>(null);
  const [columnWidths, setColumnWidths] = React.useState<number[]>(() => getInitialColumnWidths(columns.length));
  const [sortState, setSortState] = React.useState<{ columnIndex: number; direction: TSortDirection } | null>(null);
  const [currentPage, setCurrentPage] = React.useState<number>(1);

  React.useEffect(() => {
    setColumnWidths(getInitialColumnWidths(columns.length));
  }, [columns.length]);

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

  return (
    <div className="cg-grid" ref={gridRef}>
      <Table aria-label="Dynamics style subgrid" className="cg-grid__table">
        <TableHeader>
          <TableRow>
            {columns.map((column, columnIndex) => {
              const isResizable = columnIndex < columns.length - 1;
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
            <TableRow key={`${row[0]}-${row[2]}`} className="cg-grid__row">
              {row.map((cellValue, columnIndex) => (
                <TableCell
                  key={`${row[0]}-${columnIndex}`}
                  className={columnIndex === 0 ? "cg-grid__cell cg-grid__cell--name" : "cg-grid__cell"}
                  style={getColumnWidthStyle(columnIndex)}
                >
                  {typeof cellValue === "boolean" ? (cellValue ? "Yes" : "No") : cellValue}
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

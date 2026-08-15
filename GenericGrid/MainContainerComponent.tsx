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

interface IGridRow {
  guid: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  age: number;
  balance: string;
  isActive: boolean;
}

type IdDataRow = (typeof dummyData)[number];

const gridData: IGridRow[] = dummyData.map((item: IdDataRow) => {
  return {
    guid: item.guid,
    name: item.name,
    company: item.company,
    email: item.email,
    phone: item.phone,
    age: item.age,
    balance: item.balance,
    isActive: item.isActive
  };
});

const defaultColumnWidths = [14.285714, 14.285714, 14.285714, 14.285714, 14.285714, 14.285714, 14.285714];
const minColumnWidthPx = 64;
type TSortDirection = "ascending" | "descending";

const getSortValue = (row: IGridRow, columnIndex: number): string | number => {
  switch (columnIndex) {
    case 0:
      return row.name;
    case 1:
      return row.company;
    case 2:
      return row.email;
    case 3:
      return row.phone;
    case 4:
      return row.age;
    case 5:
      return row.balance;
    case 6:
      return row.isActive ? "Active" : "Inactive";
    default:
      return "";
  }
};

const MainContainerComponent: React.FunctionComponent<IMainContainerComponentProps> = ({ data, columns, isSortable, pageSize }) => {
  const gridRef = React.useRef<HTMLDivElement | null>(null);
  const dragStateRef = React.useRef<{
    columnIndex: number;
    startX: number;
    startWidths: number[];
    tableWidth: number;
  } | null>(null);
  const [columnWidths, setColumnWidths] = React.useState<number[]>(defaultColumnWidths);
  const [sortState, setSortState] = React.useState<{ columnIndex: number; direction: TSortDirection } | null>(null);

  const rows = React.useMemo(() => {
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
            <TableRow key={row.guid} className="cg-grid__row">
              <TableCell className="cg-grid__cell cg-grid__cell--name" style={getColumnWidthStyle(0)}>{row.name}</TableCell>
              <TableCell className="cg-grid__cell" style={getColumnWidthStyle(1)}>{row.company}</TableCell>
              <TableCell className="cg-grid__cell" style={getColumnWidthStyle(2)}>{row.email}</TableCell>
              <TableCell className="cg-grid__cell" style={getColumnWidthStyle(3)}>{row.phone}</TableCell>
              <TableCell className="cg-grid__cell" style={getColumnWidthStyle(4)}>{row.age}</TableCell>
              <TableCell className="cg-grid__cell" style={getColumnWidthStyle(5)}>{row.balance}</TableCell>
              <TableCell className="cg-grid__cell" style={getColumnWidthStyle(6)}>
                <span className={row.isActive ? "cg-grid__status cg-grid__status--active" : "cg-grid__status cg-grid__status--inactive"}>
                  {row.isActive ? "Active" : "Inactive"}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MainContainerComponent;

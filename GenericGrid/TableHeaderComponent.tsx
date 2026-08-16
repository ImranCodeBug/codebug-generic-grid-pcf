import { TableHeader, TableHeaderCell, TableRow } from "@fluentui/react-components";
import * as React from "react";
import { TSortDirection } from "./CellModels";

interface ITableHeaderComponentProps {
  columns: string[];
  imageColumnIndex: number;
  columnWidths: number[];
  sortState: { columnIndex: number; direction: TSortDirection } | null;
  onHeaderClick: (columnIndex: number) => void;
  onResizeMouseDown: (event: React.MouseEvent<HTMLButtonElement>, columnIndex: number) => void;
}

const TableHeaderComponent: React.FunctionComponent<ITableHeaderComponentProps> = ({ columns, imageColumnIndex, columnWidths, sortState, onHeaderClick, onResizeMouseDown }) => {
  return (
    <TableHeader>
      <TableRow>
        {columns.map((column, columnIndex) => {
          const isImageColumn = columnIndex === imageColumnIndex;
          const nextIsImageColumn = columnIndex + 1 === imageColumnIndex;
          const isResizable = columnIndex < columns.length - 1 && !isImageColumn && !nextIsImageColumn;
          const isSortedColumn = sortState?.columnIndex === columnIndex;
          const sortGlyph = sortState?.direction === "ascending" ? "▲" : "▼";

          return (
            <TableHeaderCell key={column} className="cg-grid__header-cell" style={{ width: `${columnWidths[columnIndex]}%` }}>
              <div className="cg-grid__header-content">
                <button
                  type="button"
                  className="cg-grid__sort-button"
                  onClick={() => onHeaderClick(columnIndex)}
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
                  onMouseDown={(event) => onResizeMouseDown(event, columnIndex)}
                  aria-label={`Resize ${column} column`}
                  tabIndex={-1}
                />
              ) : null}
            </TableHeaderCell>
          );
        })}
      </TableRow>
    </TableHeader>
  );
};

export default TableHeaderComponent;

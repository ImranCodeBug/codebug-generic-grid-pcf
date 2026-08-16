import { TableBody, TableCell, TableRow } from "@fluentui/react-components";
import * as React from "react";
import { isCrmObjectCell, isEmailCell, isImageCell, isLinkCell, isPositionCell, isTextArrayCell } from "./CellGuards";
import { IGridRow } from "./CellModels";
import { getCellText, getCrmRecordUrl } from "./CellRenderingService";
import ImageCellComponent from "./ImageCellComponent";

interface ITableBodyComponentProps {
  crmUrl: string;
  rows: IGridRow[];
  columns: string[];
  columnWidths: number[];
  imageColumnIndex: number;
}

const TableBodyComponent: React.FunctionComponent<ITableBodyComponentProps> = ({ crmUrl, rows, columns, columnWidths, imageColumnIndex }) => {
  return (
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
              style={{ width: `${columnWidths[columnIndex]}%` }}
            >
              {isImageCell(cellValue)
                ? <ImageCellComponent imageCell={cellValue} altText={`${getCellText(row[1])} image`} />
                : isEmailCell(cellValue)
                ? <a className="cg-grid__cell-link" href={`mailto:${cellValue.value}`}>{cellValue.value}</a>
                : isLinkCell(cellValue)
                ? (
                  <a className="cg-grid__cell-link" href={cellValue.url} target="_blank" rel="noopener noreferrer">
                    {cellValue.url}
                  </a>
                )
                : isTextArrayCell(cellValue)
                ? cellValue.values.join(", ")
                : isCrmObjectCell(cellValue)
                  ? (
                    <a className="cg-grid__cell-link" href={getCrmRecordUrl(crmUrl, cellValue)} target="_blank" rel="noopener noreferrer">
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
  );
};

export default TableBodyComponent;

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
  name: string;
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

type IDummyDataRow = (typeof dummyData)[number];

const gridData: IGridRow[] = dummyData.map((item: IDummyDataRow) => {
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

const columns: { key: keyof IGridRow | "status"; label: string; columnClass: string }[] = [
  { key: "name", label: "Name", columnClass: "cg-grid__col--name" },
  { key: "company", label: "Company", columnClass: "cg-grid__col--company" },
  { key: "email", label: "Email", columnClass: "cg-grid__col--email" },
  { key: "phone", label: "Phone", columnClass: "cg-grid__col--phone" },
  { key: "age", label: "Age", columnClass: "cg-grid__col--age" },
  { key: "balance", label: "Balance", columnClass: "cg-grid__col--balance" },
  { key: "status", label: "Status", columnClass: "cg-grid__col--status" }
];

const MainContainerComponent: React.FunctionComponent<IMainContainerComponentProps> = () => {
  const rows = React.useMemo(() => gridData.slice(0, 12), []);

  return (
    <div className="cg-grid">
      <Table aria-label="Dynamics style subgrid" className="cg-grid__table">
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHeaderCell key={column.key} className={`cg-grid__header-cell ${column.columnClass}`}>
                {column.label}
              </TableHeaderCell>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.guid} className="cg-grid__row">
              <TableCell className="cg-grid__cell cg-grid__cell--name cg-grid__col--name">{row.name}</TableCell>
              <TableCell className="cg-grid__cell cg-grid__col--company">{row.company}</TableCell>
              <TableCell className="cg-grid__cell cg-grid__col--email">{row.email}</TableCell>
              <TableCell className="cg-grid__cell cg-grid__col--phone">{row.phone}</TableCell>
              <TableCell className="cg-grid__cell cg-grid__col--age">{row.age}</TableCell>
              <TableCell className="cg-grid__cell cg-grid__col--balance">{row.balance}</TableCell>
              <TableCell className="cg-grid__cell cg-grid__col--status">
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

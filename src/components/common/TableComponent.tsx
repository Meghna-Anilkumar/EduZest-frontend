import React from "react";

interface TableProps {
  headers: string[];
  data: { [key: string]: string | number | React.ReactNode }[];
  actions?: (row: { [key: string]: string | number | React.ReactNode }) => React.ReactNode;
}

const TableComponent: React.FC<TableProps> = ({ headers, data, actions }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
        <thead>
          <tr className="bg-gray-100 text-gray-700 uppercase text-sm leading-normal">
            {headers.map((header, index) => (
              <th key={index} className="py-3 px-4 text-left font-medium">{header}</th>
            ))}
            {actions && <th className="py-3 px-4 text-left font-medium">Actions</th>}
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b hover:bg-gray-50">
              {headers.map((header, colIndex) => (
                <td key={colIndex} className="py-3 px-4">{row[header]}</td>
              ))}
              {actions && <td className="py-3 px-4">{actions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableComponent;
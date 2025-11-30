// src/components/SafeDataGrid.jsx
import React from "react";
import { DataGrid } from "@mui/x-data-grid";

const SafeDataGrid = ({ rows = [], columns = [], ...props }) => {
  const safeRows = (rows || []).map((row, idx) => ({
    id: row?.id ?? row?.transactionCode ?? row?.employeeId ?? idx,
    ...row,
  }));

  const safeColumns = (columns || []).map((col) => ({
    ...col,
    renderCell:
      col.renderCell ||
      ((params) => {
        try {
          return params?.row?.[col.field] ?? "-";
        } catch {
          return "-";
        }
      }),
  }));

  return (
    <DataGrid
      rows={safeRows}
      columns={safeColumns}
      autoHeight
      disableRowSelectionOnClick
      pageSizeOptions={[5, 10, 20]}
      {...props}
    />
  );
};

export default SafeDataGrid;

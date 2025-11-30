import React from 'react';
import useDashboardData from '../../hooks/useDashboardData';
import { DataGrid } from '@mui/x-data-grid';

export default function SalesSection() {
  const { sales = [], loading } = useDashboardData();
  const rows = (sales || []).map((r, idx) => ({ id: r.id || idx, ...r }));
  const columns = [
    { field:'created_at', headerName:'Date', width:140 },
    { field:'item_purchased', headerName:'Item', width:200 },
    { field:'quantity', headerName:'Qty', width:80 },
    { field:'total', headerName:'Total', width:120 },
    { field:'customer_name', headerName:'Customer', width:180 },
  ];
  return <div style={{ height:500 }}><DataGrid rows={rows} columns={columns} loading={loading} /></div>;
}

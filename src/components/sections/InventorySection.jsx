import React from 'react';
import useDashboardData from '../../hooks/useDashboardData';
import { DataGrid } from '@mui/x-data-grid';

export default function InventorySection() {
  const { inventory = [], loading } = useDashboardData();
  const rows = (inventory || []).map((r, idx) => ({ id: r.id || idx, ...r }));
  const columns = [
    { field:'name', headerName:'Name', width:220 },
    { field:'stock', headerName:'Stock', width:100 },
    { field:'buying_price', headerName:'Cost', width:120 },
    { field:'price', headerName:'Price', width:120 },
  ];
  return <div style={{ height:500 }}><DataGrid rows={rows} columns={columns} loading={loading} /></div>;
}

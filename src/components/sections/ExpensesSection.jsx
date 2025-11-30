import React from 'react';
import useDashboardData from '../../hooks/useDashboardData';
import { DataGrid } from '@mui/x-data-grid';

export default function ExpensesSection() {
  const { expenses = [], loading } = useDashboardData();
  const rows = (expenses || []).map((r, idx) => ({ id: r.id || idx, ...r }));
  const columns = [
    { field:'date', headerName:'Date', width:140 },
    { field:'title', headerName:'Title', width:240 },
    { field:'amount', headerName:'Amount', width:140 },
    { field:'category', headerName:'Category', width:160 },
  ];
  return <div style={{ height:500 }}><DataGrid rows={rows} columns={columns} loading={loading} /></div>;
}

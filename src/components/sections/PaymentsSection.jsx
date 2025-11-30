import React from 'react';
import useDashboardData from '../../hooks/useDashboardData';
import { DataGrid } from '@mui/x-data-grid';

export default function PaymentsSection() {
  const { sales = [], loading } = useDashboardData();
  const rows = (sales || []).map((r, idx) => ({ id: r.id || idx, created_at: r.created_at, total: r.total }));
  const columns = [
    { field:'created_at', headerName:'Date', width:180 },
    { field:'total', headerName:'Amount', width:140 },
  ];
  return <div style={{ height:500 }}><DataGrid rows={rows} columns={columns} loading={loading} /></div>;
}

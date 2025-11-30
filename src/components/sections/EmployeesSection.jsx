import React from 'react';
import useDashboardData from '../../hooks/useDashboardData';
import { DataGrid } from '@mui/x-data-grid';

export default function EmployeesSection() {
  const { employees = [], loading } = useDashboardData();
  const rows = (employees || []).map((r, idx) => ({ id: r.id || idx, name: r.name || r.user?.username, email: r.user?.email, position: r.position }));
  const columns = [
    { field:'name', headerName:'Name', width:220 },
    { field:'email', headerName:'Email', width:220 },
    { field:'position', headerName:'Position', width:150 },
  ];
  return <div style={{ height:500 }}><DataGrid rows={rows} columns={columns} loading={loading} /></div>;
}

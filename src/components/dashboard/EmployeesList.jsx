import React, { useContext } from 'react';
import { Card, Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, Pagination, Chip } from '@mui/material';
import { Add, Edit, Delete, FileDownload, Block, CheckCircle, CompareArrows } from '@mui/icons-material';
import { DashboardContext } from '../../context/DashboardContext';
import { downloadCSV, formatCurrency } from '../../utils/formatters';
import useDashboardData from '../../hooks/useDashboardData';
import EmployeeModal from './EmployeeModal';
import TransferModal from './TransferModal';
import { API_BASE_URL } from '../../utils/api';

function EmployeesList({ branchId, employees }) {
  const { page, setPage, setEditingEmployee, setTransferringEmployee, setSnack } = useContext(DashboardContext);
  const { employeesLoading, deleteEmployee, suspendEmployee, unsuspendEmployee } = useDashboardData(branchId, null, null, page);
  const totalPages = employees.length > 0 ? Math.ceil(employees.length / 10) : 1; // Assuming 10 items per page

  const openAddEmployee = () => setEditingEmployee({
    username: '',
    email: '',
    idNumber: '',
    position: '',
    experience: '',
    role: 'Employee',
    name: '',
    status: 'Active',
    photo: null,
  });

  const openEditEmployee = (employee) => setEditingEmployee({
    id: employee.id,
    username: employee.user?.username || '',
    email: employee.user?.email || '',
    idNumber: employee.idNumber || '',
    position: employee.position || '',
    experience: employee.experience || '',
    role: employee.role || 'Employee',
    name: employee.name || '',
    status: employee.suspended ? 'Suspended' : 'Active',
    photo: employee.photo || null,
  });

  const openTransferEmployee = (employee) => setTransferringEmployee(employee);

  const confirmDeleteEmployee = async (id) => {
    if (!window.confirm('Delete this employee?')) return;
    await deleteEmployee.mutateAsync(id);
    setSnack({ open: true, msg: 'Employee deleted successfully', severity: 'success' });
  };

  const confirmSuspendEmployee = async (id) => {
    if (!window.confirm('Suspend this employee?')) return;
    await suspendEmployee.mutateAsync(id);
    setSnack({ open: true, msg: 'Employee suspended successfully', severity: 'info' });
  };

  const confirmUnsuspendEmployee = async (id) => {
    if (!window.confirm('Unsuspend this employee?')) return;
    await unsuspendEmployee.mutateAsync(id);
    setSnack({ open: true, msg: 'Employee unsuspended successfully', severity: 'success' });
  };

  return (
    <Card elevation={8} sx={{ borderRadius: 3, p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Employees</Typography>
        <Box>
          <Button
            startIcon={<FileDownload />}
            size="small"
            onClick={() =>
              downloadCSV(
                'employees.csv',
                employees.map((emp) => ({
                  id: emp.id,
                  name: emp.name,
                  username: emp.user?.username,
                  email: emp.user?.email,
                  idNumber: emp.idNumber,
                  position: emp.position,
                  experience: emp.experience,
                  role: emp.role,
                  status: emp.suspended ? 'Suspended' : 'Active',
                  photo: emp.photo || 'N/A',
                }))
              )
            }
          >
            Export
          </Button>
          <Button startIcon={<Add />} size="small" onClick={openAddEmployee}>
            Add Employee
          </Button>
        </Box>
      </Box>
      <Typography variant="body2">{employees.length} employees</Typography>
      {employeesLoading ? (
        <Typography variant="body2">Loading employees...</Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Photo</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Position</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.length > 0 ? (
              employees.slice((page - 1) * 10, page * 10).map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell>
                    {emp.photo ? (
                      <img
                        src={`${API_BASE_URL}/storage/${emp.photo}`}
                        alt={emp.name}
                        style={{ width: 40, height: 40, borderRadius: '50%' }}
                      />
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell>{emp.name}</TableCell>
                  <TableCell>{emp.user?.username || 'N/A'}</TableCell>
                  <TableCell>{emp.user?.email || 'N/A'}</TableCell>
                  <TableCell>{emp.position}</TableCell>
                  <TableCell>
                    <Chip
                      label={emp.suspended ? 'Suspended' : 'Active'}
                      color={emp.suspended ? 'error' : 'success'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button size="small" startIcon={<Edit />} onClick={() => openEditEmployee(emp)}>
                      Edit
                    </Button>
                    <Button
                      size="small"
                      startIcon={emp.suspended ? <CheckCircle /> : <Block />}
                      onClick={() => (emp.suspended ? confirmUnsuspendEmployee(emp.id) : confirmSuspendEmployee(emp.id))}
                    >
                      {emp.suspended ? 'Unsuspend' : 'Suspend'}
                    </Button>
                    <Button size="small" startIcon={<CompareArrows />} onClick={() => openTransferEmployee(emp)}>
                      Transfer
                    </Button>
                    <Button size="small" startIcon={<Delete />} onClick={() => confirmDeleteEmployee(emp.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7}>No employees found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}
      <EmployeeModal branchId={branchId} />
      <TransferModal branchId={branchId} />
    </Card>
  );
}

export default EmployeesList;
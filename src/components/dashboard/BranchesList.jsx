import React, { useContext } from 'react';
import { Card, Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, Pagination } from '@mui/material';
import { Add, Edit, Delete, FileDownload } from '@mui/icons-material';
import { DashboardContext } from '../../context/DashboardContext';
import { downloadCSV } from '../../utils/formatters';
import useDashboardData from '../../hooks/useDashboardData';
import BranchModal from './BranchModal';

function BranchesList({ branches }) {
  const { page, setPage, setEditingBranch, setSnack } = useContext(DashboardContext);
  const { branchesLoading, deleteBranch } = useDashboardData();
  const totalPages = branches.length > 0 ? Math.ceil(branches.length / 10) : 1; // Assuming 10 items per page

  const openAddBranch = () => setEditingBranch({
    name: '',
    location: '',
    tillNumber: '',
    type: 'butchery',
  });

  const openEditBranch = (branch) => setEditingBranch({
    id: branch.id,
    name: branch.name || '',
    location: branch.location || '',
    tillNumber: branch.tillNumber || '',
    type: branch.type || 'butchery',
  });

  const confirmDeleteBranch = async (id) => {
    if (!window.confirm('Delete this branch? This will delete all associated data.')) return;
    await deleteBranch.mutateAsync(id);
    setSnack({ open: true, msg: 'Branch deleted successfully', severity: 'success' });
  };

  return (
    <Card elevation={8} sx={{ borderRadius: 3, p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Branches</Typography>
        <Box>
          <Button
            startIcon={<FileDownload />}
            size="small"
            onClick={() =>
              downloadCSV(
                'branches.csv',
                branches.map((branch) => ({
                  id: branch.id,
                  name: branch.name,
                  location: branch.location,
                  tillNumber: branch.tillNumber,
                  type: branch.type,
                }))
              )
            }
          >
            Export
          </Button>
          <Button startIcon={<Add />} size="small" onClick={openAddBranch}>
            Add Branch
          </Button>
        </Box>
      </Box>
      <Typography variant="body2">{branches.length} branches</Typography>
      {branchesLoading ? (
        <Typography variant="body2">Loading branches...</Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Till Number</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {branches.length > 0 ? (
              branches.slice((page - 1) * 10, page * 10).map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell>{branch.name}</TableCell>
                  <TableCell>{branch.location}</TableCell>
                  <TableCell>{branch.tillNumber || 'N/A'}</TableCell>
                  <TableCell>{branch.type}</TableCell>
                  <TableCell>
                    <Button size="small" startIcon={<Edit />} onClick={() => openEditBranch(branch)}>
                      Edit
                    </Button>
                    <Button size="small" startIcon={<Delete />} onClick={() => confirmDeleteBranch(branch.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5}>No branches found</TableCell>
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
      <BranchModal />
    </Card>
  );
}

export default BranchesList;
// src/components/dashboard/Sections/BranchesSection.jsx
import { Box, Card, Grid, Typography, Button } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AddIcon from '@mui/icons-material/Add';
import { downloadCSV } from '../../../services/csvExport';

export default function BranchesSection({ branches, exportBranches, openAddBranch }) {
  return (
    <Card elevation={8} sx={{ borderRadius: 3, p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Branches</Typography>
        <Box>
          <Button startIcon={<FileDownloadIcon />} size="small" onClick={exportBranches}>Export</Button>
          <Button startIcon={<AddIcon />} size="small" onClick={openAddBranch}>Add Branch</Button>
        </Box>
      </Box>

      <Grid container spacing={2}>
        {branches.map((b) => (
          <Grid item xs={12} sm={6} md={4} key={b.id}>
            <Card elevation={4} sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle1">{b.name}</Typography>
              <Typography variant="body2">Till: {b.tillNumber}</Typography>
              <Typography variant="body2">Type: {b.type}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Card>
  );
}
// Branches section

// src/components/dashboard/Sections/EmployeesSection.jsx
import { Box, Card, Grid, Typography, Button, Avatar } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { downloadCSV } from '../../../services/csvExport';

export default function EmployeesSection({ employees, openAddEmployee, exportEmployees }) {
  return (
    <Card elevation={8} sx={{ borderRadius: 3, p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Employees</Typography>
        <Box>
          <Button startIcon={<FileDownloadIcon />} size="small" onClick={exportEmployees}>Export</Button>
          <Button startIcon={<PersonAddIcon />} size="small" onClick={openAddEmployee}>Add</Button>
        </Box>
      </Box>

      <Grid container spacing={2}>
        {employees.map((emp) => (
          <Grid item xs={12} sm={6} md={4} key={emp.id}>
            <Card elevation={3} sx={{ p: 2, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar src={emp.photo || emp.user?.photo} alt={emp.name || emp.user?.username} />
                <Box>
                  <Typography variant="subtitle1">{emp.name || emp.user?.username}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>{emp.position}</Typography>
                  <Typography variant="caption">{emp.status}</Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Card>
  );
}
// Employees section

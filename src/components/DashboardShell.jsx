import React, { Suspense, useState, lazy } from 'react';
import { Grid, Box, Button, CircularProgress } from '@mui/material';
import SidebarMenu from './SidebarMenu';
import StatCard from './StatCard';
import ReportsModal from './ReportsModal';
import useDashboardData from '../hooks/useDashboardData';

const SalesSection = lazy(() => import('./sections/SalesSection'));
const InventorySection = lazy(() => import('./sections/InventorySection'));
const EmployeesSection = lazy(() => import('./sections/EmployeesSection'));
const ExpensesSection = lazy(() => import('./sections/ExpensesSection'));
const PaymentsSection = lazy(() => import('./sections/PaymentsSection'));

export default function DashboardShell() {
  const [section, setSection] = useState('Overview');
  const [reportsOpen, setReportsOpen] = useState(false);
  const { metrics = {}, loading } = useDashboardData(); // ✅ safe default for metrics

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={3}>
        <SidebarMenu
          section={section}
          setSection={setSection}
          onOpenReports={() => setReportsOpen(true)}
        />
      </Grid>

      <Grid item xs={12} md={9}>
        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          {loading ? (
            // ✅ show a loading state while metrics are being fetched
            <Box sx={{ p: 2 }}>
              <CircularProgress size={28} />
            </Box>
          ) : (
            <>
              <StatCard
                title="Total Sales"
                value={metrics.totalSalesFormatted ?? '-'}
                subtitle={`${metrics.txCount ?? 0} tx`}
              />
              <StatCard
                title="Expenses"
                value={metrics.totalExpensesFormatted ?? '-'}
                subtitle="Outflows"
              />
              <StatCard
                title="Net Profit"
                value={metrics.netProfitFormatted ?? '-'}
                subtitle="After savings"
              />
            </>
          )}

          <Button
            variant="outlined"
            onClick={() => setReportsOpen(true)}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Generate Report
          </Button>
        </Box>

        <Suspense fallback={<div>Loading section...</div>}>
          {section === 'Overview' && <div>Overview — select a section</div>}
          {section === 'Sales' && <SalesSection />}
          {section === 'Inventory' && <InventorySection />}
          {section === 'Employees' && <EmployeesSection />}
          {section === 'Expenses' && <ExpensesSection />}
          {section === 'Payments' && <PaymentsSection />}
        </Suspense>
      </Grid>

      <ReportsModal open={reportsOpen} onClose={() => setReportsOpen(false)} />
    </Grid>
  );
}

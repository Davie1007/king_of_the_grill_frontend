import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { client, API_BASE_URL } from '../utils/api';
import echo from '../components/echo';
import { DashboardContext } from '../context/DashboardContext';

export default function useDashboardData(branchId, period, paymentMethod, page) {
  const queryClient = useQueryClient();
  const { setSnack, setBranchId } = React.useContext(DashboardContext);

  // 🔔 Real-time payment updates
  useEffect(() => {
    if (branchId) {
      echo.channel('public.payment-received').listen('PaymentReceived', () => {
        queryClient.invalidateQueries(['payments', branchId]);
        queryClient.invalidateQueries(['sales', branchId]);
      });
      return () => echo.leaveChannel('public.payment-received');
    }
  }, [branchId, queryClient]);

  // 🏢 Branches
  const {
    data: branches = [],
    isLoading: branchesLoading,
    refetch: refetchBranches,
  } = useQuery('branches', async () => (await client.get('/api/branches')).data, {
    staleTime: 1000 * 60 * 2,
  });

  // 👇 Auto-select first branch if none selected
  useEffect(() => {
    if (!branchId && branches.length > 0) {
      console.log('Auto-selecting first branch:', branches[0].id);
      setBranchId(branches[0].id);
    }
  }, [branchId, branches, setBranchId]);

  // 👥 Employees
  const {
    data: employees = [],
    isLoading: employeesLoading,
    refetch: refetchEmployees,
  } = useQuery(
    ['employees', branchId],
    async () => (await client.get(`/api/branches/${branchId}/employees`)).data,
    { enabled: !!branchId }
  );

  // 📦 Inventory
  const {
    data: inventory = [],
    isLoading: inventoryLoading,
  } = useQuery(
    ['inventory', branchId],
    async () => (await client.get(`/api/branches/${branchId}/inventory`)).data,
    { enabled: !!branchId }
  );

  // 💳 Payments
  const {
    data: payments = [],
    isLoading: paymentsLoading,
  } = useQuery(
    ['payments', branchId, paymentMethod, page],
    () =>
      client
        .get(`/api/branches/${branchId}/payments`, {
          params: { page, payment_method: paymentMethod || undefined },
        })
        .then((res) => res.data),
    { keepPreviousData: true, enabled: !!branchId }
  );

  // 📈 Branch Statistics
  const { data: branchStats = [], isLoading } = useQuery(
    ['branchStats', branchId],
    async () => (await client.get(`/api/branches/${branchId}/statistics`)).data,
    { refetchInterval: 60_000, enabled: !!branchId }
  );

  // 🧮 Performance
  const { data: performance } = useQuery(
    ['inventoryPerformance', branchId, period],
    () =>
      fetch(`${API_BASE_URL}/api/inventory/performance/${branchId}?period=${period}`).then((r) =>
        r.json()
      ),
    { enabled: !!branchId }
  );

  // 💰 Sales
  const salesQuery = useQuery(
    ['sales', branchId],
    async () => (await client.get(`/api/branches/${branchId}/sales`)).data,
    { enabled: !!branchId }
  );

  // 💸 Expenses
  const groupedQuery = useQuery(
    ['expenses-grouped', branchId, period],
    async () =>
      (await client.get(`/api/branches/${branchId}/expenses/grouped?period=${period}`)).data,
    { enabled: !!branchId }
  );

  const expensesQuery = useQuery(
    ['expenses-list', branchId, page],
    async () =>
      (await client.get(`/api/branches/${branchId}/expenses?page=${page}`)).data,
    { enabled: !!branchId }
  );

  // 🧾 Derived Metrics for Dashboard
  const totalSales =
    salesQuery.data?.reduce((sum, s) => sum + Number(s.total || 0), 0) || 0;
  const totalExpenses =
    groupedQuery.data?.reduce((sum, g) => sum + Number(g.amount || 0), 0) || 0;
  const netProfit = totalSales - totalExpenses;

  const metrics = {
    totalSales,
    totalSalesFormatted: totalSales.toLocaleString(),
    totalExpenses,
    totalExpensesFormatted: totalExpenses.toLocaleString(),
    netProfit,
    netProfitFormatted: netProfit.toLocaleString(),
    txCount: salesQuery.data?.length || 0,
  };

  // 🧰 Mutations
  const addInventory = useMutation(
    async (payload) => {
      const formData = new FormData();
      formData.append('is_butchery', payload.isButchery ? '1' : '0');
      formData.append('name', payload.name);
      formData.append('price', payload.price.toString());
      formData.append('buying_price', payload.buying_price.toString());
      if (payload.isButchery) {
        formData.append('price2', '');
        formData.append('price3', '');
      } else {
        formData.append('price2', payload.price2.toString());
        formData.append('price3', payload.price3.toString());
      }
      formData.append('stock', payload.stock.toString());
      formData.append('unit', payload.unit);
      if (payload.image instanceof File) {
        formData.append('image', payload.image);
      }
      return (
        await client.post(`/api/branches/${branchId}/inventory`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      ).data.item;
    },
    {
      onMutate: async (newItem) => {
        await queryClient.cancelQueries(['inventory', branchId]);
        const previous = queryClient.getQueryData(['inventory', branchId]) || [];
        queryClient.setQueryData(['inventory', branchId], [
          ...previous,
          { ...newItem, id: `tmp-${Date.now()}` },
        ]);
        return { previous };
      },
      onError: (err, _, ctx) => {
        const errorMsg =
          err.response?.data?.errors
            ? Object.values(err.response.data.errors).flat().join(', ')
            : err.response?.data?.message || 'Failed to add item';
        setSnack({ open: true, msg: errorMsg, severity: 'error' });
        queryClient.setQueryData(['inventory', branchId], ctx.previous);
      },
      onSuccess: () => {
        setSnack({
          open: true,
          msg: 'Inventory item added successfully',
          severity: 'success',
        });
      },
      onSettled: () => queryClient.invalidateQueries(['inventory', branchId]),
    }
  );

  // 🧭 Return all data and utilities
  return {
    branches,
    branchesLoading,
    refetchBranches,
    employees,
    employeesLoading,
    refetchEmployees,
    inventory,
    inventoryLoading,
    payments,
    paymentsLoading,
    branchStats,
    isLoading,
    performance,
    salesQuery,
    groupedQuery,
    expensesQuery,
    metrics, // ✅ Added
    addInventory,
  };
}

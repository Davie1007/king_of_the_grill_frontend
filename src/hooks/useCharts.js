import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { client } from '../utils/api';

export default function useCharts(branchId) {
  const salesQuery = useQuery(
    ['sales', branchId],
    async () => (await client.get(`/api/branches/${branchId}/sales`)).data,
    { enabled: !!branchId }
  );

  const inventoryQuery = useQuery(
    ['inventory', branchId],
    async () => (await client.get(`/api/branches/${branchId}/inventory`)).data,
    { enabled: !!branchId }
  );

  const expensesQuery = useQuery(
    ['expenses-list', branchId],
    async () => (await client.get(`/api/branches/${branchId}/expenses`)).data,
    { enabled: !!branchId }
  );

  const salesByDayChart = useMemo(() => {
    const sales = salesQuery.data || [];
    const map = {};
    sales.forEach((s) => {
      const d = (s.timestamp || s.created_at || '').slice(0, 10) || 'unknown';
      map[d] = (map[d] || 0) + Number(s.total || 0);
    });
    return Object.entries(map)
      .slice(-14)
      .map(([k, v]) => ({ name: k, total: Number(v) }));
  }, [salesQuery.data]);

  const salesDistribution = useMemo(() => {
    const sales = salesQuery.data || [];
    const map = {};
    sales.forEach((s) => {
      const item = s.item_purchased || s.item || 'Misc';
      const qty = Number(s.quantity) || 1;
      map[item] = (map[item] || 0) + qty;
    });
    return Object.entries(map).map(([name, value]) => ({
      name,
      value: Number(value),
    }));
  }, [salesQuery.data]);

  const cashFlowTarget = 50000; // KES or fetch from API

  const cashFlow = useMemo(() => {
    const totalSales = (salesQuery.data || []).reduce((s, it) => s + Number(it.total || 0), 0);
    const totalExpenses = (expensesQuery.data?.data || []).reduce((s, it) => s + Number(it.amount || 0), 0);
    return totalSales - totalExpenses;
  }, [salesQuery.data, expensesQuery.data]);

  const lowStockItems = useMemo(() => {
    const inv = inventoryQuery.data || [];
    return inv.filter((it) => Number(it.stock) < 5);
  }, [inventoryQuery.data]);

  return { salesByDayChart, salesDistribution, lowStockItems, cashFlow, cashFlowTarget };
}
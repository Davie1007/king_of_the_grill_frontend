import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { client } from '../utils/api';

export default function useMetrics(branchId, savingsPct) {
  const salesQuery = useQuery(
    ['sales', branchId],
    async () => (await client.get(`/api/branches/${branchId}/sales`)).data,
    { enabled: !!branchId }
  );

  const expensesQuery = useQuery(
    ['expenses-list', branchId],
    async () => (await client.get(`/api/branches/${branchId}/expenses`)).data,
    { enabled: !!branchId }
  );

  const resolvedArray = (q) => {
    if (!q) return [];
    if (Array.isArray(q)) return q;
    if (Array.isArray(q.data)) return q.data;
    return [];
  };

  const metrics = useMemo(() => {
    const sales = salesQuery.data || [];
    const expenses = resolvedArray(expensesQuery.data);
    const totalSales = sales.reduce((s, it) => s + Number(it.total || 0), 0);
    const totalExpenses = expenses.reduce((s, it) => s + Number(it.amount || 0), 0);
    const grossProfit = totalSales - totalExpenses;
    const savings = Math.max(0, grossProfit * savingsPct);
    const netProfit = grossProfit - savings;
    const level = Math.min(50, Math.floor(totalSales / 500));
    const xp = Math.min(100, ((totalSales % 500) / 500) * 100);
    return { totalSales, totalExpenses, grossProfit, savings, netProfit, level, xp };
  }, [salesQuery.data, expensesQuery.data, savingsPct]);

  return metrics;
}
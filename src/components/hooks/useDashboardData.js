import { useQuery } from 'react-query';
import client from '../utils/api';
import { useMemo } from 'react';
import { formatCurrency } from '../utils/format';

export default function useDashboardData(branchId=null) {
  const { data: sales = [], isLoading: salesLoading } = useQuery(['sales', branchId], async () => (await client.get(`/api/branches/${branchId}/sales`)).data, { enabled: !!branchId });
  const { data: expenses = [], isLoading: expensesLoading } = useQuery(['expenses', branchId], async () => (await client.get(`/api/branches/${branchId}/expenses`)).data, { enabled: !!branchId });
  const { data: inventory = [], isLoading: invLoading } = useQuery(['inventory', branchId], async () => (await client.get(`/api/branches/${branchId}/inventory`)).data, { enabled: !!branchId });
  const { data: employees = [], isLoading: empLoading } = useQuery(['employees', branchId], async () => (await client.get(`/api/branches/${branchId}/employees`)).data, { enabled: !!branchId });

  const metrics = useMemo(() => {
    const totalSales = (sales || []).reduce((s,i)=>s+Number(i.total||0),0);
    const totalExpenses = (expenses || []).reduce((s,i)=>s+Number(i.amount||0),0);
    const netProfit = totalSales - totalExpenses;
    const txCount = (sales || []).length;
    return {
      totalSales, totalExpenses, netProfit, txCount,
      totalSalesFormatted: formatCurrency(totalSales),
      totalExpensesFormatted: formatCurrency(totalExpenses),
      netProfitFormatted: formatCurrency(netProfit),
    };
  }, [sales, expenses]);

  return { sales, expenses, inventory, employees, metrics, loading: salesLoading||expensesLoading||invLoading||empLoading };
}

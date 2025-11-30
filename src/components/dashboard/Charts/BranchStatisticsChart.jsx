import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../../services/formatters';

export default function BranchStatisticsChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(v) => formatCurrency(v)} />
        <Tooltip formatter={(val) => formatCurrency(val)} />
        <Line type="monotone" dataKey="value" stroke="#1976d2" strokeWidth={3} dot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
// Branch stats chart

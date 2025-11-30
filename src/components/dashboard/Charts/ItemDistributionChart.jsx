import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#007AFF', '#5AC8FA', '#34C759', '#FF9500', '#FF2D55', '#8E8E93'];

export default function ItemDistributionChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie dataKey="value" data={data} cx="50%" cy="50%" outerRadius={70} label>
          {data.map((entry, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
// Pie chart for item distribution

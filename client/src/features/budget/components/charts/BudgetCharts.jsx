import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getBudgetTone, objectToChartRows } from '../../../../utils/budgetCalculations.js';

const colors = ['#f97316', '#10b981', '#14b8a6', '#f59e0b', '#84cc16', '#64748b'];

function ChartCard({ title, children }) {
  return (
    <article className="rounded-[1.5rem] border border-orange-100 bg-gradient-to-br from-white to-orange-50 p-4 shadow-sm">
      <h3 className="font-black text-slate-950">{title}</h3>
      <div className="mt-4 h-72">{children}</div>
    </article>
  );
}

function BudgetCharts({ summary, expenses = [], monthlyRows = [], savingsRows = [] }) {
  const categoryRows = objectToChartRows(summary.totals.byCategory);
  const distributionRows = objectToChartRows(summary.totals.byCostType, 'type', 'amount');
  const tone = getBudgetTone(summary.utilization);
  const budgetVsActual = [
    { name: 'Budget', value: summary.totalBudget },
    { name: 'Estimated', value: summary.totalEstimatedCost },
    { name: 'Actual', value: summary.totalActualCost },
  ];
  const gaugeRows = [{ name: tone.label, value: Math.min(summary.utilization, 100), fill: tone.key === 'over' ? '#ef4444' : tone.key === 'near' ? '#f59e0b' : '#10b981' }];

  if (!expenses.length) {
    return <p className="mt-5 rounded-2xl bg-orange-50 p-4 font-semibold text-slate-600">Add expenses to populate charts.</p>;
  }

  return (
    <div className="mt-5 grid gap-5 xl:grid-cols-2">
      <ChartCard title="Budget vs Actual">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={budgetVsActual}>
            <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#f97316" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Category-wise Spend">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={categoryRows} dataKey="value" nameKey="name" outerRadius={95} label>
              {categoryRows.map((row, index) => <Cell key={row.name} fill={colors[index % colors.length]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Monthly Spending Trend">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={monthlyRows}>
            <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="estimated" stroke="#f59e0b" strokeWidth={3} />
            <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={3} />
            <Line type="monotone" dataKey="total" stroke="#f97316" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Expense Distribution">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={distributionRows}>
            <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" />
            <XAxis dataKey="type" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="amount" fill="#10b981" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Savings Trend">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={savingsRows}>
            <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="savings" stroke="#10b981" strokeWidth={3} />
            <Line type="monotone" dataKey="spent" stroke="#ef4444" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Budget Utilization Gauge">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart innerRadius="60%" outerRadius="100%" data={gaugeRows} startAngle={180} endAngle={0}>
            <RadialBar dataKey="value" cornerRadius={12} background />
            <Tooltip />
            <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" className="fill-slate-950 text-2xl font-black">
              {summary.utilization.toFixed(1)}%
            </text>
          </RadialBarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

export default BudgetCharts;

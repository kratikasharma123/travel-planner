import { currencyFormat } from '../../../utils/budgetCalculations.js';

function ExpenseTable({ expenses = [], currency = 'USD', pagination, onEdit, onDelete, onPageChange, isLoading }) {
  if (isLoading) return <p className="rounded-2xl bg-slate-50 p-4 text-slate-600">Loading expenses...</p>;

  if (!expenses.length) {
    return <p className="rounded-2xl bg-slate-50 p-4 text-slate-600">No expenses found. Add an expense or adjust filters.</p>;
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.16em] text-slate-500">
            <tr>
              <th className="px-5 py-4">Title</th>
              <th className="px-5 py-4">Category</th>
              <th className="px-5 py-4">Amount</th>
              <th className="px-5 py-4">Date</th>
              <th className="px-5 py-4">Vendor</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Type</th>
              <th className="px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {expenses.map((expense) => (
              <tr key={expense._id} className="align-top">
                <td className="px-5 py-4 font-semibold text-slate-950">{expense.title}<p className="mt-1 max-w-xs text-xs font-normal text-slate-500">{expense.notes}</p></td>
                <td className="px-5 py-4 text-slate-600">{expense.category}</td>
                <td className="px-5 py-4 font-bold text-slate-950">{currencyFormat(expense.amount, currency)}</td>
                <td className="px-5 py-4 text-slate-600">{expense.expenseDate}</td>
                <td className="px-5 py-4 text-slate-600">{expense.vendor || '—'}</td>
                <td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-700">{expense.status}</span></td>
                <td className="px-5 py-4 text-slate-600">{expense.costType}</td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => onEdit(expense)} className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Edit</button>
                    <button type="button" onClick={() => onDelete(expense._id)} className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-4 lg:hidden">
        {expenses.map((expense) => (
          <article key={expense._id} className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-950">{expense.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{expense.category} • {expense.vendor || 'No vendor'}</p>
              </div>
              <p className="font-bold text-slate-950">{currencyFormat(expense.amount, currency)}</p>
            </div>
            <p className="mt-3 text-sm text-slate-600">{expense.expenseDate} • {expense.status} • {expense.costType}</p>
            {expense.notes && <p className="mt-2 text-sm text-slate-500">{expense.notes}</p>}
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => onEdit(expense)} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Edit</button>
              <button type="button" onClick={() => onDelete(expense._id)} className="rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700">Delete</button>
            </div>
          </article>
        ))}
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 text-sm text-slate-600">
          <span>Page {pagination.page} of {pagination.pages} • {pagination.total} expenses</span>
          <div className="flex gap-2">
            <button type="button" disabled={pagination.page <= 1} onClick={() => onPageChange(pagination.page - 1)} className="rounded-full border border-slate-300 px-4 py-2 font-semibold disabled:opacity-50">Previous</button>
            <button type="button" disabled={pagination.page >= pagination.pages} onClick={() => onPageChange(pagination.page + 1)} className="rounded-full border border-slate-300 px-4 py-2 font-semibold disabled:opacity-50">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExpenseTable;

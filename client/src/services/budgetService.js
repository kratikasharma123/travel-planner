import { supabase } from './supabaseClient.js';
import { buildPagination, createServiceError, getCurrentUserId, mapBudget, normalizePaginationParams, throwIfError } from './supabaseUtils.js';

function calculateTotal(categories = {}) {
  return Object.values(categories).reduce((total, value) => total + Number(value || 0), 0);
}

function mapExpense(row) {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    user: row.user_id,
    budgetId: row.budget_id,
    tripId: row.trip_id,
    title: row.title,
    category: row.category,
    amount: Number(row.amount || 0),
    expenseDate: row.expense_date,
    vendor: row.vendor || '',
    notes: row.notes || '',
    status: row.status || 'estimated',
    costType: row.cost_type || 'variable',
    recurrenceFrequency: row.recurrence_frequency || '',
    recurrenceEndDate: row.recurrence_end_date || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function budgetPayloadToRow(payload = {}, userId) {
  const categories = payload.categories || {};
  return {
    ...(userId ? { user_id: userId } : {}),
    ...(payload.tripId !== undefined ? { trip_id: payload.tripId || null } : {}),
    ...(payload.name !== undefined ? { name: payload.name || 'Trip Budget' } : {}),
    ...(payload.category !== undefined ? { category: payload.category || 'general' } : {}),
    ...(payload.description !== undefined ? { description: payload.description || '' } : {}),
    ...(payload.totalBudget !== undefined ? { total_budget: Number(payload.totalBudget || 0) } : {}),
    ...(payload.startDate !== undefined ? { start_date: payload.startDate || null } : {}),
    ...(payload.endDate !== undefined ? { end_date: payload.endDate || null } : {}),
    ...(payload.savingsTarget !== undefined ? { savings_target: Number(payload.savingsTarget || 0) } : {}),
    ...(payload.fixedCosts !== undefined ? { fixed_costs: Number(payload.fixedCosts || 0) } : {}),
    ...(payload.variableCosts !== undefined ? { variable_costs: Number(payload.variableCosts || 0) } : {}),
    ...(payload.oneTimeCosts !== undefined ? { one_time_costs: Number(payload.oneTimeCosts || 0) } : {}),
    ...(payload.recurringCosts !== undefined ? { recurring_costs: Number(payload.recurringCosts || 0) } : {}),
    ...(payload.currency !== undefined ? { currency: (payload.currency || 'USD').toUpperCase() } : {}),
    ...(payload.categories !== undefined ? { categories } : {}),
    ...(payload.totalEstimate !== undefined ? { total_estimate: Number(payload.totalEstimate || calculateTotal(categories)) } : {}),
    ...(payload.confidenceLevel !== undefined ? { confidence_level: payload.confidenceLevel || 'low' } : {}),
    ...(payload.notes !== undefined ? { notes: payload.notes || '' } : {}),
    updated_at: new Date().toISOString(),
  };
}

function expensePayloadToRow(payload = {}, userId) {
  return {
    ...(userId ? { user_id: userId } : {}),
    ...(payload.budgetId !== undefined ? { budget_id: payload.budgetId } : {}),
    ...(payload.tripId !== undefined ? { trip_id: payload.tripId || null } : {}),
    ...(payload.title !== undefined ? { title: payload.title } : {}),
    ...(payload.category !== undefined ? { category: payload.category || 'miscellaneous' } : {}),
    ...(payload.amount !== undefined ? { amount: Number(payload.amount || 0) } : {}),
    ...(payload.expenseDate !== undefined ? { expense_date: payload.expenseDate || new Date().toISOString().slice(0, 10) } : {}),
    ...(payload.vendor !== undefined ? { vendor: payload.vendor || '' } : {}),
    ...(payload.notes !== undefined ? { notes: payload.notes || '' } : {}),
    ...(payload.status !== undefined ? { status: payload.status || 'estimated' } : {}),
    ...(payload.costType !== undefined ? { cost_type: payload.costType || 'variable' } : {}),
    ...(payload.recurrenceFrequency !== undefined ? { recurrence_frequency: payload.recurrenceFrequency || '' } : {}),
    ...(payload.recurrenceEndDate !== undefined ? { recurrence_end_date: payload.recurrenceEndDate || null } : {}),
    updated_at: new Date().toISOString(),
  };
}

async function ensureOwnTrip(userId, tripId) {
  if (!tripId) return;
  const { data, error } = await supabase.from('trips').select('id').eq('id', tripId).eq('user_id', userId).maybeSingle();
  throwIfError(error, 'Unable to verify trip ownership.');
  if (!data) throw createServiceError({ message: 'Trip not found.', status: 404, code: 'TRIP_NOT_FOUND' });
}

export async function listBudgets(filters = {}) {
  const userId = await getCurrentUserId();
  let query = supabase.from('budgets').select('*').eq('user_id', userId).order('created_at', { ascending: false });

  if (filters.category) query = query.eq('category', filters.category);
  if (filters.tripId) query = query.eq('trip_id', filters.tripId);
  if (filters.search) query = query.or(`name.ilike.%${filters.search}%,category.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);

  const { data, error } = await query;
  throwIfError(error, 'Unable to load budgets.');
  return { budgets: (data || []).map(mapBudget) };
}

export async function createBudget(payload) {
  const userId = await getCurrentUserId();
  await ensureOwnTrip(userId, payload.tripId);
  const { data, error } = await supabase.from('budgets').insert(budgetPayloadToRow(payload, userId)).select('*').single();
  throwIfError(error, 'Unable to create budget.');
  return { budget: mapBudget(data) };
}

export async function updateBudgetRecord(budgetId, payload) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase.from('budgets').update(budgetPayloadToRow(payload)).eq('id', budgetId).eq('user_id', userId).select('*').single();
  throwIfError(error, 'Unable to update budget.');
  return { budget: mapBudget(data) };
}

export async function listExpenses(filters = {}) {
  const userId = await getCurrentUserId();
  const { page, limit, from, to } = normalizePaginationParams(filters);
  let query = supabase
    .from('budget_expenses')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('expense_date', { ascending: false })
    .range(from, to);

  if (filters.budgetId) query = query.eq('budget_id', filters.budgetId);
  if (filters.category) query = query.eq('category', filters.category);
  if (filters.vendor) query = query.ilike('vendor', `%${filters.vendor}%`);
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.month) query = query.gte('expense_date', `${filters.month}-01`).lt('expense_date', `${filters.month}-32`);
  if (filters.year) query = query.gte('expense_date', `${filters.year}-01-01`).lt('expense_date', `${Number(filters.year) + 1}-01-01`);
  if (filters.startDate) query = query.gte('expense_date', filters.startDate);
  if (filters.endDate) query = query.lte('expense_date', filters.endDate);
  if (filters.search) query = query.or(`title.ilike.%${filters.search}%,vendor.ilike.%${filters.search}%,category.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`);

  const { data, error, count } = await query;
  throwIfError(error, 'Unable to load expenses.');
  return { expenses: (data || []).map(mapExpense), pagination: buildPagination(page, limit, count || 0) };
}

export async function createExpense(payload) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase.from('budget_expenses').insert(expensePayloadToRow(payload, userId)).select('*').single();
  throwIfError(error, 'Unable to create expense.');
  return { expense: mapExpense(data) };
}

export async function updateExpense(expenseId, payload) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase.from('budget_expenses').update(expensePayloadToRow(payload)).eq('id', expenseId).eq('user_id', userId).select('*').single();
  throwIfError(error, 'Unable to update expense.');
  return { expense: mapExpense(data) };
}

export async function deleteExpense(expenseId) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase.from('budget_expenses').delete().eq('id', expenseId).eq('user_id', userId).select('*').single();
  throwIfError(error, 'Unable to delete expense.');
  return { expense: mapExpense(data) };
}

export async function getBudget(tripId) {
  const userId = await getCurrentUserId();
  await ensureOwnTrip(userId, tripId);
  const { data, error } = await supabase.from('budgets').select('*').eq('trip_id', tripId).eq('user_id', userId).maybeSingle();
  throwIfError(error, 'Unable to load budget.');
  if (!data) throw createServiceError({ message: 'Budget not found.', status: 404, code: 'BUDGET_NOT_FOUND' });
  return { budget: mapBudget(data) };
}

export async function updateBudget(tripId, payload) {
  const userId = await getCurrentUserId();
  await ensureOwnTrip(userId, tripId);
  const categories = payload.categories || {};
  const row = budgetPayloadToRow({ ...payload, tripId, totalEstimate: calculateTotal(categories) }, userId);
  const { data, error } = await supabase.from('budgets').upsert(row, { onConflict: 'user_id,trip_id' }).select('*').single();
  throwIfError(error, 'Unable to save budget.');
  return { budget: mapBudget(data) };
}

export async function deleteBudget(budgetId) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase.from('budgets').delete().eq('id', budgetId).eq('user_id', userId).select('*').single();
  throwIfError(error, 'Unable to delete budget.');
  return { budget: mapBudget(data) };
}

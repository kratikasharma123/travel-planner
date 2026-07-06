import { useMemo, useState } from 'react';
import { ADMIN_PERMISSIONS, hasAdminPermission } from '../adminConstants.js';
import AdminModal from '../components/AdminModal.jsx';
import AdminSection from '../components/AdminSection.jsx';
import AdminTable from '../components/AdminTable.jsx';
import AdminToolbar from '../components/AdminToolbar.jsx';
import { downloadCsv, filterRows } from '../../../utils/adminExport.js';
import { useAuth } from '../../../hooks/useAuth.js';

function formatFieldLabel(key = '') {
  return key
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatFieldValue(value) {
  if (value === null || value === undefined || value === '') return '—';
  if (Array.isArray(value)) return value.length ? value.join(', ') : '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

function RecordDetails({ row }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {Object.entries(row).map(([key, value]) => {
        const isObject = value && typeof value === 'object' && !Array.isArray(value);

        return (
          <div
            key={key}
            className={`rounded-2xl border border-orange-100 bg-orange-50/40 p-4 ${isObject ? 'md:col-span-3' : ''}`}
          >
            <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-500">
              {formatFieldLabel(key)}
            </p>
            {isObject ? (
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {Object.entries(value).length ? Object.entries(value).map(([nestedKey, nestedValue]) => (
                  <div key={nestedKey} className="rounded-xl bg-white p-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.14em] text-stone-400">
                      {formatFieldLabel(nestedKey)}
                    </p>
                    <p className="mt-1 break-words text-sm font-semibold text-stone-800">
                      {formatFieldValue(nestedValue)}
                    </p>
                  </div>
                )) : <p className="text-sm font-semibold text-stone-500">No details added.</p>}
              </div>
            ) : (
              <p className="mt-2 break-words text-sm font-semibold text-stone-800">
                {formatFieldValue(value)}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function JsonRecordForm({ initialValue, error, isMutating, submitLabel, onCancel, onSubmit }) {
  const [json, setJson] = useState(JSON.stringify(initialValue || {}, null, 2));

  async function handleSubmit(event) {
    event.preventDefault();
    await onSubmit(JSON.parse(json));
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      {error && <p className="rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      <textarea
        value={json}
        onChange={(event) => setJson(event.target.value)}
        rows={10}
        className="form-control font-mono text-xs"
        aria-label="Record JSON"
      />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={isMutating} className="btn-primary">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function InlineActions({
  row,
  table,
  updateRecord,
  deleteRecord,
  isMutating,
  writePermission,
  statusOptions = [],
  renderEditForm,
  hideDelete = false,
}) {
  const { user } = useAuth();
  const canWrite = hasAdminPermission(user, writePermission);
  const [nextStatus, setNextStatus] = useState(row.status || '');
  const [showDetails, setShowDetails] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editError, setEditError] = useState('');

  async function submitEditPayload(payload) {
    setEditError('');
    try {
      await updateRecord(table, row.id, payload);
      setIsEditOpen(false);
    } catch (error) {
      setEditError(
        error instanceof SyntaxError
          ? 'Enter valid JSON before saving.'
          : error?.message || 'Unable to update record.'
      );
    }
  }

  async function handleStatusUpdate() {
    if (!nextStatus || nextStatus === row.status) return;
    await updateRecord(table, row.id, { status: nextStatus });
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <button
        type="button"
        onClick={() => setShowDetails(true)}
        className="btn-secondary px-3 py-1.5 text-xs"
      >
        View
      </button>

      {canWrite && (
        <button
          type="button"
          onClick={() => setIsEditOpen(true)}
          disabled={isMutating}
          className="btn-secondary px-3 py-1.5 text-xs"
        >
          Edit
        </button>
      )}

      {canWrite && statusOptions.length > 0 && (
        <>
          <select
            value={nextStatus}
            onChange={(event) => setNextStatus(event.target.value)}
            className="form-control bg-white py-1.5 text-xs"
            aria-label="Update status"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={isMutating || nextStatus === row.status}
            onClick={handleStatusUpdate}
            className="btn-secondary px-3 py-1.5 text-xs"
          >
            Save
          </button>
        </>
      )}

      {canWrite && !hideDelete && (
        <button
          type="button"
          disabled={isMutating}
          onClick={() =>
            window.confirm('Delete this record? This action cannot be undone.') &&
            deleteRecord(table, row.id)
          }
          className="btn-danger px-3 py-1.5 text-xs"
        >
          Delete
        </button>
      )}

      {showDetails && (
        <AdminModal title="Record details" onClose={() => setShowDetails(false)}>
          <RecordDetails row={row} />
        </AdminModal>
      )}

      {isEditOpen && (
        <AdminModal title="Edit record" description="Update this real Supabase record." onClose={() => setIsEditOpen(false)}>
          {renderEditForm ? (
            renderEditForm({
              row,
              editError,
              isMutating,
              onCancel: () => setIsEditOpen(false),
              onSave: submitEditPayload,
            })
          ) : (
            <JsonRecordForm
              initialValue={row}
              error={editError}
              isMutating={isMutating}
              submitLabel="Save changes"
              onCancel={() => setIsEditOpen(false)}
              onSubmit={submitEditPayload}
            />
          )}
        </AdminModal>
      )}
    </div>
  );
}

function AdminRecordSection({
  eyebrow,
  title,
  description,
  table,
  rows,
  columns,
  searchFields,
  filterKey = 'status',
  filterOptions = [],
  statusOptions = [],
  filename,
  writePermission = ADMIN_PERMISSIONS.SETTINGS_WRITE,
  updateRecord,
  deleteRecord,
  createRecord,
  isMutating,
  hideActions = false,
  hideDelete = false,
  globalSearch = '',
  createButtonLabel = 'Create',
  createDescription = 'Enter a JSON payload. Use fields supported by this section schema.',
  defaultCreateValue = { title: 'New record', status: 'draft' },
  renderCreateForm,
  renderEditForm,
  defaultCreateOpen = false,
}) {
  const [localSearch, setLocalSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(defaultCreateOpen);
  const [createError, setCreateError] = useState('');
  const { user } = useAuth();
  const canCreate =
    Boolean(createRecord) && hasAdminPermission(user, writePermission) && !hideActions;

  const search = localSearch || globalSearch;

  const filteredRows = useMemo(() => {
    const searched = filterRows(rows, search, searchFields);
    if (!filter || !filterKey) return searched;
    return searched.filter((row) => String(row[filterKey] || '') === filter);
  }, [rows, search, searchFields, filter, filterKey]);

  const filters = filterOptions.length
    ? [
        {
          key: filterKey,
          label: filterKey.replaceAll('_', ' '),
          value: filter,
          onChange: setFilter,
          options: filterOptions,
        },
      ]
    : [];

  async function submitCreatePayload(payload) {
    setCreateError('');
    try {
      await createRecord(table, payload);
      setIsCreateOpen(false);
    } catch (error) {
      setCreateError(
        error instanceof SyntaxError
          ? 'Enter valid JSON before creating a record.'
          : error?.message || 'Unable to create record.'
      );
    }
  }

  return (
    <AdminSection eyebrow={eyebrow} title={title} description={description}>
      <AdminToolbar
        search={search}
        onSearchChange={setLocalSearch}
        filters={filters}
        resultCount={filteredRows.length}
        actions={
          <>
            {canCreate && (
              <button type="button" onClick={() => setIsCreateOpen(true)} className="btn-primary">
                {createButtonLabel}
              </button>
            )}
            <button
              type="button"
              onClick={() => downloadCsv(filename || table, filteredRows, columns)}
              className="btn-secondary"
            >
              Export CSV
            </button>
          </>
        }
      />
      <AdminTable
        columns={columns}
        rows={filteredRows}
        actions={
          hideActions
            ? null
            : (row) => (
                <InlineActions
                  row={row}
                  table={table}
                  updateRecord={updateRecord}
                  deleteRecord={deleteRecord}
                  isMutating={isMutating}
                  writePermission={writePermission}
                  statusOptions={statusOptions}
                  renderEditForm={renderEditForm}
                  hideDelete={hideDelete}
                />
              )
        }
      />
      {isCreateOpen && (
        <AdminModal
          title={`Create ${title}`}
          description={createDescription}
          onClose={() => setIsCreateOpen(false)}
        >
          {renderCreateForm ? (
            renderCreateForm({
              createError,
              isMutating,
              onCancel: () => setIsCreateOpen(false),
              onCreate: submitCreatePayload,
            })
          ) : (
            <JsonRecordForm
              initialValue={defaultCreateValue}
              error={createError}
              isMutating={isMutating}
              submitLabel="Create record"
              onCancel={() => setIsCreateOpen(false)}
              onSubmit={submitCreatePayload}
            />
          )}
        </AdminModal>
      )}
    </AdminSection>
  );
}

export default AdminRecordSection;

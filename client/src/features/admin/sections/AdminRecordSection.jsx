import { useMemo, useState } from 'react';
import { ADMIN_PERMISSIONS, hasAdminPermission } from '../adminConstants.js';
import AdminModal from '../components/AdminModal.jsx';
import AdminSection from '../components/AdminSection.jsx';
import AdminTable from '../components/AdminTable.jsx';
import AdminToolbar from '../components/AdminToolbar.jsx';
import { downloadCsv, filterRows } from '../../../utils/adminExport.js';
import { useAuth } from '../../../hooks/useAuth.js';

function InlineActions({
  row,
  table,
  updateRecord,
  deleteRecord,
  isMutating,
  writePermission,
  statusOptions = [],
}) {
  const { user } = useAuth();
  const canWrite = hasAdminPermission(user, writePermission);
  const [nextStatus, setNextStatus] = useState(row.status || '');
  const [showDetails, setShowDetails] = useState(false);

  if (!canWrite) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowDetails(true)}
          className="btn-secondary px-3 py-1.5 text-xs"
        >
          View
        </button>
        {showDetails && (
          <AdminModal title="Record details" onClose={() => setShowDetails(false)}>
            <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">
              {JSON.stringify(row, null, 2)}
            </pre>
          </AdminModal>
        )}
      </>
    );
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
      {statusOptions.length > 0 && (
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
      {showDetails && (
        <AdminModal title="Record details" onClose={() => setShowDetails(false)}>
          <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">
            {JSON.stringify(row, null, 2)}
          </pre>
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
}) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createJson, setCreateJson] = useState(
    '{\n  "title": "New record",\n  "status": "draft"\n}'
  );
  const [createError, setCreateError] = useState('');
  const { user } = useAuth();
  const canCreate =
    Boolean(createRecord) && hasAdminPermission(user, writePermission) && !hideActions;

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

  async function handleCreate(event) {
    event.preventDefault();
    setCreateError('');
    try {
      await createRecord(table, JSON.parse(createJson));
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
        onSearchChange={setSearch}
        filters={filters}
        resultCount={filteredRows.length}
        actions={
          <>
            {canCreate && (
              <button type="button" onClick={() => setIsCreateOpen(true)} className="btn-primary">
                Create
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
                />
              )
        }
      />
      {isCreateOpen && (
        <AdminModal
          title={`Create ${title}`}
          description="Enter a JSON payload. Use fields supported by this section schema."
          onClose={() => setIsCreateOpen(false)}
        >
          <form className="grid gap-4" onSubmit={handleCreate}>
            {createError && (
              <p className="rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">{createError}</p>
            )}
            <textarea
              value={createJson}
              onChange={(event) => setCreateJson(event.target.value)}
              rows={10}
              className="form-control font-mono text-xs"
              aria-label="Create record JSON"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" disabled={isMutating} className="btn-primary">
                Create record
              </button>
            </div>
          </form>
        </AdminModal>
      )}
    </AdminSection>
  );
}

export default AdminRecordSection;

import { useMemo, useState } from 'react';
import {
  ADMIN_PERMISSIONS,
  ADMIN_ROLE_LABELS,
  ADMIN_ROLES,
  USER_STATUSES,
  hasAdminPermission,
} from '../adminConstants.js';
import AdminSection from '../components/AdminSection.jsx';
import AdminStatusBadge from '../components/AdminStatusBadge.jsx';
import AdminTable from '../components/AdminTable.jsx';
import AdminToolbar from '../components/AdminToolbar.jsx';
import { useAuth } from '../../../hooks/useAuth.js';
import { downloadCsv, filterRows } from '../../../utils/adminExport.js';

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  {
    key: 'role',
    label: 'Role',
    render: (row) => ADMIN_ROLE_LABELS[row.role] || row.role || 'User',
  },
  { key: 'status', label: 'Status', render: (row) => <AdminStatusBadge value={row.status} /> },
  {
    key: 'last_login_at',
    label: 'Last Login',
    render: (row) => row.last_login_at?.slice(0, 10) || '—',
  },
  { key: 'created_at', label: 'Registered', render: (row) => row.created_at?.slice(0, 10) || '—' },
];

function UserActions({ row, updateUser, isMutating }) {
  const { user } = useAuth();
  const canWrite = hasAdminPermission(user, ADMIN_PERMISSIONS.USERS_WRITE);
  const [role, setRole] = useState(row.role || 'user');
  const [status, setStatus] = useState(row.status || 'active');

  if (!canWrite) return <span className="text-xs text-slate-400">Read only</span>;

  async function handleSave() {
    await updateUser(row.id, {
      role,
      status,
      suspendedAt: status === 'suspended' ? new Date().toISOString() : null,
      suspensionReason: status === 'suspended' ? 'Suspended by administrator' : '',
    });
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <select
        value={role}
        onChange={(event) => setRole(event.target.value)}
        className="form-control bg-white py-1.5 text-xs"
        aria-label="Assign role"
      >
        <option value="user">User</option>
        {ADMIN_ROLES.map((item) => (
          <option key={item} value={item}>
            {ADMIN_ROLE_LABELS[item]}
          </option>
        ))}
      </select>
      <select
        value={status}
        onChange={(event) => setStatus(event.target.value)}
        className="form-control bg-white py-1.5 text-xs"
        aria-label="Set status"
      >
        {USER_STATUSES.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={isMutating || (role === row.role && status === row.status)}
        onClick={handleSave}
        className="btn-secondary px-3 py-1.5 text-xs"
      >
        Save
      </button>
    </div>
  );
}

function UsersSection({ users, updateUser, isMutating }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [role, setRole] = useState('');

  const filteredUsers = useMemo(() => {
    let next = filterRows(users, search, ['name', 'email', 'role', 'status']);
    if (status) next = next.filter((user) => user.status === status);
    if (role) next = next.filter((user) => user.role === role);
    return next;
  }, [users, search, status, role]);

  return (
    <AdminSection
      eyebrow="User management"
      title="Users"
      description="Search, filter, suspend, activate, and assign admin roles. Password resets are handled through Supabase recovery links."
    >
      <AdminToolbar
        search={search}
        onSearchChange={setSearch}
        resultCount={filteredUsers.length}
        filters={[
          {
            key: 'status',
            label: 'Status',
            value: status,
            onChange: setStatus,
            options: USER_STATUSES,
          },
          {
            key: 'role',
            label: 'Role',
            value: role,
            onChange: setRole,
            options: ['user', ...ADMIN_ROLES],
          },
        ]}
        actions={
          <button
            type="button"
            onClick={() => downloadCsv('admin-users', filteredUsers, columns)}
            className="btn-secondary"
          >
            Export CSV
          </button>
        }
      />
      <AdminTable
        columns={columns}
        rows={filteredUsers}
        actions={(row) => <UserActions row={row} updateUser={updateUser} isMutating={isMutating} />}
      />
    </AdminSection>
  );
}

export default UsersSection;

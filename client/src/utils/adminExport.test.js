import { filterRows, recordsToCsv } from './adminExport.js';

describe('adminExport utilities', () => {
  it('converts records to escaped CSV', () => {
    const csv = recordsToCsv(
      [{ name: 'A, User', status: 'active' }],
      [
        { key: 'name', label: 'Name' },
        { key: 'status', label: 'Status' },
      ]
    );
    expect(csv).toBe('Name,Status\n"A, User",active');
  });

  it('filters rows by selected fields', () => {
    const rows = [
      { name: 'Kratika', role: 'admin' },
      { name: 'Alex', role: 'user' },
    ];
    expect(filterRows(rows, 'admin', ['role'])).toEqual([{ name: 'Kratika', role: 'admin' }]);
  });
});

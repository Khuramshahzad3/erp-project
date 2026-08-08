import React, { useState } from 'react';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import DataTable, { type Column } from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import { Calendar, Activity } from 'lucide-react';
import type { AuditLog } from '../../types/api.types';

export const AuditLogList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const { data: logRes, isLoading } = useAuditLogs({ page, limit });

  const getEntityBadge = (entity: string) => {
    const colorMap: Record<string, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
      User: 'default',
      Customer: 'info',
      Product: 'success',
      SalesOrder: 'warning',
      Auth: 'error',
    };
    return <Badge variant={colorMap[entity] || 'default'}>{entity}</Badge>;
  };

  const columns: Column<AuditLog>[] = [
    {
      header: 'Operator / User',
      key: 'user',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 font-semibold text-xs border border-gray-200">
            {row.user?.name.charAt(0) || 'S'}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">{row.user?.name || 'System / Auto'}</span>
            <span className="text-[10px] text-gray-400 font-medium">{row.user?.role || 'Daemon'}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Action performed',
      key: 'action',
      accessor: (row) => (
        <span className="font-semibold text-gray-800 flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-gray-400 shrink-0" /> {row.action}
        </span>
      ),
    },
    {
      header: 'Entity Class',
      key: 'entity',
      accessor: (row) => getEntityBadge(row.entity),
    },
    {
      header: 'Details Description',
      key: 'description',
      accessor: (row) => (
        <span className="text-gray-500 max-w-sm truncate block" title={row.description}>
          {row.description}
        </span>
      ),
    },
    {
      header: 'Timestamp',
      key: 'timestamp',
      accessor: (row) => (
        <span className="text-gray-500 font-mono text-xs flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />{' '}
          {new Date(row.timestamp).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">System Audit Trail</h1>
        <p className="text-sm text-gray-500">
          Track administrator, manager and sales representative operations for security and compliance
        </p>
      </div>

      {}
      <DataTable
        columns={columns}
        data={logRes?.data || []}
        loading={isLoading}
        emptyMessage="No audit logs recorded in system database."
        pagination={logRes?.pagination}
        onPageChange={setPage}
        onLimitChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
      />
    </div>
  );
};

export default AuditLogList;

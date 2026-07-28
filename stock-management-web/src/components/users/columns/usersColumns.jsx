import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { canManageUserRecord } from '../../../utils/userPermissions';
import Badge from '../../Badge';
import { getRoleTone, getActiveTone } from '../../../utils/badgeTones';

export const getUsersColumns = (onNameClick, { onEdit, onDelete, actorUser }) => {
  const cols = [
    {
      title: 'Name',
      key: 'name',
      render: (_, record) => (
        <button
          type="button"
          onClick={() => onNameClick(record)}
          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
        >
          {record.name}
        </button>
      )
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Phone',
      dataIndex: 'number',
      key: 'number',
      render: (value) => value || '—'
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (value) => (
        <Badge tone={getRoleTone(value)} className="capitalize">
          {value}
        </Badge>
      )
    },
    {
      title: 'Email verified',
      key: 'isEmailVerified',
      render: (_, record) => (
        <Badge tone={record.isEmailVerified ? 'success' : 'warning'}>
          {record.isEmailVerified ? 'Yes' : 'No'}
        </Badge>
      )
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Badge tone={getActiveTone(record.isActive)}>{record.isActive ? 'Active' : 'Inactive'}</Badge>
      )
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value) => (value ? new Date(value).toLocaleString() : '-')
    }
  ];

  if (onEdit && onDelete && actorUser) {
    cols.push({
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        if (!canManageUserRecord(actorUser, record)) {
          return <span className="text-gray-400 text-sm">—</span>;
        }
        return (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(record)}
              className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
              title="Edit user"
            >
              <FaEdit className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(record)}
              className="p-2 rounded-lg text-red-600 hover:bg-red-50"
              title="Delete user"
            >
              <FaTrash className="w-4 h-4" />
            </button>
          </div>
        );
      }
    });
  }

  return cols;
};

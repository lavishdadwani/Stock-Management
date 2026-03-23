import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { canManageUserRecord } from '../../../utils/userPermissions';

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
      key: 'role'
    },
    {
      title: 'Email verified',
      key: 'isEmailVerified',
      render: (_, record) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            record.isEmailVerified ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-900'
          }`}
        >
          {record.isEmailVerified ? 'Yes' : 'No'}
        </span>
      )
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            record.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {record.isActive ? 'Active' : 'Inactive'}
        </span>
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

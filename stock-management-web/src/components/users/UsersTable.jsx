import React from 'react';
import Table from '../Table/Table';
import { getUsersColumns } from './columns/usersColumns';

const UsersTable = ({ users, loading, onNameClick, onEdit, onDelete, actorUser }) => {
  const columns = getUsersColumns(onNameClick, { onEdit, onDelete, actorUser });

  return (
    <Table
      title="User Credentials"
      columns={columns}
      dataSource={users}
      loading={loading}
      showPagination={false}
      rowKey="_id"
      emptyMessage="No users found"
    />
  );
};

export default UsersTable;


import React from 'react';
import Table from '../Table/Table';
import { getItemProducedColumns } from './itemProducedColumns';

const ItemProducedTable = ({
  items,
  currentPage,
  total,
  pageSize,
  onPageChange,
  loading
}) => {
  const columns = getItemProducedColumns();

  return (
    <Table
      title="Finished product entries"
      columns={columns}
      dataSource={items}
      currentPage={currentPage}
      total={total}
      pageSize={pageSize}
      onPageChangeHandler={onPageChange}
      loading={loading}
      emptyMessage="No finished product entries yet"
      rowKey="_id"
    />
  );
};

export default ItemProducedTable;

import React from 'react';
import Table from '../../Table/Table';
import { getStockColumns } from './columns/stockColumns';

const StockTable = ({
  stockData,
  currentPage,
  total,
  pageSize,
  onPageChange,
  loading,
  onEdit,
  onDelete,
}) => {
  const columns = getStockColumns(onEdit, onDelete);

  // Data is already paginated from API, no need to slice
  return (
    <Table
      columns={columns}
      dataSource={stockData}
      currentPage={currentPage}
      total={total}
      pageSize={pageSize}
      onPageChangeHandler={onPageChange}
      showPagination={true}
      loading={loading}
      rowKey="_id"
      emptyMessage="No stock items found. Click 'Add Stock' to add new items."
    />
  );
};

export default StockTable;


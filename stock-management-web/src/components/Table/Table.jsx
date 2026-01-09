import React, { useState } from 'react';
import Pagination from './Pagination';
import LoadingMessage from '../loader/LoadingMessage';
import Card from '../Card';

const Table = ({
  currentPage = 1,
  total = 0,
  pageSize = 20,
  onPageChangeHandler,
  showPagination = true,
  loading = false,
  rowKey = '_id',
  className = '',
  enableExport = false,
  exportConfig,
  toolbarComponent,
  columns = [],
  dataSource = [],
  emptyMessage = 'No data available',
  title = '',
  onAddClick,
  onExportClick,
  ...props
}) => {
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLoader, setExportLoader] = useState(false);

  // Calculate pagination
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);

  const handlePageChange = (page) => {
    if (onPageChangeHandler) {
      onPageChangeHandler(page);
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <LoadingMessage message="Loading data..." show={true} />
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Toolbar */}
      {toolbarComponent && (
        <div className="mb-4 flex items-center justify-between">
          {toolbarComponent}
        </div>
      )}

      {/* Table */}
      <Card className="overflow-hidden p-0">
        {/* Table Header with Title and Actions */}
        {(title || onAddClick || onExportClick) && (
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            {title && (
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            )}
            <div className="flex items-center gap-3">
              {onAddClick && (
                <button
                  onClick={onAddClick}
                  disabled={true}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
                >
                  Add
                </button>
              )}
              {onExportClick && (
                <button
                  onClick={onExportClick}
                  disabled={true}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-600"
                >
                  Export
                </button>
              )}
            </div>
          </div>
        )}

        {/* Top Pagination */}
        {showPagination && total > 0 && (
          <div className="px-6 py-4 border-b border-gray-200">
            <Pagination
              current={currentPage}
              total={total}
              pageSize={pageSize}
              onChange={handlePageChange}
              showSizeChanger={false}
              showQuickJumper={false}
            />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={column.key || index}
                    className={`
                      px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                      ${column.className || ''}
                    `}
                    style={column.width ? { width: column.width } : {}}
                  >
                    {column.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dataSource.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                dataSource.map((record, rowIndex) => (
                  <tr
                    key={record[rowKey] || rowIndex}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {columns.map((column, colIndex) => {
                      const cellValue = column.dataIndex
                        ? record[column.dataIndex]
                        : null;
                      
                      return (
                        <td
                          key={column.key || colIndex}
                          className={`
                            px-6 py-4 whitespace-nowrap text-sm text-gray-900
                            ${column.cellClassName || ''}
                          `}
                        >
                          {column.render
                            ? column.render(cellValue, record, rowIndex)
                            : cellValue !== null && cellValue !== undefined
                            ? String(cellValue)
                            : '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {showPagination && total > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              current={currentPage}
              total={total}
              pageSize={pageSize}
              onChange={handlePageChange}
              showSizeChanger={false}
              showQuickJumper={false}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default Table;

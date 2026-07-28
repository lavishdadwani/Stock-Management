import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Select from '../components/Select';
import Table from '../components/Table/Table';
import ActivityLogDetailsModal from '../components/activityLog/ActivityLogDetailsModal';
import { getActivityLogColumns } from '../components/activityLog/columns/activityLogColumns';
import { showSnackbar } from '../redux/slices/snackbarSlice';
import activityLogAPI from '../../services/activityLog';

const Reports = () => {
  const dispatch = useDispatch();
  const [logs, setLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [entityType, setEntityType] = useState('');
  const [action, setAction] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const pageSize = 20;

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await activityLogAPI.getAll({
        page: currentPage,
        limit: pageSize,
        entityType: entityType || undefined,
        action: action || undefined
      });

      if (response.ok) {
        const data = response.data?.data || [];
        const additionalData = response.data?.additionalData || {};
        setLogs(data);
        setTotal(additionalData.totalItems || data.length);
      } else {
        dispatch(
          showSnackbar({
            message: response.data?.displayMessage || response.data?.message || 'Failed to fetch activity log',
            severity: 'error'
          })
        );
      }
    } catch (error) {
      dispatch(
        showSnackbar({
          message: error.message || 'Failed to fetch activity log',
          severity: 'error'
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, entityType, action]);

  const columns = getActivityLogColumns((entry) => setSelectedEntry(entry));

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Activity Log</h1>
          <p className="text-gray-600 mt-1">Audit trail of stock, transfer and sale changes</p>
        </div>

        <Card className="mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Entity type"
              value={entityType}
              onChange={(e) => {
                setCurrentPage(1);
                setEntityType(e.target.value);
              }}
              placeholder="All entities"
              options={[
                { value: 'stock', label: 'Stock' },
                { value: 'stockTransfer', label: 'Stock Transfer' },
                { value: 'sale', label: 'Sale' }
              ]}
            />
            <Select
              label="Action"
              value={action}
              onChange={(e) => {
                setCurrentPage(1);
                setAction(e.target.value);
              }}
              placeholder="All actions"
              options={[
                { value: 'create', label: 'Create' },
                { value: 'update', label: 'Update' },
                { value: 'delete', label: 'Delete' }
              ]}
            />
          </div>
        </Card>

        <Table
          title="Activity"
          columns={columns}
          dataSource={logs}
          currentPage={currentPage}
          total={total}
          pageSize={pageSize}
          onPageChangeHandler={setCurrentPage}
          loading={loading}
          emptyMessage="No activity recorded yet"
          rowKey="_id"
        />

        <ActivityLogDetailsModal
          isOpen={!!selectedEntry}
          onClose={() => setSelectedEntry(null)}
          entry={selectedEntry}
        />
      </div>
    </Layout>
  );
};

export default Reports;

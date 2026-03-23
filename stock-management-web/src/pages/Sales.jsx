import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Table from '../components/Table/Table';
import DeleteModal from '../components/modal/DeleteModal';
import AddSalesModal from '../components/sales/AddSalesModal';
import EditSalesModal from '../components/sales/EditSalesModal';
import { getSalesColumns } from '../components/sales/columns/salesColumns';
import { showSnackbar } from '../redux/slices/snackbarSlice';
import salesAPI from '../../services/sales';
import customerAPI from '../../services/customer';
import { FaPlus } from 'react-icons/fa';

const Sales = () => {
  const dispatch = useDispatch();
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [saleToDelete, setSaleToDelete] = useState(null);

  const pageSize = 10;

  const fetchCustomers = async () => {
    try {
      const response = await customerAPI.getAllCustomers({ page: 1, limit: 500, isActive: true });
      if (response.ok) {
        setCustomers(response.data?.data || []);
      }
    } catch {
        dispatch(
            showSnackbar({
              message: response.data?.displayMessage || response.data?.message || 'Failed to load customers',
              severity: 'error'
            })
          );
    }
  };

  const fetchAvailableItems = async () => {
    try {
      const response = await salesAPI.getAvailableItems();
      if (response.ok) {
        setAvailableItems(response.data?.data || []);
      }
    } catch {
        dispatch(
            showSnackbar({
              message: response.data?.displayMessage || response.data?.message || 'Failed to load items',
              severity: 'error'
            })
          );
    }
  };

  const fetchSales = async () => {
    setLoading(true);
    try {
      const response = await salesAPI.getAllSales({
        page: currentPage,
        limit: pageSize
      });
      if (response.ok) {
        const data = response.data?.data || [];
        const additionalData = response.data?.additionalData || {};
        setSales(data);
        setTotal(additionalData.totalItems || data.length);
      } else {
        dispatch(
          showSnackbar({
            message: response.data?.displayMessage || response.data?.message || 'Failed to fetch sales',
            severity: 'error'
          })
        );
      }
    } catch (error) {
      dispatch(
        showSnackbar({
          message: error.message || 'Failed to fetch sales',
          severity: 'error'
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchAvailableItems();
  }, []);

  useEffect(() => {
    fetchSales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleCreateSale = async (payload) => {
    setLoading(true);
    try {
      const response = await salesAPI.createSale(payload);
      if (response.ok) {
        dispatch(showSnackbar({ message: 'Sale created successfully', severity: 'success' }));
        setIsAddModalOpen(false);
        await Promise.all([fetchSales(), fetchAvailableItems()]);
      } else {
        dispatch(
          showSnackbar({
            message: response.data?.displayMessage || response.data?.message || 'Failed to create sale',
            severity: 'error'
          })
        );
      }
    } catch (error) {
      dispatch(showSnackbar({ message: error.message || 'Failed to create sale', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSale = async (payload) => {
    if (!editingSale?._id) return;
    setLoading(true);
    try {
      const response = await salesAPI.updateSale(editingSale._id, payload);
      if (response.ok) {
        dispatch(showSnackbar({ message: 'Sale updated successfully', severity: 'success' }));
        setIsEditModalOpen(false);
        setEditingSale(null);
        await Promise.all([fetchSales(), fetchAvailableItems()]);
      } else {
        dispatch(
          showSnackbar({
            message: response.data?.displayMessage || response.data?.message || 'Failed to update sale',
            severity: 'error'
          })
        );
      }
    } catch (error) {
      dispatch(showSnackbar({ message: error.message || 'Failed to update sale', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSale = async () => {
    if (!saleToDelete) return;
    setLoading(true);
    try {
      const response = await salesAPI.deleteSale(saleToDelete);
      if (response.ok) {
        dispatch(showSnackbar({ message: 'Sale deleted successfully', severity: 'success' }));
        setIsDeleteModalOpen(false);
        setSaleToDelete(null);
        await Promise.all([fetchSales(), fetchAvailableItems()]);
      } else {
        dispatch(
          showSnackbar({
            message: response.data?.displayMessage || response.data?.message || 'Failed to delete sale',
            severity: 'error'
          })
        );
      }
    } catch (error) {
      dispatch(showSnackbar({ message: error.message || 'Failed to delete sale', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const columns = getSalesColumns(
    (sale) => {
      setEditingSale(sale);
      setIsEditModalOpen(true);
    },
    (id) => {
      setSaleToDelete(id);
      setIsDeleteModalOpen(true);
    }
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sales</h1>
            <p className="text-gray-600 mt-1">Sell finished products (pieces) to customers</p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center space-x-2">
            <FaPlus className="w-4 h-4" />
            <span>Create Sale</span>
          </Button>
        </div>

        <Table
          title="Sales History"
          columns={columns}
          dataSource={sales}
          currentPage={currentPage}
          total={total}
          pageSize={pageSize}
          onPageChangeHandler={setCurrentPage}
          loading={loading}
          emptyMessage="No sales found"
          rowKey="_id"
        />

        <AddSalesModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleCreateSale}
          loading={loading}
          customers={customers}
          availableItems={availableItems}
        />

        <EditSalesModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingSale(null);
          }}
          onSubmit={handleUpdateSale}
          loading={loading}
          saleData={editingSale}
          customers={customers}
          availableItems={availableItems}
        />

        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            if (!loading) {
              setIsDeleteModalOpen(false);
              setSaleToDelete(null);
            }
          }}
          onConfirm={handleDeleteSale}
          loading={loading}
          title="Delete Sale"
          message="Are you sure you want to delete this sale? This action cannot be undone."
        />
      </div>
    </Layout>
  );
};

export default Sales;

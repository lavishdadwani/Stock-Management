import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Table from '../components/Table/Table';
import DeleteModal from '../components/modal/DeleteModal';
import AddCustomerModal from '../components/customer/AddCustomerModal';
import EditCustomerModal from '../components/customer/EditCustomerModal';
import { getCustomerColumns } from '../components/customer/columns/customerColumns';
import { showSnackbar } from '../redux/slices/snackbarSlice';
import customerAPI from '../../services/customer';
import { FaPlus } from 'react-icons/fa';

const Customer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  const pageSize = 10;

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await customerAPI.getAllCustomers({
        page: currentPage,
        limit: pageSize
      });

      if (response.ok) {
        const data = response.data?.data || [];
        const additionalData = response.data?.additionalData || {};
        setCustomers(data);
        setTotal(additionalData.totalItems || data.length);
      } else {
        dispatch(
          showSnackbar({
            message: response.data?.displayMessage || response.data?.message || 'Failed to fetch customers',
            severity: 'error'
          })
        );
      }
    } catch (error) {
      dispatch(
        showSnackbar({
          message: error.message || 'Failed to fetch customers',
          severity: 'error'
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleAddCustomer = async (payload) => {
    setLoading(true);
    try {
      const response = await customerAPI.createCustomer(payload);
      if (response.ok) {
        dispatch(showSnackbar({ message: 'Customer added successfully', severity: 'success' }));
        setIsAddModalOpen(false);
        fetchCustomers();
      } else {
        dispatch(
          showSnackbar({
            message: response.data?.displayMessage || response.data?.message || 'Failed to add customer',
            severity: 'error'
          })
        );
      }
    } catch (error) {
      dispatch(showSnackbar({ message: error.message || 'Failed to add customer', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const handleEditCustomer = async (payload) => {
    if (!editingCustomer?._id) return;
    setLoading(true);
    try {
      const response = await customerAPI.updateCustomer(editingCustomer._id, payload);
      if (response.ok) {
        dispatch(showSnackbar({ message: 'Customer updated successfully', severity: 'success' }));
        setIsEditModalOpen(false);
        setEditingCustomer(null);
        fetchCustomers();
      } else {
        dispatch(
          showSnackbar({
            message: response.data?.displayMessage || response.data?.message || 'Failed to update customer',
            severity: 'error'
          })
        );
      }
    } catch (error) {
      dispatch(showSnackbar({ message: error.message || 'Failed to update customer', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;
    setLoading(true);
    try {
      const response = await customerAPI.deleteCustomer(customerToDelete);
      if (response.ok) {
        dispatch(showSnackbar({ message: 'Customer deleted successfully', severity: 'success' }));
        setIsDeleteModalOpen(false);
        setCustomerToDelete(null);
        fetchCustomers();
      } else {
        dispatch(
          showSnackbar({
            message: response.data?.displayMessage || response.data?.message || 'Failed to delete customer',
            severity: 'error'
          })
        );
      }
    } catch (error) {
      dispatch(showSnackbar({ message: error.message || 'Failed to delete customer', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleOpenEdit = (customer) => {
    setEditingCustomer(customer);
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (id) => {
    setCustomerToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const columns = getCustomerColumns(
    handleOpenEdit,
    handleOpenDelete,
    (record) => navigate(`/customers/${record._id}`)
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
            <p className="text-gray-600 mt-1">Manage customers for finished product sales</p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center space-x-2">
            <FaPlus className="w-4 h-4" />
            <span>Add Customer</span>
          </Button>
        </div>

        <Table
          title="Customer List"
          columns={columns}
          dataSource={customers}
          currentPage={currentPage}
          total={total}
          pageSize={pageSize}
          onPageChangeHandler={handlePageChange}
          loading={loading}
          emptyMessage="No customers found"
          rowKey="_id"
        />

        <AddCustomerModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddCustomer}
          loading={loading}
        />

        <EditCustomerModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingCustomer(null);
          }}
          onSubmit={handleEditCustomer}
          loading={loading}
          customerData={editingCustomer}
        />

        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            if (!loading) {
              setIsDeleteModalOpen(false);
              setCustomerToDelete(null);
            }
          }}
          onConfirm={handleConfirmDelete}
          loading={loading}
          title="Delete Customer"
          message="Are you sure you want to delete this customer? This action cannot be undone."
        />
      </div>
    </Layout>
  );
};

export default Customer;

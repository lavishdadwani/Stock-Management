import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Table from '../components/Table/Table';
import AddProducibleItemModal from '../components/producibleItems/AddProducibleItemModal';
import EditProducibleItemModal from '../components/producibleItems/EditProducibleItemModal';
import DeleteModal from '../components/modal/DeleteModal';
import { getProducibleItemColumns } from '../components/producibleItems/columns/producibleItemColumns';
import { showSnackbar } from '../redux/slices/snackbarSlice';
import producibleItemsAPI from '../../services/producibleItems';
import { FaPlus } from 'react-icons/fa';

const ProducibleItems = () => {
  const dispatch = useDispatch();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDeleteId, setItemToDeleteId] = useState(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await producibleItemsAPI.getAll();
      if (response.ok) {
        setItems(response.data?.data || []);
      } else {
        dispatch(
          showSnackbar({
            message: response.data?.displayMessage || response.data?.message || 'Failed to fetch producible items',
            severity: 'error'
          })
        );
      }
    } catch (error) {
      dispatch(showSnackbar({ message: error.message || 'Failed to fetch producible items', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAddSubmit = async (data) => {
    setActionLoading(true);
    try {
      const response = await producibleItemsAPI.create(data);
      if (response.ok) {
        dispatch(showSnackbar({ message: 'Producible item added successfully', severity: 'success' }));
        setIsAddModalOpen(false);
        fetchItems();
      } else {
        dispatch(
          showSnackbar({
            message: response.data?.displayMessage || response.data?.message || 'Failed to add item',
            severity: 'error'
          })
        );
      }
    } catch (error) {
      dispatch(showSnackbar({ message: error.message || 'Failed to add item', severity: 'error' }));
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (data) => {
    if (!editingItem?._id) return;
    setActionLoading(true);
    try {
      const response = await producibleItemsAPI.update(editingItem._id, data);
      if (response.ok) {
        dispatch(showSnackbar({ message: 'Producible item updated successfully', severity: 'success' }));
        setIsEditModalOpen(false);
        setEditingItem(null);
        fetchItems();
      } else {
        dispatch(
          showSnackbar({
            message: response.data?.displayMessage || response.data?.message || 'Failed to update item',
            severity: 'error'
          })
        );
      }
    } catch (error) {
      dispatch(showSnackbar({ message: error.message || 'Failed to update item', severity: 'error' }));
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (record) => {
    try {
      const response = await producibleItemsAPI.update(record._id, { isActive: !record.isActive });
      if (response.ok) {
        dispatch(
          showSnackbar({
            message: `Item ${!record.isActive ? 'activated' : 'deactivated'}`,
            severity: 'success'
          })
        );
        fetchItems();
      } else {
        dispatch(
          showSnackbar({
            message: response.data?.displayMessage || response.data?.message || 'Failed to update item',
            severity: 'error'
          })
        );
      }
    } catch (error) {
      dispatch(showSnackbar({ message: error.message || 'Failed to update item', severity: 'error' }));
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDeleteId) return;
    setActionLoading(true);
    try {
      const response = await producibleItemsAPI.deleteItem(itemToDeleteId);
      if (response.ok) {
        dispatch(showSnackbar({ message: 'Producible item deleted successfully', severity: 'success' }));
        setIsDeleteModalOpen(false);
        setItemToDeleteId(null);
        fetchItems();
      } else {
        dispatch(
          showSnackbar({
            message: response.data?.displayMessage || response.data?.message || 'Failed to delete item',
            severity: 'error'
          })
        );
      }
    } catch (error) {
      dispatch(showSnackbar({ message: error.message || 'Failed to delete item', severity: 'error' }));
    } finally {
      setActionLoading(false);
    }
  };

  const columns = getProducibleItemColumns(
    (item) => {
      setEditingItem(item);
      setIsEditModalOpen(true);
    },
    (id) => {
      setItemToDeleteId(id);
      setIsDeleteModalOpen(true);
    },
    handleToggleActive
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Producible Items</h1>
            <p className="text-gray-600 mt-1">
              Manage the catalog of items core team can select when checking out production
            </p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center space-x-2">
            <FaPlus className="w-4 h-4" />
            <span>Add Item</span>
          </Button>
        </div>

        <Table
          title="Producible Items"
          columns={columns}
          dataSource={items}
          loading={loading}
          showPagination={false}
          emptyMessage="No producible items yet."
          emptyAction={{ label: 'Add Item', onClick: () => setIsAddModalOpen(true) }}
          rowKey="_id"
        />

        <AddProducibleItemModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddSubmit}
          loading={actionLoading}
        />

        <EditProducibleItemModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingItem(null);
          }}
          onSubmit={handleEditSubmit}
          loading={actionLoading}
          itemData={editingItem}
        />

        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            if (!actionLoading) {
              setIsDeleteModalOpen(false);
              setItemToDeleteId(null);
            }
          }}
          onConfirm={handleConfirmDelete}
          loading={actionLoading}
          title="Delete Producible Item"
          message="Are you sure you want to delete this item? Existing production records referencing it are not affected, but it will disappear from the checkout dropdown."
        />
      </div>
    </Layout>
  );
};

export default ProducibleItems;

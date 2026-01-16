import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { showSnackbar } from '../redux/slices/snackbarSlice';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Table from '../components/Table/Table';
import StockCardsGrid from '../components/Dashboard/StockCardsGrid';
import TransferStockModal from '../components/Dashboard/stockTransfer/TransferStockModal';
import DeleteModal from '../components/modal/DeleteModal';
import { getStockTransferColumns } from '../components/Dashboard/stockTransfer/columns/stockTransferColumns';
import stockTransferAPI from '../../services/stockTransfer';
import userAPI from '../../services/user';
import { FaExchangeAlt, FaFilter } from 'react-icons/fa';
import Select from '../components/Select';

const StockTransfer = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const isCoreTeam = user?.role === 'core team';
  const [currentPage, setCurrentPage] = useState(1);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transferToDeleteId, setTransferToDeleteId] = useState(null);
  const [transferToEdit, setTransferToEdit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stockTransfers, setStockTransfers] = useState([]);
  const [total, setTotal] = useState(0);
  const [transferredStockQuantities, setTransferredStockQuantities] = useState({
    aluminium: { name: 'Aluminium', quantity: 0, unit: 'kg' },
    copper: { name: 'Copper', quantity: 0, unit: 'kg' },
    scrap: { name: 'Scrap', quantity: 0, unit: 'kg' },
  });
  const [coreTeamMembers, setCoreTeamMembers] = useState([]);
  const [filterUserId, setFilterUserId] = useState('');
//   const [allTransfers, setAllTransfers] = useState([]); // Store all transfers for quantity calculation
  const pageSize = 10;

  useEffect(() => {
    if (!isCoreTeam) {
      fetchCoreTeamMembers();
    }
  }, [isCoreTeam]);

  useEffect(() => {
    fetchStockTransfers();
  }, [currentPage, filterUserId, isCoreTeam, user?._id]);


  const fetchCoreTeamMembers = async () => {
    try {
      const response = await userAPI.getAllUsers({ role: 'core team', isActive: 'true' });
      if (response.ok && response.data?.data) {
        setCoreTeamMembers(response.data.data);
      }
    } catch (error) {
      dispatch(showSnackbar({
        message: 'Error fetching core team members',
        severity: 'error',
      }));
    }
  };

  const fetchStockTransfers = async () => {
    setLoading(true);
    try {
      const queryParams = {
        page: currentPage,
        limit: pageSize,
      };

      let response;
      // Core team members use my-transfers endpoint, managers/owners use get-all
      if (isCoreTeam) {
        response = await stockTransferAPI.getMyStockTransfers({
          page: currentPage,
          limit: pageSize,
        });
      } else {
        if (filterUserId) {
          queryParams.toUserId = filterUserId;
        }
        response = await stockTransferAPI.getAllStockTransfers(queryParams);
      }

      if (response.ok) {
        const data = response.data?.data;
        const pagination = response.data?.additionalData;
        setStockTransfers(data);
        setTotal(pagination.total);
      } else {
        dispatch(
          showSnackbar({
            message: response.data?.displayMessage || response.data?.message || 'Failed to fetch stock transfers',
            severity: 'error',
          })
        );
      }
    } catch (error) {
      dispatch(
        showSnackbar({
          message: error.message || 'Failed to fetch stock transfers',
          severity: 'error',
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchStockTransferQuantities = async () => {
    try {
      const queryParams = {};

      // Core team members don't need to pass toUserId - backend automatically filters by their userId
      // Managers/owners can filter by toUserId
      if (!isCoreTeam && filterUserId) {
        queryParams.toUserId = filterUserId;
      }

      const response = await stockTransferAPI.getStockTransferQuantities(queryParams);

      if (response.ok) {
        setTransferredStockQuantities(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stock transfer quantities:', error);
    }
  };

  useEffect(() => {
    fetchStockTransferQuantities();
  }, [filterUserId, isCoreTeam, user?._id]);

  const handleTransfer = () => {
    setTransferToEdit(null);
    setIsTransferModalOpen(true);
  };

  const handleTransferSuccess = () => {
    fetchStockTransfers();
    fetchStockTransferQuantities();
    dispatch(
      showSnackbar({
        message: transferToEdit ? 'Stock transfer updated successfully' : 'Stock transferred successfully',
        severity: 'success',
      })
    );
    setTransferToEdit(null);
  };

  const handleEdit = (transfer) => {
    setTransferToEdit(transfer);
    setIsTransferModalOpen(true);
  };

  const handleDelete = (id) => {
    setTransferToDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!transferToDeleteId) return;

    setLoading(true);
    try {
      const response = await stockTransferAPI.deleteStockTransfer(transferToDeleteId);

      if (response.ok) {
        dispatch(
          showSnackbar({
            message: 'Stock transfer deleted successfully',
            severity: 'success',
          })
        );
        setIsDeleteModalOpen(false);
        setTransferToDeleteId(null);
        fetchStockTransfers();
        fetchStockTransferQuantities();
      } else {
        dispatch(
          showSnackbar({
            message: response.data?.displayMessage || response.data?.message || 'Failed to delete transfer',
            severity: 'error',
          })
        );
      }
    } catch (error) {
      dispatch(
        showSnackbar({
          message: error.message || 'Failed to delete stock transfer',
          severity: 'error',
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDeleteModal = () => {
    if (!loading) {
      setIsDeleteModalOpen(false);
      setTransferToDeleteId(null);
    }
  };

  const handleFilterChange = (userId) => {
    setFilterUserId(userId);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const columns = getStockTransferColumns(
    isCoreTeam ? null : handleEdit, 
    isCoreTeam ? null : handleDelete
  );

  const formOptions = coreTeamMembers.map(user => ({
    value: user._id,
    label: user.name
  }));
  // Filter options for core team members
  const filterOptions = [
    { value: '', label: 'All Users' },
    ...formOptions,
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Stock Transfer</h1>
            <p className="text-gray-600 mt-1">
              {isCoreTeam ? 'Stock transferred to you' : 'Transfer stock to core team members'}
            </p>
          </div>
          {!isCoreTeam && (
            <Button onClick={handleTransfer} className="flex items-center space-x-2">
              <FaExchangeAlt className="w-4 h-4" />
              <span>Transfer Stock</span>
            </Button>
          )}
        </div>

        {/* Transferred Stock Quantities Dashboard */}
        <div className="mb-6">
          <StockCardsGrid stockQuantities={transferredStockQuantities} />
        </div>

        {/* Filter Section - Only for managers/owners */}
        {!isCoreTeam && (
          <div className="mb-6 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter by User:</span>
            </div>
            <div className="w-64">
              <Select
                value={filterUserId}
                onChange={(e) => handleFilterChange(e.target.value)}
                options={filterOptions}
                placeholder="Select user to filter"
              />
            </div>
            {filterUserId && (
              <Button
                variant="secondary"
                size="small"
                onClick={() => handleFilterChange('')}
              >
                Clear Filter
              </Button>
            )}
          </div>
        )}

        {/* Stock Transfer Table */}
        <Table
          title="Stock Transfer History"
          columns={columns}
          dataSource={stockTransfers}
          currentPage={currentPage}
          total={total}
          pageSize={pageSize}
          onPageChangeHandler={handlePageChange}
          loading={loading}
          emptyMessage="No stock transfers found"
          rowKey="_id"
        />

        {/* Transfer Stock Modal */}
        <TransferStockModal
          isOpen={isTransferModalOpen}
          onClose={() => {
            setIsTransferModalOpen(false);
            setTransferToEdit(null);
          }}
          onSuccess={handleTransferSuccess}
          coreTeamMembers={formOptions}
          editData={transferToEdit}
        />

        {/* Delete Transfer Modal */}
        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
        //   itemName={`transfer to ${transferToDeleteId?.toUserId?.name || 'user'}`}
          loading={loading}
          title="Delete Stock Transfer"
        />
      </div>
    </Layout>
  );
};

export default StockTransfer;


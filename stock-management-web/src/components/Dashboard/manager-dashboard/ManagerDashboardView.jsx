import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { showSnackbar } from "../../../redux/slices/snackbarSlice";
import Button from "../../Button";
import StockTable from "./StockTable";
import AddStockModal from "./AddStockModal";
import EditStockModal from "./EditStockModal";
import DeleteModal from "../../modal/DeleteModal";
import { FaPlus } from "react-icons/fa";
import StockCardsGrid from "../StockCardsGrid";
import stockAPI from "../../../../services/stock";

const ManagerDashboardView = () => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [stockId, setStockId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stockData, setStockData] = useState([]);
  const [total, setTotal] = useState(0);
  const [stockQuantities, setStockQuantities] = useState({
    aluminium: { name: 'Aluminium', quantity: 0, unit: 'kg' },
    copper: { name: 'Copper', quantity: 0, unit: 'kg' },
    scrap: { name: 'Scrap', quantity: 0, unit: 'kg' },
  });
  const pageSize = 10;

  useEffect(() => {
    fetchStockData();
  }, [currentPage]);

  useEffect(() => {
    fetchStockQuantities();
  }, []);

  const fetchStockData = async () => {
    setLoading(true);
    try {
      const queryParams = {
        page: currentPage,
        limit: pageSize,
      };

      const response = await stockAPI.get_all(queryParams);

      if (response.ok) {
        const data = response.data?.data || [];
        const additionalData = response.data?.additionalData || {};
        
        setStockData(data);
        setTotal(additionalData.totalItems || data.length);
      } else {
        dispatch(
          showSnackbar({
            message: response.data?.displayMessage || response.data?.message,
            severity: "error",
          })
        );
      }
    } catch (error) {
      console.error('Error fetching stock:', error);
      dispatch(
        showSnackbar({
          message: error.message || 'Failed to load stock items',
          severity: "error",
        })
      );
      setStockData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchStockQuantities = async () => {
    try {
      const response = await stockAPI.getQuantities();
      
      if (response.ok && response.data?.data) {
        const data = response.data.data;
        setStockQuantities({
          aluminium: data.aluminium,
          copper: data.copper,
          scrap: data.scrap,
        });
      } else {
        setStockQuantities({
          aluminium: { name: 'Aluminium', quantity: 0, unit: 'kg' },
          copper: { name: 'Copper', quantity: 0, unit: 'kg' },
          scrap: { name: 'Scrap', quantity: 0, unit: 'kg' },
        });
      }
    } catch (error) {
      dispatch(showSnackbar("Error fetching stock quantities", "error"));
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleAdd = () => {
    setIsAddModalOpen(true);
  };

  const handleEdit = (stock) => {
    setEditingStock(stock);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id) => {
    setStockId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!stockId) return;
    
    setLoading(true);
    try {
      const response = await stockAPI.deleteStock(stockId);
      
      if (response.ok) {
        dispatch(
          showSnackbar({
            message: "Stock item deleted successfully",
            severity: "success",
          })
        );
        setIsDeleteModalOpen(false);
        setStockId(null);
        fetchStockData();
        fetchStockQuantities();
      } else {
        dispatch(showSnackbar(response.data?.message || "Failed to delete item", "error"));
      }
    } catch (error) {
      console.error('Error deleting stock:', error);
      dispatch(
        showSnackbar({
          message: error.message || "Failed to delete stock item",
          severity: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDeleteModal = () => {
    if (!loading) {
      setIsDeleteModalOpen(false);
      setStockId(null);
    }
  };

  const handleAddSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await stockAPI.create(data);

      if (response.ok) {
        dispatch(
          showSnackbar({
            message: response.data?.displayMessage || "Stock item added successfully",
            severity: "success",
          })
        );
        setIsAddModalOpen(false);
        setCurrentPage(1);
        fetchStockData();
        fetchStockQuantities()
      } else {
        dispatch(
          showSnackbar({
            message: response.data?.displayMessage || response.data?.message || 'Failed to create stock',
            severity: "error",
          })
        );
      }
    } catch (error) {
      console.error('Error creating stock:', error);
      dispatch(
        showSnackbar({
          message: error.message || "Failed to save stock item",
          severity: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (data) => {
    if (!editingStock?._id) return;
    
    setLoading(true);
    try {
      const response = await stockAPI.edit(editingStock._id, data);

      if (response.ok) {
        dispatch(
          showSnackbar({
            message: response.data?.displayMessage || "Stock item updated successfully",
            severity: "success",
          })
        );
        setIsEditModalOpen(false);
        setEditingStock(null);
        fetchStockData();
        fetchStockQuantities()
      } else {
        dispatch(showSnackbar(response.data?.message || "Failed to delete item", "error"));
      }
    } catch (error) {
      dispatch(
        showSnackbar({
          message: error.message || "Failed to update stock item",
          severity: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingStock(null);
  };
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Manager Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Manage stock items</p>
        </div>
        <Button onClick={handleAdd} className="flex items-center space-x-2">
          <FaPlus className="w-4 h-4" />
          <span>Add Stock</span>
        </Button>
      </div>

      {/* Stock Cards */}
      <StockCardsGrid stockQuantities={stockQuantities} fetchStockQuantities={fetchStockQuantities} />

      {/* Stock Table */}
      <StockTable
        stockData={stockData}
        currentPage={currentPage}
        total={total}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Add Stock Modal */}
      <AddStockModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSubmit={handleAddSubmit}
        loading={loading}
      />

      {/* Edit Stock Modal */}
      <EditStockModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSubmit={handleEditSubmit}
        loading={loading}
        stockData={editingStock}
      />

      {/* Delete Stock Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        // itemName={stockId?.itemName}
        loading={loading}
        title="Delete Stock Item"
      />
    </div>
  );
};

export default ManagerDashboardView;

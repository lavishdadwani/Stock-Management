import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { showSnackbar } from "../../../redux/slices/snackbarSlice";
import Button from "../../Button";
import StockTable from "./StockTable";
import AddStockModal from "./AddStockModal";
import EditStockModal from "./EditStockModal";
import DeleteModal from "../../modal/DeleteModal";
import ThresholdModal from "./ThresholdModal";
import { FaPlus, FaBell, FaDownload } from "react-icons/fa";
import StockCardsGrid from "../StockCardsGrid";
import stockAPI from "../../../../services/stock";
import stockThresholdAPI from "../../../../services/stockThreshold";
import { triggerBlobDownload, parseBlobError } from "../../../utils/downloadFile";

const ManagerDashboardView = () => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState(false);
  const [thresholdLoading, setThresholdLoading] = useState(false);
  const [thresholds, setThresholds] = useState({});
  const [exporting, setExporting] = useState(false);
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
      dispatch(showSnackbar({ message: error.message || "Error fetching stock quantities", severity: "error" }));
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
        dispatch(
          showSnackbar({
            message: response.data?.displayMessage || response.data?.message || "Failed to delete item",
            severity: "error"
          })
        );
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
        dispatch(
          showSnackbar({
            message: response.data?.displayMessage || response.data?.message || "Failed to update item",
            severity: "error"
          })
        );
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

  const handleOpenThresholdModal = async () => {
    setIsThresholdModalOpen(true);
    try {
      const response = await stockThresholdAPI.getAll();
      if (response.ok) {
        const list = response.data?.data || [];
        const mapped = list.reduce((acc, item) => {
          acc[item.itemName] = item.thresholdKg;
          return acc;
        }, {});
        setThresholds(mapped);
      }
    } catch (error) {
      dispatch(
        showSnackbar({
          message: error.message || 'Failed to load thresholds',
          severity: "error",
        })
      );
    }
  };

  const handleCloseThresholdModal = () => {
    if (!thresholdLoading) {
      setIsThresholdModalOpen(false);
    }
  };

  const handleThresholdSubmit = async (data) => {
    setThresholdLoading(true);
    try {
      const updates = ['aluminium', 'copper', 'scrap']
        .filter((itemName) => data[itemName] !== '' && data[itemName] !== undefined && data[itemName] !== null)
        .map((itemName) => stockThresholdAPI.set({ itemName, thresholdKg: Number(data[itemName]) }));

      if (updates.length === 0) {
        setIsThresholdModalOpen(false);
        return;
      }

      const responses = await Promise.all(updates);
      const failed = responses.find((response) => !response.ok);

      if (failed) {
        dispatch(
          showSnackbar({
            message: failed.data?.displayMessage || failed.data?.message || 'Failed to save some thresholds',
            severity: "error",
          })
        );
      } else {
        dispatch(
          showSnackbar({
            message: "Low stock thresholds saved",
            severity: "success",
          })
        );
        setIsThresholdModalOpen(false);
      }
    } catch (error) {
      dispatch(
        showSnackbar({
          message: error.message || "Failed to save thresholds",
          severity: "error",
        })
      );
    } finally {
      setThresholdLoading(false);
    }
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const response = await stockAPI.exportCsv();
      if (response.ok) {
        triggerBlobDownload(response.data, `stock-export-${Date.now()}.csv`);
      } else {
        const message = await parseBlobError(response.data, 'Failed to export stock');
        dispatch(showSnackbar({ message, severity: "error" }));
      }
    } catch (error) {
      dispatch(showSnackbar({ message: error.message || 'Failed to export stock', severity: "error" }));
    } finally {
      setExporting(false);
    }
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
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleExportCsv}
            loading={exporting}
            className="flex items-center space-x-2"
          >
            <FaDownload className="w-4 h-4" />
            <span>Export CSV</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleOpenThresholdModal}
            className="flex items-center space-x-2"
          >
            <FaBell className="w-4 h-4" />
            <span>Low Stock Alerts</span>
          </Button>
          <Button onClick={handleAdd} className="flex items-center space-x-2">
            <FaPlus className="w-4 h-4" />
            <span>Add Stock</span>
          </Button>
        </div>
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
        onAdd={handleAdd}
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

      {/* Threshold Modal */}
      <ThresholdModal
        isOpen={isThresholdModalOpen}
        onClose={handleCloseThresholdModal}
        onSubmit={handleThresholdSubmit}
        loading={thresholdLoading}
        initialData={thresholds}
      />
    </div>
  );
};

export default ManagerDashboardView;

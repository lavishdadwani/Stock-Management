import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { showSnackbar } from "../../../redux/slices/snackbarSlice";
import Button from "../../Button";
import StockTable from "./StockTable";
import AddStockModal from "./AddStockModal";
import EditStockModal from "./EditStockModal";
import { FaPlus } from "react-icons/fa";
import StockCardsGrid from "../StockCardsGrid";
import QuickActions from "../QuickActions";

const ManagerDashboardView = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [loading, setLoading] = useState(false);
  const pageSize = 20;

  // Dummy stock data - in real app, this would come from API
  const [stockData, setStockData] = useState([
    {
      _id: "1",
      itemName: "Aluminium Wire",
      quantity: 1250,
      unit: "kg",
      category: "Wire",
      addedBy: "Manager 1",
      addedDate: "2024-01-15",
      status: "Active",
    },
    {
      _id: "2",
      itemName: "Copper Wire",
      quantity: 890,
      unit: "kg",
      category: "Wire",
      addedBy: "Manager 1",
      addedDate: "2024-01-14",
      status: "Active",
    },
    {
      _id: "3",
      itemName: "Scrap Metal",
      quantity: 450,
      unit: "kg",
      category: "Scrap",
      addedBy: "Manager 1",
      addedDate: "2024-01-13",
      status: "Active",
    },
    {
      _id: "1",
      itemName: "Aluminium Wire",
      quantity: 1250,
      unit: "kg",
      category: "Wire",
      addedBy: "Manager 1",
      addedDate: "2024-01-15",
      status: "Active",
    },
    {
      _id: "2",
      itemName: "Copper Wire",
      quantity: 890,
      unit: "kg",
      category: "Wire",
      addedBy: "Manager 1",
      addedDate: "2024-01-14",
      status: "Active",
    },
    {
      _id: "3",
      itemName: "Scrap Metal",
      quantity: 450,
      unit: "kg",
      category: "Scrap",
      addedBy: "Manager 1",
      addedDate: "2024-01-13",
      status: "Active",
    },
    {
      _id: "1",
      itemName: "Aluminium Wire",
      quantity: 1250,
      unit: "kg",
      category: "Wire",
      addedBy: "Manager 1",
      addedDate: "2024-01-15",
      status: "Active",
    },
    {
      _id: "2",
      itemName: "Copper Wire",
      quantity: 890,
      unit: "kg",
      category: "Wire",
      addedBy: "Manager 1",
      addedDate: "2024-01-14",
      status: "Active",
    },
    {
      _id: "3",
      itemName: "Scrap Metal",
      quantity: 450,
      unit: "kg",
      category: "Scrap",
      addedBy: "Manager 1",
      addedDate: "2024-01-13",
      status: "Active",
    },
    {
      _id: "1",
      itemName: "Aluminium Wire",
      quantity: 1250,
      unit: "kg",
      category: "Wire",
      addedBy: "Manager 1",
      addedDate: "2024-01-15",
      status: "Active",
    },
    {
      _id: "2",
      itemName: "Copper Wire",
      quantity: 890,
      unit: "kg",
      category: "Wire",
      addedBy: "Manager 1",
      addedDate: "2024-01-14",
      status: "Active",
    },
    {
      _id: "3",
      itemName: "Scrap Metal",
      quantity: 450,
      unit: "kg",
      category: "Scrap",
      addedBy: "Manager 1",
      addedDate: "2024-01-13",
      status: "Active",
    },
    {
      _id: "1",
      itemName: "Aluminium Wire",
      quantity: 1250,
      unit: "kg",
      category: "Wire",
      addedBy: "Manager 1",
      addedDate: "2024-01-15",
      status: "Active",
    },
    {
      _id: "2",
      itemName: "Copper Wire",
      quantity: 890,
      unit: "kg",
      category: "Wire",
      addedBy: "Manager 1",
      addedDate: "2024-01-14",
      status: "Active",
    },
    {
      _id: "3",
      itemName: "Scrap Metal",
      quantity: 450,
      unit: "kg",
      category: "Scrap",
      addedBy: "Manager 1",
      addedDate: "2024-01-13",
      status: "Active",
    },
    {
      _id: "1",
      itemName: "Aluminium Wire",
      quantity: 1250,
      unit: "kg",
      category: "Wire",
      addedBy: "Manager 1",
      addedDate: "2024-01-15",
      status: "Active",
    },
    {
      _id: "2",
      itemName: "Copper Wire",
      quantity: 890,
      unit: "kg",
      category: "Wire",
      addedBy: "Manager 1",
      addedDate: "2024-01-14",
      status: "Active",
    },
    {
      _id: "3",
      itemName: "Scrap Metal",
      quantity: 450,
      unit: "kg",
      category: "Scrap",
      addedBy: "Manager 1",
      addedDate: "2024-01-13",
      status: "Active",
    },
    {
      _id: "1",
      itemName: "Aluminium Wire",
      quantity: 1250,
      unit: "kg",
      category: "Wire",
      addedBy: "Manager 1",
      addedDate: "2024-01-15",
      status: "Active",
    },
    {
      _id: "2",
      itemName: "Copper Wire",
      quantity: 890,
      unit: "kg",
      category: "Wire",
      addedBy: "Manager 1",
      addedDate: "2024-01-14",
      status: "Active",
    },
    {
      _id: "3",
      itemName: "Scrap Metal",
      quantity: 450,
      unit: "kg",
      category: "Scrap",
      addedBy: "Manager 1",
      addedDate: "2024-01-13",
      status: "Active",
    },
    {
      _id: "1",
      itemName: "Aluminium Wire",
      quantity: 1250,
      unit: "kg",
      category: "Wire",
      addedBy: "Manager 1",
      addedDate: "2024-01-15",
      status: "Active",
    },
    {
      _id: "2",
      itemName: "Copper Wire",
      quantity: 890,
      unit: "kg",
      category: "Wire",
      addedBy: "Manager 1",
      addedDate: "2024-01-14",
      status: "Active",
    },
    {
      _id: "3",
      itemName: "Scrap Metal",
      quantity: 450,
      unit: "kg",
      category: "Scrap",
      addedBy: "Manager 1",
      addedDate: "2024-01-13",
      status: "Active",
    },
    {
      _id: "1",
      itemName: "Aluminium Wire",
      quantity: 1250,
      unit: "kg",
      category: "Wire",
      addedBy: "Manager 1",
      addedDate: "2024-01-15",
      status: "Active",
    },
    {
      _id: "2",
      itemName: "Copper Wire",
      quantity: 890,
      unit: "kg",
      category: "Wire",
      addedBy: "Manager 1",
      addedDate: "2024-01-14",
      status: "Active",
    },
    {
      _id: "3",
      itemName: "Scrap Metal",
      quantity: 450,
      unit: "kg",
      category: "Scrap",
      addedBy: "Manager 1",
      addedDate: "2024-01-13",
      status: "Active",
    },
    {
      _id: "1",
      itemName: "Aluminium Wire",
      quantity: 1250,
      unit: "kg",
      category: "Wire",
      addedBy: "Manager 1",
      addedDate: "2024-01-15",
      status: "Active",
    },
    {
      _id: "2",
      itemName: "Copper Wire",
      quantity: 890,
      unit: "kg",
      category: "Wire",
      addedBy: "Manager 1",
      addedDate: "2024-01-14",
      status: "Active",
    },
    {
      _id: "3",
      itemName: "Scrap Metal",
      quantity: 450,
      unit: "kg",
      category: "Scrap",
      addedBy: "Manager 1",
      addedDate: "2024-01-13",
      status: "Active",
    },
  ]);

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
    if (window.confirm("Are you sure you want to delete this stock item?")) {
      setStockData(stockData.filter((item) => item._id !== id));
      dispatch(
        showSnackbar({
          message: "Stock item deleted successfully",
          severity: "success",
        })
      );
    }
  };

  const handleAddSubmit = async (data) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Add new stock
      const newStock = {
        _id: String(Date.now()),
        ...data,
        quantity: Number(data.quantity),
        addedBy: user?.name || "Manager",
        addedDate: new Date().toISOString().split("T")[0],
        status: "Active",
      };
      setStockData([newStock, ...stockData]);
      dispatch(
        showSnackbar({
          message: "Stock item added successfully",
          severity: "success",
        })
      );
      setIsAddModalOpen(false);
    } catch (error) {
      dispatch(
        showSnackbar({
          message: "Failed to save stock item",
          severity: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (data) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Update existing stock
      setStockData(
        stockData.map((item) =>
          item._id === editingStock._id
            ? {
                ...item,
                ...data,
                quantity: Number(data.quantity),
                addedBy: user?.name || "Manager",
                addedDate: new Date().toISOString().split("T")[0],
              }
            : item
        )
      );
      dispatch(
        showSnackbar({
          message: "Stock item updated successfully",
          severity: "success",
        })
      );
      setIsEditModalOpen(false);
      setEditingStock(null);
    } catch (error) {
      dispatch(
        showSnackbar({
          message: "Failed to update stock item",
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
  // Dummy stock data
  const stockData1 = {
    aluminiumWire: {
      name: "Aluminium Wire",
      quantity: 1250,
      unit: "kg",
    },
    copperWire: {
      name: "Copper Wire",
      quantity: 890,
      unit: "kg",
    },
    scrap: {
      name: "Scrap",
      quantity: 450,
      unit: "kg",
    },
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
      <StockCardsGrid stockData={stockData1} />

      {/* Quick Actions */}
      {/* <QuickActions /> */}

      {/* Stock Table */}
      <StockTable
        stockData={stockData}
        currentPage={currentPage}
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
    </div>
  );
};

export default ManagerDashboardView;

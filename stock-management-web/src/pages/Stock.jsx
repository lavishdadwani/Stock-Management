import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../components/Layout';
import Button from '../components/Button';
import ItemProducedTable from '../components/itemProduced/ItemProducedTable';
import FinishedStockCardsGrid from '../components/itemProduced/FinishedStockCardsGrid';
import PurchaseFinishedProductModal from '../components/itemProduced/PurchaseFinishedProductModal';
import { showSnackbar } from '../redux/slices/snackbarSlice';
import itemProducedAPI from '../../services/itemProduced';
import customerAPI from '../../services/customer';
import { FaShoppingCart } from 'react-icons/fa';

const Stock = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const pageSize = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [finishedStockTotals, setFinishedStockTotals] = useState([]);
  const [totalsLoading, setTotalsLoading] = useState(false);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  const canRecordPurchase = user?.role === 'manager' || user?.role === 'owner';

  const fetchProducedItems = async () => {
    setLoading(true);
    try {
      const response = await itemProducedAPI.getAllItemProduced({
        page: currentPage,
        limit: pageSize
      });

      if (response.ok) {
        const data = response.data?.data || [];
        const additionalData = response.data?.additionalData || {};
        setItems(data);
        setTotal(additionalData.totalItems || 0);
      } else {
        dispatch(
          showSnackbar({
            message:
              response.data?.displayMessage ||
              response.data?.message ||
              'Failed to fetch produced items',
            severity: 'error'
          })
        );
      }
    } catch (error) {
      dispatch(
        showSnackbar({
          message: error.message || 'Failed to fetch produced items',
          severity: 'error'
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchItemTotals = async () => {
    setTotalsLoading(true);
    try {
      const response = await itemProducedAPI.getItemProducedTotals();
      if (response.ok) {
        setFinishedStockTotals(response.data?.data || []);
      } else {
        dispatch(
          showSnackbar({
            message:
              response.data?.displayMessage ||
              response.data?.message ||
              'Failed to fetch finished stock totals',
            severity: 'error'
          })
        );
      }
    } catch (error) {
      dispatch(
        showSnackbar({
          message: error.message || 'Failed to fetch finished stock totals',
          severity: 'error'
        })
      );
    } finally {
      setTotalsLoading(false);
    }
  };

  const fetchCustomersForPurchase = async () => {
    try {
      const response = await customerAPI.getAllCustomers({ page: 1, limit: 500, isActive: true });
      if (response.ok) {
        setCustomers(response.data?.data || []);
      }
    } catch {
      setCustomers([]);
    }
  };

  useEffect(() => {
    fetchProducedItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, user?.id]);

  useEffect(() => {
    fetchItemTotals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  useEffect(() => {
    if (purchaseModalOpen && canRecordPurchase) {
      fetchCustomersForPurchase();
    }
  }, [purchaseModalOpen, canRecordPurchase]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePurchaseSubmit = async (payload, resetForm) => {
    setPurchaseLoading(true);
    try {
      const response = await itemProducedAPI.purchaseFromCustomer(payload);
      if (response.ok) {
        dispatch(showSnackbar({ message: 'Purchase recorded — finished stock updated', severity: 'success' }));
        setPurchaseModalOpen(false);
        resetForm?.();
        fetchProducedItems();
        fetchItemTotals();
      } else {
        dispatch(
          showSnackbar({
            message:
              response.data?.displayMessage || response.data?.message || 'Failed to record purchase',
            severity: 'error'
          })
        );
      }
    } catch (error) {
      dispatch(
        showSnackbar({
          message: error.message || 'Failed to record purchase',
          severity: 'error'
        })
      );
    } finally {
      setPurchaseLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Stock Management</h1>
            <p className="text-gray-600 mt-1">
              Finished products: in-house production and purchases from customers (sellable pool)
            </p>
          </div>
          {canRecordPurchase ? (
            <Button
              type="button"
              variant="secondary"
              className="flex items-center gap-2 shrink-0"
              onClick={() => setPurchaseModalOpen(true)}
            >
              <FaShoppingCart className="w-4 h-4" />
              Purchase from customer
            </Button>
          ) : null}
        </div>

        <FinishedStockCardsGrid totals={finishedStockTotals} loading={totalsLoading} />

        <ItemProducedTable
          items={items}
          currentPage={currentPage}
          total={total}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          loading={loading}
        />

        <PurchaseFinishedProductModal
          isOpen={purchaseModalOpen}
          onClose={() => !purchaseLoading && setPurchaseModalOpen(false)}
          onSubmit={handlePurchaseSubmit}
          loading={purchaseLoading}
          customers={customers}
        />
      </div>
    </Layout>
  );
};

export default Stock;

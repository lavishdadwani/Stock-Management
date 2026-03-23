import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Layout from '../components/Layout';
import Card from '../components/Card';
import {
  CustomerDetailsHeader,
  CustomerProfileCard,
  CustomerSalesSummaryCards,
  CustomerFinishedSalesSection,
  getCustomerSalesColumns
} from '../components/customerDetails';
import { showSnackbar } from '../redux/slices/snackbarSlice';
import customerAPI from '../../services/customer';
import salesAPI from '../../services/sales';

const pageSize = 10;

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [customer, setCustomer] = useState(null);
  const [sales, setSales] = useState([]);
  const [salesPage, setSalesPage] = useState(1);
  const [salesTotal, setSalesTotal] = useState(0);
  const [loadingCustomer, setLoadingCustomer] = useState(true);
  const [loadingSales, setLoadingSales] = useState(true);

  const fetchCustomer = useCallback(async () => {
    setLoadingCustomer(true);
    try {
      const response = await customerAPI.getCustomerById(id);
      if (response.ok) {
        setCustomer(response.data?.data || null);
      } else {
        setCustomer(null);
        dispatch(
          showSnackbar({
            message: response.data?.displayMessage || response.data?.message || 'Customer not found',
            severity: 'error'
          })
        );
      }
    } catch (e) {
      setCustomer(null);
      dispatch(
        showSnackbar({ message: e.message || 'Failed to load customer', severity: 'error' })
      );
    } finally {
      setLoadingCustomer(false);
    }
  }, [id, dispatch]);

  const fetchSales = useCallback(async () => {
    if (!id) return;
    setLoadingSales(true);
    try {
      const response = await salesAPI.getAllSales({
        page: salesPage,
        limit: pageSize,
        customerId: id
      });
      if (response.ok) {
        const data = response.data?.data || [];
        const additionalData = response.data?.additionalData || {};
        setSales(data);
        setSalesTotal(additionalData.totalItems ?? data.length);
      } else {
        setSales([]);
        dispatch(
          showSnackbar({
            message: response.data?.displayMessage || response.data?.message || 'Failed to load sales',
            severity: 'error'
          })
        );
      }
    } catch (e) {
      setSales([]);
      dispatch(showSnackbar({ message: e.message || 'Failed to load sales', severity: 'error' }));
    } finally {
      setLoadingSales(false);
    }
  }, [id, salesPage, dispatch]);

  useEffect(() => {
    setSalesPage(1);
  }, [id]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const salesSummary = useMemo(() => {
    let totalPieces = 0;
    let revenue = 0;
    for (const s of sales) {
      totalPieces += Number(s.quantity) || 0;
      if (s.totalAmount != null) revenue += Number(s.totalAmount) || 0;
    }
    return { totalPieces, revenue, count: sales.length };
  }, [sales]);

  const salesColumns = useMemo(() => getCustomerSalesColumns(), []);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <CustomerDetailsHeader onBack={() => navigate('/customers')} />

        {loadingCustomer ? (
          <p className="text-gray-600">Loading customer…</p>
        ) : !customer ? (
          <Card>
            <p className="text-gray-600">Customer not found.</p>
          </Card>
        ) : (
          <>
            <CustomerProfileCard customer={customer} />
            <CustomerSalesSummaryCards summary={salesSummary} />
            <CustomerFinishedSalesSection
              sales={sales}
              columns={salesColumns}
              currentPage={salesPage}
              total={salesTotal}
              pageSize={pageSize}
              loading={loadingSales}
              onPageChange={setSalesPage}
              onNavigateToAllSales={() => navigate('/sales')}
            />
          </>
        )}
      </div>
    </Layout>
  );
};

export default CustomerDetails;

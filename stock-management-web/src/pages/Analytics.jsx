import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Layout from '../components/Layout';
import StatTile from '../components/analytics/StatTile';
import SalesTrendChart from '../components/analytics/SalesTrendChart';
import MaterialUsageChart from '../components/analytics/MaterialUsageChart';
import ProductionSummaryChart from '../components/analytics/ProductionSummaryChart';
import { showSnackbar } from '../redux/slices/snackbarSlice';
import analyticsAPI from '../../services/analytics';

const RANGE_PRESETS = [
  { value: 7, label: 'Last 7 days' },
  { value: 30, label: 'Last 30 days' },
  { value: 90, label: 'Last 90 days' }
];

const toIsoDate = (date) => date.toISOString().slice(0, 10);

const getRangeParams = (days) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (days - 1));
  return { startDate: toIsoDate(startDate), endDate: toIsoDate(endDate) };
};

const Analytics = () => {
  const dispatch = useDispatch();
  const [rangeDays, setRangeDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState(null);
  const [salesTrend, setSalesTrend] = useState([]);
  const [materialUsage, setMaterialUsage] = useState([]);
  const [productionSummary, setProductionSummary] = useState([]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const params = getRangeParams(rangeDays);
      const [overviewRes, salesRes, materialRes, productionRes] = await Promise.all([
        analyticsAPI.getOverview(params),
        analyticsAPI.getSalesTrend(params),
        analyticsAPI.getMaterialUsageTrend(params),
        analyticsAPI.getProductionSummary(params)
      ]);

      if (overviewRes.ok) setOverview(overviewRes.data?.data || null);
      if (salesRes.ok) setSalesTrend(salesRes.data?.data || []);
      if (materialRes.ok) setMaterialUsage(materialRes.data?.data || []);
      if (productionRes.ok) setProductionSummary(productionRes.data?.data || []);

      const failed = [overviewRes, salesRes, materialRes, productionRes].find((r) => !r.ok);
      if (failed) {
        dispatch(
          showSnackbar({
            message: failed.data?.displayMessage || failed.data?.message || 'Failed to load some analytics data',
            severity: 'error'
          })
        );
      }
    } catch (error) {
      dispatch(showSnackbar({ message: error.message || 'Failed to load analytics', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeDays]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-1">Sales, material usage, and production trends</p>
          </div>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {RANGE_PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setRangeDays(preset.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  rangeDays === preset.value
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatTile
            label="Total Revenue"
            value={overview ? `$${overview.totalRevenue.toLocaleString()}` : '—'}
          />
          <StatTile label="Sales" value={overview ? overview.totalSalesCount.toLocaleString() : '—'} />
          <StatTile
            label="Items Produced"
            value={overview ? overview.totalItemsProduced.toLocaleString() : '—'}
          />
          <StatTile
            label="Attendance Hours"
            value={overview ? `${overview.totalAttendanceHours.toLocaleString()}h` : '—'}
          />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <SalesTrendChart data={salesTrend} loading={loading} />
          <MaterialUsageChart data={materialUsage} loading={loading} />
          <ProductionSummaryChart data={productionSummary} loading={loading} />
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;

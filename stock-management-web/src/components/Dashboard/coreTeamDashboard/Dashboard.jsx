import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../../../redux/slices/snackbarSlice';
import Button from '../../Button';
import Table from '../../Table/Table';
import CheckoutModal from './CheckoutModal';
import { getAttendanceColumns } from './columns/attendanceColumns';
import attendanceAPI from '../../../../services/attendance';
import { FaSignInAlt, FaSignOutAlt } from 'react-icons/fa';

const Dashboard = () => {
  const dispatch = useDispatch();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInStatusLoading, setCheckInStatusLoading] = useState(true);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [totalHistory, setTotalHistory] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(false);
  const pageSize = 10;

  useEffect(() => {
    fetchCheckInStatus();
    // fetchAttendanceHistory();
  }, []);

  useEffect(() => {
    fetchAttendanceHistory();
  }, [currentPage]);

  const fetchCheckInStatus = async () => {
    setCheckInStatusLoading(true);
    try {
      const response = await attendanceAPI.getCheckInStatus();
      if (response.ok) {
        setIsCheckedIn(response.data?.data?.isCheckedIn || false);
      } else {
        dispatch(
          showSnackbar({
            message: response.data?.displayMessage || response.data?.message || 'Failed to fetch check-in status',
            severity: 'error',
          })
        );
      }
    } catch (error) {
      dispatch(
        showSnackbar({
          message: error.message || 'Failed to fetch check-in status',
          severity: 'error',
        })
      );
    } finally {
      setCheckInStatusLoading(false);
    }
  };

  const fetchAttendanceHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await attendanceAPI.getMyAttendanceHistory({
        page: currentPage,
        limit: pageSize,
      });

      if (response.ok) {
        const data = response.data?.data || [];
        const pagination = response.data?.additionalData || {};
        setAttendanceHistory(data);
        setTotalHistory(pagination.total);
      } else {
        dispatch(
          showSnackbar({
            message: response.data?.displayMessage || response.data?.message || 'Failed to fetch attendance history',
            severity: 'error',
          })
        );
      }
    } catch (error) {
      dispatch(
        showSnackbar({
          message: error.message || 'Failed to fetch attendance history',
          severity: 'error',
        })
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setCheckInLoading(true);
    try {
      const response = await attendanceAPI.checkIn();

      if (response.ok) {
        setIsCheckedIn(true);
        dispatch(
          showSnackbar({
            message: response.data?.displayMessage || 'Checked in successfully',
            severity: 'success',
          })
        );
        fetchAttendanceHistory();
      } else {
        dispatch(
          showSnackbar({
            message: response.data?.displayMessage || response.data?.message || 'Failed to check in',
            severity: 'error',
          })
        );
      }
    } catch (error) {
      dispatch(
        showSnackbar({
          message: error.message || 'Failed to check in',
          severity: 'error',
        })
      );
    } finally {
      setCheckInLoading(false);
    }
  };

  const handleCheckOutClick = () => {
    setIsCheckoutModalOpen(true);
  };

  const handleCheckoutSuccess = () => {
    setIsCheckedIn(false);
    setIsCheckoutModalOpen(false);
    fetchAttendanceHistory();
    dispatch(
      showSnackbar({
        message: 'Checked out successfully',
        severity: 'success',
      })
    );
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const columns = getAttendanceColumns();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Core Team Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage your attendance and production</p>
      </div>

      {/* Check In/Out Section */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Attendance</h2>
          
          {checkInStatusLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Loading status...</div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              {!isCheckedIn ? (
                <Button
                  onClick={handleCheckIn}
                  loading={checkInLoading}
                  disabled={checkInLoading}
                  variant="primary"
                  size="large"
                  className="flex items-center space-x-2"
                >
                  <FaSignInAlt className="w-5 h-5" />
                  <span>Check In</span>
                </Button>
              ) : (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-green-600">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">You are checked in</span>
                  </div>
                  <Button
                    onClick={handleCheckOutClick}
                    variant="danger"
                    size="large"
                    className="flex items-center space-x-2"
                  >
                    <FaSignOutAlt className="w-5 h-5" />
                    <span>Check Out</span>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Attendance History Table */}
      <div>
        <Table
          title="Attendance History"
          columns={columns}
          dataSource={attendanceHistory}
          currentPage={currentPage}
          total={totalHistory}
          pageSize={pageSize}
          onPageChangeHandler={handlePageChange}
          loading={historyLoading}
          emptyMessage="No attendance records found"
          rowKey="_id"
        />
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        onSuccess={handleCheckoutSuccess}
      />
    </div>
  );
};

export default Dashboard;

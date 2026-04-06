import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Card from '../Card';
import Table from '../Table/Table';
import CheckInPhotoModal from './CheckInPhotoModal';
import attendanceAPI from '../../../services/attendance';

const pageSize = 8;

const formatCoord = (lat, lng) => {
  if (lat == null || lng == null || Number.isNaN(Number(lat)) || Number.isNaN(Number(lng))) {
    return '—';
  }
  return `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`;
};

const UserAttendanceHistory = ({ userId }) => {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoSrc, setPhotoSrc] = useState(null);
  const [photoError, setPhotoError] = useState(null);

  const fetchHistory = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await attendanceAPI.getUserAttendanceHistory(userId, {
        page,
        limit: pageSize
      });
      if (res.ok) {
        setRows(res.data?.data || []);
        const add = res.data?.additionalData || {};
        setTotal(add.totalItems ?? (res.data?.data || []).length);
      } else {
        setRows([]);
        setTotal(0);
      }
    } catch {
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [userId, page]);

  useEffect(() => {
    setPage(1);
  }, [userId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const openPhoto = useCallback(async (attendanceId) => {
    setPhotoModalOpen(true);
    setPhotoLoading(true);
    setPhotoSrc(null);
    setPhotoError(null);
    try {
      const res = await attendanceAPI.getAttendanceRecord(attendanceId);
      if (res.ok) {
        const doc = res.data?.data;
        const src = doc?.checkInPhoto;
        if (src && String(src).trim()) {
          setPhotoSrc(String(src).trim());
        } else {
          setPhotoError('No photo stored for this check-in.');
        }
      } else {
        setPhotoError(res.data?.message || res.data?.displayMessage || 'Could not load photo.');
      }
    } catch (e) {
      setPhotoError(e.message || 'Could not load photo.');
    } finally {
      setPhotoLoading(false);
    }
  }, []);

  const closePhotoModal = () => {
    setPhotoModalOpen(false);
    setPhotoSrc(null);
    setPhotoError(null);
  };

  const columns = useMemo(
    () => [
      {
        title: 'Check-in',
        dataIndex: 'checkInTime',
        key: 'checkInTime',
        render: (v) => (v ? new Date(v).toLocaleString() : '—')
      },
      {
        title: 'Check-out',
        dataIndex: 'checkOutTime',
        key: 'checkOutTime',
        render: (v) => (v ? new Date(v).toLocaleString() : '—')
      },
      {
        title: 'Duration',
        key: 'duration',
        render: (_, record) => {
          if (!record.checkInTime || !record.checkOutTime) return '-';
          const duration = new Date(record.checkOutTime) - new Date(record.checkInTime);
          const hours = Math.floor(duration / (1000 * 60 * 60));
          const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
          return `${hours}h ${minutes}m`;
        },
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (v) => v || '—'
      },
      {
        title: 'City',
        dataIndex: 'city',
        key: 'city',
        // render: (v) => v
      },
      {
        title: 'Location (lat, lng)',
        key: 'loc',
        render: (_, record) => formatCoord(record.checkInLatitude, record.checkInLongitude)
      },
      {
        title: 'Wire Used',
        key: 'wireUsed',
        render: (_, record) => {
          if (!record.item) return '-';
          const wireType = record.item.wireUsedType || '-';
          const quantity = record.item.wireUsedQuantity || 0;
          return (
            <span>
              {wireType !== '-' ? `${wireType.charAt(0).toUpperCase() + wireType.slice(1)}: ${quantity} kg` : '-'}
            </span>
          );
        },
      },
      {
        title: 'Item Produced',
        key: 'itemProduced',
        render: (_, record) => {
          if (!record.item) return '-';
          const itemName = record.item.itemName || '-';
          const quantity = record.item.quantity || 0;
          const unit = record.item.unit || 'kg';
          return (
            <span>
              {itemName !== '-' ? `${itemName}: ${quantity} ${unit}` : '-'}
            </span>
          );
        },
      },
      {
        title: 'Scrap Generated',
        key: 'scrap',
        render: (_, record) => {
          if (!record.item || !record.item.scrapQuantity) return '-';
          return <span>{record.item.scrapQuantity} kg</span>;
        },
      },
      {
        title: 'Check-in photo',
        key: 'photo',
        render: (_, record) =>
          record.hasCheckInPhoto ? (
            <button
              type="button"
              onClick={() => openPhoto(record._id)}
              className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
            >
              View photo
            </button>
          ) : (
            <span className="text-gray-400">—</span>
          )
      }
    ],
    [openPhoto]
  );

  if (!userId) return null;

  return (
    <>
      <Card className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Attendance history</h2>
        <p className="text-sm text-gray-600 mb-4">
          Check-in and check-out sessions. Open the photo when a check-in image was captured (e.g. from the mobile
          app).
        </p>
        <Table
          title=""
          columns={columns}
          dataSource={rows}
          currentPage={page}
          total={total}
          pageSize={pageSize}
          onPageChangeHandler={setPage}
          loading={loading}
          emptyMessage="No attendance records for this user."
          rowKey="_id"
        />
      </Card>

      <CheckInPhotoModal
        isOpen={photoModalOpen}
        onClose={closePhotoModal}
        imageSrc={photoSrc}
        loading={photoLoading}
        errorMessage={photoError}
      />
    </>
  );
};

export default UserAttendanceHistory;

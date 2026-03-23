import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import DeleteModal from '../components/modal/DeleteModal';
import EditUserModal from '../components/users/EditUserModal';
import { showSnackbar } from '../redux/slices/snackbarSlice';
import userAPI from '../../services/user';
import { canManageUserRecord } from '../utils/userPermissions';
import { FaTrash, FaUserEdit } from 'react-icons/fa';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user: actor } = useSelector((state) => state.auth);

  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const allowedRoleOptions = useMemo(() => {
    if (actor?.role === 'owner') {
      return [
        { value: 'manager', label: 'Manager' },
        { value: 'core_team', label: 'Core Team' }
      ];
    }
    if (actor?.role === 'manager') {
      return [{ value: 'core_team', label: 'Core Team' }];
    }
    return [];
  }, [actor?.role]);

  const fetchUserDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await userAPI.getUserById(id);
      if (response.ok) {
        setUserDetails(response.data?.data || null);
      } else {
        dispatch(
          showSnackbar({
            message: response.data?.displayMessage || response.data?.message || 'Failed to fetch user details',
            severity: 'error'
          })
        );
      }
    } catch (error) {
      dispatch(
        showSnackbar({
          message: error.message || 'Failed to fetch user details',
          severity: 'error'
        })
      );
    } finally {
      setLoading(false);
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (id && (actor?.role === 'manager' || actor?.role === 'owner')) {
      fetchUserDetails();
    }
  }, [id, actor?.role, fetchUserDetails]);

  const canManage = userDetails && canManageUserRecord(actor, userDetails);

  const handleStatusChange = async (nextActive) => {
    if (!canManage || !userDetails) return;
    setStatusLoading(true);
    try {
      const response = await userAPI.updateUserById(id, { isActive: nextActive });
      if (response.ok) {
        setUserDetails(response.data?.data || { ...userDetails, isActive: nextActive });
        dispatch(
          showSnackbar({
            message: nextActive ? 'User activated' : 'User marked inactive',
            severity: 'success'
          })
        );
      } else {
        dispatch(
          showSnackbar({
            message: response.data?.displayMessage || response.data?.message || 'Failed to update status',
            severity: 'error'
          })
        );
      }
    } catch (e) {
      dispatch(showSnackbar({ message: e.message || 'Failed to update status', severity: 'error' }));
    } finally {
      setStatusLoading(false);
    }
  };

  const handleEditSubmit = async (payload) => {
    setActionLoading(true);
    try {
      const response = await userAPI.updateUserById(id, payload);
      if (response.ok) {
        setUserDetails(response.data?.data || null);
        dispatch(showSnackbar({ message: 'User updated', severity: 'success' }));
        setEditOpen(false);
      } else {
        dispatch(
          showSnackbar({
            message: response.data?.displayMessage || response.data?.message || 'Update failed',
            severity: 'error'
          })
        );
      }
    } catch (e) {
      dispatch(showSnackbar({ message: e.message || 'Update failed', severity: 'error' }));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setActionLoading(true);
    try {
      const response = await userAPI.deleteUserById(id);
      if (response.ok) {
        dispatch(showSnackbar({ message: 'User deleted', severity: 'success' }));
        setDeleteOpen(false);
        navigate('/users');
      } else {
        dispatch(
          showSnackbar({
            message: response.data?.displayMessage || response.data?.message || 'Delete failed',
            severity: 'error'
          })
        );
      }
    } catch (e) {
      dispatch(showSnackbar({ message: e.message || 'Delete failed', severity: 'error' }));
    } finally {
      setActionLoading(false);
    }
  };

  if (actor?.role !== 'manager' && actor?.role !== 'owner') {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Details</h1>
          <p className="text-gray-600">Access denied. Only manager and owner can view user details.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Details</h1>
            <p className="text-gray-600 mt-1">Full profile and account controls</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => navigate('/users')}>
              Back to Users
            </Button>
            {canManage && (
              <>
                <Button variant="secondary" onClick={() => setEditOpen(true)}>
                  <span className="inline-flex items-center gap-2">
                    <FaUserEdit /> Edit
                  </span>
                </Button>
                <Button variant="danger" onClick={() => setDeleteOpen(true)}>
                  <span className="inline-flex items-center gap-2">
                    <FaTrash /> Delete
                  </span>
                </Button>
              </>
            )}
          </div>
        </div>

        <Card>
          {loading ? (
            <p className="text-gray-600">Loading user details...</p>
          ) : !userDetails ? (
            <p className="text-gray-600">User not found.</p>
          ) : (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="shrink-0">
                  {userDetails.photo ? (
                    <img
                      src={userDetails.photo}
                      alt=""
                      className="w-28 h-28 rounded-full object-cover border border-gray-200 bg-gray-100"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling?.classList?.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-semibold text-gray-600 ${
                      userDetails.photo ? 'hidden' : ''
                    }`}
                  >
                    {(userDetails.name || '?').charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">{userDetails.name || '-'}</h2>
                    <p className="text-gray-600">{userDetails.email || '-'}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                      {userDetails.role || '—'}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        userDetails.isEmailVerified
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {userDetails.isEmailVerified ? 'Email verified' : 'Email not verified'}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        userDetails.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {userDetails.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-100 pt-6">
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-lg font-medium text-gray-900">{userDetails.number || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Profile photo</p>
                  <p className="text-lg font-medium text-gray-900 break-all">
                    {userDetails.photo || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last login</p>
                  <p className="text-lg font-medium text-gray-900">
                    {userDetails.lastLogin ? new Date(userDetails.lastLogin).toLocaleString() : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="text-lg font-medium text-gray-900">
                    {userDetails.createdAt ? new Date(userDetails.createdAt).toLocaleString() : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last updated</p>
                  <p className="text-lg font-medium text-gray-900">
                    {userDetails.updatedAt ? new Date(userDetails.updatedAt).toLocaleString() : '—'}
                  </p>
                </div>
              </div>

              {canManage && (
                <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row sm:items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">Account active</span>
                  <label className="inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={!!userDetails.isActive}
                      disabled={statusLoading}
                      onChange={(e) => handleStatusChange(e.target.checked)}
                    />
                    <div
                      className={`relative w-11 h-6 rounded-full transition-colors peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 ${
                        userDetails.isActive ? 'bg-green-500' : 'bg-gray-300'
                      } ${statusLoading ? 'opacity-60' : ''}`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          userDetails.isActive ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </div>
                    <span className="ml-3 text-sm text-gray-600">
                      {statusLoading ? 'Saving…' : userDetails.isActive ? 'On' : 'Off'}
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 sm:ml-4">
                    Inactive users cannot sign in and will see a message on the login screen.
                  </p>
                </div>
              )}

              {!canManage && userDetails && (
                <p className="text-sm text-gray-500 border-t border-gray-100 pt-6">
                  {String(actor?.id) === String(userDetails._id ?? userDetails.id)
                    ? 'Use your profile settings to change your own account.'
                    : userDetails.role === 'owner'
                      ? 'Owner accounts cannot be edited or deleted from this page.'
                      : 'You do not have permission to manage this user.'}
                </p>
              )}
            </div>
          )}
        </Card>
      </div>

      {userDetails && (
        <EditUserModal
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          user={userDetails}
          allowedRoleOptions={allowedRoleOptions}
          onSubmit={handleEditSubmit}
          loading={actionLoading}
        />
      )}

      <DeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        loading={actionLoading}
        itemName={userDetails?.name}
        title="Delete user"
        message={`Permanently delete ${userDetails?.name || 'this user'}? They will not be able to sign in anymore.`}
      />
    </Layout>
  );
};

export default UserDetails;

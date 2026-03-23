import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import UsersTable from '../components/users/UsersTable';
import CreateUserCredentialsModal from '../components/users/CreateUserCredentialsModal';
import DeleteModal from '../components/modal/DeleteModal';
import { showSnackbar } from '../redux/slices/snackbarSlice';
import userAPI from '../../services/user';

const Users = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const userRole = user?.role;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const allowedRoleOptions = useMemo(() => {
    if (userRole === 'owner') {
      return [
        { value: 'manager', label: 'Manager' },
        { value: 'core team', label: 'Core Team' }
      ];
    }
    if (userRole === 'manager') {
      return [{ value: 'core team', label: 'Core Team' }];
    }
    return [];
  }, [userRole]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getAllUsers();
      if (response.ok) {
        setUsers(response.data?.data || []);
      } else {
        dispatch(
          showSnackbar({
            message: response.data?.displayMessage || response.data?.message || 'Failed to fetch users',
            severity: 'error'
          })
        );
      }
    } catch (error) {
      dispatch(
        showSnackbar({
          message: error.message || 'Failed to fetch users',
          severity: 'error'
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole === 'manager' || userRole === 'owner') {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole]);

  const onCreateCredentials = async (formData, resetForm) => {
    setLoading(true);
    try {
      const response = await userAPI.createCredentials(formData);
      if (response.ok) {
        dispatch(showSnackbar({ message: 'Credentials created successfully', severity: 'success' }));
        setIsCreateModalOpen(false);
        resetForm();
        fetchUsers();
      } else {
        dispatch(
          showSnackbar({
            message: response.data?.displayMessage || response.data?.message || 'Failed to create credentials',
            severity: 'error'
          })
        );
      }
    } catch (error) {
      dispatch(
        showSnackbar({
          message: error.message || 'Failed to create credentials',
          severity: 'error'
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget?._id) return;
    setDeleteLoading(true);
    try {
      const response = await userAPI.deleteUserById(deleteTarget._id);
      if (response.ok) {
        dispatch(showSnackbar({ message: 'User deleted', severity: 'success' }));
        setDeleteTarget(null);
        fetchUsers();
      } else {
        dispatch(
          showSnackbar({
            message: response.data?.displayMessage || response.data?.message || 'Delete failed',
            severity: 'error'
          })
        );
      }
    } catch (error) {
      dispatch(
        showSnackbar({
          message: error.message || 'Delete failed',
          severity: 'error'
        })
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  if (userRole !== 'manager' && userRole !== 'owner') {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Users</h1>
          <p className="text-gray-600">Access denied. Only manager and owner can manage credentials.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-600 mt-1">
              {userRole === 'owner'
                ? 'Create manager and core team credentials'
                : 'Create core team credentials'}
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            Create Credentials
          </Button>
        </div>

        <UsersTable
          users={users}
          loading={loading}
          onNameClick={(record) => navigate(`/users/${record._id}`)}
          onEdit={(record) => navigate(`/users/${record._id}`)}
          onDelete={(record) => setDeleteTarget(record)}
          actorUser={user}
        />

        <CreateUserCredentialsModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={onCreateCredentials}
          loading={loading}
          allowedRoleOptions={allowedRoleOptions}
        />

        <DeleteModal
          isOpen={!!deleteTarget}
          onClose={() => !deleteLoading && setDeleteTarget(null)}
          onConfirm={handleDeleteUser}
          loading={deleteLoading}
          itemName={deleteTarget?.name}
          title="Delete user"
          message={
            deleteTarget
              ? `Permanently delete ${deleteTarget.name}? They will not be able to sign in anymore.`
              : undefined
          }
        />
      </div>
    </Layout>
  );
};

export default Users;


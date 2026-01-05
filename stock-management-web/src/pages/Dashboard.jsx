import React from 'react';
import { useSelector } from 'react-redux';
import Layout from '../components/Layout';
import ManagerDashboardView from '../components/Dashboard/manager-dashboard/ManagerDashboardView';
import OwnerDashboardView from '../components/Dashboard/owner-dashboard/OwnerDashboardView';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const userRole = user?.role?.toLowerCase();

  return (
    <Layout>
      {userRole === 'manager' && (
         <ManagerDashboardView />
      )}
      {userRole === 'owner' && (
         <OwnerDashboardView />
      )}
      {userRole === 'core team' && (
         <ManagerDashboardView />
      )}
    </Layout>
  );
};

export default Dashboard;


import React from 'react';
import { useSelector } from 'react-redux';
import Layout from '../components/Layout';
import ManagerDashboardView from '../components/Dashboard/manager-dashboard/ManagerDashboardView';
import CoreTeamDashboard from "../components/Dashboard/coreTeamDashboard/Dashboard"
const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const userRole = user?.role?.toLowerCase();

  return (
    <Layout>
      {(userRole === 'manager' || userRole === 'owner' || userRole === 'super_admin') && (
         <ManagerDashboardView />
      )}
      {userRole === 'core_team' && (
         <CoreTeamDashboard />
      )}
    </Layout>
  );
};

export default Dashboard;


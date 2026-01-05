import React from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';

const Stock = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Stock Management</h1>
          <p className="text-gray-600 mt-1">Manage your stock items</p>
        </div>
        
        <Card>
          <p className="text-gray-600">Stock management page coming soon...</p>
        </Card>
      </div>
    </Layout>
  );
};

export default Stock;


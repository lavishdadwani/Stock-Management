import React from 'react';
import Card from '../Card';

const QuickActions = ({ actions = [] }) => {
  const defaultActions = [
    {
      title: 'Add Stock',
      description: 'Add new stock items',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100',
    },
    {
      title: 'View Reports',
      description: 'View stock reports',
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-100',
    },
    {
      title: 'Manage Inventory',
      description: 'Manage your inventory',
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-100',
    },
  ];

  const actionsToDisplay = actions.length > 0 ? actions : defaultActions;

  return (
    <Card>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actionsToDisplay.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`p-4 ${action.bgColor} ${action.hoverColor} rounded-lg text-left transition-colors`}
          >
            <h3 className="font-semibold text-gray-900">{action.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{action.description}</p>
          </button>
        ))}
      </div>
    </Card>
  );
};

export default QuickActions;


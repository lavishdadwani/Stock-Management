import React from 'react';
import Modal from '../modal/Modal';

const JsonBlock = ({ label, value }) => (
  <div>
    <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
    <pre className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs overflow-x-auto max-h-80">
      {value ? JSON.stringify(value, null, 2) : 'None'}
    </pre>
  </div>
);

const ActivityLogDetailsModal = ({ isOpen, onClose, entry }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Activity Details"
      size="lg"
    >
      {entry && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">{entry.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <JsonBlock label="Before" value={entry.before} />
            <JsonBlock label="After" value={entry.after} />
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ActivityLogDetailsModal;

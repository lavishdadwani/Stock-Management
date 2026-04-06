import React from 'react';
import Modal from '../modal/Modal';
import Button from '../Button';

/**
 * Full-screen friendly modal to view a check-in photo (URL or data URL).
 */
const CheckInPhotoModal = ({ isOpen, onClose, imageSrc, loading, errorMessage }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Check-in photo" size="lg">
      <div className="flex flex-col items-center gap-4 py-2">
        {loading ? (
          <p className="text-gray-600">Loading image…</p>
        ) : errorMessage ? (
          <p className="text-red-600 text-center">{errorMessage}</p>
        ) : imageSrc ? (
          <div className="w-full max-h-[70vh] overflow-auto flex justify-center bg-gray-50 rounded-lg p-2">
            <img
              src={imageSrc}
              alt="Check-in"
              className="max-w-full h-auto object-contain rounded-md"
            />
          </div>
        ) : (
          <p className="text-gray-600">No image available.</p>
        )}
        <Button type="button" variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
};

export default CheckInPhotoModal;

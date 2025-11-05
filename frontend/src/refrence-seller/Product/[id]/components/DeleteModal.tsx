import React from "react";
import { ProductData } from "./types";

interface DeleteModalProps {
  product: ProductData;
  showDeleteModal: boolean;
  setShowDeleteModal: (show: boolean) => void;
  handleDeleteProduct: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  product,
  showDeleteModal,
  setShowDeleteModal,
  handleDeleteProduct,
}) => {
  if (!showDeleteModal) return null;

  return (
    <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 max-w-md w-full mx-4 shadow-2xl rounded-md  border-2 border-black">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Delete Product
        </h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete "{product.productName}"? This action
          cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="flex-1 px-4 py-2 border cursor-pointer border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteProduct}
            className="flex-1 px-4 py-2 cursor-pointer bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;

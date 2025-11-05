import React from "react";
import { ArrowLeft, Edit, Trash2, Save } from "lucide-react";
import { ProductData } from "./types";
import { useRouter } from "next/navigation";

interface ProductHeaderProps {
  product: ProductData;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  editedProduct: ProductData;
  setEditedProduct: (product: ProductData) => void;
  setShowDeleteModal: (value: boolean) => void;
  handleSaveChanges: () => void;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({
  product,
  isEditing,
  setIsEditing,
  setEditedProduct,
  setShowDeleteModal,
  handleSaveChanges,
}) => {
  const router = useRouter();
  return (
    <div className="bg-white shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            className="inline-flex cursor-pointer items-center justify-center text-terracotta-600 hover:text-terracotta-700 transition-colors"
            onClick={() => router.push("/Artist/Product")}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">Back to Products</span>
            <span className="sm:hidden">Back</span>
          </button>
        </div>

        <div className="flex items-center gap-3 sm:justify-end">
          {isEditing ? (
            <>
              <button
                onClick={() => {
                  setEditedProduct(product);
                  setIsEditing(false);
                }}
                className="flex-1 sm:flex-initial cursor-pointer px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                className="flex-1 sm:flex-initial px-4 cursor-pointer py-2 bg-terracotta-600 text-white hover:bg-terracotta-700 transition-colors flex items-center justify-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 sm:flex-initial px-4 py-2 cursor-pointer bg-terracotta-600 text-white hover:bg-terracotta-700 transition-colors flex items-center justify-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Product
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 border border-red-300 cursor-pointer text-red-700 hover:bg-red-50 transition-colors flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductHeader;

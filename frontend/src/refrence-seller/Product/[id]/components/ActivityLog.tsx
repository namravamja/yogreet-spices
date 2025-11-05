import React from "react";
import { Calendar } from "lucide-react";
import { ProductData } from "./types";

interface ActivityLogProps {
  product: ProductData;
}

const ActivityLog: React.FC<ActivityLogProps> = ({ product }) => {
  return (
    <div className="bg-white shadow-sm border border-gray-200 p-4 sm:p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <Calendar className="w-5 h-5 mr-2 text-terracotta-600" />
        Activity
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Created</span>
          <span className="font-medium text-gray-900 text-sm">
            {new Date(product.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Updated</span>
          <span className="font-medium text-gray-900 text-sm">
            {new Date(product.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;

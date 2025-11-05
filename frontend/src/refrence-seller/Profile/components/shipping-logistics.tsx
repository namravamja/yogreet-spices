"use client";

import { Truck, Package, Hash, Mail, Clock, Globe, Shield } from "lucide-react";

interface ArtistData {
  shippingType: string;
  serviceAreas: string[];
  inventoryVolume: string;
  supportContact: string;
  returnPolicy: string;
  workingHours: string;
}

interface ShippingLogisticsProps {
  artistData: ArtistData;
}

export default function ShippingLogistics({
  artistData,
}: ShippingLogisticsProps) {
  return (
    <div className="bg-white border border-stone-200 shadow-sm">
      <div className="p-6 border-b border-stone-200">
        <h2 className="text-xl font-medium text-stone-900 flex items-center">
          <Truck className="w-5 h-5 mr-2" />
          Shipping & Logistics
        </h2>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-stone-700 mb-1 flex items-center">
              <Package className="w-4 h-4 mr-2" />
              Shipping Type *
            </label>
            <p className="text-stone-600 py-2">
              {artistData.shippingType || "not provided"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700 mb-1 flex items-center">
              <Hash className="w-4 h-4 mr-2" />
              Inventory Volume *
            </label>
            <p className="text-stone-600 py-2">
              {artistData.inventoryVolume || "not provided"} items
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700 mb-1 flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              Support Contact *
            </label>
            <p className="text-stone-600 py-2">
              {artistData.supportContact || "not provided"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700 mb-1 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Working Hours
            </label>
            <p className="text-stone-600 py-2">
              {artistData.workingHours || "not provided"}
            </p>
          </div>
        </div>

        {/* Service Areas */}
        <div className="pt-6 border-t border-stone-200">
          <label className="text-sm font-medium text-stone-700 mb-3 flex items-center">
            <Globe className="w-4 h-4 mr-2" />
            Service Areas
          </label>
          <div className="flex flex-wrap gap-2">
            {artistData.serviceAreas.map((area, index) => (
              <span
                key={index}
                className="bg-sage-100 text-sage-700 px-3 py-1 rounded-full text-sm"
              >
                {area || "not provided"}
              </span>
            ))}
          </div>
        </div>

        {/* Return Policy */}
        <div className="pt-6 border-t border-stone-200">
          <label className="text-sm font-medium text-stone-700 mb-3 flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            Return Policy
          </label>
          <p className="text-stone-600">
            {artistData.returnPolicy || "not provided"}
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import type React from "react";
import { Switch } from "@/components/ui/switch";

interface SellerShipmentCapabilityData {
  certificateOfOriginCapability: boolean;
  phytosanitaryCertificateCapability: boolean;
  packagingCompliance: boolean;
  fumigationCertificateCapability: boolean;
  exportLogisticsPrepared: boolean;
}

interface Step4Props {
  data: SellerShipmentCapabilityData & Record<string, any>;
  updateData: (updates: Partial<SellerShipmentCapabilityData>) => void;
}

export default function Step4ExportDocsShipment({ data, updateData }: Step4Props) {
  const ToggleRow = ({
    label,
    field,
  }: {
    label: string;
    field: keyof SellerShipmentCapabilityData;
  }) => (
    <div className="flex items-center justify-between py-3 border-b border-stone-200 last:border-b-0">
      <span className="text-sm text-stone-700">{label}</span>
      <Switch
        checked={!!data[field]}
        onCheckedChange={(val) => updateData({ [field]: val } as Partial<SellerShipmentCapabilityData>)}
        className="data-[state=checked]:bg-yogreet-sage cursor-pointer"
      />
    </div>
  );

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-light text-yogreet-charcoal mb-4 sm:mb-6">Export Documentation & Shipment Capability</h2>

      <div className="bg-white border border-stone-200 rounded-md">
        <div className="p-4 sm:p-6">
          <ToggleRow label="Certificate of Origin Capability" field="certificateOfOriginCapability" />
          <ToggleRow label="Phytosanitary Certificate Capability" field="phytosanitaryCertificateCapability" />
          <ToggleRow label="Packaging Compliance" field="packagingCompliance" />
          <ToggleRow label="Fumigation Certificate Capability" field="fumigationCertificateCapability" />
          <ToggleRow label="Export Logistics Prepared" field="exportLogisticsPrepared" />
        </div>
      </div>

      <p className="text-xs text-stone-500 mt-4">Review your details and click Submit to send for verification.</p>
    </div>
  );
}



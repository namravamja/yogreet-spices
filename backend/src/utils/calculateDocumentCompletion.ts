/**
 * Centralized function to calculate seller document completion percentage
 * This is the single source of truth for document completion calculation in the backend
 * Must match the frontend calculation logic in frontend/src/utils/calculateDocumentCompletion.ts
 */

export interface SellerDocumentData {
  // Step 1: Business Identity
  panNumber?: string | null;
  gstNumber?: string | null;
  aadharNumber?: string | null;
  ownerIdDocument?: string | null;
  incorporationCertificate?: string | null;
  msmeUdyamCertificate?: string | null;
  businessAddressProof?: string | null;

  // Step 2: Export Eligibility
  iecCode?: string | null;
  iecCertificate?: string | null;
  tradeLicense?: string | null;
  apedaRegistrationNumber?: string | null;
  apedaCertificate?: string | null;
  spicesBoardRegistrationNumber?: string | null;
  spicesBoardCertificate?: string | null;
  bankAccountHolderName?: string | null;
  bankAccountNumber?: string | null;
  bankIfscCode?: string | null;
  bankProofDocument?: string | null;

  // Step 3: Food & Safety
  fssaiLicenseNumber?: string | null;
  fssaiCertificate?: string | null;

  // Step 4: Shipping & Logistics
  shippingType?: string | null;
  serviceAreas?: string[] | null;
  returnPolicy?: string | null;
}

/**
 * Calculates document completion percentage for seller verification
 * @param data - Seller document data
 * @returns Completion percentage (0-100)
 */
export function calculateDocumentCompletion(data: SellerDocumentData): number {
  try {
    let completed = 0;
    const total = 23; // Step 1 (7) + Step 2 (11) + Step 3 (2) + Step 4 (3)

    // Step 1: Business Identity (7 fields)
    if (data?.panNumber?.trim()) completed++;
    if (data?.gstNumber?.trim()) completed++;
    if (data?.aadharNumber?.trim()) completed++;
    if (data?.ownerIdDocument) completed++;
    if (data?.incorporationCertificate) completed++;
    if (data?.msmeUdyamCertificate) completed++;
    if (data?.businessAddressProof) completed++;

    // Step 2: Export Eligibility (11 fields)
    if (data?.iecCode?.trim()) completed++;
    if (data?.iecCertificate) completed++;
    if (data?.tradeLicense) completed++;
    if (data?.apedaRegistrationNumber?.trim()) completed++;
    if (data?.apedaCertificate) completed++;
    if (data?.spicesBoardRegistrationNumber?.trim()) completed++;
    if (data?.spicesBoardCertificate) completed++;
    if (data?.bankAccountHolderName?.trim()) completed++;
    if (data?.bankAccountNumber?.trim()) completed++;
    if (data?.bankIfscCode?.trim()) completed++;
    if (data?.bankProofDocument) completed++;

    // Step 3: Food & Safety (2 fields)
    if (data?.fssaiLicenseNumber?.trim()) completed++;
    if (data?.fssaiCertificate) completed++;

    // Step 4: Shipping & Logistics (3 fields)
    if (data?.shippingType?.trim()) completed++;
    if (Array.isArray(data?.serviceAreas) && data.serviceAreas.length > 0) completed++;
    if (data?.returnPolicy?.trim()) completed++;

    return Math.round((completed / total) * 100);
  } catch {
    return 0;
  }
}


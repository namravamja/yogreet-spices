import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export type DocumentType = 
  | 'pan' 
  | 'gst' 
  | 'aadhaar' 
  | 'ifsc' 
  | 'fssai' 
  | 'iec' 
  | 'udyam' 
  | 'bankAccount';

export interface VerificationResult {
  success: boolean;
  verified: boolean;
  message: string;
  documentType?: DocumentType;
  data?: Record<string, any>;
  autoVerified?: boolean;
}

export interface CrossVerifyResult {
  success: boolean;
  crossVerified: boolean;
  pan: { verified: boolean; message: string; data?: any };
  gst: { verified: boolean; message: string; data?: any };
  message: string;
}

export interface BatchVerificationResult {
  success: boolean;
  allVerified: boolean;
  results: Array<{
    type: DocumentType;
    verified: boolean;
    message: string;
    data?: any;
  }>;
}

export interface SaveVerificationStatusRequest {
  documentType: DocumentType;
  value: string;
  verified: boolean;
  details?: string;
  bankName?: string;
  branchName?: string;
}

export interface SaveVerificationStatusResponse {
  success: boolean;
  message: string;
  field: string;
  verified: boolean;
}

export interface AutoVerificationStatus {
  panNumber?: { verified: boolean; verifiedAt?: string; details?: string };
  gstNumber?: { verified: boolean; verifiedAt?: string; details?: string };
  aadharNumber?: { verified: boolean; verifiedAt?: string; details?: string };
  iecCode?: { verified: boolean; verifiedAt?: string; details?: string };
  bankIfscCode?: { verified: boolean; verifiedAt?: string; bankName?: string; branchName?: string };
  bankAccountNumber?: { verified: boolean; verifiedAt?: string; details?: string };
  fssaiLicenseNumber?: { verified: boolean; verifiedAt?: string; details?: string };
}

export interface GetVerificationStatusResponse {
  success: boolean;
  autoVerified: AutoVerificationStatus;
}

export const VerificationApi = createApi({
  reducerPath: "verificationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_API_URL}/verify`,
    credentials: "include",
  }),
  tagTypes: ["Verification"],
  endpoints: (builder) => ({
    // Verify single document
    verifyDocument: builder.mutation<VerificationResult, { documentType: DocumentType; value: string; crossCheckData?: Record<string, string> }>({
      query: (body) => ({
        url: "/document",
        method: "POST",
        body,
      }),
    }),

    // Verify PAN
    verifyPAN: builder.mutation<VerificationResult, { pan: string; gst?: string }>({
      query: (body) => ({
        url: "/pan",
        method: "POST",
        body,
      }),
    }),

    // Verify GST
    verifyGST: builder.mutation<VerificationResult, { gst: string; pan?: string }>({
      query: (body) => ({
        url: "/gst",
        method: "POST",
        body,
      }),
    }),

    // Verify Aadhaar  
    verifyAadhaar: builder.mutation<VerificationResult, { aadhaar: string }>({
      query: (body) => ({
        url: "/aadhaar",
        method: "POST",
        body,
      }),
    }),

    // Verify IFSC
    verifyIFSC: builder.mutation<VerificationResult, { ifsc: string }>({
      query: (body) => ({
        url: "/ifsc",
        method: "POST",
        body,
      }),
    }),

    // Verify FSSAI
    verifyFSSAI: builder.mutation<VerificationResult, { fssai: string }>({
      query: (body) => ({
        url: "/fssai",
        method: "POST",
        body,
      }),
    }),

    // Verify IEC
    verifyIEC: builder.mutation<VerificationResult, { iec: string }>({
      query: (body) => ({
        url: "/iec",
        method: "POST",
        body,
      }),
    }),

    // Cross verify PAN and GST
    crossVerifyPANGST: builder.mutation<CrossVerifyResult, { pan: string; gst: string }>({
      query: (body) => ({
        url: "/pan-gst",
        method: "POST",
        body,
      }),
    }),

    // Batch verify multiple documents
    verifyBatch: builder.mutation<BatchVerificationResult, { documents: Array<{ type: DocumentType; value: string; crossCheckData?: Record<string, string> }> }>({
      query: (body) => ({
        url: "/batch",
        method: "POST",
        body,
      }),
    }),

    // Save verification status to database
    saveVerificationStatus: builder.mutation<SaveVerificationStatusResponse, SaveVerificationStatusRequest>({
      query: (body) => ({
        url: "/save-status",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Verification"],
    }),

    // Get all verification statuses
    getVerificationStatus: builder.query<GetVerificationStatusResponse, void>({
      query: () => "/status",
      providesTags: ["Verification"],
    }),
  }),
});

export const {
  useVerifyDocumentMutation,
  useVerifyPANMutation,
  useVerifyGSTMutation,
  useVerifyAadhaarMutation,
  useVerifyIFSCMutation,
  useVerifyFSSAIMutation,
  useVerifyIECMutation,
  useCrossVerifyPANGSTMutation,
  useVerifyBatchMutation,
  useSaveVerificationStatusMutation,
  useGetVerificationStatusQuery,
} = VerificationApi;

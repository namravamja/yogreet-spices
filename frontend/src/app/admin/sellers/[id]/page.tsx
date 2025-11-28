"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useGetSellerByIdQuery, useVerifyDocumentMutation, useUnverifyDocumentMutation, useUpdateSellerVerificationStatusMutation, useMarkFieldsAsReviewedMutation } from "@/services/api/adminApi"
import { FiChevronDown, FiChevronUp, FiMail, FiPhone, FiMapPin, FiCheckCircle, FiXCircle, FiClock, FiFileText, FiDownload, FiExternalLink } from "react-icons/fi"
import Image from "next/image"
import { toast } from "sonner"

export default function SellerDetailPage() {
  const params = useParams()
  const sellerId = params.id as string
  const { data: seller, isLoading, error } = useGetSellerByIdQuery(sellerId)
  const [verifyDocument] = useVerifyDocumentMutation()
  const [unverifyDocument] = useUnverifyDocumentMutation()
  const [updateSellerVerificationStatus] = useUpdateSellerVerificationStatusMutation()
  const [markFieldsAsReviewed] = useMarkFieldsAsReviewedMutation()
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    profile: false,
    step1: false,
    step2: false,
    step3: false,
    step4: false,
    step5: false,
  })

  const verifiedDocuments = seller?.verifiedDocuments || []
  const changedFields = seller?.changedFields || []

  // Helper function to check if a field is changed
  const isFieldChanged = (fieldName: string): boolean => {
    return changedFields.includes(fieldName) || 
           changedFields.some((field: string) => field.startsWith(fieldName + "."))
  }

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Helper function to check if all documents in a section are verified
  const areAllDocumentsVerified = (documentFields: string[], documentUrls: (string | null | undefined)[]): boolean => {
    // Check that all required documents are uploaded
    const allDocumentsUploaded = documentFields.every((_, index) => documentUrls[index])
    if (!allDocumentsUploaded) return false // Don't show badge if any document is missing
    
    // Check that all uploaded documents are verified
    return documentFields.every(field => verifiedDocuments.includes(field))
  }

  // Document fields for each section
  const getSectionDocuments = (section: string) => {
    switch (section) {
      case "step1":
        return {
          fields: ["ownerIdDocument", "incorporationCertificate", "msmeUdyamCertificate", "businessAddressProof"],
          urls: [seller?.ownerIdDocument, seller?.incorporationCertificate, seller?.msmeUdyamCertificate, seller?.businessAddressProof]
        }
      case "step2":
        return {
          fields: ["iecCertificate", "apedaCertificate", "spicesBoardCertificate", "tradeLicense", "bankProofDocument"],
          urls: [seller?.iecCertificate, seller?.apedaCertificate, seller?.spicesBoardCertificate, seller?.tradeLicense, seller?.bankProofDocument]
        }
      case "step3":
        return {
          fields: ["fssaiCertificate"],
          urls: [seller?.fssaiCertificate]
        }
      case "step4":
        return {
          fields: ["shippingLogistics"],
          urls: [seller?.shippingType ? "exists" : null] // Check if section has content
        }
      case "step5":
        return {
          fields: ["exportDocumentation"],
          urls: [seller?.exportLogisticsPrepared !== undefined ? "exists" : null] // Check if section has content
        }
      default:
        return { fields: [], urls: [] }
    }
  }

  const getVerificationBadge = (status?: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium">
            <FiCheckCircle className="w-3 h-3" />
            Approved
          </span>
        )
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium">
            <FiXCircle className="w-3 h-3" />
            Rejected
          </span>
        )
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium">
            <FiClock className="w-3 h-3" />
            Pending
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium">
            <FiClock className="w-3 h-3" />
            Pending
          </span>
        )
    }
  }

  // Helper function to handle document verification
  const handleVerifyDocument = async (documentField: string) => {
    try {
      await verifyDocument({ sellerId, documentField }).unwrap()
      toast.success("Document verified successfully")
    } catch (error: any) {
      toast.error(error?.data?.error || error?.message || "Failed to verify document")
    }
  }

  // Helper function to handle document unverification
  const handleUnverifyDocument = async (documentField: string) => {
    try {
      await unverifyDocument({ sellerId, documentField }).unwrap()
      toast.success("Document unverified successfully")
    } catch (error: any) {
      toast.error(error?.data?.error || error?.message || "Failed to unverify document")
    }
  }

  // Check if all sections are verified and no changed fields
  const canMarkSellerVerified = () => {
    // Check if there are any changed fields
    if (changedFields.length > 0) {
      return false
    }

    // Check if seller is already approved
    if (seller?.verificationStatus === "approved") {
      return false
    }

    // Check if all sections show "All Documents Verified"
    const step1Docs = getSectionDocuments("step1")
    const step2Docs = getSectionDocuments("step2")
    const step3Docs = getSectionDocuments("step3")
    
    const step1Verified = areAllDocumentsVerified(step1Docs.fields, step1Docs.urls)
    const step2Verified = areAllDocumentsVerified(step2Docs.fields, step2Docs.urls)
    const step3Verified = areAllDocumentsVerified(step3Docs.fields, step3Docs.urls)
    const step4Verified = verifiedDocuments.includes("shippingLogistics")
    const step5Verified = verifiedDocuments.includes("exportDocumentation")
    const profileVerified = verifiedDocuments.includes("profileInformation")

    return step1Verified && step2Verified && step3Verified && step4Verified && step5Verified && profileVerified
  }

  // Handle marking seller as verified
  const handleMarkSellerVerified = async () => {
    try {
      await updateSellerVerificationStatus({ 
        sellerId, 
        status: "approved" 
      }).unwrap()
      toast.success("Seller marked as verified successfully")
    } catch (error: any) {
      toast.error(error?.data?.error || error?.message || "Failed to mark seller as verified")
    }
  }

  // Handle unapproving seller
  const handleUnapproveSeller = async () => {
    try {
      await updateSellerVerificationStatus({ 
        sellerId, 
        status: "rejected" 
      }).unwrap()
      toast.success("Seller unapproved successfully")
    } catch (error: any) {
      toast.error(error?.data?.error || error?.message || "Failed to unapprove seller")
    }
  }

  // Get fields for a section
  const getSectionFields = (section: string): string[] => {
    switch (section) {
      case "profile":
        return [
          "fullName", "companyName", "email", "mobile", "businessType", "productCategories",
          "about", "businessLogo", "storePhotos", "businessAddress", "businessAddress.street",
          "businessAddress.city", "businessAddress.state", "businessAddress.country", "businessAddress.pinCode",
          "socialLinks", "socialLinks.website", "socialLinks.instagram", "socialLinks.facebook", "socialLinks.twitter"
        ]
      case "step1":
        return ["panNumber", "gstNumber", "aadharNumber", "ownerIdDocument", "incorporationCertificate", "msmeUdyamCertificate", "businessAddressProof"]
      case "step2":
        return ["iecCode", "iecCertificate", "apedaRegistrationNumber", "apedaCertificate", "spicesBoardRegistrationNumber", "spicesBoardCertificate", "tradeLicense", "bankAccountHolderName", "bankAccountNumber", "bankIfscCode", "bankName", "bankProofDocument", "upiId"]
      case "step3":
        return ["fssaiLicenseNumber", "fssaiCertificate", "foodQualityCertifications", "labTestingCapability"]
      case "step4":
        return ["shippingType", "serviceAreas", "returnPolicy"]
      case "step5":
        return ["certificateOfOriginCapability", "phytosanitaryCertificateCapability", "packagingCompliance", "fumigationCertificateCapability", "exportLogisticsPrepared"]
      default:
        return []
    }
  }

  // Check if section has changed fields
  const hasSectionChanges = (section: string): boolean => {
    const sectionFields = getSectionFields(section)
    return sectionFields.some(field => isFieldChanged(field))
  }

  // Handle marking section changes as reviewed
  const handleMarkSectionReviewed = async (section: string) => {
    try {
      const sectionFields = getSectionFields(section)
      await markFieldsAsReviewed({ sellerId, fields: sectionFields }).unwrap()
      toast.success("Section changes marked as reviewed")
    } catch (error: any) {
      toast.error(error?.data?.error || error?.message || "Failed to mark section as reviewed")
    }
  }

  // Helper function to render document row with verify button
  const renderDocumentRow = (label: string, documentField: string, documentUrl?: string | null) => {
    const isVerified = verifiedDocuments.includes(documentField)
    const isChanged = isFieldChanged(documentField)
    
    return (
      <div className="grid grid-cols-2 gap-4 py-3 border-b border-yogreet-light-gray">
        <div className="text-xs font-manrope font-medium text-yogreet-warm-gray text-center">
          <div className="text-left flex items-center gap-2">
            {isChanged && (
              <span className="inline-flex items-center justify-center w-2 h-2 bg-yogreet-red rounded-full" title="Field has been changed by seller"></span>
            )}
            {label}
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-center gap-3 flex-wrap justify-start">
            {documentUrl ? (
              <>
                <a
                  href={documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-inter font-medium bg-yogreet-light-gray text-yogreet-charcoal hover:bg-yogreet-light-gray/80 transition-colors cursor-pointer"
                >
                  <FiDownload className="w-3 h-3" />
                  View Document
                </a>
                {isVerified ? (
                  <button
                    onClick={() => handleUnverifyDocument(documentField)}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-inter font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors cursor-pointer"
                  >
                    Click to Unverify
                  </button>
                ) : (
                  <button
                    onClick={() => handleVerifyDocument(documentField)}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-inter font-medium bg-yogreet-red text-white hover:bg-yogreet-red/90 transition-colors cursor-pointer"
                  >
                    Click to Verify
                  </button>
                )}
              </>
            ) : (
              <p className="text-xs font-inter text-yogreet-warm-gray italic">Not uploaded</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Helper function to render text field row
  const renderTextFieldRow = (label: string, value?: string | null, fieldName?: string) => {
    const isChanged = fieldName ? isFieldChanged(fieldName) : false
    
    return (
      <div className="grid grid-cols-2 gap-4 py-3 border-b border-yogreet-light-gray">
        <div className="text-xs font-manrope font-medium text-yogreet-warm-gray text-center">
          <div className="text-left flex items-center gap-2">
            {isChanged && (
              <span className="inline-flex items-center justify-center w-2 h-2 bg-yogreet-red rounded-full" title="Field has been changed by seller"></span>
            )}
            {label}
          </div>
        </div>
        <div className="text-sm font-inter text-yogreet-charcoal text-center">
          <div className="text-left">{value || "N/A"}</div>
        </div>
      </div>
    )
  }

  // Helper function to render boolean field row
  const renderBooleanRow = (label: string, value?: boolean | null, fieldName?: string) => {
    const isChanged = fieldName ? isFieldChanged(fieldName) : false
    
    return (
      <div className="grid grid-cols-2 gap-4 py-3 border-b border-yogreet-light-gray">
        <div className="text-xs font-manrope font-medium text-yogreet-warm-gray text-center">
          <div className="text-left flex items-center gap-2">
            {isChanged && (
              <span className="inline-flex items-center justify-center w-2 h-2 bg-yogreet-red rounded-full" title="Field has been changed by seller"></span>
            )}
            {label}
          </div>
        </div>
        <div className="text-sm font-inter text-yogreet-charcoal text-center">
          <div className="text-left">{value ? "Yes" : "No"}</div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-stone-50 via-white to-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 w-1/4"></div>
            <div className="h-64 bg-gray-200"></div>
            <div className="h-96 bg-gray-200"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !seller) {
    return (
      <div className="min-h-screen bg-linear-to-br from-stone-50 via-white to-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white border border-yogreet-light-gray p-8 text-center shadow-sm">
            <p className="text-yogreet-warm-gray font-inter text-sm">Seller not found</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-stone-50 via-white to-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section - Basic Info */}
        <div className="bg-white border border-yogreet-light-gray p-4 mb-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Profile Picture */}
            <div className="w-24 h-24 overflow-hidden shrink-0">
              {seller.businessLogo ? (
                <div className="relative w-full h-full">
                  <Image
                    src={seller.businessLogo}
                    alt={seller.companyName || seller.fullName || "Seller"}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-yogreet-sage flex items-center justify-center">
                    <span className="text-white font-poppins font-bold text-xl">
                      {(seller.companyName || seller.fullName || "S").charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
                <div>
                  <h1 className="text-xl md:text-2xl font-poppins font-semibold text-yogreet-charcoal mb-1">
                    {seller.companyName || seller.fullName || "N/A"}
                  </h1>
                  {seller.fullName && seller.companyName && (
                    <p className="text-sm font-inter text-yogreet-warm-gray mb-1">
                      {seller.fullName}
                    </p>
                  )}
                  <p className="text-xs font-inter text-yogreet-warm-gray mb-3">
                    {seller.businessType || "Business"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {canMarkSellerVerified() && (
                    <button
                      onClick={handleMarkSellerVerified}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-inter font-medium bg-yogreet-red text-white hover:bg-yogreet-red/90 transition-colors cursor-pointer rounded"
                    >
                      <FiCheckCircle className="w-4 h-4" />
                      Mark Seller Verified
                    </button>
                  )}
                  {seller.verificationStatus === "approved" && (
                    <button
                      onClick={handleUnapproveSeller}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-inter font-medium bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer rounded"
                    >
                      <FiXCircle className="w-4 h-4" />
                      Unapprove Seller
                    </button>
                  )}
                  {getVerificationBadge(seller.verificationStatus)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div className="flex items-center gap-2 text-xs text-yogreet-charcoal">
                  <FiMail className="w-3 h-3 text-yogreet-warm-gray" />
                  <span className="font-inter">{seller.email}</span>
                </div>
                {seller.mobile && (
                  <div className="flex items-center gap-2 text-xs text-yogreet-charcoal">
                    <FiPhone className="w-3 h-3 text-yogreet-warm-gray" />
                    <span className="font-inter">{seller.mobile}</span>
                  </div>
                )}
                {seller.businessAddressId && (
                  <div className="flex items-center gap-2 text-xs text-yogreet-charcoal">
                    <FiMapPin className="w-3 h-3 text-yogreet-warm-gray" />
                    <span className="font-inter">
                      {[
                        (seller.businessAddressId as any)?.street,
                        (seller.businessAddressId as any)?.city,
                        (seller.businessAddressId as any)?.state,
                        (seller.businessAddressId as any)?.country,
                        (seller.businessAddressId as any)?.pinCode,
                      ]
                        .filter(Boolean)
                        .join(", ") || "N/A"}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3 mt-3">
                <div className="bg-yogreet-light-gray px-3 py-1.5">
                  <p className="text-xs font-inter text-yogreet-warm-gray mb-0.5">Profile Completion</p>
                  <p className="text-base font-poppins font-semibold text-yogreet-charcoal">
                    {seller.profileCompletion || 0}%
                  </p>
                </div>
                <div className="bg-yogreet-light-gray px-3 py-1.5">
                  <p className="text-xs font-inter text-yogreet-warm-gray mb-0.5">Document Completion</p>
                  <p className="text-base font-poppins font-semibold text-yogreet-charcoal">
                    {seller.documentCompletion || 0}%
                  </p>
                </div>
                <div className="bg-yogreet-light-gray px-3 py-1.5">
                  <p className="text-xs font-inter text-yogreet-warm-gray mb-0.5">Products</p>
                  <p className="text-base font-poppins font-semibold text-yogreet-charcoal">
                    {seller._count?.products || 0}
                  </p>
                </div>
                <div className="bg-yogreet-light-gray px-3 py-1.5">
                  <p className="text-xs font-inter text-yogreet-warm-gray mb-0.5">Orders</p>
                  <p className="text-base font-poppins font-semibold text-yogreet-charcoal">
                    {seller._count?.orders || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information Section */}
        <div className="relative bg-white border border-yogreet-light-gray mb-4 shadow-sm">
          {(isFieldChanged("fullName") || isFieldChanged("companyName") || isFieldChanged("email") || 
            isFieldChanged("mobile") || isFieldChanged("businessType") || isFieldChanged("productCategories") ||
            isFieldChanged("about") || isFieldChanged("businessAddress") || isFieldChanged("socialLinks") ||
            isFieldChanged("businessLogo") || isFieldChanged("storePhotos") || isFieldChanged("businessAddress.street") ||
            isFieldChanged("businessAddress.city") || isFieldChanged("businessAddress.state") ||
            isFieldChanged("businessAddress.country") || isFieldChanged("businessAddress.pinCode") ||
            isFieldChanged("socialLinks.website") || isFieldChanged("socialLinks.instagram") ||
            isFieldChanged("socialLinks.facebook") || isFieldChanged("socialLinks.twitter")) && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 bg-yogreet-red rounded-full z-10 -translate-y-1/2 translate-x-1/2" title="Some fields in this section have been changed"></span>
          )}
          <button
            onClick={() => toggleSection("profile")}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-yogreet-light-gray transition-colors cursor-pointer border-b border-yogreet-light-gray"
          >
            <div className="flex items-center gap-3">
              <h2 className="text-base font-poppins font-semibold text-yogreet-charcoal flex items-center gap-2">
                <FiFileText className="w-4 h-4" />
                Profile Information
              </h2>
              {verifiedDocuments.includes("profileInformation") && (
                <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-inter font-medium bg-green-100 text-green-700">
                  <FiCheckCircle className="w-3 h-3" />
                  All Documents Verified
                </span>
              )}
            </div>
            {openSections.profile ? (
              <FiChevronUp className="w-4 h-4 text-yogreet-charcoal" />
            ) : (
              <FiChevronDown className="w-4 h-4 text-yogreet-charcoal" />
            )}
          </button>
          {openSections.profile && (
            <div className="p-4 border-t border-yogreet-light-gray">
              <div className="flex items-start justify-end gap-3 mb-4">
                {hasSectionChanges("profile") && (
                  <button
                    onClick={() => handleMarkSectionReviewed("profile")}
                    className="inline-flex items-center gap-1 px-4 py-2 text-xs font-inter font-medium bg-yogreet-red text-white hover:bg-yogreet-red/90 transition-colors cursor-pointer rounded"
                    title="Mark all changes in this section as reviewed"
                  >
                    <FiCheckCircle className="w-3 h-3" />
                    Mark as Reviewed
                  </button>
                )}
                <button
                  onClick={() => {
                    if (verifiedDocuments.includes("profileInformation")) {
                      handleUnverifyDocument("profileInformation")
                    } else {
                      handleVerifyDocument("profileInformation")
                    }
                  }}
                  className={`inline-flex items-center gap-1 px-4 py-2 text-xs font-inter font-medium transition-colors cursor-pointer rounded ${
                    verifiedDocuments.includes("profileInformation")
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-yogreet-red text-white hover:bg-yogreet-red/90"
                  }`}
                >
                  {verifiedDocuments.includes("profileInformation") ? (
                    "Click to Unverify"
                  ) : (
                    "Verify All Profile Fields"
                  )}
                </button>
              </div>
              <div className="max-w-4xl mx-auto space-y-0">
                {renderTextFieldRow("Full Name", seller.fullName, "fullName")}
                {renderTextFieldRow("Company Name", seller.companyName, "companyName")}
                {renderTextFieldRow("Email", seller.email, "email")}
                {renderTextFieldRow("Mobile", seller.mobile, "mobile")}
                {renderTextFieldRow("Business Type", seller.businessType, "businessType")}
                <div className="grid grid-cols-2 gap-4 py-3 border-b border-yogreet-light-gray">
                      <div className="text-xs font-manrope font-medium text-yogreet-warm-gray">
                      <div className="flex items-center gap-2">
                        {isFieldChanged("productCategories") && (
                          <span className="inline-flex items-center justify-center w-2 h-2 bg-yogreet-red rounded-full" title="Field has been changed by seller"></span>
                        )}
                        Product Categories
                      </div>
                    </div>
                  <div className="text-sm font-inter text-yogreet-charcoal">
                    {seller.productCategories && seller.productCategories.length > 0
                      ? seller.productCategories.join(", ")
                      : "N/A"}
                  </div>
                </div>
                {seller.about && (
                  <div className="grid grid-cols-2 gap-4 py-3 border-b border-yogreet-light-gray">
                      <div className="text-xs font-manrope font-medium text-yogreet-warm-gray">
                        <div className="flex items-center gap-2">
                          {isFieldChanged("about") && (
                            <span className="inline-flex items-center justify-center w-2 h-2 bg-yogreet-red rounded-full" title="Field has been changed by seller"></span>
                          )}
                          About
                        </div>
                      </div>
                    <div className="text-sm font-inter text-yogreet-charcoal">{seller.about}</div>
                  </div>
                )}
                {seller.businessAddressId && (
                  <div className="grid grid-cols-2 gap-4 py-3 border-b border-yogreet-light-gray">
                      <div className="text-xs font-manrope font-medium text-yogreet-warm-gray">
                        <div className="flex items-center gap-2">
                          {(isFieldChanged("businessAddress") || 
                            isFieldChanged("businessAddress.street") ||
                            isFieldChanged("businessAddress.city") ||
                            isFieldChanged("businessAddress.state") ||
                            isFieldChanged("businessAddress.country") ||
                            isFieldChanged("businessAddress.pinCode")) && (
                            <span className="inline-flex items-center justify-center w-2 h-2 bg-yogreet-red rounded-full" title="Field has been changed by seller"></span>
                          )}
                          Business Address
                        </div>
                      </div>
                    <div className="text-sm font-inter text-yogreet-charcoal">
                      {[
                        (seller.businessAddressId as any)?.street,
                        (seller.businessAddressId as any)?.city,
                        (seller.businessAddressId as any)?.state,
                        (seller.businessAddressId as any)?.country,
                        (seller.businessAddressId as any)?.pinCode,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                  </div>
                )}
                {seller.socialLinksId && (
                  <div className="grid grid-cols-2 gap-4 py-3 border-b border-yogreet-light-gray">
                      <div className="text-xs font-manrope font-medium text-yogreet-warm-gray">
                        <div className="flex items-center gap-2">
                          {(isFieldChanged("socialLinks") ||
                            isFieldChanged("socialLinks.website") ||
                            isFieldChanged("socialLinks.instagram") ||
                            isFieldChanged("socialLinks.facebook") ||
                            isFieldChanged("socialLinks.twitter")) && (
                            <span className="inline-flex items-center justify-center w-2 h-2 bg-yogreet-red rounded-full" title="Field has been changed by seller"></span>
                          )}
                          Social Links
                        </div>
                      </div>
                    <div className="flex flex-wrap gap-3">
                      {(seller.socialLinksId as any)?.website && (
                        <a
                          href={(seller.socialLinksId as any).website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-yogreet-red hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          Website <FiExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {(seller.socialLinksId as any)?.instagram && (
                        <a
                          href={(seller.socialLinksId as any).instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-yogreet-red hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          Instagram <FiExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {(seller.socialLinksId as any)?.facebook && (
                        <a
                          href={(seller.socialLinksId as any).facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-yogreet-red hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          Facebook <FiExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {(seller.socialLinksId as any)?.twitter && (
                        <a
                          href={(seller.socialLinksId as any).twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-yogreet-red hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          Twitter <FiExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
                {seller.storePhotos && seller.storePhotos.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 py-3 border-b border-yogreet-light-gray">
                    <div className="text-xs font-manrope font-medium text-yogreet-warm-gray">
                      Store Photos
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {seller.storePhotos.map((photo: string, index: number) => (
                        <div key={index} className="relative w-full h-24">
                          <Image
                            src={photo}
                            alt={`Store photo ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Business Identity Verification */}
        <div className="relative bg-white border border-yogreet-light-gray mb-4 shadow-sm">
          {(isFieldChanged("panNumber") || isFieldChanged("gstNumber") || isFieldChanged("aadharNumber") ||
            isFieldChanged("ownerIdDocument") || isFieldChanged("incorporationCertificate") ||
            isFieldChanged("msmeUdyamCertificate") || isFieldChanged("businessAddressProof")) && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 bg-yogreet-red rounded-full z-10 -translate-y-1/2 translate-x-1/2" title="Some fields in this section have been changed"></span>
          )}
          <button
            onClick={() => toggleSection("step1")}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-yogreet-light-gray transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <h2 className="text-base font-poppins font-semibold text-yogreet-charcoal flex items-center gap-2">
                <FiFileText className="w-4 h-4" />
                Business Identity Verification
              </h2>
              {(() => {
                const sectionDocs = getSectionDocuments("step1")
                const allVerified = areAllDocumentsVerified(sectionDocs.fields, sectionDocs.urls)
                return allVerified ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-inter font-medium bg-green-100 text-green-700">
                    <FiCheckCircle className="w-3 h-3" />
                    All Documents Verified
                  </span>
                ) : null
              })()}
            </div>
            {openSections.step1 ? (
              <FiChevronUp className="w-4 h-4 text-yogreet-charcoal" />
            ) : (
              <FiChevronDown className="w-4 h-4 text-yogreet-charcoal" />
            )}
          </button>
          {openSections.step1 && (
            <div className="p-4 border-t border-yogreet-light-gray">
              <div className="flex items-start justify-end gap-3 mb-4">
                {hasSectionChanges("step1") && (
                  <button
                    onClick={() => handleMarkSectionReviewed("step1")}
                    className="inline-flex items-center gap-1 px-4 py-2 text-xs font-inter font-medium bg-yogreet-red text-white hover:bg-yogreet-red/90 transition-colors cursor-pointer rounded"
                    title="Mark all changes in this section as reviewed"
                  >
                    <FiCheckCircle className="w-3 h-3" />
                    Mark as Reviewed
                  </button>
                )}
              </div>
              <div className="max-w-4xl mx-auto space-y-0">
                {renderTextFieldRow("PAN Number", seller.panNumber, "panNumber")}
                {renderTextFieldRow("GST Number", seller.gstNumber, "gstNumber")}
                {renderTextFieldRow("Aadhaar Number", seller.aadharNumber, "aadharNumber")}
                {renderDocumentRow("Owner ID Document", "ownerIdDocument", seller.ownerIdDocument)}
                {renderDocumentRow("Incorporation Certificate", "incorporationCertificate", seller.incorporationCertificate)}
                {renderDocumentRow("MSME Udyam Certificate", "msmeUdyamCertificate", seller.msmeUdyamCertificate)}
                {renderDocumentRow("Business Address Proof", "businessAddressProof", seller.businessAddressProof)}
              </div>
            </div>
          )}
        </div>

        {/* Export Eligibility Verification */}
        <div className="relative bg-white border border-yogreet-light-gray mb-4 shadow-sm">
          {(isFieldChanged("iecCode") || isFieldChanged("iecCertificate") || isFieldChanged("apedaRegistrationNumber") ||
            isFieldChanged("apedaCertificate") || isFieldChanged("spicesBoardRegistrationNumber") ||
            isFieldChanged("spicesBoardCertificate") || isFieldChanged("tradeLicense") ||
            isFieldChanged("bankAccountHolderName") || isFieldChanged("bankAccountNumber") ||
            isFieldChanged("bankIfscCode") || isFieldChanged("bankName") || isFieldChanged("bankProofDocument") ||
            isFieldChanged("upiId")) && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 bg-yogreet-red rounded-full z-10 -translate-y-1/2 translate-x-1/2" title="Some fields in this section have been changed"></span>
          )}
          <button
            onClick={() => toggleSection("step2")}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-yogreet-light-gray transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <h2 className="text-base font-poppins font-semibold text-yogreet-charcoal flex items-center gap-2">
                <FiFileText className="w-4 h-4" />
                Export Eligibility Verification
              </h2>
              {(() => {
                const sectionDocs = getSectionDocuments("step2")
                const allVerified = areAllDocumentsVerified(sectionDocs.fields, sectionDocs.urls)
                return allVerified ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-inter font-medium bg-green-100 text-green-700">
                    <FiCheckCircle className="w-3 h-3" />
                    All Documents Verified
                  </span>
                ) : null
              })()}
            </div>
            {openSections.step2 ? (
              <FiChevronUp className="w-4 h-4 text-yogreet-charcoal" />
            ) : (
              <FiChevronDown className="w-4 h-4 text-yogreet-charcoal" />
            )}
          </button>
          {openSections.step2 && (
            <div className="p-4 border-t border-yogreet-light-gray">
              <div className="flex items-start justify-end gap-3 mb-4">
                {hasSectionChanges("step2") && (
                  <button
                    onClick={() => handleMarkSectionReviewed("step2")}
                    className="inline-flex items-center gap-1 px-4 py-2 text-xs font-inter font-medium bg-yogreet-red text-white hover:bg-yogreet-red/90 transition-colors cursor-pointer rounded"
                    title="Mark all changes in this section as reviewed"
                  >
                    <FiCheckCircle className="w-3 h-3" />
                    Mark as Reviewed
                  </button>
                )}
              </div>
              <div className="max-w-4xl mx-auto space-y-0">
                {renderTextFieldRow("IEC Code", seller.iecCode, "iecCode")}
                {renderDocumentRow("IEC Certificate", "iecCertificate", seller.iecCertificate)}
                {renderTextFieldRow("APEDA Registration Number", seller.apedaRegistrationNumber, "apedaRegistrationNumber")}
                {renderDocumentRow("APEDA Certificate", "apedaCertificate", seller.apedaCertificate)}
                {renderTextFieldRow("Spices Board Registration Number", seller.spicesBoardRegistrationNumber, "spicesBoardRegistrationNumber")}
                {renderDocumentRow("Spices Board Certificate", "spicesBoardCertificate", seller.spicesBoardCertificate)}
                {renderDocumentRow("Trade License", "tradeLicense", seller.tradeLicense)}
                {renderTextFieldRow("Bank Account Holder Name", seller.bankAccountHolderName, "bankAccountHolderName")}
                {renderTextFieldRow("Bank Account Number", seller.bankAccountNumber, "bankAccountNumber")}
                {renderTextFieldRow("Bank IFSC Code", seller.bankIfscCode, "bankIfscCode")}
                {renderTextFieldRow("Bank Name", seller.bankName, "bankName")}
                {renderDocumentRow("Bank Proof Document", "bankProofDocument", seller.bankProofDocument)}
                {renderTextFieldRow("UPI ID", seller.upiId, "upiId")}
              </div>
            </div>
          )}
        </div>

        {/* Food & Safety Compliance */}
        <div className="relative bg-white border border-yogreet-light-gray mb-4 shadow-sm">
          {(isFieldChanged("fssaiLicenseNumber") || isFieldChanged("fssaiCertificate") ||
            isFieldChanged("foodQualityCertifications") || isFieldChanged("labTestingCapability")) && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 bg-yogreet-red rounded-full z-10 -translate-y-1/2 translate-x-1/2" title="Some fields in this section have been changed"></span>
          )}
          <button
            onClick={() => toggleSection("step3")}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-yogreet-light-gray transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <h2 className="text-base font-poppins font-semibold text-yogreet-charcoal flex items-center gap-2">
                <FiFileText className="w-4 h-4" />
                Food & Safety Compliance
              </h2>
              {(() => {
                const sectionDocs = getSectionDocuments("step3")
                const allVerified = areAllDocumentsVerified(sectionDocs.fields, sectionDocs.urls)
                return allVerified ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-inter font-medium bg-green-100 text-green-700">
                    <FiCheckCircle className="w-3 h-3" />
                    All Documents Verified
                  </span>
                ) : null
              })()}
            </div>
            {openSections.step3 ? (
              <FiChevronUp className="w-4 h-4 text-yogreet-charcoal" />
            ) : (
              <FiChevronDown className="w-4 h-4 text-yogreet-charcoal" />
            )}
          </button>
          {openSections.step3 && (
            <div className="p-4 border-t border-yogreet-light-gray">
              <div className="flex items-start justify-end gap-3 mb-4">
                {hasSectionChanges("step3") && (
                  <button
                    onClick={() => handleMarkSectionReviewed("step3")}
                    className="inline-flex items-center gap-1 px-4 py-2 text-xs font-inter font-medium bg-yogreet-red text-white hover:bg-yogreet-red/90 transition-colors cursor-pointer rounded"
                    title="Mark all changes in this section as reviewed"
                  >
                    <FiCheckCircle className="w-3 h-3" />
                    Mark as Reviewed
                  </button>
                )}
              </div>
              <div className="max-w-4xl mx-auto space-y-0">
                {renderTextFieldRow("FSSAI License Number", seller.fssaiLicenseNumber, "fssaiLicenseNumber")}
                {renderDocumentRow("FSSAI Certificate", "fssaiCertificate", seller.fssaiCertificate)}
                {seller.foodQualityCertifications && seller.foodQualityCertifications.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 py-3 border-b border-yogreet-light-gray">
                      <div className="text-xs font-manrope font-medium text-yogreet-warm-gray text-center">
                        <div className="text-left flex items-center gap-2">
                          {isFieldChanged("foodQualityCertifications") && (
                            <span className="inline-flex items-center justify-center w-2 h-2 bg-yogreet-red rounded-full" title="Field has been changed by seller"></span>
                          )}
                          Food Quality Certifications
                        </div>
                      </div>
                    <div className="text-sm font-inter text-yogreet-charcoal text-center">
                      <div className="text-left">
                        {seller.foodQualityCertifications.join(", ")}
                      </div>
                    </div>
                  </div>
                )}
                {renderBooleanRow("Lab Testing Capability", seller.labTestingCapability, "labTestingCapability")}
              </div>
            </div>
          )}
        </div>

        {/* Shipping & Logistics */}
        <div className="relative bg-white border border-yogreet-light-gray mb-4 shadow-sm">
          {(isFieldChanged("shippingType") || isFieldChanged("serviceAreas") || isFieldChanged("returnPolicy")) && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 bg-yogreet-red rounded-full z-10 -translate-y-1/2 translate-x-1/2" title="Some fields in this section have been changed"></span>
          )}
          <button
            onClick={() => toggleSection("step4")}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-yogreet-light-gray transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <h2 className="text-base font-poppins font-semibold text-yogreet-charcoal flex items-center gap-2">
                <FiFileText className="w-4 h-4" />
                Shipping & Logistics
              </h2>
              {verifiedDocuments.includes("shippingLogistics") && (
                <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-inter font-medium bg-green-100 text-green-700">
                  <FiCheckCircle className="w-3 h-3" />
                  All Documents Verified
                </span>
              )}
            </div>
            {openSections.step4 ? (
              <FiChevronUp className="w-4 h-4 text-yogreet-charcoal" />
            ) : (
              <FiChevronDown className="w-4 h-4 text-yogreet-charcoal" />
            )}
          </button>
          {openSections.step4 && (
            <div className="p-4 border-t border-yogreet-light-gray">
              <div className="flex items-start justify-end gap-3 mb-4">
                {hasSectionChanges("step4") && (
                  <button
                    onClick={() => handleMarkSectionReviewed("step4")}
                    className="inline-flex items-center gap-1 px-4 py-2 text-xs font-inter font-medium bg-yogreet-red text-white hover:bg-yogreet-red/90 transition-colors cursor-pointer rounded"
                    title="Mark all changes in this section as reviewed"
                  >
                    <FiCheckCircle className="w-3 h-3" />
                    Mark as Reviewed
                  </button>
                )}
                <button
                  onClick={() => {
                    if (verifiedDocuments.includes("shippingLogistics")) {
                      handleUnverifyDocument("shippingLogistics")
                    } else {
                      handleVerifyDocument("shippingLogistics")
                    }
                  }}
                  className={`inline-flex items-center gap-1 px-4 py-2 text-xs font-inter font-medium transition-colors cursor-pointer rounded ${
                    verifiedDocuments.includes("shippingLogistics")
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-yogreet-red text-white hover:bg-yogreet-red/90"
                  }`}
                >
                  {verifiedDocuments.includes("shippingLogistics") ? (
                    "Click to Unverify"
                  ) : (
                    "Verify All Fields"
                  )}
                </button>
              </div>
              <div className="max-w-4xl mx-auto space-y-0">
                {renderTextFieldRow("Shipping Type", seller.shippingType, "shippingType")}
                {seller.serviceAreas && seller.serviceAreas.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 py-3 border-b border-yogreet-light-gray">
                    <div className="text-xs font-manrope font-medium text-yogreet-warm-gray text-center">
                      <div className="text-left flex items-center gap-2">
                        {isFieldChanged("serviceAreas") && (
                          <span className="inline-flex items-center justify-center w-2 h-2 bg-yogreet-red rounded-full" title="Field has been changed by seller"></span>
                        )}
                        Service Areas
                      </div>
                    </div>
                    <div className="text-sm font-inter text-yogreet-charcoal text-center">
                      <div className="text-left">
                        {seller.serviceAreas.join(", ")}
                      </div>
                    </div>
                  </div>
                )}
                {renderTextFieldRow("Return Policy", seller.returnPolicy, "returnPolicy")}
              </div>
            </div>
          )}
        </div>

        {/* Export Documentation & Shipment Capability */}
        <div className="relative bg-white border border-yogreet-light-gray mb-4 shadow-sm">
          {(isFieldChanged("certificateOfOriginCapability") || isFieldChanged("phytosanitaryCertificateCapability") ||
            isFieldChanged("packagingCompliance") || isFieldChanged("fumigationCertificateCapability") ||
            isFieldChanged("exportLogisticsPrepared")) && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 bg-yogreet-red rounded-full z-10 -translate-y-1/2 translate-x-1/2" title="Some fields in this section have been changed"></span>
          )}
          <button
            onClick={() => toggleSection("step5")}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-yogreet-light-gray transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <h2 className="text-base font-poppins font-semibold text-yogreet-charcoal flex items-center gap-2">
                <FiFileText className="w-4 h-4" />
                Export Documentation & Shipment Capability
              </h2>
              {verifiedDocuments.includes("exportDocumentation") && (
                <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-inter font-medium bg-green-100 text-green-700">
                  <FiCheckCircle className="w-3 h-3" />
                  All Documents Verified
                </span>
              )}
            </div>
            {openSections.step5 ? (
              <FiChevronUp className="w-4 h-4 text-yogreet-charcoal" />
            ) : (
              <FiChevronDown className="w-4 h-4 text-yogreet-charcoal" />
            )}
          </button>
          {openSections.step5 && (
            <div className="p-4 border-t border-yogreet-light-gray">
              <div className="flex items-start justify-end gap-3 mb-4">
                {hasSectionChanges("step5") && (
                  <button
                    onClick={() => handleMarkSectionReviewed("step5")}
                    className="inline-flex items-center gap-1 px-4 py-2 text-xs font-inter font-medium bg-yogreet-red text-white hover:bg-yogreet-red/90 transition-colors cursor-pointer rounded"
                    title="Mark all changes in this section as reviewed"
                  >
                    <FiCheckCircle className="w-3 h-3" />
                    Mark as Reviewed
                  </button>
                )}
                <button
                  onClick={() => {
                    if (verifiedDocuments.includes("exportDocumentation")) {
                      handleUnverifyDocument("exportDocumentation")
                    } else {
                      handleVerifyDocument("exportDocumentation")
                    }
                  }}
                  className={`inline-flex items-center gap-1 px-4 py-2 text-xs font-inter font-medium transition-colors cursor-pointer rounded ${
                    verifiedDocuments.includes("exportDocumentation")
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-yogreet-red text-white hover:bg-yogreet-red/90"
                  }`}
                >
                  {verifiedDocuments.includes("exportDocumentation") ? (
                    "Click to Unverify"
                  ) : (
                    "Verify All Fields"
                  )}
                </button>
              </div>
              <div className="max-w-4xl mx-auto space-y-0">
                {renderBooleanRow("Certificate of Origin Capability", seller.certificateOfOriginCapability, "certificateOfOriginCapability")}
                {renderBooleanRow("Phytosanitary Certificate Capability", seller.phytosanitaryCertificateCapability, "phytosanitaryCertificateCapability")}
                {renderBooleanRow("Packaging Compliance", seller.packagingCompliance, "packagingCompliance")}
                {renderBooleanRow("Fumigation Certificate Capability", seller.fumigationCertificateCapability, "fumigationCertificateCapability")}
                {renderBooleanRow("Export Logistics Prepared", seller.exportLogisticsPrepared, "exportLogisticsPrepared")}
              </div>
            </div>
          )}
        </div>

        {/* Verification Notes */}
        {seller.verificationNotes && (
          <div className="bg-white border border-yogreet-light-gray mb-4 shadow-sm p-4">
            <h2 className="text-base font-poppins font-semibold text-yogreet-charcoal mb-3">
              Verification Notes
            </h2>
            <p className="text-sm font-inter text-yogreet-charcoal">{seller.verificationNotes}</p>
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import { useState, useMemo } from "react"
import { useGetAllSellersQuery } from "@/services/api/adminApi"
import { FiSearch, FiCheckCircle, FiXCircle, FiClock, FiChevronDown, FiEdit } from "react-icons/fi"
import Image from "next/image"

type SortOption = "best-match" | "newest" | "oldest" | "name-asc" | "name-desc"

export default function AdminSellersPage() {
  const { data: sellers, isLoading } = useGetAllSellersQuery(undefined)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("best-match")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedModifiedFilter, setSelectedModifiedFilter] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(true)

  // Filter and sort sellers
  const filteredAndSortedSellers = useMemo(() => {
    let filtered = sellers || []

    // Search filter
    if (searchQuery) {
    const query = searchQuery.toLowerCase()
      filtered = filtered.filter((seller: any) =>
      seller.email?.toLowerCase().includes(query) ||
      seller.fullName?.toLowerCase().includes(query) ||
      seller.companyName?.toLowerCase().includes(query) ||
      seller.businessType?.toLowerCase().includes(query)
    )
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter((seller: any) => {
        if (selectedStatus === "verified") return seller.verificationStatus === "approved"
        if (selectedStatus === "pending") return seller.verificationStatus === "pending"
        if (selectedStatus === "rejected") return seller.verificationStatus === "rejected"
        return true
      })
    }

    // Modified fields filter
    if (selectedModifiedFilter !== "all") {
      filtered = filtered.filter((seller: any) => {
        const hasChangedFields = seller.changedFields && seller.changedFields.length > 0
        if (selectedModifiedFilter === "modified") return hasChangedFields
        if (selectedModifiedFilter === "not-modified") return !hasChangedFields
        return true
      })
    }

    // Sort
    filtered = [...filtered].sort((a: any, b: any) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "name-asc":
          return (a.companyName || a.fullName || "").localeCompare(b.companyName || b.fullName || "")
        case "name-desc":
          return (b.companyName || b.fullName || "").localeCompare(a.companyName || a.fullName || "")
        default:
          return 0
      }
    })

    return filtered
  }, [sellers, searchQuery, sortBy, selectedStatus, selectedModifiedFilter])

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
            <FiCheckCircle className="w-3 h-3" />
            Approved
          </span>
        )
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
            <FiXCircle className="w-3 h-3" />
            Rejected
          </span>
        )
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
            <FiClock className="w-3 h-3" />
            Pending
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
            <FiClock className="w-3 h-3" />
            Pending
          </span>
        )
    }
  }

  const stats = useMemo(() => {
    if (!sellers) return { total: 0, verified: 0, pending: 0, rejected: 0, modified: 0, notModified: 0 }
    return {
      total: sellers.length,
      verified: sellers.filter((s: any) => s.verificationStatus === "approved").length,
      pending: sellers.filter((s: any) => s.verificationStatus === "pending").length,
      rejected: sellers.filter((s: any) => s.verificationStatus === "rejected").length,
      modified: sellers.filter((s: any) => s.changedFields && s.changedFields.length > 0).length,
      notModified: sellers.filter((s: any) => !s.changedFields || s.changedFields.length === 0).length,
    }
  }, [sellers])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-stone-50 via-white to-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 w-1/4 rounded"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1 h-96 bg-gray-200 rounded"></div>
              <div className="lg:col-span-3 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-stone-50 via-white to-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-poppins font-semibold text-yogreet-charcoal mb-2">
          Sellers Management
        </h1>
        <p className="text-yogreet-warm-gray font-inter text-sm">
            {filteredAndSortedSellers.length} {filteredAndSortedSellers.length === 1 ? "seller" : "sellers"} found
            {searchQuery && ` for "${searchQuery}"`}
        </p>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-yogreet-light-gray  p-6 sticky top-24 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-poppins font-semibold text-yogreet-charcoal">Filter & Refine</h2>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden text-yogreet-charcoal"
                >
                  <FiChevronDown className={`w-5 h-5 transition-transform ${showFilters ? "" : "rotate-180"}`} />
                </button>
              </div>

              <div className={`space-y-6 ${showFilters ? "block" : "hidden lg:block"}`}>
                {/* Search */}
                <div>
                  <label className="block text-sm font-manrope font-medium text-yogreet-charcoal mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yogreet-warm-gray w-4 h-4" />
          <input
            type="text"
                      placeholder="Search sellers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-yogreet-light-gray  focus:outline-none focus:ring-2 focus:ring-yogreet-red focus:border-transparent font-inter text-sm"
          />
        </div>
      </div>

                {/* Status Filter */}
                <div>
                  <h3 className="text-sm font-manrope font-semibold text-yogreet-charcoal mb-3">Status</h3>
                  <div className="space-y-2">
                    {[
                      { value: "all", label: "All Status", count: stats.total },
                      { value: "verified", label: "Verified", count: stats.verified },
                      { value: "pending", label: "Pending", count: stats.pending },
                      { value: "rejected", label: "Rejected", count: stats.rejected },
                    ].map((option) => (
                      <label key={option.value} className="flex items-center justify-between cursor-pointer group">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="status"
                            value={option.value}
                            checked={selectedStatus === option.value}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-4 h-4 text-yogreet-red focus:ring-yogreet-red"
                          />
                          <span className="text-sm font-inter text-yogreet-charcoal group-hover:text-yogreet-red">
                            {option.label}
                          </span>
                        </div>
                        <span className="text-xs text-yogreet-warm-gray">({option.count})</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Modified Fields Filter */}
                <div>
                  <h3 className="text-sm font-manrope font-semibold text-yogreet-charcoal mb-3">Modified Fields</h3>
                  <div className="space-y-2">
                    {[
                      { value: "all", label: "All", count: stats.total },
                      { value: "modified", label: "Modified", count: stats.modified },
                      { value: "not-modified", label: "Not Modified", count: stats.notModified },
                    ].map((option) => (
                      <label key={option.value} className="flex items-center justify-between cursor-pointer group">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="modified"
                            value={option.value}
                            checked={selectedModifiedFilter === option.value}
                            onChange={(e) => setSelectedModifiedFilter(e.target.value)}
                            className="w-4 h-4 text-yogreet-red focus:ring-yogreet-red"
                          />
                          <span className="text-sm font-inter text-yogreet-charcoal group-hover:text-yogreet-red">
                            {option.label}
                          </span>
                        </div>
                        <span className="text-xs text-yogreet-warm-gray">({option.count})</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                {(searchQuery || selectedStatus !== "all" || selectedModifiedFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSearchQuery("")
                      setSelectedStatus("all")
                      setSelectedModifiedFilter("all")
                    }}
                    className="w-full px-4 py-2 text-sm font-inter text-yogreet-red border border-yogreet-red  hover:bg-yogreet-red hover:text-white transition-colors"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
        </div>
        </div>

          {/* Right Section - Results */}
          <div className="lg:col-span-3">
            {/* Toolbar */}
            <div className="bg-white border border-yogreet-light-gray  p-4 mb-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-inter text-yogreet-warm-gray">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="px-3 py-2 border border-yogreet-light-gray  focus:outline-none focus:ring-2 focus:ring-yogreet-red focus:border-transparent font-inter text-sm text-yogreet-charcoal"
                  >
                    <option value="best-match">Best match</option>
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                  </select>
        </div>
        </div>
      </div>

            {/* Results List */}
            {filteredAndSortedSellers.length === 0 ? (
              <div className="bg-white border border-yogreet-light-gray  p-12 text-center shadow-sm">
                <p className="text-yogreet-warm-gray font-inter">No sellers found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedSellers.map((seller: any) => (
                  <a
                    key={seller.id}
                    href={`/admin/sellers/${seller.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block bg-white border border-yogreet-light-gray  p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex gap-6">
                      {/* Image */}
                      <div className="w-36 h-36 overflow-hidden shrink-0">
                        {seller.businessLogo ? (
                          <div className="relative w-full h-full">
                            <Image
                              src={seller.businessLogo}
                              alt={seller.companyName || seller.fullName}
                              fill
                              className="object-cover"
                              sizes="144px"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-36 h-36 rounded-full bg-yogreet-sage flex items-center justify-center">
                              <span className="text-white font-poppins font-bold text-xl">
                              {(seller.companyName || seller.fullName || "S").charAt(0).toUpperCase()}
                            </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-poppins font-semibold text-yogreet-charcoal mb-1 group-hover:underline transition-all">
                              {seller.companyName || seller.fullName || "N/A"}
                            </h3>
                            <p className="text-sm font-inter text-yogreet-warm-gray mb-2">
                              {seller.businessType || "Business"}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {getVerificationBadge(seller.verificationStatus)}
                            {seller.changedFields && seller.changedFields.length > 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-yogreet-red/10 text-yogreet-red text-xs font-medium rounded border border-yogreet-red/20">
                                <FiEdit className="w-3 h-3" />
                                Modified
                              </span>
                            )}
                          </div>
                      </div>

                        <p className="text-sm font-inter text-yogreet-charcoal mb-3">{seller.email}</p>

                        <div className="flex flex-wrap items-center gap-4 text-sm font-inter text-yogreet-warm-gray">
                          {seller.businessAddress && (
                            <span>
                            {[seller.businessAddress.city, seller.businessAddress.state, seller.businessAddress.country]
                              .filter(Boolean)
                              .join(", ") || "N/A"}
                          </span>
                          )}
                          <span>{seller._count?.products || 0} Products</span>
                          <span>Profile: {seller.profileCompletion || 0}%</span>
                          <span>Joined: {new Date(seller.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
              )}
          </div>
        </div>
      </div>
    </div>
  )
}

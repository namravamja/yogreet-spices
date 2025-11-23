"use client"

import { useState, useMemo } from "react"
import { useGetAllBuyersQuery } from "@/services/api/adminApi"
import { FiSearch, FiCheckCircle, FiXCircle, FiChevronDown } from "react-icons/fi"
import Image from "next/image"

type SortOption = "best-match" | "newest" | "oldest" | "name-asc" | "name-desc"

export default function AdminBuyersPage() {
  const { data: buyers, isLoading } = useGetAllBuyersQuery(undefined)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("best-match")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(true)

  // Filter and sort buyers
  const filteredAndSortedBuyers = useMemo(() => {
    let filtered = buyers || []

    // Search filter
    if (searchQuery) {
    const query = searchQuery.toLowerCase()
      filtered = filtered.filter((buyer: any) =>
      buyer.email?.toLowerCase().includes(query) ||
      buyer.firstName?.toLowerCase().includes(query) ||
      buyer.lastName?.toLowerCase().includes(query)
    )
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter((buyer: any) => {
        if (selectedStatus === "verified") return buyer.isVerified
        if (selectedStatus === "unverified") return !buyer.isVerified
        if (selectedStatus === "active") return buyer.isAuthenticated
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
          const nameA = `${a.firstName || ""} ${a.lastName || ""}`.trim() || a.email
          const nameB = `${b.firstName || ""} ${b.lastName || ""}`.trim() || b.email
          return nameA.localeCompare(nameB)
        case "name-desc":
          const nameA2 = `${a.firstName || ""} ${a.lastName || ""}`.trim() || a.email
          const nameB2 = `${b.firstName || ""} ${b.lastName || ""}`.trim() || b.email
          return nameB2.localeCompare(nameA2)
        default:
          return 0
      }
    })

    return filtered
  }, [buyers, searchQuery, sortBy, selectedStatus])

  const stats = useMemo(() => {
    if (!buyers) return { total: 0, verified: 0, unverified: 0, active: 0 }
    return {
      total: buyers.length,
      verified: buyers.filter((b: any) => b.isVerified).length,
      unverified: buyers.filter((b: any) => !b.isVerified).length,
      active: buyers.filter((b: any) => b.isAuthenticated).length,
    }
  }, [buyers])

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
          Buyers Management
        </h1>
        <p className="text-yogreet-warm-gray font-inter text-sm">
            {filteredAndSortedBuyers.length} {filteredAndSortedBuyers.length === 1 ? "buyer" : "buyers"} found
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
                      placeholder="Search buyers..."
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
                      { value: "unverified", label: "Unverified", count: stats.unverified },
                      { value: "active", label: "Active", count: stats.active },
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

                {/* Clear Filters */}
                {(searchQuery || selectedStatus !== "all") && (
                  <button
                    onClick={() => {
                      setSearchQuery("")
                      setSelectedStatus("all")
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
            {filteredAndSortedBuyers.length === 0 ? (
              <div className="bg-white border border-yogreet-light-gray  p-12 text-center shadow-sm">
                <p className="text-yogreet-warm-gray font-inter">No buyers found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedBuyers.map((buyer: any) => (
                  <div
                    key={buyer.id}
                    className="bg-white border border-yogreet-light-gray  p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-6">
                      {/* Image */}
                      <div className="w-36 h-36 overflow-hidden shrink-0">
                        {buyer.avatar ? (
                          <div className="relative w-full h-full">
                            <Image
                              src={buyer.avatar}
                              alt={`${buyer.firstName} ${buyer.lastName}`}
                              fill
                              className="object-cover"
                              sizes="144px"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-36 h-36 rounded-full bg-yogreet-sage flex items-center justify-center">
                              <span className="text-white font-poppins font-bold text-xl">
                                {(buyer.firstName || buyer.lastName || buyer.email || "B").charAt(0).toUpperCase()}
                            </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                        <div>
                            <h3 className="text-lg font-poppins font-semibold text-yogreet-charcoal mb-1">
                            {buyer.firstName && buyer.lastName
                              ? `${buyer.firstName} ${buyer.lastName}`
                              : buyer.firstName || buyer.lastName || "N/A"}
                            </h3>
                            <p className="text-sm font-inter text-yogreet-warm-gray mb-2">
                            {buyer.email}
                          </p>
                          </div>
                        {buyer.isVerified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                            <FiCheckCircle className="w-3 h-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                            <FiXCircle className="w-3 h-3" />
                            Unverified
                          </span>
                        )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm font-inter text-yogreet-warm-gray">
                          {buyer.addresses && buyer.addresses.length > 0 && (
                            <span>
                              {[buyer.addresses[0].city, buyer.addresses[0].state, buyer.addresses[0].country]
                                .filter(Boolean)
                                .join(", ") || "N/A"}
                            </span>
                          )}
                          <span>{buyer._count?.orders || 0} Orders</span>
                          {buyer.isAuthenticated && <span className="text-yogreet-sage font-medium">Active</span>}
                          <span>Joined: {new Date(buyer.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              )}
          </div>
        </div>
      </div>
    </div>
  )
}

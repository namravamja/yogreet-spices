"use client"

import { FiChevronLeft, FiChevronRight } from "react-icons/fi"

interface ExplorePaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function ExplorePagination({ currentPage, totalPages, onPageChange }: ExplorePaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const visiblePages = pages.slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 3))

  return (
    <div className="flex justify-center items-center gap-2 py-8">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="p-2 border border-gray-200 text-yogreet-charcoal hover:bg-yogreet-light-gray disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition"
      >
        <FiChevronLeft className="w-5 h-5" />
      </button>

      {visiblePages[0] > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-3 py-2 border border-gray-200 text-yogreet-charcoal hover:bg-yogreet-light-gray cursor-pointer transition"
          >
            1
          </button>
          {visiblePages[0] > 2 && <span className="text-yogreet-charcoal text-opacity-60">...</span>}
        </>
      )}

      {visiblePages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-2 transition cursor-pointer ${
            page === currentPage
              ? "bg-yogreet-red text-white"
              : "border border-gray-200 text-yogreet-charcoal hover:bg-yogreet-light-gray"
          }`}
        >
          {page}
        </button>
      ))}

      {visiblePages[visiblePages.length - 1] < totalPages && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <span className="text-yogreet-charcoal text-opacity-60">...</span>
          )}
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-3 py-2 border border-gray-200 text-yogreet-charcoal hover:bg-yogreet-light-gray cursor-pointer transition"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="p-2 border border-gray-200 text-yogreet-charcoal hover:bg-yogreet-light-gray disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition"
      >
        <FiChevronRight className="w-5 h-5" />
      </button>
    </div>
  )
}

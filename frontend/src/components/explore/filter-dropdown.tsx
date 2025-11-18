"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"

interface FilterOption {
  value: string
  label: string
  count?: number
}

interface FilterDropdownProps {
  label: string
  options: FilterOption[]
  selectedValues: string[]
  onSelectionChange: (values: string[]) => void
  showCounts?: boolean
  maxVisible?: number
}

export function FilterDropdown({
  label,
  options,
  selectedValues,
  onSelectionChange,
  showCounts = true,
  maxVisible = 4,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tempSelection, setTempSelection] = useState<string[]>(selectedValues)
  const [showAll, setShowAll] = useState(false)

  const visibleOptions = showAll ? options : options.slice(0, maxVisible)
  const remainingCount = Math.max(0, options.length - maxVisible)

  const handleCheckboxChange = (value: string, checked: boolean) => {
    if (checked) {
      setTempSelection([...tempSelection, value])
    } else {
      setTempSelection(tempSelection.filter((v) => v !== value))
    }
  }

  const handleApply = () => {
    onSelectionChange(tempSelection)
    setIsOpen(false)
    setShowAll(false)
  }

  const handleClear = () => {
    setTempSelection([])
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open) {
      setTempSelection(selectedValues)
      setShowAll(false)
    }
  }

  const selectedCount = selectedValues.length
  const displayLabel = selectedCount > 0 ? `${label} (${selectedCount})` : label

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 bg-transparent text-yogreet-charcoal px-4 py-3 text-sm font-medium cursor-pointer border border-gray-200 hover:border-black/20 transition rounded-lg">
          <span>{displayLabel}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start">
        <div className="p-6">
          <h3 className="font-semibold text-yogreet-charcoal text-base">{label}</h3>
          <div className="space-y-0 max-h-80 overflow-y-auto">
            {visibleOptions.map((option, index) => {
              const isChecked = tempSelection.includes(option.value)
              const isLast = index === visibleOptions.length - 1
              return (
                <label
                  key={option.value}
                  className={`flex items-center justify-between cursor-pointer py-2.5 ${!isLast ? "border-b border-gray-100" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(checked) => handleCheckboxChange(option.value, checked as boolean)}
                    />
                    <span className="text-sm text-yogreet-charcoal font-normal">{option.label}</span>
                  </div>
                  {showCounts && option.count !== undefined && (
                    <span className="text-sm text-gray-500 font-normal">({option.count.toLocaleString()})</span>
                  )}
                </label>
              )
            })}
            {!showAll && remainingCount > 0 && (
              <button
                onClick={() => setShowAll(true)}
                className="text-sm text-yogreet-sage hover:text-yogreet-charcoal font-medium cursor-pointer pt-3 pb-1"
              >
                +{remainingCount} more
              </button>
            )}
          </div>
        </div>
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50">
          <button
            onClick={handleClear}
            className="text-sm text-gray-600 hover:text-yogreet-charcoal cursor-pointer font-medium"
          >
            Clear all
          </button>
          <button
            onClick={handleApply}
            className="bg-yogreet-charcoal text-white px-8 py-2.5 rounded-lg text-sm font-medium hover:bg-yogreet-charcoal/90 transition-colors cursor-pointer"
          >
            Apply
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}


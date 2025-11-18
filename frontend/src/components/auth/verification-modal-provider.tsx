"use client"

import { useState, createContext, useContext, ReactNode } from "react"
import { VerificationMessageModal } from "./verification-message-modal"

interface VerificationModalContextType {
  showVerificationModal: () => void
  hideVerificationModal: () => void
  isOpen: boolean
}

const VerificationModalContext = createContext<VerificationModalContextType | undefined>(undefined)

export function VerificationModalProviderWithModal({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const showVerificationModal = () => {
    setIsOpen(true)
  }

  const hideVerificationModal = () => {
    setIsOpen(false)
  }

  return (
    <VerificationModalContext.Provider
      value={{
        showVerificationModal,
        hideVerificationModal,
        isOpen,
      }}
    >
      {children}
      <VerificationMessageModal
        isOpen={isOpen}
        onClose={hideVerificationModal}
      />
    </VerificationModalContext.Provider>
  )
}

export function useVerificationModal() {
  const context = useContext(VerificationModalContext)
  if (context === undefined) {
    throw new Error("useVerificationModal must be used within a VerificationModalProviderWithModal")
  }
  return context
}


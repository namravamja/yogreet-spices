"use client"

import { useEffect } from "react"
import { FiX, FiMail } from "react-icons/fi"
import { motion, AnimatePresence } from "framer-motion"

interface VerificationMessageModalProps {
  isOpen: boolean
  onClose: () => void
}

export function VerificationMessageModal({ isOpen, onClose }: VerificationMessageModalProps) {
  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="modal-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        >
      {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="absolute inset-0 bg-black/60 backdrop-blur-none cursor-pointer"
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
      />

      {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ 
              duration: 0.25, 
              ease: [0.4, 0, 0.2, 1],
              opacity: { duration: 0.2 }
            }}
        className="relative bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10 p-1 rounded-full hover:bg-gray-100 cursor-pointer"
        >
          <FiX className="h-5 w-5" />
        </button>

        <div className="px-9 py-8">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-yogreet-purple/10 rounded-full flex items-center justify-center">
                <FiMail className="h-8 w-8 text-yogreet-purple" />
              </div>
            </div>
            <h2 className="text-2xl font-poppins font-bold text-yogreet-charcoal mb-3">
              Thank you for registering on Yogreet!
            </h2>
            <div className="font-inter text-gray-600 leading-relaxed space-y-2">
              <p>
                We've sent a verification email to your registered email address.
              </p>
              <p>
                Please check your inbox and click on the verification link in the email to verify your account. Once verified, you can log in and start using Yogreet.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={onClose}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-yogreet-purple hover:bg-yogreet-purple/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yogreet-purple cursor-pointer transition-colors font-manrope"
            >
              Got it
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
      )}
    </AnimatePresence>
  )
}


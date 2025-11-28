'use client'

import { Toaster as Sonner } from 'sonner'

const Toaster = ({ ...props }: React.ComponentProps<typeof Sonner>) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      duration={2400}
      toastOptions={{
        duration: 2400,
        classNames: {
          toast: 'group toast group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg group-[.toaster]:border',
          description: 'group-[.toast]:text-opacity-90',
          actionButton: 'group-[.toast]:bg-white/20 group-[.toast]:text-current hover:group-[.toast]:bg-white/30',
          cancelButton: 'group-[.toast]:bg-white/20 group-[.toast]:text-current hover:group-[.toast]:bg-white/30',
          success: 'group-[.toaster]:bg-green-600 group-[.toaster]:text-white group-[.toaster]:border-green-700',
          error: 'group-[.toaster]:bg-red-600 group-[.toaster]:text-white group-[.toaster]:border-red-700',
          warning: 'group-[.toaster]:bg-yellow-500 group-[.toaster]:text-white group-[.toaster]:border-yellow-600',
          info: 'group-[.toaster]:bg-blue-600 group-[.toaster]:text-white group-[.toaster]:border-blue-700',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

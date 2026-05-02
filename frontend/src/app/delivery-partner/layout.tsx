"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Truck, Package, User, LogOut, Menu, X } from "lucide-react";

export default function DeliveryPartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/delivery/profile`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        // Only redirect if not on login page
        if (!pathname?.includes("/login")) {
          router.push("/delivery-partner/login");
        }
      }
    } catch (error) {
      if (!pathname?.includes("/login")) {
        router.push("/delivery-partner/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/delivery/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      router.push("/delivery-partner/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Don't show layout on login page
  if (pathname?.includes("/login")) {
    return <>{children}</>;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yogreet-sage border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-600 font-inter">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const navigation = [
    {
      name: "Dashboard",
      href: "/delivery-partner",
      icon: Truck,
      active: pathname === "/delivery-partner",
    },
    {
      name: "Orders",
      href: "/delivery-partner",
      icon: Package,
      active: pathname?.includes("/orders"),
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/delivery-partner"
              className="flex items-center gap-2 text-yogreet-charcoal hover:text-yogreet-sage transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-yogreet-sage/10 flex items-center justify-center">
                <Truck className="w-6 h-6 text-yogreet-sage" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-poppins font-medium">Yogreet</h1>
                <p className="text-xs text-stone-500 font-inter">Delivery Partner</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-manrope font-medium text-sm transition-colors ${
                    item.active
                      ? "bg-yogreet-sage/10 text-yogreet-sage"
                      : "text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-stone-600 hover:text-red-600 hover:bg-red-50 rounded-lg font-manrope font-medium text-sm transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-stone-600 hover:text-yogreet-sage transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-stone-200 bg-white">
            <nav className="container mx-auto px-4 py-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-manrope font-medium text-sm transition-colors ${
                    item.active
                      ? "bg-yogreet-sage/10 text-yogreet-sage"
                      : "text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              ))}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-manrope font-medium text-sm transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-stone-500 font-inter">
              &copy; {new Date().getFullYear()} Yogreet Spices. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-stone-500 font-inter">
              <a href="#" className="hover:text-yogreet-sage transition-colors">
                Help
              </a>
              <a href="#" className="hover:text-yogreet-sage transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

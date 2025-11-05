"use client";

import type React from "react";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { useGetartistQuery } from "@/services/api/artistApi";
import { useLogoutMutation } from "@/services/api/authApi";

const navigation = [
  { name: "Home", href: "/Artist" },
  { name: "Profile", href: "/Artist/Profile" },
  { name: "Dashboard", href: "/Artist/Dashboard" },
  { name: "Orders", href: "/Artist/Orders" },
  { name: "Products", href: "/Artist/Product" },
  { name: "Reviews", href: "/Artist/Reviews" },
];

interface ArtistData {
  fullName?: string;
  storeName?: string;
  businessLogo?: string;
  [key: string]: any;
}

interface CacheResponse {
  source: string;
  data: ArtistData;
}

interface ApiError {
  status?: number;
  data?: any;
  [key: string]: any;
}

export default function ArtistNavbar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [hasTriedAuth, setHasTriedAuth] = useState(false);
  const pathname = usePathname();

  // Fetch artist data
  const {
    data: rawArtistData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetartistQuery(undefined);

  // Handle logout mutation
  const [logout] = useLogoutMutation();

  // Extract artist data from cache response
  const artistData = useMemo(() => {
    if (!rawArtistData) return null;

    // Handle cache response format
    if (
      rawArtistData &&
      typeof rawArtistData === "object" &&
      "data" in rawArtistData
    ) {
      return (rawArtistData as CacheResponse).data;
    }

    // Handle direct response format
    return rawArtistData as ArtistData;
  }, [rawArtistData]);

  // Track when we've tried authentication
  useEffect(() => {
    if (isError || artistData) {
      setHasTriedAuth(true);
    }
  }, [isError, artistData]);

  // Determine authentication state
  const isAuthenticated = !isError && !!artistData && hasTriedAuth;
  const apiError = error as ApiError | undefined;

  // Extract artist data
  const artist = useMemo(() => {
    if (!isAuthenticated || !artistData) return null;

    return {
      name: artistData.fullName || "Artist",
      storeName: artistData.storeName || "",
      image: artistData.businessLogo || "/Profile.jpg",
    };
  }, [isAuthenticated, artistData]);

  // Handle menu opening and closing with animation
  useEffect(() => {
    if (isMenuOpen) {
      setMenuVisible(true);
    } else {
      const timer = setTimeout(() => {
        setMenuVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isMenuOpen]);

  const handleLogout = () => {
    if (showLogoutConfirm) {
      performLogout();
    } else {
      setShowLogoutConfirm(true);
      toast("Click logout again to confirm", {
        icon: "⚠️",
        duration: 3000,
      });

      setTimeout(() => {
        setShowLogoutConfirm(false);
      }, 3000);
    }
  };

  const performLogout = async () => {
    setIsLoggingOut(true);
    const loadingToastId = toast.loading("Logging out...");

    try {
      await logout({}).unwrap();
      router.push("/");
      toast.dismiss(loadingToastId);
      toast.success("Successfully logged out!", {
        duration: 2000,
      });

      refetch();
    } catch (err: any) {
      console.error("Logout failed:", err);
      toast.dismiss(loadingToastId);

      const errorMessage =
        err?.data?.message ||
        err?.message ||
        "Failed to logout. Please try again.";
      toast.error(errorMessage, {
        duration: 4000,
      });
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    const target = e.currentTarget;
    target.style.display = "none";
  };

  return (
    <>
      <header className="bg-white/95 backdrop-blur-sm fixed top-0 left-0 right-0 z-40 shadow-md border-b border-stone-100">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 md:h-20">
            {/* Logo - responsive sizing */}
            <Link href="/Artist" className="flex items-center">
              <span className="text-lg sm:text-xl font-light tracking-wider text-stone-900 hover:text-terracotta-600 transition-colors duration-300">
                AADIVAA<span className="font-medium">EARTH</span>
              </span>
            </Link>

            {/* Desktop Navigation - with responsive breakpoints */}
            <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 xl:space-x-10">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-xs sm:text-sm font-medium relative py-2 ${
                    pathname === item.href
                      ? "text-terracotta-600"
                      : "text-stone-600 hover:text-terracotta-600 transition-colors duration-300"
                  } ${
                    pathname === item.href
                      ? "after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-terracotta-600"
                      : ""
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Desktop Actions - responsive spacing and sizing */}
            <div className="hidden md:flex items-center space-x-3 lg:space-x-5 xl:space-x-7">
              {/* Artist Profile Section */}
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-terracotta-600"></div>
                </div>
              ) : artist ? (
                <div className="relative group py-2">
                  <div className="flex items-center cursor-pointer p-1 rounded-md hover:bg-stone-50 transition-colors duration-300 gap-2">
                    <span className="text-sm text-stone-600 hidden lg:inline">
                      My Account
                    </span>
                    {artist.image ? (
                      <img
                        src={artist.image || "/placeholder.svg"}
                        alt={artist.name}
                        className="w-7 h-7 lg:w-8 lg:h-8 rounded-full object-cover border-2 border-stone-200 group-hover:border-terracotta-600 transition-colors duration-300"
                        onError={handleImageError}
                      />
                    ) : (
                      <div className="w-7 h-7 lg:w-8 lg:h-8 bg-stone-200 rounded-full flex items-center justify-center group-hover:bg-terracotta-100 transition-colors duration-300">
                        <span className="text-stone-600 text-xs font-medium">
                          {(artist.storeName || artist.name)
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Hover dropdown menu */}
                  <div className="absolute right-0 mt-2 w-48 lg:w-52 bg-white border border-stone-100 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right scale-95 group-hover:scale-100 z-50">
                    <div className="px-4 py-3 border-b border-stone-100">
                      <p className="text-xs lg:text-sm font-medium text-stone-900">
                        {artist.storeName || artist.name}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className={`flex items-center cursor-pointer w-full text-left px-4 py-3 text-xs lg:text-sm text-stone-700 hover:bg-stone-50 hover:text-terracotta-600 transition-colors duration-200 rounded-b-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                        showLogoutConfirm ? "bg-red-50 text-red-700" : ""
                      }`}
                      type="button"
                    >
                      <LogOut className="w-4 h-4 mr-3 flex-shrink-0" />
                      {showLogoutConfirm ? "Click again to confirm" : "Logout"}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Mobile Menu Button - better spacing for small devices */}
            <div className="md:hidden flex items-center space-x-3">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-stone-600 hover:text-terracotta-600 transition-colors duration-300 p-1 rounded-md hover:bg-stone-100"
                aria-expanded={isMenuOpen}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 rotate-0" />
                ) : (
                  <Menu className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 rotate-0" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - with smooth transitions */}
        <div
          className={`md:hidden fixed inset-x-0 top-16 sm:top-18 h-[calc(100vh-4rem)] sm:h-[calc(100vh-4.5rem)] bg-white shadow-lg border-t border-stone-100 transform transition-all duration-300 ease-in-out ${
            isMenuOpen
              ? "translate-y-0 opacity-100"
              : "translate-y-[-8px] opacity-0 pointer-events-none"
          }`}
        >
          {menuVisible && (
            <div className="container mx-auto px-4 py-6 h-full overflow-auto">
              <nav className="flex flex-col space-y-5">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`text-xl sm:text-2xl font-light ${
                      pathname === item.href
                        ? "text-terracotta-600"
                        : "text-stone-900 hover:text-terracotta-600 transition-colors duration-300"
                    } ${
                      pathname === item.href
                        ? "border-l-4 border-terracotta-600 pl-2"
                        : ""
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}

                {/* Mobile Artist Profile Section */}
                {artist && (
                  <div className="border-t border-stone-200 pt-5 mt-2 flex flex-col space-y-5 bg-stone-50 -mx-4 px-4 pb-6 rounded-b-lg">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                      {artist.image ? (
                        <img
                          src={artist.image || "/placeholder.svg"}
                          alt={artist.name}
                          className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full object-cover border-2 border-stone-200 flex-shrink-0"
                          onError={handleImageError}
                        />
                      ) : (
                        <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-stone-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-stone-600 text-sm font-medium">
                            {(artist.storeName || artist.name)
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-stone-900 font-medium text-sm sm:text-base truncate">
                          {artist.name}
                        </span>
                        {artist.storeName && (
                          <span className="text-stone-500 text-xs sm:text-sm truncate">
                            {artist.storeName}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className={`text-stone-900 text-base sm:text-lg md:text-xl font-light flex items-center gap-3 hover:text-terracotta-600 transition-colors duration-300 p-3 hover:bg-white rounded-lg w-full text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                        showLogoutConfirm
                          ? "bg-red-50 border border-red-200"
                          : ""
                      }`}
                      type="button"
                    >
                      <LogOut className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" />
                      <span>
                        {showLogoutConfirm
                          ? "Click again to confirm"
                          : "Logout"}
                      </span>
                    </button>
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>
      <div className="mb-20"></div>
    </>
  );
}

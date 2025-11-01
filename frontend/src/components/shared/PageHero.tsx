"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageHeroProps {
  title: string;
  subtitle: string;
  description: string;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonHref?: string;
  breadcrumb?: {
    items: Array<{
      label: string;
      href?: string;
      isActive?: boolean;
    }>;
  };
}

export default function PageHero({
  title,
  subtitle,
  description,
  showBackButton = false,
  backButtonText = "Back",
  backButtonHref = "/explore",
  breadcrumb,
}: PageHeroProps) {
  return (
    <div className="bg-yogreet-light-gray py-8 px-4 md:px-8 mb-10">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        {(showBackButton || breadcrumb) && (
          <nav className="text-sm text-yogreet-charcoal mb-4">
            {showBackButton && (
              <Link
                href={backButtonHref}
                className="flex items-center hover:text-yogreet-red transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {backButtonText}
              </Link>
            )}
            {breadcrumb && (
              <div className="flex items-center">
                {breadcrumb.items.map((item, index) => (
                  <div key={index} className="flex items-center">
                    {index > 0 && <span className="mx-2">/</span>}
                    {item.href ? (
                      <Link
                        href={item.href}
                        className={`hover:text-yogreet-red transition-colors ${
                          item.isActive ? "font-medium" : ""
                        }`}
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span className={item.isActive ? "font-medium" : ""}>
                        {item.label}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </nav>
        )}
        
        {/* Main Content */}
        <div>
          <h1 className="text-3xl md:text-4xl font-poppins font-semibold text-yogreet-charcoal mb-2">
            {title}
          </h1>
          <p className="text-yogreet-charcoal text-opacity-70 max-w-2xl">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
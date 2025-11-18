"use client";

import { Star, MessageSquare } from "lucide-react";

interface BuyerInfo {
  firstName?: string | null;
  lastName?: string | null;
}

interface Review {
  id: string;
  rating: number;
  title: string;
  text: string;
  date: string;
  verified?: boolean;
  buyer?: BuyerInfo | null;
}

interface Props {
  reviews?: Review[] | null;
}

const Stars = ({ value }: { value: number }) => {
  const full = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < full ? "fill-yellow-400 text-yellow-400" : "text-stone-300"}`}
        />
      ))}
    </div>
  );
};

export default function ReviewsSection({ reviews }: Props) {
  const list = Array.isArray(reviews) ? reviews : [];
  const average =
    list.length > 0
      ? list.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / list.length
      : 0;

  return (
    <div className="bg-white border border-stone-200 shadow-sm">
      <div className="p-6 border-b border-stone-200">
        <h2 className="text-xl font-manrope font-medium text-yogreet-charcoal flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-yogreet-sage" />
          Reviews
        </h2>
      </div>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Stars value={average} />
            <span className="text-stone-700 font-inter">
              {average.toFixed(1)} / 5
            </span>
          </div>
          <span className="text-sm text-stone-500 font-inter">
            {list.length} review{list.length === 1 ? "" : "s"}
          </span>
        </div>

        {list.length === 0 ? (
          <p className="text-stone-500 font-inter italic">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {list.slice(0, 6).map((r) => {
              const buyerName = r.buyer
                ? [r.buyer.firstName, r.buyer.lastName].filter(Boolean).join(" ")
                : "Buyer";
              const dateStr = r.date ? new Date(r.date).toLocaleDateString() : "";
              return (
                <div key={r.id} className="border border-stone-200 rounded-md p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Stars value={Number(r.rating) || 0} />
                      <span className="text-sm text-stone-600 font-inter">
                        {buyerName}
                      </span>
                      {r.verified && (
                        <span className="text-xs bg-yogreet-sage/10 text-yogreet-sage px-2 py-0.5 rounded-full font-manrope">
                          Verified
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-stone-500 font-inter">{dateStr}</span>
                  </div>
                  {r.title && (
                    <h3 className="text-sm font-manrope font-medium text-yogreet-charcoal">
                      {r.title}
                    </h3>
                  )}
                  <p className="text-sm text-stone-700 font-inter mt-1 whitespace-pre-line">
                    {r.text}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}



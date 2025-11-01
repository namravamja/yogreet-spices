interface LoadingSkeletonProps {
  height?: string;
  className?: string;
  lines?: number;
}

export function LoadingSkeleton({ 
  height = "h-4", 
  className = "", 
  lines = 1 
}: LoadingSkeletonProps) {
  if (lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${height} bg-stone-200 rounded animate-pulse`}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${height} bg-stone-200 rounded animate-pulse ${className}`}
    />
  );
}

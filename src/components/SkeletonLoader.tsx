import React from "react";

interface SkeletonLoaderProps {
  className?: string;
  children?: React.ReactNode;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className = "",
  children,
}) => {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}>
      {children}
    </div>
  );
};

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 1,
  className = "",
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonLoader
          key={index}
          className={`h-4 ${index === lines - 1 ? "w-3/4" : "w-full"}`}
        />
      ))}
    </div>
  );
};

interface SkeletonCardProps {
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  className = "",
}) => {
  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}
    >
      <div className="space-y-3">
        <SkeletonLoader className="h-6 w-3/4" />
        <SkeletonLoader className="h-4 w-1/2" />
        <div className="flex gap-2">
          <SkeletonLoader className="h-6 w-16 rounded-full" />
          <SkeletonLoader className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
};

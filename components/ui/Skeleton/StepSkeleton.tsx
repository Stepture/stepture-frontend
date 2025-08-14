"use client";

import { Skeleton } from "@/components/ui/Skeleton";

interface StepSkeletonProps {
  hasScreenshot?: boolean;
}

export function StepSkeleton({ hasScreenshot = true }: StepSkeletonProps) {
  return (
    <div className="screenshot-item border-1 border-corner rounded-md p-2.5 bg-white flex flex-col items-start gap-1 w-full">
      {/* Step header */}
      <div className="flex items-center gap-2 text-sm font-medium w-full">
        <span className="px-3 py-1 rounded-md font-semibold bg-slate-200"></span>
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Screenshot or content area */}
      {hasScreenshot ? (
        <div className="relative w-full">
          <Skeleton className="w-full h-[400px] rounded-md mt-2" />
          {/* Click indicator skeleton */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
        </div>
      ) : (
        <div className="w-full mt-2">
          <Skeleton className="w-full h-16 rounded-md" />
        </div>
      )}
    </div>
  );
}

export default StepSkeleton;

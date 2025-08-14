"use client";

import { Skeleton } from "@/components/ui/Skeleton";
import StepSkeleton from "./StepSkeleton";

export default function DocumentPageSkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header Section */}
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-b from-[#E3EAFC] to-white flex items-center justify-center">
          <Skeleton className="w-12 h-12 rounded-xl" />
        </div>
        <div className="flex-1">
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-5 w-full mb-2" />
          <Skeleton className="h-5 w-2/3 mb-2" />
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-14" />
          </div>
        </div>
      </div>

      {/* Steps Section */}
      <div className="flex flex-col gap-4 items-center justify-center">
        {Array.from({ length: 5 }).map((_, index) => (
          <StepSkeleton
            key={index}
            hasScreenshot={Math.random() > 0.2} // 80% chance of having screenshot
          />
        ))}
      </div>
    </div>
  );
}

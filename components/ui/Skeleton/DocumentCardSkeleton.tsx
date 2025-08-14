"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export default function DocumentCardSkeleton() {
  return (
    <div className="bg-[#f8fafd] rounded-xl p-5 shadow-sm w-full border border-[#eaecef]">
      {/* Logo + Website Name (Top Row) */}
      <div className="flex items-center gap-3 mb-3">
        <div className="p-1 rounded-md bg-gradient-to-br from-[#e3ecff] to-[#f0f4ff]">
          <Skeleton className="w-10 h-10 rounded-md" />
        </div>
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Main Title */}
      <div className="mb-4 space-y-2">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
      </div>

      {/* Author Badge */}
      <div className="mb-4">
        <Skeleton className="h-7 w-20 rounded" />
      </div>

      {/* Footer Info Row */}
      <div className="flex flex-wrap gap-6">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

"use client";

import { Skeleton } from "@/components/ui/skeleton";
import DocumentCardSkeleton from "@/components/ui/Skeleton/DocumentCardSkeleton";

export default function DocumentListSkeleton() {
  return (
    <div className="p-12 max-w-[1200px] lg:mx-auto">
      <Skeleton className="h-8 w-64 mb-6" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <DocumentCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

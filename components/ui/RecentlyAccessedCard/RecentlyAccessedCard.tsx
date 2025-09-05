import React from "react";
import Link from "next/link";

interface RecentlyAccessedCardProps {
  logoSrc: string;
  websiteName: string;
  docTitle: string;
  author: string;
  stepCount: number;
  estimatedTime: string;
  lastAccessedAt: string;
  href: string;
}

const RecentlyAccessedCard: React.FC<RecentlyAccessedCardProps> = ({
  logoSrc,
  websiteName,
  docTitle,
  author,
  stepCount,
  estimatedTime,
  lastAccessedAt,
  href,
}) => {
  return (
    <Link href={href}>
      <div className="border rounded-lg p-4 shadow hover:shadow-md transition cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <img src={logoSrc} alt={websiteName} className="w-6 h-6" />
            <span className="text-sm text-gray-600">{websiteName}</span>
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{docTitle}</h3>

        <p className="text-sm text-gray-600 mb-3">By {author}</p>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>{stepCount} steps</span>
            <span>{estimatedTime}</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-gray-500">
            Last accessed:{" "}
            {new Date(lastAccessedAt).toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default RecentlyAccessedCard;

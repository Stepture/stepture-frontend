// app/auth/success/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AuthSuccess() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        {/* App Logo */}
        <div className="mb-8">
          <Image
            src="/Stepture.png"
            alt="Stepture Logo"
            width={120}
            height={120}
            className="mx-auto animate-pulse"
          />
        </div>

        {/* Loading Spinner */}
        <div className="mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>

        {/* Loading Text */}
        <p className="text-lg text-gray-700 font-medium">Logging you in...</p>
        <p className="text-sm text-gray-500 mt-2">
          Please wait while we redirect you to the dashboard
        </p>
      </div>
    </div>
  );
}

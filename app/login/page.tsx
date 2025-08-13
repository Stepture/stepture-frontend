"use client";
import Image from "next/image";
import { stepture_text } from "@/public/constants/images";

export default function LoginPage() {
  const googleAuthUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: "url('/assets/landingpage/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <header className="px-6 py-4 bg-white shadow-sm">
        <div className="flex items-center justify-between max-w-[1280px] mx-auto">
          <Image
            src={stepture_text}
            alt="Stepture Logo"
            width={100}
            height={80}
            priority
          />
        </div>
      </header>

      {/* Main content */}
      <main className="flex items-center justify-center h-[calc(100vh-72px)]">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm text-center">
          <h2 className="text-lg font-medium text-gray-900 mb-6">
            Sign in to Stepture
          </h2>

          <div className="flex justify-center mb-6">
            <Image
              src="/Stepture.png"
              alt="Stepture Icon"
              width={60}
              height={60}
              className="rounded-full"
            />
          </div>

          <button
            className="w-full border border-gray-300 hover:border-gray-400 px-4 py-2 rounded-lg flex items-center justify-center gap-3 text-sm font-medium bg-white"
            onClick={() => {
              window.location.href = googleAuthUrl;
            }}
          >
            <Image
              src="/devicon_google.svg"
              alt="Google Logo"
              width={18}
              height={18}
            />
            Sign in with Google
          </button>
        </div>
      </main>
    </div>
  );
}
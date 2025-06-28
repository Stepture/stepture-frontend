'use client';

import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <header className="px-6 py-4 bg-white shadow-sm">
        <Image
          src="/stepture logo.png"
          alt="Stepture Logo"
          width={100}
          height={100}
          priority
        />
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
              alert('Google Sign-In clicked'); // Real Login Logic laterrrr
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
// b
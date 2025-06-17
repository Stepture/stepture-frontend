// app/auth/success/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthSuccess() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard");
  }, []);

  return <p>Logging you in...</p>;
}

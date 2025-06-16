"use client"; // U may make separate "a button component" for this if you want as server component
export default function LoginPage() {
  const loginWithGoogle = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f9f9f9",
      }}
    >
      <button
        style={{
          padding: "12px 32px",
          fontSize: "1.1rem",
          borderRadius: "6px",
          border: "none",
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          color: "black",
        }}
        onClick={loginWithGoogle}
      >
        <img
          src="/globe.svg"
          alt="Google"
          style={{ width: 24, height: 24, color: "black" }}
        />
        Log in with Google
      </button>
    </div>
  );
}

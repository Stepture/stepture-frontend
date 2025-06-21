// U may make separate "a button component" for this if you want as server component
export default function LoginPage() {
  const googleAuthUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
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
      <a
        href={googleAuthUrl}
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
          textDecoration: "none",
        }}
      >
        Log in with Google !!
      </a>
    </div>
  );
}

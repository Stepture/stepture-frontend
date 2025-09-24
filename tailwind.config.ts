import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
      colors: {
        primary: { 100: "#8EACFE", 700: "#5368AC" },
        gray: { 50: "#FBFDFF", 100: "#F5F5F5" },
      },
      boxShadow: {
        card: "0 12px 36px rgba(83,104,172,0.14)",
      },
      borderRadius: { xl: "1rem", "2xl": "1.25rem" },
    },
  },
  plugins: [],
} satisfies Config;

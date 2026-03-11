/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: "#0F172A",
        card: "#1E293B",
        accent: "#22C55E",
        reward: "#F59E0B",
        ink: "#E2E8F0"
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'IBM Plex Sans KR'", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(34, 197, 94, 0.25), 0 18px 60px rgba(15, 23, 42, 0.45)"
      }
    }
  },
  plugins: []
};

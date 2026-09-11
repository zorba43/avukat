import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "var(--navy)",
        "navy-deep": "var(--navy-deep)",
        charcoal: "var(--charcoal)",
        paper: "var(--paper)",
        mist: "var(--mist)",
        line: "var(--line)",
        slate: "var(--slate)",
        amber: "var(--amber)",
        urgent: "var(--urgent)",
        "urgent-dark": "var(--urgent-dark)",
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "6px",
      },
      maxWidth: {
        prose: "68ch",
      },
      keyframes: {
        pulse: {
          "0%": { transform: "scale(1)", opacity: "0.9" },
          "70%": { transform: "scale(2.6)", opacity: "0" },
          "100%": { transform: "scale(2.6)", opacity: "0" },
        },
      },
      animation: {
        "ping-slow": "pulse 2.4s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
    },
  },
  plugins: [],
};
export default config;

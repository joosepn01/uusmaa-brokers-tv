import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'SF Pro Display'", "-apple-system", "BlinkMacSystemFont", "Inter", "sans-serif"],
        mono: ["'SF Mono'", "ui-monospace", "monospace"],
      },
      colors: {
        ink: {
          950: "#05060A",
          900: "#0A0B10",
          800: "#0F1117",
          700: "#161823",
        },
        accent: {
          gold: "#E7C36A",
          coral: "#FF6E6C",
          lime: "#C6FF5E",
          iris: "#7C6CFF",
          sky: "#5EC7FF",
        },
      },
      keyframes: {
        shimmer: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        shimmer: "shimmer 3s ease-in-out infinite",
        floaty: "floaty 6s ease-in-out infinite",
        marquee: "marquee 60s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;

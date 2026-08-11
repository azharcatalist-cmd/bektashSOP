import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: "#FFC60B",
          amber: "#E5B009",
          black: "#0B0B0C",
          surface: "#141417",
          card: "#1C1C20",
          line: "#2A2A30",
        },
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      fontFamily: {
        display: ["Anton", "Arial Narrow", "Impact", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

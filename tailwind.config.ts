import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#4A148C",
          soft: "#6A1B9A",
        },
      },
      fontFamily: {
        sans: ["'Noto Sans JP'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

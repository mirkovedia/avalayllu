import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fef3e2",
          100: "#fde4b9",
          200: "#fcd48c",
          300: "#fbc45f",
          400: "#fab83d",
          500: "#f9ac1b",
          600: "#e89a18",
          700: "#d48614",
          800: "#c07310",
          900: "#9c5409",
        },
        avax: {
          red: "#E84142",
          dark: "#232323",
        },
        ayllu: {
          earth: "#8B6914",
          sky: "#1E3A5F",
          sun: "#F9AC1B",
          leaf: "#2D6A4F",
          sand: "#F5E6C8",
          night: "#0D1B2A",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "sans-serif"],
      },
      backgroundImage: {
        "gradient-andean": "linear-gradient(135deg, #0D1B2A 0%, #1E3A5F 50%, #2D6A4F 100%)",
        "gradient-sun": "linear-gradient(135deg, #F9AC1B 0%, #E84142 100%)",
      },
    },
  },
  plugins: [],
};

export default config;

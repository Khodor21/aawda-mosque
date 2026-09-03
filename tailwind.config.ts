import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-thm-med)", "serif"],
      },
      colors: {
        night: "#000000",
        moss: "#587D55",
        bone: "#C9CBBF",
      },
    },
  },
  plugins: [],
};
export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        paper: "#F5F5F2",
        "paper-muted": "#ECECE8",
        ink: "#111111",
        copy: "#666666",
        line: "#D4D4D4",
        accent: "#F05A1A",
      },
    },
  },
  plugins: [],
};
export default config;

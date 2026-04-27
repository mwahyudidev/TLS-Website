import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        brand: {
          primary: "#0B6E6E",
          "primary-light": "#0E9E9E",
          "primary-subtle": "#E6F7F7",
          accent: "#00C4B4",
          navy: "#083D4F",
          surface: "#F8FFFE",
          "text-primary": "#0D2B35",
          "text-secondary": "#4A7B86",
          border: "#D0EBEB",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "float-x": {
          "0%, 100%": { transform: "translateX(0) translateY(0)" },
          "33%": { transform: "translateX(12px) translateY(-6px)" },
          "66%": { transform: "translateX(-8px) translateY(4px)" },
        },
        "bubble-rise": {
          "0%": { transform: "translateY(0) scale(1)", opacity: "0.06" },
          "100%": { transform: "translateY(-80px) scale(1.1)", opacity: "0" },
        },
        sway: {
          "0%, 100%": { transform: "rotate(-4deg) translateY(0)" },
          "50%": { transform: "rotate(4deg) translateY(-4px)" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(28px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "float-x": "float-x 12s ease-in-out infinite",
        "bubble-rise": "bubble-rise 8s ease-in infinite",
        sway: "sway 6s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

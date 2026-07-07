import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["'Euclid Circular B'", "sans-serif"],
      },
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        purple: {
          800: "hsl(var(--purple-800))",
          700: "hsl(var(--purple-700))",
          600: "hsl(var(--purple-600))",
          500: "hsl(var(--purple-500))",
          400: "hsl(var(--purple-400))",
          300: "hsl(var(--purple-300))",
          200: "hsl(var(--purple-200))",
          100: "hsl(var(--purple-100))",
        },
        onyx: {
          800: "hsl(var(--onyx-800))",
          700: "hsl(var(--onyx-700))",
          600: "hsl(var(--onyx-600))",
          500: "hsl(var(--onyx-500))",
          400: "hsl(var(--onyx-400))",
          300: "hsl(var(--onyx-300))",
          200: "hsl(var(--onyx-200))",
          100: "hsl(var(--onyx-100))",
        },
        cerise: {
          800: "hsl(var(--cerise-800))",
          700: "hsl(var(--cerise-700))",
          600: "hsl(var(--cerise-600))",
          500: "hsl(var(--cerise-500))",
          400: "hsl(var(--cerise-400))",
          300: "hsl(var(--cerise-300))",
          200: "hsl(var(--cerise-200))",
          100: "hsl(var(--cerise-100))",
        },
        blue: {
          800: "hsl(var(--blue-800))",
          700: "hsl(var(--blue-700))",
          600: "hsl(var(--blue-600))",
          500: "hsl(var(--blue-500))",
          400: "hsl(var(--blue-400))",
          300: "hsl(var(--blue-300))",
          200: "hsl(var(--blue-200))",
          100: "hsl(var(--blue-100))",
        },
        green: {
          800: "hsl(var(--green-800))",
          700: "hsl(var(--green-700))",
          600: "hsl(var(--green-600))",
          500: "hsl(var(--green-500))",
          400: "hsl(var(--green-400))",
          300: "hsl(var(--green-300))",
          200: "hsl(var(--green-200))",
          100: "hsl(var(--green-100))",
          50: "hsl(var(--green-50))",
        },
        orange: {
          800: "hsl(var(--orange-800))",
          700: "hsl(var(--orange-700))",
          600: "hsl(var(--orange-600))",
          500: "hsl(var(--orange-500))",
          400: "hsl(var(--orange-400))",
          300: "hsl(var(--orange-300))",
          200: "hsl(var(--orange-200))",
          100: "hsl(var(--orange-100))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
          bg: "hsl(var(--success-bg))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
          bg: "hsl(var(--warning-bg))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
          bg: "hsl(var(--info-bg))",
        },
        error: {
          DEFAULT: "hsl(var(--error))",
          foreground: "hsl(var(--error-foreground))",
          bg: "hsl(var(--error-bg))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

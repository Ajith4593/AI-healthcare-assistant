/** @type {import('tailwindcss').Config} */

module.exports = {
  darkMode: "class",

  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1280px",
      },
    },

    extend: {
      fontFamily: {
        display: ["Plus Jakarta Sans", "Outfit", "sans-serif"],
        sans: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
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

        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },

        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },

        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },

        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },

        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },

        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },

        pending: {
          DEFAULT: "hsl(var(--pending))",
          foreground: "hsl(var(--pending-foreground))",
        },

        ai: {
          DEFAULT: "hsl(var(--ai))",
          foreground: "hsl(var(--ai-foreground))",
        },

        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },

        "diff-highlight": "hsl(var(--diff-highlight))",
      },

      borderRadius: {
        "3xl": "1.75rem",
        "2xl": "1.25rem",
        xl: "1rem",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      boxShadow: {
        card: "0 10px 30px -5px rgba(13, 148, 136, 0.08)",
        glass: "0 8px 32px 0 rgba(16, 185, 129, 0.12)",
        floating: "0 14px 35px rgba(13, 148, 136, 0.18)",
        "glow-teal": "0 0 25px rgba(13, 148, 136, 0.35)",
        "glow-amber": "0 0 25px rgba(245, 158, 11, 0.35)",
      },

      keyframes: {
        "fade-in": {
          from: {
            opacity: "0",
            transform: "translateY(8px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },

        "slide-up": {
          from: {
            opacity: "0",
            transform: "translateY(20px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },

        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },

        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },

        "pulse-soft": {
          "0%,100%": {
            opacity: "1",
          },
          "50%": {
            opacity: ".6",
          },
        },

        "gauge-sweep": {
          from: {
            strokeDashoffset: "251",
          },
          to: {
            strokeDashoffset: "var(--gauge-offset)",
          },
        },
      },

      animation: {
        "fade-in": "fade-in .35s ease-out",

        "slide-up": "slide-up .4s ease-out",

        float: "float 4s ease-in-out infinite",

        "spin-slow": "spin-slow 12s linear infinite",

        "pulse-soft": "pulse-soft 2s ease-in-out infinite",

        "gauge-sweep":
          "gauge-sweep 1s cubic-bezier(0.4,0,0.2,1) forwards",
      },
    },
  },

  plugins: [
    require("tailwindcss-animate"),
  ],
};
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "sans-serif"],
        heading: ["'Outfit'", "sans-serif"],
      },
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#0f172a',
        },
        navy: {
          800: '#0f172a',
          900: '#0b1120',
          950: '#060a12',
        }
      },
      boxShadow: {
        soft: "0 10px 30px -5px rgba(15, 23, 42, 0.05), 0 4px 12px -2px rgba(15, 23, 42, 0.03)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.08)",
        glow: "0 0 25px -5px rgba(37, 99, 235, 0.3)",
        'glow-emerald': "0 0 25px -5px rgba(16, 185, 129, 0.3)",
        'glow-amber': "0 0 25px -5px rgba(245, 158, 11, 0.3)",
        'glow-rose': "0 0 25px -5px rgba(244, 63, 94, 0.3)",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-pattern': 'radial-gradient(at 0% 0%, rgba(37, 99, 235, 0.08) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(99, 102, 241, 0.08) 0px, transparent 50%)',
      }
    },
  },
  plugins: [],
};

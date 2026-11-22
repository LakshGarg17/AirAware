/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aqi: {
          good: "#10b981",
          moderate: "#f59e0b",
          sensitive: "#f97316",
          unhealthy: "#ef4444",
          very_unhealthy: "#8b5cf6",
          hazardous: "#881337",
        }
      }
    },
  },
  plugins: [],
}

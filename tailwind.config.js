/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        lr: {
          // Dark backgrounds
          darker: "#1a1a1a",
          dark: "#242424",
          panel: "#2b2b2b",
          card: "#323232",
          // Light elements
          border: "#3d3d3d",
          divider: "#4a4a4a",
          // Text
          text: {
            primary: "#e8e8e8",
            secondary: "#b8b8b8",
            tertiary: "#8a8a8a",
          },
          // Accent colors 
          blue: {
            DEFAULT: "#5b9dd9",
            dark: "#4a8dc9",
            darker: "#3a7db9",
          },
          teal: {
            DEFAULT: "#5eb49b",
            dark: "#4ea48b",
          },
          purple: {
            DEFAULT: "#9b7fd1",
            dark: "#8b6fc1",
          },
          green: {
            DEFAULT: "#7cbd6f",
            dark: "#6cad5f",
          },
          orange: {
            DEFAULT: "#e09952",
            dark: "#d08942",
          },
          red: {
            DEFAULT: "#d96459",
            dark: "#c95449",
          },
        },
      },
      boxShadow: {
        'lr': '0 2px 8px rgba(0, 0, 0, 0.3)',
        'lr-lg': '0 4px 16px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
}
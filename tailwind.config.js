/**
 * Tailwind CSS Configuration
 * Custom theme configuration for Kalakrithi project
 * 
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      /** Custom color palette inspired by Indian folk art */
      colors: {
        brown: "#9e1b1b",           // Primary brand color - deep maroon/brown
        black: "#000",              // Text and contrast color
        white: "#fff",              // White color
        gainsboro: "#d9d9d9",       // Placeholder background color
        aquamarine: "rgba(153, 238, 187, 0.11)",  // Light green decorative
        rosybrown: "#946c6c",       // Stall color variant
        maroon: "#581616",          // Dark maroon stall color
        firebrick: "#b61515",       // Red stall color
        gray: "#3c2b2b",            // Dark gray stall color
        indianred: "#b96464",       // Light red stall color
      },
      /** Custom font families */
      fontFamily: {
        "lakki-reddy": "Lakki Reddy",  // Traditional Indian font
      },
      /** Custom padding utilities */
      padding: {
        "num-0": "0px",  // Zero padding utility
      },
      /** Custom spacing for stalls layout */
      spacing: {
        "num-249": "249px",  // Ornamental frame width
        "num-105": "105px",  // Dancing figure width
        "num-893": "893px",  // Stall section width
        "num-72": "72px",    // Ornamental frame height
        "num-158": "158px",  // Dancing figure height
      },
    },
    /** Custom font sizes */
    fontSize: {
      "num-24": "24px",  // Stall text size
    },
  },
  corePlugins: {
    preflight: false,  // Disable Tailwind's default reset
  },
};

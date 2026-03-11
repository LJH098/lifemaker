import colors from "tailwindcss/colors";

const {
  inherit,
  current,
  transparent,
  black,
  white,
  gray,
  zinc,
  neutral,
  stone,
  red,
  orange,
  amber,
  yellow,
  lime,
  green,
  emerald,
  teal,
  cyan,
  sky,
  blue,
  indigo,
  violet,
  purple,
  fuchsia,
  pink,
  rose
} = colors;

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    colors: {
      inherit,
      current,
      transparent,
      black,
      white,
      gray,
      zinc,
      neutral,
      stone,
      red,
      orange,
      amber,
      yellow,
      lime,
      green,
      emerald,
      teal,
      cyan,
      sky,
      blue,
      indigo,
      violet,
      purple,
      fuchsia,
      pink,
      rose,
      slate: {
        50: "#fbfdff",
        100: "#f4f8fc",
        200: "#e9f0f7",
        300: "#d8e2ec",
        400: "#bccbda",
        500: "#9eb2c4",
        600: "#8198ac",
        700: "#687f94",
        800: "#566b7f",
        900: "#48596c",
        950: "#3d4c5f"
      }
    },
    extend: {
      colors: {
        night: "#f2f7fd",
        card: "rgb(255 255 255 / 0.58)",
        accent: "#8fbce8",
        reward: "#c8d8f5",
        ink: "#31485f"
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'IBM Plex Sans KR'", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(203, 220, 240, 0.7), 0 24px 64px rgba(160, 183, 212, 0.18)"
      }
    }
  },
  plugins: []
};

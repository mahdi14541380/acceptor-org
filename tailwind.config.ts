import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0A0A0B",       // near-black background
        paper: "#F4F4F2",     // off-white text
        signal: "#E11B2B",    // brand red (from logo)
        signalDeep: "#7A0E18",// deep red for gradients/borders
        steel: "#242427",     // card surfaces
        steelLine: "#3A3A3E", // hairline borders
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      backgroundImage: {
        "checkmark-glow":
          "radial-gradient(circle at 30% 20%, rgba(225,27,43,0.25), transparent 60%)",
      },
    },
  },
  plugins: [],
};

export default config;

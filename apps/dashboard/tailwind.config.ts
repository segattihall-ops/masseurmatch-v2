import type { Config } from "tailwindcss";
import preset from "@masseurmatch/ui/tailwind-preset";

const config: Config = {
  presets: [preset],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    // Scan the design system so its utility classes survive purging.
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
};

export default config;

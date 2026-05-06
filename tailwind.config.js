/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx,mdx}",
    "./components/**/*.{js,jsx,ts,tsx,mdx}",
    "./context/**/*.{js,jsx,ts,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ezBg: "#0a0a0f",
        ezCard: "#13131a",
        ezSidebar: "#0f0f18",
        ezBorder: "#1e1e2e",
        ezPrimary: "#6c63ff",
      },
      fontFamily: {
        sifonn: ["var(--font-sifonn)"],
      },
    },
  },
  plugins: [],
};

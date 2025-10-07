export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        primary: "var(--primary)",
        text: "var(--text-color)", // 글자색도 변수로
      },
    },
  },
  plugins: [],
}
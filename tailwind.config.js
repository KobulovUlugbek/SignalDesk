export default {
  content: ['./resources/views/**/*.blade.php', './resources/js/**/*.{ts,tsx}'],
  theme: { extend: {
    fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
    colors: { ink: '#18243d', muted: '#738097', accent: '#635bff', canvas: '#f6f8fc' },
    boxShadow: { soft: '0 5px 32px rgba(26, 37, 67, .045)', panel: '0 10px 40px rgba(28,39,68,.06)' },
    borderRadius: { xl2: '18px' },
  } },
  plugins: [],
};

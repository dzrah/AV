/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				holo: {
					blue: '#1482ff',
					cyan: '#00dcff',
					purple: '#6440dc',
					magenta: '#c832ff',
					pale: '#a0d4ff'
				},
				surface: {
					900: '#050a18',
					800: '#081026',
					700: '#0f1e3c',
					600: '#162a52',
					500: '#1e3a6e'
				}
			},
			fontFamily: {
				display: ['Oxanium', 'sans-serif'],
				body: ['Chakra Petch', 'sans-serif'],
				mono: ['Share Tech Mono', 'monospace']
			},
			boxShadow: {
				'holo': '0 0 20px rgba(20, 130, 255, 0.3), 0 0 40px rgba(20, 130, 255, 0.1)',
				'holo-cyan': '0 0 15px rgba(0, 220, 255, 0.3), 0 0 30px rgba(0, 220, 255, 0.1)',
				'holo-sm': '0 0 10px rgba(20, 130, 255, 0.2)',
			}
		}
	},
	plugins: []
};

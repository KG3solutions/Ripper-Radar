/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				sans: [
					'-apple-system',
					'BlinkMacSystemFont',
					'Segoe UI',
					'Roboto',
					'Helvetica Neue',
					'Arial',
					'sans-serif'
				]
			},
			fontSize: {
				xs: ['14px', { lineHeight: '1.5' }],
				sm: ['16px', { lineHeight: '1.5' }],
				base: ['18px', { lineHeight: '1.5' }],
				lg: ['20px', { lineHeight: '1.25' }],
				xl: ['24px', { lineHeight: '1.25' }],
				'2xl': ['28px', { lineHeight: '1.25' }],
				'3xl': ['32px', { lineHeight: '1.25' }]
			},
			colors: {
				gray: {
					50: '#FAFAFA',
					100: '#F5F5F5',
					200: '#E5E5E5',
					300: '#D4D4D4',
					400: '#A3A3A3',
					500: '#737373',
					600: '#525252',
					700: '#404040',
					800: '#262626',
					900: '#171717'
				},
				blue: {
					100: '#DBEAFE',
					600: '#2563EB',
					700: '#1D4ED8',
					800: '#1E40AF'
				},
				green: {
					100: '#DCFCE7',
					600: '#16A34A',
					700: '#15803D'
				},
				amber: {
					100: '#FEF3C7',
					500: '#F59E0B',
					600: '#D97706'
				},
				red: {
					100: '#FEE2E2',
					200: '#FECACA',
					600: '#DC2626',
					700: '#B91C1C',
					800: '#991B1B'
				}
			},
			spacing: {
				1: '4px',
				2: '8px',
				3: '12px',
				4: '16px',
				5: '20px',
				6: '24px',
				8: '32px',
				10: '40px',
				12: '48px',
				16: '64px'
			},
			borderRadius: {
				sm: '4px',
				DEFAULT: '6px',
				lg: '8px'
			},
			boxShadow: {
				sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
				md: '0 2px 4px rgba(0, 0, 0, 0.1)',
				focus: '0 0 0 3px rgba(37, 99, 235, 0.5)'
			},
			minHeight: {
				touch: '48px',
				'touch-lg': '56px'
			},
			maxWidth: {
				form: '480px',
				content: '640px',
				readable: '720px'
			}
		}
	},
	plugins: []
};

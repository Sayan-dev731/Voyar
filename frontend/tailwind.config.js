/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ["class"],
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			},
			fontFamily: {
				sans: [
					'-apple-system',
					'BlinkMacSystemFont',
					'SF Pro Display',
					'SF Pro Text',
					'Segoe UI',
					'Roboto',
					'Helvetica Neue',
					'Arial',
					'sans-serif'
				]
			},
			animation: {
				'fade-in': 'fadeIn 0.5s ease-in-out',
				'slide-up': 'slideUp 0.5s ease-out',
				float: 'float 3s ease-in-out infinite',
				'float-slow': 'floatSlow 6s ease-in-out infinite',
				'float-reverse': 'floatReverse 7s ease-in-out infinite',
				shimmer: 'shimmer 1.5s ease-in-out infinite',
				'glow-pulse': 'glowPulse 2s ease-in-out infinite',
				gradient: 'gradientShift 4s ease infinite',
				'scale-in': 'scaleIn 0.5s ease-out forwards',
			},
			keyframes: {
				fadeIn: {
					'0%': {
						opacity: '0'
					},
					'100%': {
						opacity: '1'
					}
				},
				slideUp: {
					'0%': {
						transform: 'translateY(20px)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateY(0)',
						opacity: '1'
					}
				},
				float: {
					'0%, 100%': {
						transform: 'translateY(0px)'
					},
					'50%': {
						transform: 'translateY(-20px)'
					}
				},
				floatSlow: {
					'0%, 100%': {
						transform: 'translateY(0) rotate(0deg)'
					},
					'50%': {
						transform: 'translateY(-15px) rotate(2deg)'
					}
				},
				floatReverse: {
					'0%, 100%': {
						transform: 'translateY(0) rotate(0deg)'
					},
					'50%': {
						transform: 'translateY(15px) rotate(-2deg)'
					}
				},
				shimmer: {
					'0%': {
						backgroundPosition: '-200% 0'
					},
					'100%': {
						backgroundPosition: '200% 0'
					}
				},
				glowPulse: {
					'0%, 100%': {
						boxShadow: '0 0 20px rgba(217, 156, 41, 0.3)'
					},
					'50%': {
						boxShadow: '0 0 40px rgba(217, 156, 41, 0.6)'
					}
				},
				gradientShift: {
					'0%': {
						backgroundPosition: '0% 50%'
					},
					'50%': {
						backgroundPosition: '100% 50%'
					},
					'100%': {
						backgroundPosition: '0% 50%'
					}
				},
				scaleIn: {
					'0%': {
						transform: 'scale(0.95)',
						opacity: '0'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				}
			},
			backgroundSize: {
				'200': '200% 200%',
				'size-200': '200% 200%',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
}

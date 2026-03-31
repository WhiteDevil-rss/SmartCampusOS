import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				background: 'var(--background)',
				surface: 'var(--surface)',
				card: 'var(--card)',
				'card-hover': 'var(--card-hover)',
				primary: {
					DEFAULT: 'var(--primary)',
					dark: 'var(--primary-dark)',
					light: 'var(--primary-light)',
					glow: 'var(--primary-glow)',
				},
				secondary: {
					DEFAULT: 'var(--secondary)',
					dark: 'var(--secondary-dark)',
					light: 'var(--secondary-light)',
					glow: 'var(--secondary-glow)',
				},
				accent: {
					red: 'var(--accent-red)',
					yellow: 'var(--accent-yellow)',
					green: 'var(--accent-green)',
					orange: 'var(--accent-orange)',
				},
				border: {
					DEFAULT: 'var(--border)',
					hover: 'var(--border-hover)',
				},
				text: {
					primary: 'var(--text-primary)',
					secondary: 'var(--text-secondary)',
					muted: 'var(--text-muted)',
					disabled: 'var(--text-disabled)',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				ring: 'var(--primary)',
				// Design System tokens
				'neon-cyan': 'var(--neon-cyan)',
				'neon-purple': 'var(--neon-purple)',
				'surface-hover': 'var(--surface-hover)',
				'background-dark': '#030712',
				'surface-dark': '#111827',
				'card-bg': 'rgba(255, 255, 255, 0.03)',
				'card-border': 'rgba(255, 255, 255, 0.1)',
				'accent-purple': '#8b5cf6',
			},
			borderRadius: {
				lg: 'var(--radius-l)',
				md: 'var(--radius-m)',
				sm: 'var(--radius-s)',
				xl: 'var(--radius-xl)',
				full: '9999px',
			},
			boxShadow: {
				'card': '0 4px 24px rgba(0, 112, 255, 0.08)',
				'card-hover': '0 8px 40px rgba(0, 112, 255, 0.15)',
				'button': '0 4px 16px rgba(0, 112, 255, 0.2)',
				'glow': '0 0 60px rgba(0, 112, 255, 0.3)',
				'glow-lg': '0 0 80px rgba(0, 112, 255, 0.4)',
				'cta-glow': '0 0 80px rgba(0, 209, 255, 0.3)',
				'input-glow': '0 0 20px rgba(0, 112, 255, 0.15)',
			},
			animation: {
				'fade-in': 'fadeIn 0.4s ease-out forwards',
				'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
				'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'float': 'float 6s ease-in-out infinite',
				'spin-slow': 'spin 8s linear infinite',
				'shake': 'shake 0.4s cubic-bezier(.36,.07,.19,.97) both',
			},
			keyframes: {
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				slideUp: {
					'0%': { transform: 'translateY(20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
				float: {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-20px)' },
				},
				shake: {
					'10%, 90%': { transform: 'translateX(-1px)' },
					'20%, 80%': { transform: 'translateX(2px)' },
					'30%, 50%, 70%': { transform: 'translateX(-4px)' },
					'40%, 60%': { transform: 'translateX(4px)' },
				},
			},
			fontFamily: {
				sans: ['var(--font-inter)', 'sans-serif'],
				heading: ['var(--font-space-grotesk)', 'sans-serif'],
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
};
export default config;

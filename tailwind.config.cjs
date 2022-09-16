/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin');

module.exports = {
    mode: 'jit',

    content: ['./src/**/*.{js,ts,jsx,tsx}'],
    darkMode: 'class',
    theme: {
        fontFamily: {
            display: ['Open Sans', 'sans-serif'],
            body: ['Open Sans', 'sans-serif'],
        },
        fontSize: {
            xs: '.5rem',
            sm: '.75rem',
            tiny: '.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem',
            '4xl': '2.25rem',
            '5xl': '3rem',
            '6xl': '4rem',
            '7xl': '5rem',
        },
        extend: {
            fontSize: {
                14: '14px',
            },
            colors: {
                primary: '#6967CE',
                'primary-darker': '#5556BA',
                'primary-dark-alt': '#00176D',
            },
            backgroundColor: {
                'main-bg': '#FAFBFB',
                'main-dark-bg': '#011A27',
                'secondary-dark-bg': '#063852',
                'light-gray': '#F0F0F0',
                'half-transparent': 'rgba(0, 0, 0, 0.5)',
                'primary-bg': '#6967CE',
                'primary-bg-lighter': '#8681EB',
                'primary-bg-darker': '#5556BA',
                'secondary-bg': '#F1B814',
                'offset-bg': '#FFC414',
                'info-bg': '#9CF6FB',
                'success-bg': '#BCFD4C',
                'light-alt-bg': '#FDF5DF',
                'dark-alt-bg': '#00176D',
            },
            textColor: {
                primary: '#BD1E51',
                secondary: '#F1B814',
                offset: '#FFC414',
                'half-transparent': 'rgba(0,0,0,0.5',
            },
            borderWidth: {
                1: '1px',
            },
            borderColor: {
                color: 'rgba(0, 0, 0, 0.1)',
            },
            width: {
                400: '400px',
                760: '760px',
                780: '780px',
                800: '800px',
                1000: '1000px',
                1200: '1200px',
                1400: '1400px',
            },
            height: {
                80: '80px',
            },
            minHeight: {
                590: '590px',
            },
            transitionProperty: {
                height: 'height',
                spacing: 'margin, padding',
            },
            variants: {
                height: ['hover', 'focus'],
            },
        },
        backdropBlur: ({ theme }) => theme('blur'),
        backdropBrightness: ({ theme }) => theme('brightness'),
        backdropContrast: ({ theme }) => theme('contrast'),
        backdropGrayscale: ({ theme }) => theme('grayscale'),
        backdropHueRotate: ({ theme }) => theme('hueRotate'),
        backdropInvert: ({ theme }) => theme('invert'),
        backdropOpacity: ({ theme }) => theme('opacity'),
        backdropSaturate: ({ theme }) => theme('saturate'),
        backdropSepia: ({ theme }) => theme('sepia'),
        backgroundColor: ({ theme }) => theme('colors'),
        backgroundImage: ({ theme }) => ({
            none: 'none',
            'gradient-to-t':
                'linear-gradient(to top, var(--tw-gradient-stops))',
            'gradient-to-tr':
                'linear-gradient(to top right, var(--tw-gradient-stops))',
            'gradient-to-r':
                'linear-gradient(to right, var(--tw-gradient-stops))',
            'gradient-to-br':
                'linear-gradient(to bottom right, var(--tw-gradient-stops))',
            'gradient-to-b':
                'linear-gradient(to bottom, var(--tw-gradient-stops))',
            'gradient-to-bl':
                'linear-gradient(to bottom left, var(--tw-gradient-stops))',
            'gradient-to-l':
                'linear-gradient(to left, var(--tw-gradient-stops))',
            'gradient-to-tl':
                'linear-gradient(to top left, var(--tw-gradient-stops))',

            'gradient-fuchsia':
                'linear-gradient(310deg,' +
                theme('colors.purple.700') +
                ',' +
                theme('colors.pink.500') +
                ')',
            'gradient-cyan':
                'linear-gradient(310deg,' +
                theme('colors.blue.600') +
                ',' +
                theme('colors.cyan.400') +
                ')',
            'gradient-orange':
                'linear-gradient(310deg,' +
                theme('colors.red.500') +
                ',' +
                theme('colors.yellow.400') +
                ')',
            'gradient-red':
                'linear-gradient(310deg,' +
                theme('colors.red.600') +
                ',' +
                theme('colors.rose.400') +
                ')',
            'gradient-lime':
                'linear-gradient(310deg,' +
                theme('colors.green.600') +
                ',' +
                theme('colors.lime.400') +
                ')',
            'gradient-slate':
                'linear-gradient(310deg,' +
                theme('colors.slate.600') +
                ',' +
                theme('colors.slate.300') +
                ')',
            'gradient-dark-gray':
                'linear-gradient(310deg,' +
                theme('colors.gray.900') +
                ',' +
                theme('colors.slate.800') +
                ')',
            'gradient-gray':
                'linear-gradient(310deg,' +
                theme('colors.gray.400') +
                ',' +
                theme('colors.gray.100') +
                ')',

            'gradient-horizontal-dark':
                'linear-gradient(90deg,transparent,rgba(0,0,0,.4),transparent)',
            'gradient-horizontal-light':
                'linear-gradient(90deg,transparent,rgba(0,0,0,.1),transparent)',
        }),
    },
    plugins: [
        plugin(function ({ addComponents, addUtilities }) {
            addUtilities({
                '.scrollbar-rounded::-webkit-scrollbar': {
                    display: 'block',
                    width: '6px',
                    height: '18px',
                },
                '.scrollbar-rounded-horizontal::-webkit-scrollbar': {
                    display: 'block',
                    width: 'auto',
                    height: '6px',
                },

                '.scrollbar-rounded::-webkit-scrollbar-track': {
                    borderRadius: '100vh',
                    background: '#FFFFFF00',
                },
                '.scrollbar-rounded-horizontal::-webkit-scrollbar-track': {
                    borderRadius: '100vh',
                    background: '#f3f4f6',
                },

                '.scrollbar-rounded::-webkit-scrollbar-thumb': {
                    background: '#FFFFFF00',
                    borderRadius: '100vh',
                    border: '3px solid #FFFFFF00',
                },
                '.scrollbar-rounded-horizontal::-webkit-scrollbar-thumb': {
                    background: '#666',
                    borderRadius: '100vh',
                    border: '3px solid #FFFFFF00',
                },

                '.scrollbar-rounded::-webkit-scrollbar-thumb:hover': {
                    background: '#00176D',
                },

                '.scrollbar-rounded-horizontal::-webkit-scrollbar-thumb:hover':
                    {
                        background: '#475569',
                    },
                '.no-scrollbar::-webkit-scrollbar': {
                    display: 'none',
                },
                '.no-scrollbar': {
                    '-ms-overflow-style': 'none',
                    'scrollbar-width': 'none',
                },
                '.transform3d': {
                    transform: 'perspective(999px) rotateX(0deg) translateZ(0)',
                },
                '.transform3d-hover': {
                    transform:
                        'perspective(999px) rotateX(7deg) translate3d(0,-4px,5px)',
                },
                '.transform-dropdown': {
                    transform:
                        'perspective(999px) rotateX(-10deg) translateZ(0) translate3d(0,37px,0)',
                },
                '.transform-dropdown-show': {
                    transform:
                        'perspective(999px) rotateX(0deg) translateZ(0) translate3d(0,37px,5px)',
                },
                '.flex-wrap-inherit': {
                    'flex-wrap': 'inherit',
                },
            });
        }),
        plugin(function ({ matchUtilities, theme }) {
            matchUtilities({
                'bg-gradient': (angle) => ({
                    'background-image': `linear-gradient(${angle}, var(--tw-gradient-stops))`,
                }),
            });
        }),
    ],
};

import resolveConfig from 'tailwindcss/resolveConfig';
import { Config } from 'tailwindcss';
import tailwindConfig from '../../../tailwind.config.cjs';

// array of duplicated colors
const excludeColors = [
    'primary',
    'secondary',
    'positive',
    'negative',
    'warning',
    'info',
];

export function makeFullColorPalette() {
    const config = resolveConfig(tailwindConfig as unknown as Config);
    const rawColors = config?.theme?.colors ?? {};
    // const tailwindColors = theme.extend.colors ?? {};

    const colors = Object.entries(rawColors).flatMap(([name, values]) => {
        if (typeof values === 'string' || excludeColors.includes(name)) {
            return [];
        }

        return Object.entries(values).map(([tonality, hex]) => ({
            name: `${name}-${tonality}`,
            value: hex,
        }));
    });

    colors.push({ name: 'White', value: '#fff' });
    colors.push({ name: 'Black', value: '#000' });

    return colors;
}

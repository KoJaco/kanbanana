import { useMemo, useState } from 'react';
import { fullColorPalette, minimalColorPalette } from '@/core/consts/branding';
import { Color } from '@/core/types/sortableBoard';
import clsx from 'clsx';

type ColorPickerPaletteProps = {
    allowGradientSelection?: boolean;
    minimalPalette?: boolean;
    handlePickColor: (color: Color) => void;
};

type GradientOptions = 'linear' | 'radial' | 'conic';

const gradientOptions = ['linear', 'radial', 'conic'];

function renderGradient(
    gradientType: GradientOptions,
    fromColorValue: string,
    toColorValue?: string
) {
    <div id="gradientDisplay"></div>;
}

const ColorPickerPalette = ({
    allowGradientSelection = false,
    minimalPalette = false,
    handlePickColor,
}: ColorPickerPaletteProps) => {
    const [fromColorValue, setFromColorValue] = useState<string | null>(null);
    const [toColorValue, setToColorValue] = useState<string | null>(null);
    const [gradientType, setGradientType] = useState<GradientOptions | null>(
        null
    );

    // return a color with structure {name: string, value: string, textDark: boolean} out of selection
    const colorPalette = useMemo(() => {
        return fullColorPalette;
    }, []);

    return (
        <div className="flex w-full">
            {/* <div className="flex flex-col w-1/2"></div> */}

            <div className="ml-auto w-full py-1 px-1 grid grid-cols-10 justify-start items-end max-h-40 overflow-y-auto bg-transparent gap-y-1 no-scrollbar transition-transform duration-300">
                {minimalPalette ? (
                    <>
                        {minimalColorPalette.map((color, index) => (
                            <button
                                type="button"
                                key={index}
                                title={`${color.name}`}
                                className={clsx(
                                    color.name === 'white' && 'border-1',
                                    allowGradientSelection
                                        ? 'w-5 h-5'
                                        : 'w-6 h-6',
                                    'flex items-center justify-start hover:drop-shadow-lg hover:scale-110 transition-all duration-200 rounded-lg hover:border-1'
                                )}
                                style={{
                                    backgroundColor:
                                        color.value !== undefined ||
                                        color.value !== null
                                            ? color.value
                                            : 'transparent',
                                    opacity:
                                        color.value === '#00ffffff' ? 0.2 : 1,

                                    borderColor: color.textDark
                                        ? '#6875F5'
                                        : 'transparent',
                                }}
                                onClick={() => handlePickColor(color)}
                            />
                        ))}
                    </>
                ) : (
                    <>
                        {colorPalette.map((color, index) => (
                            <button
                                type="button"
                                key={index}
                                title={`${color.name}`}
                                className={clsx(
                                    color.name === 'white' && 'border-1',
                                    allowGradientSelection
                                        ? 'w-5 h-5'
                                        : 'w-6 h-6',
                                    'flex items-center justify-start hover:drop-shadow-lg hover:scale-110 transition-all duration-200 rounded-lg hover:border-1'
                                )}
                                style={{
                                    backgroundColor:
                                        color.value !== undefined ||
                                        color.value !== null
                                            ? color.value
                                            : 'transparent',
                                    opacity:
                                        color.value === '#00ffffff' ? 0.2 : 1,

                                    borderColor: color.textDark
                                        ? '#6875F5'
                                        : 'transparent',
                                }}
                                onClick={() => handlePickColor(color)}
                            />
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};

export default ColorPickerPalette;

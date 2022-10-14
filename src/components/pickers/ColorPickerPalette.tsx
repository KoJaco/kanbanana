import { useMemo, useRef } from 'react';
import { fullColorPalette } from '@/core/consts/branding';

type TColor = {
    positionInContainer?: 'right' | 'left' | 'top' | 'bottom';
    attachToCorner?: 'topRight' | 'bottomRight' | 'bottomLeft' | 'topLeft';
    // name is in tailwind format, could be templated into className
    name: string;
    // value is in HEX
    value: string;
    // textDark describes whether the text should be dark or not, to stand out from the chosen color.
    textDark: boolean;
};

type ColorPickerPaletteProps = {
    handlePickColor: (color: TColor) => void;
};

const ColorPickerPalette = ({ handlePickColor }: ColorPickerPaletteProps) => {
    const colorPalette = useMemo(() => {
        return fullColorPalette;
    }, []);

    return (
        // positioned absolutely to be like a tooltip, need to select direction.
        <div className="w-full py-1 px-1 grid grid-cols-10 justify-start items-end max-h-40 overflow-y-auto bg-transparent gap-y-1 no-scrollbar z-1000 transition-transform duration-300">
            {colorPalette.map((color, index) => (
                <button
                    type="button"
                    key={index}
                    title={`${color.name}`}
                    className={`${color.name === 'white' && 'border-1'} 
                        w-6 h-6 flex items-center justify-start hover:drop-shadow-lg hover:scale-110 transition-all duration-200 rounded-lg hover:border-1`}
                    style={{
                        backgroundColor:
                            color.value !== undefined || color.value !== null
                                ? color.value
                                : 'transparent',
                        opacity: color.value === '#00ffffff' ? 0.2 : 1,

                        borderColor: color.textDark ? '#6875F5' : 'transparent',
                    }}
                    onClick={() => handlePickColor(color)}
                />
            ))}
        </div>
    );
};

export default ColorPickerPalette;

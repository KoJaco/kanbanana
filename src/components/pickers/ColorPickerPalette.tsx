import React from 'react';

import { useMemo } from 'react';
import { fullColorPalette } from '@/core/consts/branding';

type TColor = {
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

const ColorPickerPalette = (props: ColorPickerPaletteProps) => {
    const colorPalette = useMemo(() => {
        return fullColorPalette;
    }, []);

    return (
        <div className="p-3 shadow-lg grid grid-cols-10 justify-start items-end w-80 max-h-96 overflow-y-auto rounded-md bg-gradient-to-br to-white gap-y-1 gap-x-1 no-scrollbar">
            {colorPalette.map((color, index) => (
                <button
                    key={index}
                    title={`${color.name}`}
                    className={`${color.name === 'White' && 'border-1'} 
                        w-auto h-7 flex items-center justify-start hover:drop-shadow-lg hover:scale-110 transition-all duration-200 rounded-md hover:border-1`}
                    style={{
                        backgroundColor:
                            color.value !== undefined || color.value !== null
                                ? color.value
                                : 'transparent',
                        opacity: color.value === '#00ffffff' ? 0.2 : 1,

                        borderColor: color.textDark ? '#6875F5' : 'transparent',
                    }}
                    onClick={() => props.handlePickColor(color)}
                />
            ))}
        </div>
    );
};

export default ColorPickerPalette;
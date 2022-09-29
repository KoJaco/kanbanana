import React from 'react';

import { useMemo } from 'react';
import { fullColorPalette } from '@/core/consts/branding';

const ColorPickerPalette = () => {
    const colorPalette = useMemo(() => {
        return fullColorPalette;
    }, []);

    return (
        <div className="p-3 shadow-lg grid grid-cols-10 justify-start items-end w-80 max-h-96 overflow-y-auto rounded-md bg-gradient-to-br to-white gap-y-1 gap-x-1 no-scrollbar">
            {colorPalette.map((color, index) => (
                <button
                    key={index}
                    title={`${color.name}`}
                    className="w-auto h-7 flex items-center justify-start hover:drop-shadow-lg hover:scale-110 transition-all duration-200 rounded-md hover:border-1"
                    style={{
                        backgroundColor:
                            color.value !== undefined || color.value !== null
                                ? color.value
                                : 'transparent',

                        borderColor: color.textDark ? '#6875F5' : 'transparent',
                    }}
                ></button>
            ))}
        </div>
    );
};

export default ColorPickerPalette;

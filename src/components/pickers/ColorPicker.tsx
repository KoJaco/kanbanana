import { useMemo, useState } from 'react';
import { fullColorPalette, minimalColorPalette } from '@/core/consts/branding';
import { Color } from '@/core/types/sortableBoard';

import clsx from 'clsx';

type ColorPickerProps = {
    colorPaletteOptions: 'minimal' | 'full' | 'dark' | 'light' | 'custom';
    popoverDirection?: 'up' | 'right' | 'down' | 'left';
    contentDirection?: 'left' | 'right';
    showColorPicker: boolean;
    children: JSX.Element;
    handlePickColor: (color: Color) => void;
};

const ColorPicker = ({
    children,
    popoverDirection = 'down',
    contentDirection = 'left',
    handlePickColor,
    ...props
}: ColorPickerProps) => {
    // color picker component which acts like a tooltip or popover

    const colorPalette = useMemo(() => {
        return fullColorPalette;
    }, []);

    const absoluteDivStyling = clsx(
        'absolute whitespace-no-wrap bg-white text-slate-600 text-sm px-2 py-1 rounded flex items-center justify-center transition-transform duration-200 bg-white border-1 rounded-lg drop-shadow-sm hover:drop-shadow-lg hover:scale-105 z-[1000]',
        popoverDirection === 'up' && 'bottom-0 mb-10',
        popoverDirection === 'right' && 'left-0 ml-10',
        popoverDirection === 'down' && 'top-0 mt-10',
        popoverDirection === 'left' && 'right-0 mr-10'
    );

    const tagDivStyling = clsx(
        'bg-white h-3 w-3 absolute -top-[7px] rotate-45',
        contentDirection === 'left' ? 'left-1' : 'right-1',
        popoverDirection === 'up' && 'inline-flex border-b',
        popoverDirection === 'right' && 'border-l',
        popoverDirection === 'down' && 'inline-flex border-t border-l',
        popoverDirection === 'left' && 'border-r'
    );

    return (
        <div
            className={clsx(
                'relative flex items-center',
                contentDirection === 'right' ? 'justify-end' : 'justify-start'
            )}
        >
            {props.showColorPicker && (
                <div className={absoluteDivStyling}>
                    <div className={tagDivStyling} />
                    {/* color picker */}

                    <div className="ml-auto w-64 h-92 p-2 grid grid-cols-10 justify-start items-end max-h-40 overflow-y-auto bg-transparent gap-y-1 no-scrollbar transition-transform duration-300">
                        {colorPalette.map((color, index) => (
                            <button
                                type="button"
                                key={index}
                                title={`${color.name}`}
                                className="w-5 h-5 flex items-center justify-start hover:drop-shadow-lg hover:scale-110 transition-all duration-200 rounded-lg hover:border-1"
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
                    </div>
                </div>
            )}

            {children}
        </div>
    );
};

export default ColorPicker;

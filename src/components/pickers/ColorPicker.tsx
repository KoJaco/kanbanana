import { useMemo } from 'react';
import clsx from 'clsx';

import { fullColorPalette } from '@/core/consts/branding';
import { Color } from '@/core/types/sortableBoard';

type ColorPickerProps = {
    pickerType?: 'popover' | 'inline';
    colorPaletteOptions: 'minimal' | 'full' | 'dark' | 'light' | 'custom';
    popoverDirection?: 'up' | 'right' | 'down' | 'left';
    corner?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
    showColorPicker: boolean;
    children?: JSX.Element;
    handlePickColor: (color: Color) => void;
};

const additionalColors = [
    { name: 'black', value: '#000', textDark: false },
    { name: 'white', value: '#fff', textDark: true },
    { name: 'transparent', value: '#FFFFFF00', textDark: true },
];

const ColorPicker = ({
    children,
    pickerType = 'popover',
    popoverDirection = 'down',
    corner = 'bottomLeft',
    handlePickColor,
    ...props
}: ColorPickerProps) => {
    // color picker component which acts like a tooltip or popover

    const colorPalette = useMemo(() => {
        return fullColorPalette;
    }, []);

    function parseColorPalette(
        paletteOption: 'minimal' | 'full' | 'dark' | 'light' | 'custom'
    ) {
        switch (paletteOption) {
            case 'minimal':
                // return 500s
                return colorPalette.filter((_, i) => {
                    return (i + 5) % 10 === 0;
                });
            case 'full':
                // return full palette
                return colorPalette;
            // return only before 500s
            default:
                return colorPalette;
        }
    }

    const absoluteDivStyling = clsx(
        'absolute whitespace-no-wrap bg-white dark:bg-slate-700 dark:border-slate-800 text-slate-600 text-sm px-2 py-1 rounded flex items-center justify-center transition-transform duration-200 bg-white border-1 rounded-lg drop-shadow-sm hover:drop-shadow-lg z-[150]',
        popoverDirection === 'up' && 'bottom-0 mb-10',
        popoverDirection === 'right' && 'left-0 ml-10',
        popoverDirection === 'down' && 'top-0 mt-10',
        popoverDirection === 'left' && 'right-0 top-0 mr-10'
    );

    const tagDivStyling = clsx(
        'bg-white h-3 w-3 absolute rotate-45 dark:bg-slate-700 dark:border-slate-800',
        corner === 'bottomLeft' ? 'left-1' : 'right-1',
        popoverDirection === 'up' &&
            'inline-flex border-b border-r -bottom-[7px]',
        popoverDirection === 'right' && 'border-l',
        popoverDirection === 'down' &&
            'inline-flex border-t border-l -top-[7px]',
        popoverDirection === 'left' && 'border-r border-t -right-[7px] top-1'
    );

    return (
        <>
            {pickerType === 'popover' ? (
                <div className="relative flex items-center justify-end">
                    {children}
                    {props.showColorPicker && (
                        <div className={absoluteDivStyling}>
                            <div className={tagDivStyling} />
                            {/* color picker */}

                            <div className="ml-auto w-64 h-92 p-2 grid grid-cols-10 justify-start items-end max-h-40 overflow-y-auto bg-transparent gap-y-1 no-scrollbar transition-transform duration-300">
                                {parseColorPalette(
                                    props.colorPaletteOptions
                                ).map((color, index) => (
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
                                                color.value === '#00ffffff'
                                                    ? 0.2
                                                    : 1,

                                            borderColor: color.textDark
                                                ? '#6875F5'
                                                : 'transparent',
                                        }}
                                        onClick={() => handlePickColor(color)}
                                    />
                                ))}
                                {additionalColors.map((color, index) => (
                                    <button
                                        type="button"
                                        key={index}
                                        title={`${color.name}`}
                                        className="w-5 h-5 flex items-center justify-start hover:drop-shadow-lg hover:scale-110 transition-all duration-200 rounded-lg border-1"
                                        style={{
                                            backgroundColor:
                                                color.value !== undefined ||
                                                color.value !== null
                                                    ? color.value
                                                    : 'transparent',
                                            opacity:
                                                color.name === 'transparent'
                                                    ? 0.2
                                                    : 1,

                                            borderColor: color.textDark
                                                ? '#777'
                                                : 'transparent',
                                        }}
                                        onClick={() => handlePickColor(color)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    {props.showColorPicker && (
                        <div className="flex flex-col w-full">
                            <div className="w-full ml-auto p-2 grid grid-cols-10 justify-start items-end max-h-40 overflow-y-auto bg-transparent gap-y-1 no-scrollbar transition-transform duration-300">
                                {parseColorPalette(
                                    props.colorPaletteOptions
                                ).map((color, index) => (
                                    <button
                                        type="button"
                                        key={index}
                                        title={`${color.name}`}
                                        className="w-6 h-6 flex items-center justify-start hover:drop-shadow-lg hover:scale-110 transition-all duration-200 rounded-lg hover:border-1"
                                        style={{
                                            backgroundColor:
                                                color.value !== undefined ||
                                                color.value !== null
                                                    ? color.value
                                                    : 'transparent',
                                            opacity:
                                                color.value === '#00ffffff'
                                                    ? 0.2
                                                    : 1,

                                            borderColor: color.textDark
                                                ? '#6875F5'
                                                : 'transparent',
                                        }}
                                        onClick={() => handlePickColor(color)}
                                    />
                                ))}
                                {additionalColors.map((color, index) => (
                                    <button
                                        type="button"
                                        key={index}
                                        title={`${color.name}`}
                                        className="w-6 h-6 flex items-center justify-start hover:drop-shadow-lg hover:scale-110 transition-all duration-200 rounded-lg border-1"
                                        style={{
                                            backgroundColor:
                                                color.value !== undefined ||
                                                color.value !== null
                                                    ? color.value
                                                    : 'transparent',
                                            opacity:
                                                color.name === 'transparent'
                                                    ? 0.2
                                                    : 1,

                                            borderColor: color.textDark
                                                ? '#777'
                                                : 'transparent',
                                        }}
                                        onClick={() => handlePickColor(color)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default ColorPicker;

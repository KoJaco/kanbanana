import React from 'react';
import { useUIControlStore } from '@/stores/UIControlStore';

const themeColors = [
    {
        name: 'offset-bg',
        color: '#FFC414',
    },
    {
        name: 'secondary-bg',
        color: '#E01E5A',
    },
    {
        name: 'dark-alt-bg',
        color: '#00176D',
    },
];

const ThemeSettings = () => {
    const { setCurrentColor, setCurrentMode, currentMode } =
        useUIControlStore();

    return (
        <div className="bg-inherit w-full h-auto">
            <div className="flex-col">
                <div className="form-check form-switch gap-5 px-4 py-3 rounded-lg text-md   dark:text-gray-200 dark:hover:text-black hover:bg-indigo-600 m-2">
                    <label className="relative flex justify-between items-center group text-md">
                        <span className="text-indigo-300 dark:text-gray-200 dark:group-hover:text-black">
                            Light/Dark
                        </span>
                        <input
                            id={currentMode}
                            type="checkbox"
                            className="absolute left-1/2 -translate-x-1/2 w-full h-full peer appearance-none rounded-md"
                            checked={currentMode === 'light' ? false : true}
                            onChange={setCurrentMode}
                            value={currentMode === 'light' ? 'dark' : 'light'}
                        />
                        <span className="cursor-pointer w-14 h-8 flex items-center flex-shrink-0 p-0.5 bg-slate-300 rounded-full duration-300 ease-in-out peer-checked:bg-primary-bg after:w-7 after:h-7 after:bg-white after:rounded-full after:shadow-md after:duration-300 peer-checked:after:translate-x-6 group-hover:scale-105 group-hover:drop-shadow-md"></span>
                    </label>
                </div>

                <div className="flex flex-row items-center gap-5 px-4 py-3 rounded-lg text-md text-gray-700 dark:text-gray-200 dark:hover:text-black hover:bg-indigo-600 m-2 group">
                    <label className="flex items-center text-md">
                        <span className="text-indigo-300  dark:text-gray-200 dark:group-hover:text-black">
                            Theme Colours
                        </span>
                    </label>
                    <div className="grid grid-cols-2 gap-2 ml-auto">
                        {themeColors.map((item) => (
                            <div
                                key={item.name}
                                className="relative mt-2 cursor-pointer flex items-center"
                            >
                                <button
                                    type="button"
                                    className="h-5 w-5 rounded-md cursor-pointer shadow-sm"
                                    // hydration error without ternary
                                    style={{
                                        backgroundColor: item.color
                                            ? item.color
                                            : '',
                                    }}
                                    onClick={() => {
                                        setCurrentColor(item.color);
                                    }}
                                ></button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThemeSettings;

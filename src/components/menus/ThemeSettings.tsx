import React from 'react';
import { useUIControlStore } from '@/stores/UIControlStore';

const themeColors = [
    {
        name: 'another',
        color: '#008BB2',
    },
    {
        name: 'secondary-bg',
        color: '#0079D6',
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
                <ul>
                    <li className="form-check form-switch px-3 py-2 rounded-lg text-md  hover:bg-primary-bg-darker">
                        <label className="relative flex justify-between items-center group text-md">
                            <span className="text-indigo-200 ">Light/Dark</span>
                            <input
                                id={currentMode}
                                type="checkbox"
                                className="absolute left-1/2 -translate-x-1/2 w-full h-full peer appearance-none rounded-md"
                                checked={currentMode === 'light' ? false : true}
                                onChange={setCurrentMode}
                                value={
                                    currentMode === 'light' ? 'dark' : 'light'
                                }
                            />
                            <span className="cursor-pointer w-14 h-8 flex items-center flex-shrink-0 p-0.5 bg-indigo-300 rounded-full duration-300 ease-in-out peer-checked:bg-dark-alt-bg after:w-7 after:h-7 after:bg-white after:rounded-full after:shadow-md after:duration-300 peer-checked:after:translate-x-6 group-hover:scale-105 group-hover:drop-shadow-md"></span>
                        </label>
                    </li>

                    <li className="flex flex-row items-center px-3 py-2  rounded-lg text-md text-indigo-200  dark:hover:text-black hover:bg-primary-bg-darker group">
                        <label className="flex items-center text-md">
                            <span className="text-indigo-200">
                                Theme Colours
                            </span>
                        </label>
                        <div className="grid grid-cols-3 gap-2 ml-auto">
                            {themeColors.map((item) => (
                                <div
                                    key={item.name}
                                    className="relative mt-2 cursor-pointer flex items-center"
                                >
                                    <button
                                        type="button"
                                        className="h-5 w-5 rounded-md cursor-pointer shadow-md border-1 border-slate-600"
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
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default ThemeSettings;

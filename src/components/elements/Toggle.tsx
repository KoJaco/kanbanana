import React from 'react';
import clsx from 'clsx';

type ToggleProps = {
    text: string;
    checked: boolean;
    toggle: (e: React.FormEvent<HTMLInputElement>) => void;
};

const Toggle = (props: ToggleProps) => {
    return (
        <label className="relative flex justify-between items-center group p-2 text-md">
            <span className="text-gray-700 dark:text-gray-200">
                {props.text}
            </span>
            <input
                type="checkbox"
                className="absolute left-1/2 -translate-x-1/2 w-full h-full peer appearance-none rounded-md"
                checked={props.checked}
                onChange={(event) => props.toggle(event)}
                value="light"
            />
            <span className="cursor-pointer w-14 h-8 flex items-center flex-shrink-0 p-0.5 bg-slate-300 rounded-full duration-300 ease-in-out peer-checked:bg-green-400 after:w-7 after:h-7 after:bg-white after:rounded-full after:shadow-md after:duration-300 peer-checked:after:translate-x-6 group-hover:scale-105 group-hover:drop-shadow-md"></span>
        </label>
    );
};

export default Toggle;

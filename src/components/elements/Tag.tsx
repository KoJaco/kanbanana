import React from 'react';
import { useTheme } from 'next-themes';

type TagProps = {
    text: string;
    backgroundColor: { name: string; value: string; textDark: boolean };
};

const Tag = (props: TagProps) => {
    const { theme } = useTheme();

    const textColorStyle = () => {
        if (props.backgroundColor.name === 'transparent' && theme === 'light') {
            return 'rgba(0,0,0,1)';
        } else if (
            props.backgroundColor.name === 'transparent' &&
            theme === 'dark'
        ) {
            return 'rgba(255,255,255,1)';
        }
        if (props.backgroundColor.textDark) {
            return 'black';
        } else {
            return '#fff';
        }
    };

    return (
        <>
            {props.text.length > 0 && (
                <div
                    className={`flex items-center rounded-full ${
                        props.backgroundColor.name === 'transparent' &&
                        'border-1 border-slate-500/50'
                    }`}
                    style={{
                        backgroundColor: props.backgroundColor.value,
                    }}
                >
                    <span
                        className="text-sm md:text-md font-medium px-2"
                        style={{
                            color: textColorStyle(),
                        }}
                    >
                        {props.text}
                    </span>
                </div>
            )}
        </>
    );
};

export default Tag;

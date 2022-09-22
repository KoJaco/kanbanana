import React from 'react';

type TagProps = {
    text: string;
    color?: string;
};

const Tag = (props: TagProps) => {
    return (
        <div
            className="flex items-center px-2 rounded-full"
            style={{
                backgroundColor: props.color ? props.color : 'transparent',
            }}
        >
            <span
                className="text-sm md:text-md font-medium text-slate-800"
                // style={{
                //     mixBlendMode: 'exclusion',
                // }}
            >
                {props.text}
            </span>
        </div>
    );
};

export default Tag;

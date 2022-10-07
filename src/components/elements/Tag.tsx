import React from 'react';

type TagProps = {
    text: string;
    backgroundColor: { name: string; value: string; textDark: boolean };
};

const Tag = (props: TagProps) => {
    return (
        <div
            className="flex items-center px-2 rounded-full"
            style={{
                backgroundColor: props.backgroundColor.value,
            }}
        >
            <span
                className="text-sm md:text-md font-medium"
                style={{
                    color: props.backgroundColor.textDark ? '#333' : '#fff',
                }}
            >
                {props.text}
            </span>
        </div>
    );
};

export default Tag;

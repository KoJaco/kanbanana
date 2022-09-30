import React from 'react';

type TagProps = {
    text: string;
    color: { name: string; value: string; textDark: boolean };
};

const Tag = (props: TagProps) => {
    return (
        <div
            className="flex items-center px-2 rounded-full"
            style={{
                backgroundColor: props.color.value,
            }}
        >
            <span
                className="text-sm md:text-md font-medium"
                style={{ color: props.color.textDark ? '#333' : '#fff' }}
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

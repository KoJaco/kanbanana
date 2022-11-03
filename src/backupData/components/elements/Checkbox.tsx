import React from 'react';
import clsx from 'clsx';

type CheckboxProps = {
    id: string;
    // for aria description only
    relation?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    customStyling?: string;
    bgColorChecked: string;
    bgColorBase: string;
    checked: boolean;
    disabled?: boolean;
    check: () => void;
};

const Checkbox = ({
    disabled = false,
    checked = false,
    size = 'md',
    ...props
}: CheckboxProps) => {
    const inputStyles = clsx(
        size === 'xs' && 'h-3 w-3',
        size === 'sm' && 'h-4 w-4',
        size === 'md' && 'h-5 w-5',
        size === 'lg' && 'h-7 w-7',
        size === 'xl' && 'h-10 w-10',
        checked ? props.bgColorChecked : props.bgColorBase,
        'border-solid border-1 border-dark hover:scale-105 focus:scale-105 transition-colors ease-in duration-150 hover:drop-shadow-md focus:drop-shadow-md transition-transform ease-out appearance-none rounded-md cursor-pointer drop-shadow-sm'
    );

    return (
        <>
            {disabled ? (
                <input
                    id={props.id}
                    aria-describedby={props.relation ? props.relation : ''}
                    name={props.id}
                    type="checkbox"
                    onChange={props.check}
                    className={clsx('disabled:opacity-75', inputStyles)}
                    checked={checked}
                    disabled
                ></input>
            ) : (
                <input
                    id={props.id}
                    aria-describedby={props.relation ? props.relation : ''}
                    name={props.id}
                    type="checkbox"
                    onChange={props.check}
                    checked={checked}
                    className={inputStyles}
                />
            )}
        </>
    );
};

export default Checkbox;

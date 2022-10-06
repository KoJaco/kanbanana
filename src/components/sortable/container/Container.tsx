import React, { forwardRef } from 'react';
import clsx from 'clsx';
// import styles from './Container.module.css';
import { Handle, Remove } from '../components';
import { MdDragIndicator } from 'react-icons/md';

export interface ContainerProps {
    children: React.ReactNode;
    columns?: number;
    label?: string;
    style?: React.CSSProperties;
    horizontal?: boolean;
    hover?: boolean;
    handleProps?: React.HTMLAttributes<any>;
    scrollable?: boolean;
    shadow?: boolean;
    placeholder?: boolean;
    unstyled?: boolean;
    onClick?(): void;
    onRemove?(): void;
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
    (
        {
            children,
            columns = 1,
            handleProps,
            horizontal,
            hover,
            onClick,
            onRemove,
            label,
            placeholder,
            style,
            scrollable,
            shadow,
            unstyled,
            ...props
        }: ContainerProps,
        ref
    ) => {
        const Component = onClick ? 'button' : 'div';

        return (
            <Component
                {...props}
                // @ts-ignore
                ref={ref}
                style={
                    {
                        ...style,
                        '--columns': columns,
                    } as React.CSSProperties
                }
                className="flex flex-col w-52 md:w-80 lg:w-96 xl:w-[30rem] bg-gray-100 sm:px-1 mx-1 rounded-md group"
                // className={clsx(
                //     styles.Container,
                //     unstyled && styles.unstyled,
                //     horizontal && styles.horizontal,
                //     hover && styles.hover,
                //     placeholder && styles.placeholder,
                //     scrollable && styles.scrollable,
                //     shadow && styles.shadow
                // )}
                onClick={onClick}
                tabIndex={onClick ? 0 : undefined}
            >
                {label ? (
                    <div className="flex justify-between items-center group mt-2 mb-1 mx-1">
                        <h1 className="text-l text-slate-500 font-medium">
                            {label}
                        </h1>
                        <div className="flex items-center gap-x-4">
                            {onRemove ? (
                                <Remove
                                    onClick={onRemove}
                                    className="opacity-0 group-hover:opacity-100 text-gray-500 cursor-drag focus:cursor-drag transition-opacity duration-300"
                                />
                            ) : undefined}
                            <Handle
                                {...handleProps}
                                className="opacity-0 group-hover:opacity-100 text-gray-500 cursor-drag focus:cursor-drag transition-opacity duration-300"
                            />
                        </div>
                    </div>
                ) : null}
                {placeholder ? (
                    children
                ) : (
                    <ul className="w-full">{children}</ul>
                )}
            </Component>
        );
    }
);

Container.displayName = 'Container';

import React, { forwardRef, CSSProperties } from 'react';
import clsx from 'clsx';
import styles from './Action.module.css';
export interface ActionProps extends React.HTMLAttributes<HTMLButtonElement> {
    active?: {
        fill: string;
        background: string;
    };
    cursor?: CSSProperties['cursor'];
    initialOpacity?: string;
}

export const Action = forwardRef<HTMLButtonElement, ActionProps>(
    ({ active, className, cursor, style, ...props }, ref) => {
        return (
            <button
                ref={ref}
                {...props}
                className={clsx(styles.Action, className)}
                tabIndex={0}
                style={
                    {
                        ...style,
                        cursor,
                        '--fill': active?.fill,
                        '--background': active?.background,
                    } as CSSProperties
                }
            />
        );
    }
);

Action.displayName = 'Action';

import React, { forwardRef, CSSProperties } from 'react';

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
                className="text-slate-600 rounded-md opacity-0 group-focus-visible:opacity-75 focus:opacity-75 group-hover:opacity-75 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-2 focus-visible:ring-slate-600 focus-visible:scale-105 transition-transform duration-300"
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

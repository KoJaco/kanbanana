import React, { useRef } from 'react';

type TooltipProps = {
    content: string;
    contentStyling?: string;
    popoverDirection?: 'up' | 'right' | 'down' | 'left';
    children: JSX.Element;
};

const Tooltip = ({
    children,
    popoverDirection = 'down',
    ...props
}: TooltipProps) => {
    const tooltipRef = useRef<HTMLDivElement>(null);

    function handleMouseEnter() {
        if (tooltipRef.current !== null) {
            tooltipRef.current.style.opacity = '1';
            switch (popoverDirection) {
                case 'up':
                    tooltipRef.current.style.marginBottom = '20px';
                    break;
                case 'right':
                    break;
                case 'down':
                    tooltipRef.current.style.marginTop = '20px';
                    break;
                case 'left':
                    tooltipRef.current.style.marginRight = '20px';
                    break;
                default:
                    break;
            }
        }
    }

    function handleMouseLeave() {
        if (tooltipRef.current !== null) {
            tooltipRef.current.style.opacity = '0';
            switch (popoverDirection) {
                case 'up':
                    tooltipRef.current.style.marginBottom = '10px';
                    break;
                case 'right':
                    tooltipRef.current.style.marginLeft = '10px';
                    break;
                case 'down':
                    tooltipRef.current.style.marginTop = '10px';

                    break;
                case 'left':
                    tooltipRef.current.style.marginRight = '10px';
                    break;
                default:
                    break;
            }
        }
    }

    const renderTooltip = (direction: string) => {
        switch (direction) {
            case 'up':
                return (
                    <div
                        className="absolute whitespace-no-wrap bg-white text-slate-600 text-sm px-2 py-1 rounded flex items-center self-center justify-center transition-all duration-150 z-[170] border-1 shadow-lg"
                        style={{ bottom: '100%', opacity: 0 }}
                        ref={tooltipRef}
                    >
                        <div
                            className="inline-flex bg-white h-3 w-3 absolute border-b"
                            style={{
                                bottom: '-6px',
                                transform: 'rotate(45deg)',
                            }}
                        />
                        {props.content}
                    </div>
                );
            case 'right':
                return (
                    <div
                        className="absolute whitespace-no-wrap bg-white text-slate-600 text-sm px-2 py-1 rounded flex items-center transition-all duration-150 z-[170] border-1 shadow-lg"
                        style={{ left: '100%', opacity: 0 }}
                        ref={tooltipRef}
                    >
                        <div
                            className="bg-white h-3 w-3 absolute border-l"
                            style={{ left: '-6px', transform: 'rotate(45deg)' }}
                        />
                        {props.content}
                    </div>
                );
            case 'down':
                return (
                    <div
                        className="absolute whitespace-no-wrap bg-white text-slate-600 text-sm px-2 py-1 rounded flex items-center self-center justify-center transition-all duration-150 z-[170] border-1 shadow-lg"
                        style={{ top: '100%', opacity: 0 }}
                        ref={tooltipRef}
                    >
                        <div
                            className="inline-flex bg-white h-3 w-3 absolute border-t"
                            style={{
                                top: '-6px',
                                transform: 'rotate(45deg)',
                            }}
                        />
                        {props.content}
                    </div>
                );
            case 'left':
                return (
                    <div
                        className="absolute whitespace-no-wrap bg-white text-slate-600 text-sm px-2 py-1 rounded flex items-center justify-center transition-all duration-150 z-[170] border-1 shadow-lg"
                        style={{ right: '100%', opacity: 0 }}
                        ref={tooltipRef}
                    >
                        <div
                            className="bg-white h-3 w-3 absolute border-r"
                            style={{
                                right: '-6px',
                                transform: 'rotate(45deg)',
                            }}
                        />
                        {props.content}
                    </div>
                );

            default:
                break;
        }
    };

    return (
        <div
            className="relative flex items-center justify-center"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {renderTooltip(popoverDirection)}

            {children}
        </div>
    );
};

export default Tooltip;

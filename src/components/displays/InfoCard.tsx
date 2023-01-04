import React from 'react';

type InfoCardProps = {
    title?: string;
    icon?: JSX.Element;
    content: string;
    onClick?: () => void;
};

const InfoCard = ({ onClick, ...props }: InfoCardProps) => {
    return (
        <div className="w-full rounded-md shadow px-4 py-2 border-1 border-slate-900/50 dark:border-slate-600/50 hover:dark:shadow-slate-800 dark:drop-shadow-md text-slate-500 dark:text-slate-200 bg-light-gray/25 dark:bg-slate-800/50 hover:shadow-lg hover:-translate-y-2 hover:bg-light-gray dark:hover:bg-slate-800/25 transition-all duration-300">
            <div className="flex flex-col gap-y-5">
                <div className="flex flex-row items-center justify-between">
                    {props.title && (
                        <div className="text-slate-900 whitespace-normal dark:text-slate-100 font-semibold w-2/3">
                            <h2> {props.title}</h2>
                        </div>
                    )}
                    {props.icon}
                </div>

                <div className="text-slate-700 dark:text-slate-200">
                    <p>{props.content}</p>
                </div>
            </div>
        </div>
    );
};

export default InfoCard;

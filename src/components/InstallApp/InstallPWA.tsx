import React, { useEffect, useState } from 'react';
import { BiDownload } from 'react-icons/bi';
const InstallPWA = () => {
    const [supportsPWA, setSupportsPWA] = useState(false);
    const [promptInstall, setPromptInstall] = useState<any>(null);

    useEffect(() => {
        const handler = (event: any) => {
            event.preventDefault();
            console.log('triggered event');
            setSupportsPWA(true);
            setPromptInstall(event);
        };
        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('transitionend', handler);
    }, []);

    const onClick = (event: React.UIEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (!promptInstall) {
            return;
        }
        promptInstall.prompt();
    };

    return (
        <button
            className="disabled:opacity-50 px-4 py-2 border rounded-sm disabled:cursor-auto cursor-pointer dark:border-slate-500 border-slate-700 dark:text-slate-400 flex items-center gap-x-4 enabled:hover:scale-105 transition-all duration-300 enabled:dark:hover:text-slate-300 enabled:dark:hover:border-slate-300 group"
            id="setup_button"
            aria-label="Install app"
            title="Install app"
            disabled={!supportsPWA}
            onClick={onClick}
        >
            {!supportsPWA ? 'Install unavailable' : 'Install Kanbanana'}
            <span className="">
                <BiDownload className="w-5 h-5 group-hover:text-emerald-500 transition-colors duration-300" />
            </span>
        </button>
    );
};

export default InstallPWA;

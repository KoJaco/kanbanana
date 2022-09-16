import { useUIControlStore } from '@/stores/UIControlStore';

import Sidebar from '@/components/navigation/Sidebar';
import Navbar from '@/components/navigation/Navbar';

type MainLayoutProps = {
    children: JSX.Element;
};

export default function MainLayout({ children }: MainLayoutProps) {
    const { currentMode, sidebarOpen, setSidebarOpen } = useUIControlStore();

    return (
        <>
            {/* Main Layout */}
            <div className={currentMode === 'dark' ? 'dark' : ''}>
                {/* Sidebar, static on desktop, responsive/closed on mobile */}
                <Sidebar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />

                <div className="flex flex-1 flex-col md:pl-64">
                    {/* Navbar */}
                    <Navbar setSidebarOpen={setSidebarOpen} />

                    <main>
                        <div className="py-6">
                            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
                                <h1 className="text-2xl font-semibold text-gray-900">
                                    Board Title
                                </h1>
                            </div>
                            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
                                content
                                {children}
                                {/* /End replace */}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}

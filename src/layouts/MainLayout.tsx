import { useUIControlStore } from '@/stores/UIControlStore';
import dynamic from 'next/dynamic';
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
            <div className={currentMode === 'dark' ? 'dark z-3' : 'z-30'}>
                {/* Sidebar, static on desktop, responsive/closed on mobile */}
                <Sidebar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />

                <div className="flex flex-1 flex-col md:pl-64">
                    {/* Navbar */}
                    <Navbar setSidebarOpen={setSidebarOpen} />

                    <main className="z-10">
                        <div className="py-6">{children}</div>
                    </main>
                </div>
            </div>
        </>
    );
}

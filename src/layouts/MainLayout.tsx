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

                <div className="flex flex-1 flex-col md:pl-64 dark:bg-[#0a0321]">
                    {/* Navbar */}
                    <Navbar setSidebarOpen={setSidebarOpen} />

                    <main className="z-10 h-screen">
                        <div className="py-6">{children}</div>
                    </main>
                </div>
            </div>
        </>
    );
}

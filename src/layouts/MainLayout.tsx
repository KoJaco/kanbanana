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

            {/* Sidebar, static on desktop, responsive/closed on mobile */}
            <Sidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />

            <div className="md:pl-64 flex flex-1 flex-col dark:bg-slate-900 h-screen">
                {/* Navbar */}
                <Navbar setSidebarOpen={setSidebarOpen} />

                <main className="dark:bg-slate-900 touch-pan-y">
                    {children}
                </main>
            </div>
        </>
    );
}

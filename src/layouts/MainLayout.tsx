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

            <div className="flex flex-1 flex-col md:pl-64 dark:bg-slate-900 h-screen">
                {/* Navbar */}
                <Navbar setSidebarOpen={setSidebarOpen} />

                <main>
                    <div>{children}</div>
                </main>
            </div>
        </>
    );
}

import { useUIControlStore } from '@/stores/UIControlStore';
import Sidebar from '@/components/navigation/Sidebar';
import Navbar from '@/components/navigation/Navbar';

type BoardLayoutProps = {
    children: JSX.Element;
};

export default function BoardLayout({ children }: BoardLayoutProps) {
    const { sidebarOpen, setSidebarOpen } = useUIControlStore();

    return (
        <>
            {/* Sidebar, static on desktop, responsive/closed on mobile */}
            <Sidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />

            <div className="lg:pl-64 flex flex-1 flex-col dark:bg-slate-900 h-screen">
                <Navbar setSidebarOpen={setSidebarOpen} />

                <main className="dark:bg-slate-900 touch-pan-y">
                    {children}
                </main>
            </div>
        </>
    );
}

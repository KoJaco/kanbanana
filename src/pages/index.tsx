import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
const ClientSideCardDisplay = dynamic(
    () => import('@/components/clientSideCardDisplay/ClientSideCardDisplay'),
    {
        ssr: false,
    }
);

// import { SortableBoard } from '@/components/sortable/SortableBoard';

const SortableBoard = dynamic(
    () => import('@/components/sortable/SortableBoard'),
    { ssr: false }
);

const Home: NextPage = () => {
    return (
        <div className="my-8 ml-2 px-2 sm:px-6 md:px-8">
            <h1 className="text-2xl font-semibold text-slate-600">
                All Boards
            </h1>
            <div className="overflow-x-auto overflow-y-hidden h-96">
                <SortableBoard slug="" />
            </div>
        </div>
    );
};

export default Home;

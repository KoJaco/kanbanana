import type { NextPage } from 'next';
import dynamic from 'next/dynamic';

const AllBoards = dynamic(() => import('@/components/views/AllBoards'), {
    ssr: false,
});
const Boards: NextPage = () => {
    return (
        <div className="my-8 ml-2 px-2 sm:px-6 md:px-8 flex flex-col touch-pan-y">
            <h1 className="text-2xl font-semibold text-slate-600 dark:text-gray-50">
                Boards
            </h1>
            <AllBoards />
        </div>
    );
};

export default Boards;

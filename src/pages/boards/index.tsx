import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import BoardLayout from '@/layouts/BoardLayout';

const AllBoards = dynamic(() => import('@/components/displays/AllBoards'), {
    ssr: false,
});
const Boards: NextPage = () => {
    return (
        <BoardLayout>
            <div className="my-8 ml-2 px-2 sm:px-6 md:px-8 flex flex-col touch-pan-y">
                <AllBoards />
            </div>
        </BoardLayout>
    );
};

export default Boards;

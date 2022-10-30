import type { NextPage } from 'next';
import dynamic from 'next/dynamic';

const AllBoards = dynamic(() => import('@/components/views/AllBoards'), {
    ssr: false,
});
const Boards: NextPage = () => {
    return (
        <div className="my-8 ml-2 px-2 sm:px-6 md:px-8 flex flex-col touch-pan-y">
            <AllBoards />
        </div>
    );
};

export default Boards;

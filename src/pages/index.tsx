import type { NextPage } from 'next';
import dynamic from 'next/dynamic';

const ClientSideCardDisplay = dynamic(
    () => import('@/components/clientSideCardDisplay/ClientSideCardDisplay'),
    {
        ssr: false,
    }
);

const Home: NextPage = () => {
    return <div className="my-8 ml-2 px-2 sm:px-6 md:px-8 flex flex-col"></div>;
};

export default Home;

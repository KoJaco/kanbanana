import type { NextPage } from 'next';
import HomeLayout from '@/layouts/HomeLayout';

const Home: NextPage = () => {
    return (
        <HomeLayout>
            <div className="my-8 ml-2 px-2 sm:px-6 md:px-8 flex flex-col"></div>
        </HomeLayout>
    );
};

export default Home;

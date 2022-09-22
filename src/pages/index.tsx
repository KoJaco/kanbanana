import { useMemo } from 'react';
import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import { makeFullColorPalette } from '@/core/utils/colors';

const ClientSideCardDisplay = dynamic(
    () => import('@/components/clientSideCardDisplay/ClientSideCardDisplay'),
    {
        ssr: false,
    }
);

// just console out the make full colors and copy the array to a ts object, then import it.

const Home: NextPage = () => {
    // const colors = useMemo(() => {
    //     makeFullColorPalette();
    // }, []);

    // const colors = makeFullColorPalette();
    // console.log(colors);

    return (
        <div className="my-8 ml-2 px-2 sm:px-6 md:px-8 ">
            <h1 className="text-2xl font-semibold text-slate-600">
                All Boards
            </h1>
            {/* <div className="border shadow-lg flex flex-row">
                {colors.map((color, index) => (
                    <div
                        key={index}
                        className={`bg-${color.name} w-5 h-5 flex flex-wrap`}
                        style={{
                            backgroundColor:
                                color.value !== undefined ||
                                color.value !== null
                                    ? color.value
                                    : 'transparent',
                        }}
                    ></div>
                ))}
            </div> */}
        </div>
    );
};

export default Home;

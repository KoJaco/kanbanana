import React, { useState, useEffect } from 'react';
import Image from 'next/image';

type BackgroundImageProps = {
    imageSrc: string;
    altText?: string;
};

function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;

    return {
        width,
        height,
    };
}

const BackgroundImage = ({ altText = '', ...props }: BackgroundImageProps) => {
    // Dynamic component here, Client side only as depends on window.
    const [width, setWidth] = useState<number>();
    const [height, setHeight] = useState<number>();

    useEffect(() => {
        const { width, height } = getWindowDimensions();

        setWidth(width);
        setHeight(height);
    }, []);

    useEffect(() => {
        // when the window resizes, change width and height

        function handleResize() {
            const { width, height } = getWindowDimensions();
        }
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    });

    if (width && height) {
        return (
            <div className="fixed top-0 z-0">
                <Image
                    src={props.imageSrc}
                    width={width}
                    height={height}
                    alt={altText}
                />
            </div>
        );
    }

    return null;
};

export default BackgroundImage;

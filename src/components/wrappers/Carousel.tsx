import { useState, useRef, useEffect } from 'react';

type CarouselProps = {
    children: JSX.Element;
};

const Carousel = ({ children }: CarouselProps) => {
    // state
    const [currentIndex, setCurrentIndex] = useState(0);

    // refs
    // we don't want this number to change during renders
    const maxScrollWidth = useRef<number>(0);
    const carouselRef = useRef<HTMLDivElement>(null);

    // Hooks
    useEffect(() => {
        // run on component render to get carousel element's total scrollable content width, less the currently visible offset width value.. then store this value in maxScrollWidth ref value.
        maxScrollWidth.current = carouselRef.current
            ? carouselRef.current.scrollWidth - carouselRef.current.offsetWidth
            : 0;
    }, []);

    useEffect(() => {
        // when the value of current index changes (when previous/next function are clicked), scroll the carousel
        if (carouselRef !== null && carouselRef.current !== null) {
            carouselRef.current.scrollLeft =
                carouselRef.current.offsetWidth * currentIndex;
        }
    }, [currentIndex]);

    // helper functions
    function scrollPrevious() {
        // Just need to know when we hit 0
        if (currentIndex > 0) {
            setCurrentIndex((prevIndex) => prevIndex - 1);
        }
    }

    function scrollNext() {
        // need to check .current !== null, and that we're not going 'out of bounds'
        // work out currently visible slide of the carousel, multiplied by the current page... must be less than the max scrollable width of the carousel's content -- i.e. the carousel's total width.
        if (
            carouselRef.current !== null &&
            carouselRef.current.offsetWidth * currentIndex <=
                maxScrollWidth.current
        ) {
            setCurrentIndex((prevIndex) => prevIndex + 1);
        }
    }

    function isDisabled(direction: 'previous' | 'next') {
        // on each button click and subsequent slide function, isDisabled will be called to determine if the button should be disabled.
        if (direction === 'previous') {
            return currentIndex <= 0;
        }

        if (direction === 'next' && carouselRef.current !== null) {
            return (
                carouselRef.current.offsetWidth * currentIndex >=
                maxScrollWidth.current
            );
        }

        return false;
    }

    return (
        <div className="carousel my-12 mx-auto">
            <div className="relative overflow-hidden">
                <div className="flex justify-between absolute top left w-full h-full">
                    <button
                        onClick={scrollPrevious}
                        className="hover:bg-primary-dark-alt text-gray-50 w-10 h-full text-center opacity-75 hover:opacity-100 disabled:opacity-25 disabled:cursor-not-allowed z-10 p-0 m-0 transition-all ease-in-out duration-300"
                        disabled={isDisabled('previous')}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-20 -ml-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 191-7-7 7-7"
                            />
                        </svg>
                        <span className="sr-only">Previous</span>
                    </button>
                    <button
                        onClick={scrollNext}
                        className="hover:bg-primary-dark-alt text-gray-50 w-10 h-full text-center opacity-75 hover:opacity-100 disabled:opacity-25 disabled:cursor-not-allowed z-10 p-0 m-0 transition-all ease-in-out duration-300"
                        disabled={isDisabled('next')}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-20 -ml-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                        <span className="sr-only">Next</span>
                    </button>
                </div>
                <div
                    ref={carouselRef}
                    className="carousel-container relative flex gap-1 overflow-hidden scroll-smooth snap-x snap-mandatory touch-pan-x z-0"
                >
                    {/* Map through or insert carousel items  */}
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Carousel;

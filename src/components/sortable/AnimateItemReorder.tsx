import React, { useEffect, useLayoutEffect, useState } from 'react';

import { usePrevious } from '@/core/hooks';
import { calculateBoundingBoxes } from '@/core/utils/kanbanBoard';

type AnimateItemReorderProps = {
    children: any;
    animationEnabled: boolean;
};

// https://dev.to/toantd90/react-beautiful-animation-reordering-the-list-of-items-1mbp

const AnimateItemReorder = ({
    children,
    animationEnabled,
}: AnimateItemReorderProps) => {
    // must be a better way tp disable this animation, or maybe combine it with the logic for dnd animation?
    const [boundingBox, setBoundingBox] = useState({});
    const [prevBoundingBox, setPrevBoundingBox] = useState({});
    const prevChildren = usePrevious(children);

    useLayoutEffect(() => {
        if (animationEnabled) {
            const newBoundingBox = calculateBoundingBoxes(children);
            setBoundingBox(newBoundingBox);
        }
    }, [children, animationEnabled]);

    useLayoutEffect(() => {
        if (animationEnabled) {
            const prevBoundingBox = calculateBoundingBoxes(prevChildren);
            setPrevBoundingBox(prevBoundingBox);
        }
    }, [prevChildren, animationEnabled]);

    useEffect(() => {
        if (animationEnabled) {
            const hasPrevBoundingBox = Object.keys(prevBoundingBox).length;

            if (hasPrevBoundingBox) {
                React.Children.forEach(children, (child: any) => {
                    const domNode = child.ref?.current;
                    const firstBox = prevBoundingBox[child.key];
                    const lastBox = boundingBox[child.key];
                    const changeInY = firstBox?.top - lastBox?.top;

                    if (changeInY) {
                        requestAnimationFrame(() => {
                            // Before the DOM paints, invert child to old position
                            domNode.style.transform = `translateY(${changeInY}px)`;
                            domNode.style.transition = 'transform 0s';

                            requestAnimationFrame(() => {
                                // After the previous frame, remove
                                // the transition to play the animation
                                domNode.style.transform = '';
                                domNode.style.transition = 'transform 500ms';
                            });
                        });
                    }
                });
            }
        }
    }, [boundingBox, prevBoundingBox, children, animationEnabled]);

    return children;
};

export default AnimateItemReorder;

import { UniqueIdentifier } from '@/core/types/sortableBoard';
import { forwardRef, memo } from 'react';

interface ItemAnimationWrapperProps {
    id: UniqueIdentifier;
    ref: HTMLDivElement;
    children: JSX.Element;
}

const ItemAnimationWrapper = memo(
    forwardRef<HTMLDivElement, ItemAnimationWrapperProps>(
        ({ id, children }, ref) => {
            return (
                <div id={`${id}`} ref={ref}>
                    {children}
                </div>
            );
        }
    )
);

export default ItemAnimationWrapper;

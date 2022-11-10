import { UniqueIdentifier } from '@/core/types/sortableBoard';
import { forwardRef, memo } from 'react';

interface ItemAnimationWrapperProps {
    wrapperId: UniqueIdentifier;
    ref: HTMLLIElement;
    children: JSX.Element;
}

const ItemAnimationWrapper = memo(
    forwardRef<HTMLLIElement, ItemAnimationWrapperProps>(
        /**
         * this is a really hacky way of introducing this animation effect.
         * - I've used a <li> tag as a direct descendant of the <ul> tag in the Container component, and then the actual item is within another <li> tag within the <ul> surrounding children.
         * - Ive done this so that the HTML is not technically invalid.
         * - To fix this, I must refactor the Sortable <dir./components> to forward the <li> node ref up 2 levels (from item HOC) so it's available in the SortableItem component props, to then be use with the AnimateItemReorder effect wrapper.
         **/
        ({ wrapperId, children }, ref) => {
            return (
                <li id={`${wrapperId}`} ref={ref}>
                    <ol>{children}</ol>
                </li>
            );
        }
    )
);

export default ItemAnimationWrapper;

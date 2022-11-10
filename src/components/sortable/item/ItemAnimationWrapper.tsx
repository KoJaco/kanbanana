import { UniqueIdentifier } from '@/core/types/sortableBoard';
import { forwardRef, memo } from 'react';

interface ItemAnimationWrapperProps {
    wrapperId: UniqueIdentifier;
    ref: HTMLUListElement;
    children: JSX.Element;
}

const ItemAnimationWrapper = memo(
    forwardRef<HTMLUListElement, ItemAnimationWrapperProps>(
        ({ wrapperId, children }, ref) => {
            return (
                <ul id={`${wrapperId}`} ref={ref}>
                    {children}
                </ul>
            );
        }
    )
);

// interface ItemAnimationWrapperProps {
//     id: UniqueIdentifier;
//     ref: HTMLDivElement;
//     children: JSX.Element;
// }

// const ItemAnimationWrapper = memo(
//     forwardRef<HTMLDivElement, ItemAnimationWrapperProps>(
//         ({ id, children }, ref) => {
//             return (
//                 <div id={`${id}`} ref={ref}>
//                     {children}
//                 </div>
//             );
//         }
//     )
// );

export default ItemAnimationWrapper;

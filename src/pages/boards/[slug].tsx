import { Suspense } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import BoardLayout from '@/layouts/BoardLayout';

// dynamically import board component, depends on IndexDB and dnt-kit.
const SortableBoard = dynamic(
    () => import('@/components/sortable/SortableBoard'),
    { ssr: false }
);

function parseSlug(slug: string | string[] | undefined): string {
    if (typeof slug === 'string') return slug;
    else if (typeof slug === 'undefined') {
        // should throw error and redirect to main page or try to resolve.
        return '';
    } else {
        // if undefined throw error and redirect or resolve.
        return slug[0] !== undefined ? slug[0] : '';
    }
}

const BoardDetail: NextPage = () => {
    const router = useRouter();
    // extract slug from query, must check type.
    const { slug } = router.query;

    return (
        <BoardLayout>
            <div className="h-auto ">
                <Suspense fallback={'loading..'}>
                    <SortableBoard slug={parseSlug(slug)} />
                </Suspense>
            </div>
        </BoardLayout>
    );
};

export default BoardDetail;

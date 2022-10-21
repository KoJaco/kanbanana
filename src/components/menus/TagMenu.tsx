import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import { useRouter } from 'next/router';

import { useUIControlStore } from '@/stores/UIControlStore';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/server/db';
import { useKanbanStore } from '@/stores/KanbanStore';
import { Board, BoardTag, BoardTags } from '@/core/types/sortableBoard';

import Tag from '@/components/elements/Tag';

var omit = require('object.omit');

const TagMenu = () => {
    const { boardCount, setBoardCount } = useKanbanStore();
    const { sidebarOpen, setSidebarOpen, screenSize, currentColor } =
        useUIControlStore();

    const router = useRouter();
    const currentRoute = router.asPath;

    const handleCloseSidebar = () => {
        if (sidebarOpen && screenSize != undefined && screenSize <= 900) {
            setSidebarOpen(false);
        }
    };

    const boards = useLiveQuery(
        () => db.getAllBoards(true),
        // () => db.boards.orderBy('updatedAt').reverse().toArray(),
        [boardCount] //we should retrieve whenever board count is updated
    );

    const initialBoardCount = useLiveQuery(() => db.boards.count());

    useEffect(() => {
        // board count is also updated in the CreateBoardForm component, and also when boards are deleted.
        if (initialBoardCount !== undefined) {
            setBoardCount(initialBoardCount);
        }
    }, [initialBoardCount, setBoardCount]);

    const allTags = useMemo(() => {
        if (boards !== undefined) {
            // initially concat tags from each board
            let tags: BoardTags = [];
            boards.forEach((board: Board) => {
                if (board.tags) {
                    let boardTags = board.tags;
                    tags = tags.concat(boardTags);
                }
            });

            // remove duplicate tags based on text
            let lessDuplicateTags: BoardTags = [];
            let uniqueObject: any = {};
            for (let i = 0; i < tags.length; i++) {
                if (tags && tags[i]) {
                    const text = tags[i]!['text'];
                    uniqueObject[text] = tags[i]!;
                }
            }
            for (let j in uniqueObject) {
                lessDuplicateTags.push(uniqueObject[j]);
            }

            // sort tags alphabetically

            lessDuplicateTags.sort((t1, t2) => {
                // object sort algorithm, sort alphabetically by text
                const textA = t1.text.toLowerCase();
                const textB = t2.text.toLowerCase();
                if (textA > textB) {
                    return 1;
                }
                if (textA < textB) {
                    return -1;
                }
                return 0;
            });

            return lessDuplicateTags;
        } else {
            return null;
        }
    }, [boards]);

    if (!allTags) return null;

    return (
        <>
            <ol className="inline-flex px-2 items-center gap-x-2 gap-y-2 w-full max-h-96 py-4 whitespace-normal flex-wrap">
                {allTags.map((tag, index) => (
                    <button
                        key={index}
                        className="hover:scale-110 transition-transform duration-300"
                    >
                        <Tag
                            text={tag.text}
                            backgroundColor={tag.backgroundColor}
                        />
                    </button>
                ))}
            </ol>
        </>
    );
};

export default TagMenu;

import { useState, useEffect, useCallback } from 'react';
import { Droppable, DragDropContext, DropResult } from 'react-beautiful-dnd';
import Column from './Column';
import { ModifyError } from 'dexie';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/server/db';
import { initializeBoard } from '@/core/utils/kanbanBoard';
import { useKanbanStore } from '@/stores/KanbanStore';

import type {
    Board,
    TaskId,
    ColumnId,
    TColumn,
    Tasks,
    Columns,
} from '@/core/types/kanbanBoard';
import { MdAdd, MdDone } from 'react-icons/md';
import { FiEdit } from 'react-icons/fi';

type KanbanProps = {
    slug: string;
};

const Kanban = () => {
    // *** react-beautiful-dnd does not work with React Strict Mode...
    // *** should look at dnd-kit or react-draggable instead, although can simply disable strict mode when testing drag and drop functionality.
    return <div>Board</div>;
};

export default Kanban;

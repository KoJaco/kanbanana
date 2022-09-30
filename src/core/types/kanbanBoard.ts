export type Color = {
    name: string;
    value: string;
    textDark: boolean;
};

export type TTask = {
    // incremental positive integer, will need to track task count.
    id: number;
    color: Color;
    // user input
    content: string;
    // completed tag will change styling based on column type.
    completed: boolean;
    // timestamps, good to have.
    updatedAt: string;
    createdAt: string;
};

export type BoardTag = {
    id: number;
    color: Color;
    // color: Color;
    text: string;
};

export type BoardTags = BoardTag[];

export interface Tasks {
    // accessing non-existing property results in undefined, difference between runtime and and compilation inference.
    // key should be in form 'task-<x>' where x is a unique positive integer.
    [key: string]: TTask;
}

export type TaskId = keyof Tasks;

export type TColumn = {
    // change this to number?
    id: string;
    // user input
    title: string;
    // strings b/c maybe add more types later.
    type: 'checklist' | 'simple';
    completedTaskOrder: 'start' | 'end' | 'noChange';
    // must set a default value of 'transparent'
    badgeColor: Color;
    taskIds: string[];
    // timestamps not essential for columns?
};

export interface Columns {
    // key should be in form 'column-<x>' where x is a unique positive integer.
    [key: string]: TColumn;
}

export type ColumnId = keyof Columns;

export type ColumnOrder = Array<keyof Columns>;

export interface Board {
    // auto-generated id
    // id: string;
    // direct data, set by the user to instantiate a new board.
    title: string;
    slug: string;
    // optional tag for categorising boards
    tags?: BoardTags;
    // auto generated upon instantiation.
    createdAt: string;
    // auto generated per mutation.
    updatedAt: string;
    // nested objects indexed by '<task/column>-x', where x is a unique positive integer.
    tasks: Tasks;
    columns: Columns;
    // column order with types explicitly specified as keyof columns
    columnOrder: ColumnOrder;
}

export interface Boards {
    // index signature with key: string, value: Board
    [key: string]: Board;
}

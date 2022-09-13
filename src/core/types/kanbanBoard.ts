export type TTask = {
    // incremental positive integer, will need to track task count.
    id: number;
    color: {
        r: number;
        g: number;
        b: number;
        a: number;
    };
    // user input
    content: string;
};

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
    // must set a default value of 'transparent'
    bgColor: {
        r: number;
        g: number;
        b: number;
        a: number;
    };
    taskIds: string[];
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
    tag?: string;
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

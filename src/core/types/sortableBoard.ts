export type Color = {
    name: string;
    value: string;
    textDark: boolean;
};

export type TItem = {
    id: UniqueIdentifier;

    // incremental positive integer, will need to track task count.
    badgeColor: Color;
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
    backgroundColor: Color;
    // color: Color;
    text: string;
};

export type BoardTags = BoardTag[];

export type UniqueIdentifier = string | number;

export interface Items {
    // accessing non-existing property results in undefined, difference between runtime and and compilation inference.
    // key should be in form 'task-<x>' where x is a unique positive integer.
    [key: UniqueIdentifier]: TItem;
}

export type ItemId = keyof Items;

export type TContainer = {
    id: UniqueIdentifier;
    // user input
    title: string;
    // strings b/c maybe add more types later.
    type: 'checklist' | 'simple';
    completedItemOrder: 'start' | 'end' | 'noChange';
    // must set a default value of 'transparent'
    badgeColor: Color;
    // timestamps not essential for columns?
};

export interface Containers {
    // key should be in form 'column-<x>' where x is a unique positive integer.
    [key: UniqueIdentifier]: TContainer;
}

export type ContainerId = keyof Containers;

export type ContainerOrder = Array<keyof Containers>;

export type ContainerItemMapping = Record<UniqueIdentifier, UniqueIdentifier[]>;

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
    containerItemMapping: ContainerItemMapping;
    // nested objects indexed by '<task/column>-x', where x is a unique positive integer.
    items: Items;
    containers: Containers;
}

export interface Boards {
    // index signature with key: string, value: Board
    [key: UniqueIdentifier]: Board;
}

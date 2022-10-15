import { Board } from '@/core/types/sortableBoard';

export const blankBoard: Board = {
    title: '',
    slug: '',
    createdAt: '',
    updatedAt: '',
    tags: [],
    containerItemMapping: {},
    containerOrder: [],
    containers: {},
    items: {},
};
// export const blankBoard: Board = {
//     title: '',
//     slug: '',
//     createdAt: new Date(Date.now()).toLocaleString(),
//     updatedAt: new Date(Date.now()).toLocaleString(),
//     tags: [
//         {
//             id: 1,
//             backgroundColor: {
//                 name: 'white',
//                 value: '#fff',
//                 textDark: true,
//             },
//             text: 'work',
//         },
//         {
//             id: 2,
//             backgroundColor: {
//                 name: 'white',
//                 value: '#fff',
//                 textDark: true,
//             },
//             text: 'something',
//         },
//     ],
//     containerItemMapping: {
//         A: ['1', '2', '3'],
//         B: ['4', '5', '6'],
//         C: ['7', '8', '9'],
//     },
//     containerOrder: ['A', 'B', 'C'],
//     containers: {
//         A: {
//             id: 'A',
//             title: 'Observations',
//             type: 'simple',
//             completedItemOrder: 'noChange',
//             badgeColor: { name: 'white', value: '#fff', textDark: true },
//         },
//         B: {
//             id: 'B',

//             title: 'Checklist',
//             type: 'checklist',
//             completedItemOrder: 'start',
//             badgeColor: { name: 'white', value: '#fff', textDark: true },
//         },
//         C: {
//             id: 'C',

//             title: 'Done',
//             type: 'checklist',
//             completedItemOrder: 'start',
//             badgeColor: { name: 'white', value: '#fff', textDark: true },
//         },
//     },
//     items: {
//         '1': {
//             id: '1',
//             content: '',
//             badgeColor: { name: 'white', value: '#fff', textDark: true },
//             completed: false,
//             createdAt: new Date(Date.now()).toLocaleString(),
//             updatedAt: new Date(Date.now()).toLocaleString(),
//         },
//         '2': {
//             id: '2',
//             content: '',
//             badgeColor: { name: 'white', value: '#fff', textDark: true },
//             completed: false,
//             createdAt: new Date(Date.now()).toLocaleString(),
//             updatedAt: new Date(Date.now()).toLocaleString(),
//         },
//         '3': {
//             id: '3',
//             content: '',
//             badgeColor: { name: 'white', value: '#fff', textDark: true },
//             completed: false,
//             createdAt: new Date(Date.now()).toLocaleString(),
//             updatedAt: new Date(Date.now()).toLocaleString(),
//         },
//         '4': {
//             id: '4',
//             content: '',
//             badgeColor: { name: 'white', value: '#fff', textDark: true },
//             completed: false,
//             createdAt: new Date(Date.now()).toLocaleString(),
//             updatedAt: new Date(Date.now()).toLocaleString(),
//         },
//         '5': {
//             id: '5',
//             content: '',
//             badgeColor: { name: 'white', value: '#fff', textDark: true },
//             completed: false,
//             createdAt: new Date(Date.now()).toLocaleString(),
//             updatedAt: new Date(Date.now()).toLocaleString(),
//         },
//         '6': {
//             id: '6',
//             content: '',
//             badgeColor: { name: 'white', value: '#fff', textDark: true },
//             completed: false,
//             createdAt: new Date(Date.now()).toLocaleString(),
//             updatedAt: new Date(Date.now()).toLocaleString(),
//         },
//         '7': {
//             id: '7',
//             content: '',
//             badgeColor: { name: 'white', value: '#fff', textDark: true },
//             completed: false,
//             createdAt: new Date(Date.now()).toLocaleString(),
//             updatedAt: new Date(Date.now()).toLocaleString(),
//         },
//         '8': {
//             id: '8',
//             content: '',
//             badgeColor: { name: 'white', value: '#fff', textDark: true },
//             completed: false,
//             createdAt: new Date(Date.now()).toLocaleString(),
//             updatedAt: new Date(Date.now()).toLocaleString(),
//         },
//         '9': {
//             id: '9',
//             content: '',
//             badgeColor: { name: 'white', value: '#fff', textDark: true },
//             completed: false,
//             createdAt: new Date(Date.now()).toLocaleString(),
//             updatedAt: new Date(Date.now()).toLocaleString(),
//         },
//     },
// };

import type { Group, Member, Expense } from './types';

export const members: Member[] = [
  { id: '1', name: 'Alice', avatarId: 'avatar-alice' },
  { id: '2', name: 'Bob', avatarId: 'avatar-bob' },
  { id: '3', name: 'Charlie', avatarId: 'avatar-charlie' },
  { id: '4', name: 'Diana', avatarId: 'avatar-diana' },
  { id: '5', name: 'Ethan', avatarId: 'avatar-ethan' },
];

export const groups: Group[] = [
  {
    id: 'g1',
    name: 'Trip to Mountains',
    members: [members[0], members[1], members[2]],
  },
  {
    id: 'g2',
    name: 'Weekend Project',
    members: [members[0], members[3], members[4]],
  },
];

export const expenses: Expense[] = [
  {
    id: 'e1',
    groupId: 'g1',
    description: 'Groceries',
    amount: 90,
    paidBy: '1',
    date: '2024-07-20',
    split: [
      { memberId: '1', amount: 30 },
      { memberId: '2', amount: 30 },
      { memberId: '3', amount: 30 },
    ],
  },
  {
    id: 'e2',
    groupId: 'g1',
    description: 'Gas',
    amount: 50,
    paidBy: '2',
    date: '2024-07-20',
    split: [
      { memberId: '1', amount: 25 },
      { memberId: '2', amount: 25 },
    ],
  },
  {
    id: 'e3',
    groupId: 'g1',
    description: 'Dinner',
    amount: 120,
    paidBy: '3',
    date: '2024-07-21',
    split: [
      { memberId: '1', amount: 40 },
      { memberId: '2', amount: 40 },
      { memberId: '3', amount: 40 },
    ],
  },
  {
    id: 'e4',
    groupId: 'g2',
    description: 'Server Hosting',
    amount: 60,
    paidBy: '4',
    date: '2024-07-15',
    split: [
      { memberId: '1', amount: 20 },
      { memberId: '4', amount: 20 },
      { memberId: '5', amount: 20 },
    ],
  },
  {
    id: 'e5',
    groupId: 'g2',
    description: 'Pizza',
    amount: 25,
    paidBy: '5',
    date: '2024-07-16',
    split: [
      { memberId: '1', amount: 10 },
      { memberId: '4', amount: 10 },
      { memberId: '5', amount: 5 },
    ],
  },
];

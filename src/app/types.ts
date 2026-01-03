export interface Member {
  id: string;
  name: string;
  avatarId: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string; // memberId
  split: { memberId: string; amount: number }[];
  date: string;
  groupId: string;
}

export interface Group {
  id: string;
  name: string;
  members: Member[];
}

export interface Balance {
  memberId: string;
  name: string;
  avatarId: string;
  balance: number;
}

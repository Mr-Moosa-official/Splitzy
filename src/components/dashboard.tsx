"use client";

import { useState, useMemo, useCallback } from 'react';
import { groups as initialGroups, expenses as initialExpenses } from '@/app/data';
import type { Group, Expense, Balance, Member } from '@/app/types';
import { Header } from '@/components/header';
import { GroupSelector } from '@/components/group-selector';
import { BalanceSummary } from '@/components/balance-summary';
import { ExpenseList } from '@/components/expense-list';
import { AddExpenseDialog } from '@/components/add-expense-dialog';
import { SettleUpDialog } from '@/components/settle-up-dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function Dashboard() {
  const { toast } = useToast();
  const [groupsData, setGroupsData] = useState<Group[]>(initialGroups);
  const [expensesData, setExpensesData] = useState<Expense[]>(initialExpenses);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(initialGroups[0].id);
  const [isAddExpenseOpen, setAddExpenseOpen] = useState(false);
  const [isSettleUpOpen, setSettleUpOpen] = useState(false);

  const selectedGroup = useMemo(() => {
    return groupsData.find(g => g.id === selectedGroupId);
  }, [groupsData, selectedGroupId]);

  const groupExpenses = useMemo(() => {
    return expensesData.filter(e => e.groupId === selectedGroupId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expensesData, selectedGroupId]);

  const balances: Balance[] = useMemo(() => {
    if (!selectedGroup) return [];

    return selectedGroup.members.map(member => {
      const paid = groupExpenses
        .filter(e => e.paidBy === member.id)
        .reduce((sum, e) => sum + e.amount, 0);

      const share = groupExpenses
        .flatMap(e => e.split)
        .filter(s => s.memberId === member.id)
        .reduce((sum, s) => sum + s.amount, 0);

      return {
        memberId: member.id,
        name: member.name,
        avatarId: member.avatarId,
        balance: paid - share
      };
    });
  }, [selectedGroup, groupExpenses]);

  const totalExpenses = useMemo(() => {
    return groupExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [groupExpenses]);

  const handleAddExpense = useCallback((newExpenseData: Omit<Expense, 'id' | 'groupId'>) => {
    const newExpense: Expense = {
      ...newExpenseData,
      id: `e${Date.now()}`,
      groupId: selectedGroupId,
    };
    setExpensesData(prev => [...prev, newExpense]);
  }, [selectedGroupId]);

  if (!selectedGroup) {
    return <div>Loading...</div>; // Or some error state
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header onAddExpense={() => setAddExpenseOpen(true)} />

      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="grid gap-8">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <GroupSelector 
              groups={groupsData}
              selectedGroupId={selectedGroupId}
              onGroupChange={setSelectedGroupId}
            />
            <Button variant="outline" onClick={() => setSettleUpOpen(true)}>
              <ArrowLeftRight className="mr-2 h-4 w-4" />
              Settle Up
            </Button>
          </div>

          <BalanceSummary balances={balances} totalExpenses={totalExpenses} />
          
          <ExpenseList expenses={groupExpenses} members={selectedGroup.members} />
        </div>
      </main>

      <AddExpenseDialog 
        isOpen={isAddExpenseOpen}
        onOpenChange={setAddExpenseOpen}
        onAddExpense={handleAddExpense}
        groupMembers={selectedGroup.members}
      />

      <SettleUpDialog
        isOpen={isSettleUpOpen}
        onOpenChange={setSettleUpOpen}
        balances={balances}
      />
    </div>
  );
}

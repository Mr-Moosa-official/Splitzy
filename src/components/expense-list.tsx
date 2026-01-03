import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/utils";
import type { Expense, Member } from '@/app/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Receipt } from 'lucide-react';
import { format } from 'date-fns';

interface ExpenseListProps {
  expenses: Expense[];
  members: Member[];
}

export function ExpenseList({ expenses, members }: ExpenseListProps) {
  const getMember = (memberId: string) => members.find(m => m.id === memberId);
  const getAvatarUrl = (avatarId: string) => PlaceHolderImages.find(img => img.id === avatarId)?.imageUrl || '';

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Receipt className="mx-auto h-12 w-12" />
        <h3 className="mt-4 text-lg font-semibold">No expenses yet</h3>
        <p>Add an expense to get started.</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight mb-4">Expenses</h2>
      <div className="grid gap-4">
        {expenses.map(expense => {
          const paidByMember = getMember(expense.paidBy);
          return (
            <Card key={expense.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{expense.description}</CardTitle>
                    <CardDescription>{format(new Date(expense.date), 'PPP')}</CardDescription>
                  </div>
                  <div className="text-2xl font-bold text-primary">{formatCurrency(expense.amount)}</div>
                </div>
              </CardHeader>
              <CardFooter className="flex justify-between items-center text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>Paid by</span>
                  {paidByMember && (
                    <>
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={getAvatarUrl(paidByMember.avatarId)} alt={paidByMember.name} data-ai-hint="person face" />
                        <AvatarFallback>{paidByMember.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-foreground">{paidByMember.name}</span>
                    </>
                  )}
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex -space-x-2 overflow-hidden">
                        {expense.split.map(({ memberId }) => {
                          const splitMember = getMember(memberId);
                          if (!splitMember) return null;
                          return (
                            <Avatar key={memberId} className="h-6 w-6 border-2 border-background">
                              <AvatarImage src={getAvatarUrl(splitMember.avatarId)} alt={splitMember.name} data-ai-hint="person face" />
                              <AvatarFallback>{splitMember.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          );
                        })}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Split between:</p>
                      <ul className="list-disc pl-4">
                        {expense.split.map(({ memberId, amount }) => {
                          const splitMember = getMember(memberId);
                          return <li key={memberId}>{splitMember?.name}: {formatCurrency(amount)}</li>;
                        })}
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

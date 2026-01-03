import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/utils";
import type { Balance } from '@/app/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface BalanceSummaryProps {
  balances: Balance[];
  totalExpenses: number;
}

export function BalanceSummary({ balances, totalExpenses }: BalanceSummaryProps) {
  const getAvatarUrl = (avatarId: string) => {
    return PlaceHolderImages.find(img => img.id === avatarId)?.imageUrl || '';
  };

  return (
    <div>
      <div className="mb-4 flex flex-col md:flex-row justify-between md:items-center">
        <h2 className="text-2xl font-bold tracking-tight">Balance Summary</h2>
        <div className="text-lg text-muted-foreground">
          Total Expenses: <span className="font-semibold text-foreground">{formatCurrency(totalExpenses)}</span>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {balances.map(({ memberId, name, avatarId, balance }) => (
          <Card key={memberId} className="transition-transform hover:scale-[1.02] hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">{name}</CardTitle>
              <Avatar className="h-8 w-8">
                <AvatarImage src={getAvatarUrl(avatarId)} alt={name} data-ai-hint="person face" />
                <AvatarFallback>{name.charAt(0)}</AvatarFallback>
              </Avatar>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${balance < 0 ? 'text-destructive' : 'text-emerald-400'}`}>
                {formatCurrency(balance)}
              </div>
              <p className="text-xs text-muted-foreground">
                {balance === 0 ? "Settled up" : balance > 0 ? "is owed" : "owes"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

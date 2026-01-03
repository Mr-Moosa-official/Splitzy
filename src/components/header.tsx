import { Wallet, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onAddExpense: () => void;
}

export function Header({ onAddExpense }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold font-headline text-foreground">Splitzy</h1>
        </div>
        <Button onClick={onAddExpense} className="bg-primary hover:bg-primary/90">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
        </Button>
      </div>
    </header>
  );
}

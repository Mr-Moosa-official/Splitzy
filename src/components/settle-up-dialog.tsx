"use client";

import { useState } from 'react';
import { suggestOptimalSettlement } from '@/ai/flows/suggest-optimal-settlement';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeftRight, Sparkles, LoaderCircle, AlertCircle } from 'lucide-react';
import type { Balance } from '@/app/types';
import { formatCurrency } from '@/lib/utils';
import { Separator } from './ui/separator';

interface SettleUpDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  balances: Balance[];
}

export function SettleUpDialog({ isOpen, onOpenChange, balances }: SettleUpDialogProps) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const debtors = balances.filter(b => b.balance < 0);
  const creditors = balances.filter(b => b.balance > 0);

  const handleSuggest = async () => {
    setLoading(true);
    setSuggestion(null);
    setError(null);
    try {
      const input = {
        groupMembers: balances.map(({ name, balance }) => ({ name, balance })),
      };
      const result = await suggestOptimalSettlement(input);
      setSuggestion(result.instructions);
    } catch (e) {
      setError("Failed to get suggestion from AI. Please try again later.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSuggestion(null);
      setError(null);
      setLoading(false);
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settle Up Debts</DialogTitle>
          <DialogDescription>
            Review the group debts and get an optimized settlement plan.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 my-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Who Owes</h4>
              {debtors.length > 0 ? debtors.map(d => (
                <div key={d.memberId} className="text-sm text-destructive">{d.name}: {formatCurrency(Math.abs(d.balance))}</div>
              )) : <p className="text-sm text-muted-foreground">No one owes money.</p>}
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Who is Owed</h4>
              {creditors.length > 0 ? creditors.map(c => (
                <div key={c.memberId} className="text-sm text-emerald-400">{c.name}: {formatCurrency(c.balance)}</div>
              )) : <p className="text-sm text-muted-foreground">No one is owed money.</p>}
            </div>
          </div>
          
          <Separator />

          {suggestion && (
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertTitle>Optimal Settlement Plan</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  {suggestion.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSuggest} disabled={loading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            {loading ? (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Suggest Optimal Settlement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

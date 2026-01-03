"use client";

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalendarIcon, PlusCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn, formatCurrency } from '@/lib/utils';
import type { Member, Expense } from '@/app/types';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  paidBy: z.string().min(1, "Please select who paid"),
  date: z.date(),
  splitType: z.enum(['equally', 'custom']),
  customSplits: z.array(z.object({
    memberId: z.string(),
    amount: z.coerce.number().min(0)
  }))
}).refine(data => {
  if (data.splitType === 'custom') {
    const totalCustomSplit = data.customSplits.reduce((sum, split) => sum + split.amount, 0);
    return Math.abs(totalCustomSplit - data.amount) < 0.01;
  }
  return true;
}, {
  message: "Custom splits must add up to the total amount.",
  path: ["customSplits"],
});

type FormValues = z.infer<typeof formSchema>;

interface AddExpenseDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddExpense: (expense: Omit<Expense, 'id' | 'groupId'>) => void;
  groupMembers: Member[];
}

export function AddExpenseDialog({ isOpen, onOpenChange, onAddExpense, groupMembers }: AddExpenseDialogProps) {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      amount: 0,
      paidBy: '',
      date: new Date(),
      splitType: 'equally',
      customSplits: groupMembers.map(m => ({ memberId: m.id, amount: 0 })),
    },
  });
  
  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "customSplits",
  });

  const watchAmount = form.watch('amount');
  const watchSplitType = form.watch('splitType');

  const onSubmit = (values: FormValues) => {
    let split;
    if (values.splitType === 'equally') {
      const splitAmount = values.amount / groupMembers.length;
      split = groupMembers.map(member => ({ memberId: member.id, amount: splitAmount }));
    } else {
      split = values.customSplits.filter(s => s.amount > 0);
    }

    onAddExpense({
      ...values,
      date: values.date.toISOString(),
      split,
    });
    form.reset();
    onOpenChange(false);
    toast({
        title: "Expense Added",
        description: `${values.description} for ${formatCurrency(values.amount)} was successfully added.`,
    })
  };

  const totalCustomSplit = form.watch('customSplits').reduce((sum, s) => sum + s.amount, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Dinner, Groceries" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paidBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paid by</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a member" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {groupMembers.map(member => (
                          <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Tabs value={watchSplitType} onValueChange={(value) => form.setValue('splitType', value as 'equally' | 'custom')} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="equally">Split Equally</TabsTrigger>
                <TabsTrigger value="custom">Custom Split</TabsTrigger>
              </TabsList>
              <TabsContent value="equally" className="text-center text-muted-foreground p-4 border rounded-md mt-2">
                <p>Splitting {formatCurrency(watchAmount || 0)} among {groupMembers.length} members.</p>
                <p className="font-bold">{formatCurrency((watchAmount || 0) / groupMembers.length)}/person</p>
              </TabsContent>
              <TabsContent value="custom" className="space-y-2 border rounded-md p-4 mt-2">
                {fields.map((field, index) => (
                  <FormField
                    key={field.id}
                    control={form.control}
                    name={`customSplits.${index}.amount`}
                    render={({ field }) => {
                      const member = groupMembers[index];
                      return (
                        <FormItem className="flex items-center justify-between">
                          <FormLabel>{member.name}</FormLabel>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">$</span>
                            <FormControl>
                              <Input type="number" className="w-24" {...field} />
                            </FormControl>
                          </div>
                        </FormItem>
                      );
                    }}
                  />
                ))}
                <div className="flex justify-between text-sm font-medium pt-2 border-t">
                  <span>Total:</span>
                  <span className={cn(Math.abs(totalCustomSplit - watchAmount) > 0.01 && "text-destructive")}>{formatCurrency(totalCustomSplit)}</span>
                </div>
                 {form.formState.errors.customSplits && <FormMessage>{form.formState.errors.customSplits.message}</FormMessage>}
              </TabsContent>
            </Tabs>

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Add Expense</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

'use server';

/**
 * @fileOverview An AI agent that suggests the optimal way to settle group debts.
 *
 * - suggestOptimalSettlement - A function that suggests the optimal way to settle debts.
 * - SuggestOptimalSettlementInput - The input type for the suggestOptimalSettlement function.
 * - SuggestOptimalSettlementOutput - The return type for the suggestOptimalSettlement function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestOptimalSettlementInputSchema = z.object({
  groupMembers: z
    .array(z.object({name: z.string(), balance: z.number()}))
    .describe('An array of group members with their names and balances.'),
});
export type SuggestOptimalSettlementInput = z.infer<typeof SuggestOptimalSettlementInputSchema>;

const SuggestOptimalSettlementOutputSchema = z.object({
  instructions: z
    .array(z.string())
    .describe(
      'A list of instructions for each transaction needed to settle the debts, including the payer, receiver, and amount.'
    ),
});
export type SuggestOptimalSettlementOutput = z.infer<typeof SuggestOptimalSettlementOutputSchema>;

export async function suggestOptimalSettlement(
  input: SuggestOptimalSettlementInput
): Promise<SuggestOptimalSettlementOutput> {
  return suggestOptimalSettlementFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOptimalSettlementPrompt',
  input: {schema: SuggestOptimalSettlementInputSchema},
  output: {schema: SuggestOptimalSettlementOutputSchema},
  prompt: `You are an expert in optimizing debt settlement among groups of people. Given a list of group members and their balances, you will determine the most efficient way to settle all debts with the fewest number of transactions.

Group Members and Balances:
{{#each groupMembers}}
- {{name}}: {{balance}}
{{/each}}

Instructions:
Return a list of instructions detailing who should pay whom and how much, to resolve all debts. Ensure the solution minimizes the number of transactions.

Here is the format:
[
  "MemberA pays MemberB $Amount",
  "MemberC pays MemberD $Amount",
  ...
]
`,
});

const suggestOptimalSettlementFlow = ai.defineFlow(
  {
    name: 'suggestOptimalSettlementFlow',
    inputSchema: SuggestOptimalSettlementInputSchema,
    outputSchema: SuggestOptimalSettlementOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

'use server';

/**
 * @fileOverview AI flow for analyzing meeting notes and suggesting dates, invitees, and tasks.
 *
 * - analyzeMeetingNotes - Analyzes meeting notes to suggest dates, invitees, and tasks.
 * - AnalyzeMeetingNotesInput - The input type for the analyzeMeetingNotes function.
 * - AnalyzeMeetingNotesOutput - The return type for the analyzeMeetingNotes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeMeetingNotesInputSchema = z.object({
  meetingNotes: z
    .string()
    .describe('The meeting notes to analyze.'),
});
export type AnalyzeMeetingNotesInput = z.infer<typeof AnalyzeMeetingNotesInputSchema>;

const AnalyzeMeetingNotesOutputSchema = z.object({
  suggestedDates: z.array(z.string()).describe('Suggested dates for upcoming events.'),
  suggestedInvitees: z.array(z.string()).describe('Suggested invitees for upcoming events.'),
  suggestedTasks: z.array(z.string()).describe('Suggested tasks for upcoming events.'),
});
export type AnalyzeMeetingNotesOutput = z.infer<typeof AnalyzeMeetingNotesOutputSchema>;

export async function analyzeMeetingNotes(input: AnalyzeMeetingNotesInput): Promise<AnalyzeMeetingNotesOutput> {
  return analyzeMeetingNotesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeMeetingNotesPrompt',
  input: {schema: AnalyzeMeetingNotesInputSchema},
  output: {schema: AnalyzeMeetingNotesOutputSchema},
  prompt: `You are an AI assistant specializing in analyzing meeting notes.

  Your task is to extract key information from the meeting notes and suggest:
  - Possible dates for upcoming events related to the meeting.
  - People who should be invited to these events.
  - Tasks that need to be done following the meeting.

  Meeting Notes: {{{meetingNotes}}}

  Please provide the output in JSON format.
  `,
});

const analyzeMeetingNotesFlow = ai.defineFlow(
  {
    name: 'analyzeMeetingNotesFlow',
    inputSchema: AnalyzeMeetingNotesInputSchema,
    outputSchema: AnalyzeMeetingNotesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

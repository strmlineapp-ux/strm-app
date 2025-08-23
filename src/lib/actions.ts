"use server";

import {
  analyzeMeetingNotes as analyzeMeetingNotesFlow,
  AnalyzeMeetingNotesOutput,
} from "@/ai/flows/analyze-meeting-notes";
import { z } from "zod";

const inputSchema = z.object({
  meetingNotes: z
    .string()
    .min(10, { message: "Meeting notes must be at least 10 characters." }),
});

export type FormState = {
  message: string;
  result?: AnalyzeMeetingNotesOutput;
  error?: string;
};

export async function analyzeMeetingNotesAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = inputSchema.safeParse({
    meetingNotes: formData.get("meetingNotes"),
  });

  if (!validatedFields.success) {
    return {
      message: "Validation failed.",
      error: validatedFields.error.flatten().fieldErrors.meetingNotes?.[0],
    };
  }

  try {
    const result = await analyzeMeetingNotesFlow(validatedFields.data);
    return {
      message: "Analysis successful.",
      result,
    };
  } catch (e) {
    console.error(e);
    return {
      message: "An unexpected error occurred.",
      error: "Failed to analyze notes. Please try again later.",
    };
  }
}

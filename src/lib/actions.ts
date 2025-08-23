"use server";

import {
  analyzeMeetingNotes as analyzeMeetingNotesFlow,
  AnalyzeMeetingNotesOutput,
} from "@/ai/flows/analyze-meeting-notes";
import { z } from "zod";
import { createCollection, createLabel, createProject } from "./firestore";
import { CollectionSchema, LabelSchema, ProjectSchema }from "./types";
import { revalidatePath } from "next/cache";

const analyzeInputSchema = z.object({
  meetingNotes: z
    .string()
    .min(10, { message: "Meeting notes must be at least 10 characters." }),
});

export type FormState = {
  message: string;
  result?: AnalyzeMeetingNotesOutput;
  error?: string;
  errors?: { [key: string]: string[] | undefined };
};

export async function analyzeMeetingNotesAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = analyzeInputSchema.safeParse({
    meetingNotes: formData.get("meetingNotes"),
  });

  if (!validatedFields.success) {
    return {
      message: "Validation failed.",
      errors: validatedFields.error.flatten().fieldErrors,
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

export async function createCollectionAction(prevState: FormState, formData: FormData): Promise<FormState> {
    const validatedFields = CollectionSchema.pick({ name: true, description: true }).safeParse({
        name: formData.get("name"),
        description: formData.get("description"),
    });

    if (!validatedFields.success) {
        return {
            message: "Validation failed",
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    try {
        await createCollection(validatedFields.data);
        revalidatePath("/collections");
        return { message: "Collection created" };
    } catch (e) {
        console.error(e);
        return { message: "Failed to create collection", error: "An unexpected error occurred." };
    }
}

export async function createProjectAction(prevState: FormState, formData: FormData): Promise<FormState> {
    const validatedFields = ProjectSchema.pick({ name: true, description: true }).safeParse({
        name: formData.get("name"),
        description: formData.get("description"),
    });

    if (!validatedFields.success) {
        return {
            message: "Validation failed",
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    try {
        await createProject(validatedFields.data);
        revalidatePath("/projects");
        return { message: "Project created" };
    } catch (e) {
        console.error(e);
        return { message: "Failed to create project", error: "An unexpected error occurred." };
    }
}

export async function createLabelAction(prevState: FormState, formData: FormData): Promise<FormState> {
    const validatedFields = LabelSchema.pick({
        collectionId: true,
        name: true,
        description: true,
        color: true,
        icon: true,
    }).extend({
        assignPermissions: z.string()
    }).safeParse({
        collectionId: formData.get('collectionId'),
        name: formData.get('name'),
        description: formData.get('description'),
        color: formData.get('color'),
        icon: formData.get('icon'),
        assignPermissions: formData.get('assignPermissions'),
    });

    if (!validatedFields.success) {
        console.log(validatedFields.error.flatten().fieldErrors);
        return {
            message: "Validation failed",
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    try {
        const { collectionId, name, description, color, icon, assignPermissions } = validatedFields.data;
        await createLabel({
            collectionId,
            name,
            description,
            color,
            icon,
            assignPermissions: {
                type: assignPermissions as "anyone" | "specific_users" | "team_admins" | "team_members",
            }
        });
        revalidatePath(`/collections/${collectionId}`);
        return { message: "Label created" };
    } catch (e) {
        console.error(e);
        return { message: "Failed to create label", error: "An unexpected error occurred." };
    }
}

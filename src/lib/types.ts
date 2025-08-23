import { z } from 'zod';

export const AssignPermissionsSchema = z.object({
  type: z.enum(["anyone", "specific_users", "team_admins", "team_members"]),
  allowedIds: z.array(z.string()).optional(),
});

export type AssignPermissions = z.infer<typeof AssignPermissionsSchema>;

export const LabelSchema = z.object({
  id: z.string(),
  collectionId: z.string(),
  name: z.string(),
  color: z.string(),
  icon: z.string(),
  description: z.string().optional(),
  assignPermissions: AssignPermissionsSchema,
  ownerId: z.string(),
});

export type Label = z.infer<typeof LabelSchema>;

export const CollectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  ownerId: z.string(),
  isShared: z.boolean().default(false),
  labels: z.array(LabelSchema).optional(),
});

export type Collection = z.infer<typeof CollectionSchema>;

export const PhaseSchema = z.object({
    id: z.string(),
    projectId: z.string(),
    name: z.string().min(1, { message: "Phase name is required." }),
    startDate: z.string().min(1, { message: "Start date is required." }),
    endDate: z.string().min(1, { message: "End date is required." }),
    ownerId: z.string(),
});

export type Phase = z.infer<typeof PhaseSchema>;

export const EventSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  name: z.string().min(1, { message: "Event name is required." }),
  startDate: z.string().min(1, { message: "Start date is required." }),
  endDate: z.string().min(1, { message: "End date is required." }),
  location: z.string().optional(),
  guestEmails: z.array(z.string()).optional(),
  googleEventId: z.string().optional(),
  ownerId: z.string(),
  isShared: z.boolean().default(false),
  labels: z.record(z.string()).optional(),
});

export type Event = z.infer<typeof EventSchema>;

export const ProjectSchema = z.object({
    id: z.string(),
    name: z.string().min(1, { message: "Project name is required." }),
    description: z.string().optional(),
    ownerId: z.string(),
    isShared: z.boolean().default(false),
    phases: z.array(PhaseSchema).optional(),
    events: z.array(EventSchema).optional(),
});

export type Project = z.infer<typeof ProjectSchema>;

export const LinkedEntitySchema = z.object({
    id: z.string(),
    type: z.enum(['collection', 'project', 'task']),
    linkedAt: z.date(),
});

export type LinkedEntity = z.infer<typeof LinkedEntitySchema>;

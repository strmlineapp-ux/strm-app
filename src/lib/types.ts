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
    name: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    ownerId: z.string(),
});
  
export type Phase = z.infer<typeof PhaseSchema>;

export const ProjectSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    ownerId: z.string(),
    isShared: z.boolean().default(false),
    phases: z.array(PhaseSchema).optional(),
});

export type Project = z.infer<typeof ProjectSchema>;

export const LinkedEntitySchema = z.object({
    id: z.string(),
    type: z.enum(['collection', 'project', 'task']),
    linkedAt: z.date(),
});

export type LinkedEntity = z.infer<typeof LinkedEntitySchema>;

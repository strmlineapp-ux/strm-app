"use client";
import Header from "@/components/layout/header";
import { SidebarInset } from "@/components/ui/sidebar";
import { deletePhase, getProjectById, updatePhase } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Project, Phase } from "@/lib/types";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  PlusCircle,
  EllipsisVertical,
  Trash2,
  Edit,
} from "lucide-react";
import React, { useEffect, useState, useActionState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPhaseAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"

function SubmitButton({ isEditing }: { isEditing?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (isEditing ? "Saving..." : "Creating...") : (isEditing ? "Save Changes" : "Create Phase")}
    </Button>
  );
}

function CreatePhaseDialog({
  projectId,
  open,
  onOpenChange,
}: {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const [state, formAction] = useActionState(createPhaseAction, {
    message: "",
  });

  useEffect(() => {
    if (state.message) {
      if (state.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: state.error,
        });
      } else {
        toast({
          title: "Success",
          description: state.message,
        });
        onOpenChange(false);
      }
    }
  }, [state, toast, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2" />
          Create Phase
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <form action={formAction}>
          <input type="hidden" name="projectId" value={projectId} />
          <DialogHeader>
            <DialogTitle>Create New Phase</DialogTitle>
            <DialogDescription>
              Phases help you break down your project into manageable stages.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" name="name" className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                Start Date
              </Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                End Date
              </Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PhaseRow({ phase, onPhaseDeleted }: { phase: Phase, onPhaseDeleted: (phaseId: string) => void }) {
    const { toast } = useToast();
    const [isDeleting, startDeleteTransition] = useTransition();


    const handleDelete = async () => {
        startDeleteTransition(async () => {
            try {
                await deletePhase(phase.projectId, phase.id);
                onPhaseDeleted(phase.id);
                toast({
                    title: 'Success',
                    description: 'Phase deleted successfully.'
                })
            } catch (error) {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Failed to delete phase.'
                })
            }
        });
    };

  return (
    <TableRow key={phase.id}>
      <TableCell className="font-medium">{phase.name}</TableCell>
      <TableCell>{phase.startDate}</TableCell>
      <TableCell>{phase.endDate}</TableCell>
      <TableCell className="text-right">
      <AlertDialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <EllipsisVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
            </AlertDialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This will permanently delete the phase. This action cannot be undone.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                    {isDeleting ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
}

export default function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [project, setProject] = useState<Project | null | undefined>(undefined);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  const fetchProject = async () => {
    const projectData = await getProjectById(params.id);
    setProject(projectData);
  };

  useEffect(() => {
    fetchProject();
  }, [params.id, openCreateDialog]);

  const handlePhaseDeleted = (phaseId: string) => {
    setProject(prev => prev ? ({...prev, phases: prev.phases?.filter(p => p.id !== phaseId)}) : null);
  }

  if (project === undefined) {
    return (
      <SidebarInset>
        <Header />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <p>Loading...</p>
        </main>
      </SidebarInset>
    );
  }

  if (!project) {
    return (
      <SidebarInset>
        <Header />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <h1 className="text-2xl font-bold">Project not found</h1>
        </main>
      </SidebarInset>
    );
  }

  return (
    <SidebarInset>
      <Header />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/projects">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Projects
              </Link>
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {project.name}
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">
                  {project.description}
                </p>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Phases</CardTitle>
                <CreatePhaseDialog
                  projectId={params.id}
                  open={openCreateDialog}
                  onOpenChange={setOpenCreateDialog}
                />
              </div>
              <CardDescription>
                The stages or milestones of your project.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {project.phases && project.phases.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {project.phases.map((phase) => (
                      <PhaseRow key={phase.id} phase={phase} onPhaseDeleted={handlePhaseDeleted} />
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center text-muted-foreground p-8 border-dashed border-2 rounded-lg">
                    <Calendar className="mx-auto h-12 w-12" />
                    <h3 className="mt-4 text-lg font-semibold">No Phases Yet</h3>
                    <p className="mt-1 text-sm">Get started by creating the first phase for your project.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </SidebarInset>
  );
}

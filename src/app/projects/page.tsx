"use client";
import Header from "@/components/layout/header";
import { SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { getProjects, updateProject, deleteProject } from "@/lib/firestore";
import { Project } from "@/lib/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Share2, PlusCircle, EllipsisVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import React, { useEffect, useState, useTransition, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createProjectAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/context/user-context";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating..." : "Create Project"}
    </Button>
  );
}

function CreateProjectDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const [state, formAction] = useActionState(createProjectAction, {
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
          Create Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Projects help you organize your work and collaborate with your team.
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
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                name="description"
                placeholder="A short description of the project"
                className="col-span-3"
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

function ProjectCard({ project, onProjectDeleted }: { project: Project, onProjectDeleted: (id: string) => void }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSharePending, startShareTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();


  const handleShareToggle = async () => {
    startShareTransition(async () => {
        try {
            await updateProject(project.id, { isShared: !project.isShared });
            router.refresh();
            toast({
                title: "Success",
                description: `Project ${project.isShared ? 'unshared' : 'shared'}.`
            })
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to update project sharing status.'
            })
        }
    });
  };

  const handleDelete = () => {
    startDeleteTransition(async () => {
        try {
            await deleteProject(project.id);
            onProjectDeleted(project.id);
            toast({
                title: 'Success',
                description: 'Project deleted successfully.'
            })
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to delete project.'
            })
        }
    })
  }
    
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{project.name}</CardTitle>
            <CardDescription className="mt-1">
              {project.description}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <EllipsisVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleShareToggle} disabled={isSharePending}>
                <Share2 className="mr-2 h-4 w-4" />
                <span>{isSharePending ? 'Updating...' : (project.isShared ? "Unshare" : "Share")}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        {project.isShared && <Badge variant="secondary">Shared</Badge>}
      </CardContent>
      <CardFooter>
        <Button variant="link" asChild className="p-0 h-auto">
            <Link
            href={`/projects/${project.id}`}
            className="block text-primary hover:underline"
            >
            View Details
            </Link>
        </Button>
      </CardFooter>
      <AlertDialogContent>
        <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your project.
            </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeletePending} className="bg-destructive hover:bg-destructive/90">
                {isDeletePending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </Card>
  );
}

export default function ProjectsPage() {
  const { user, loading: userLoading } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  useEffect(() => {
    if (userLoading || !user) {
        if (!userLoading) setIsLoading(false);
        return;
    }
    const fetchProjects = async () => {
        setIsLoading(true);
        const projectsData = await getProjects(user.uid);
        setProjects(projectsData);
        setIsLoading(false);
    };
    fetchProjects();
  }, [user, userLoading]);

  const handleProjectCreated = () => {
    setOpenCreateDialog(false);
    if (user) {
        getProjects(user.uid).then(setProjects);
    }
  }

  const handleProjectDeleted = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  }

  const isLoadingData = isLoading || userLoading;


  return (
    <SidebarInset>
      <Header />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
      <AlertDialog>
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                My Projects
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Manage your personal projects.
              </p>
            </div>
            { user && <CreateProjectDialog open={openCreateDialog} onOpenChange={ (isOpen) => { setOpenCreateDialog(isOpen); if (!isOpen) handleProjectCreated(); }}/> }
          </div>
            {isLoadingData ? (
                <p>Loading projects...</p>
            ) : !user ? (
                <p>Please sign in to view your projects.</p>
            ): (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                    <ProjectCard key={project.id} project={project} onProjectDeleted={handleProjectDeleted} />
                    ))}
                </div>
            )}
        </div>
      </AlertDialog>
      </main>
    </SidebarInset>
  );
}

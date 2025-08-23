"use client";
import Header from "@/components/layout/header";
import { SidebarInset } from "@/components/ui/sidebar";
import { deleteEvent, deletePhase, getProjectById, updatePhase } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Project, Phase, Event } from "@/lib/types";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  PlusCircle,
  EllipsisVertical,
  Trash2,
  Edit,
  Video,
  MapPin,
  Users
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
import { createPhaseAction, upsertEventAction } from "@/lib/actions";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon } from "@/components/ui/calendar"
import { format, parseISO } from 'date-fns'

function SubmitButton({ isEditing }: { isEditing?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (isEditing ? "Saving..." : "Creating...") : (isEditing ? "Save Changes" : "Create")}
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

function UpsertEventDialog({
    projectId,
    event,
    open,
    onOpenChange,
  }: {
    projectId: string;
    event?: Event | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) {
    const { toast } = useToast();
    const isEditing = !!event;
    const [state, formAction] = useActionState(upsertEventAction, { message: "" });
  
    useEffect(() => {
      if (state.message) {
        if (state.error) {
          toast({ variant: "destructive", title: "Error", description: state.error });
        } else {
          toast({ title: "Success", description: state.message });
          onOpenChange(false);
        }
      }
    }, [state, toast, onOpenChange]);
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          { !isEditing && <Button><PlusCircle className="mr-2" />Create Event</Button> }
        </DialogTrigger>
        <DialogContent className="sm:max-w-[525px]">
          <form action={formAction}>
            <input type="hidden" name="projectId" value={projectId} />
            {isEditing && <input type="hidden" name="eventId" value={event.id} />}
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Event" : "Create New Event"}</DialogTitle>
              <DialogDescription>
                Schedule and manage your project events.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" name="name" defaultValue={event?.name} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startDate" className="text-right">Start Date</Label>
                <Input id="startDate" name="startDate" type="date" defaultValue={event?.startDate} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endDate" className="text-right">End Date</Label>
                <Input id="endDate" name="endDate" type="date" defaultValue={event?.endDate} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">Location</Label>
                <Input id="location" name="location" defaultValue={event?.location} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="guestEmails" className="text-right">Guests</Label>
                <Input id="guestEmails" name="guestEmails" placeholder="comma, separated, emails" defaultValue={event?.guestEmails?.join(', ')} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <SubmitButton isEditing={isEditing} />
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
}

function EventCard({ event, onEventDeleted, onEventEdited }: { event: Event, onEventDeleted: (eventId: string) => void, onEventEdited: (event: Event) => void }) {
    const { toast } = useToast();
    const [isDeleting, startDeleteTransition] = useTransition();

    const handleDelete = async () => {
        startDeleteTransition(async () => {
            try {
                await deleteEvent(event.projectId, event.id);
                onEventDeleted(event.id);
                toast({ title: 'Success', description: 'Event deleted successfully.' });
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete event.' });
            }
        });
    };

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle>{event.name}</CardTitle>
                    <AlertDialog>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><EllipsisVertical className="h-5 w-5" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onEventEdited(event)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                                </AlertDialogTrigger>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>This will permanently delete the event. This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
                <CardDescription>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{format(parseISO(event.startDate), "PPP")} - {format(parseISO(event.endDate), "PPP")}</span>
                    </div>
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
                {event.location && <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /><span>{event.location}</span></div>}
                {event.guestEmails && event.guestEmails.length > 0 && <div className="flex items-center gap-2"><Users className="h-4 w-4" /><span>{event.guestEmails.join(', ')}</span></div>}
            </CardContent>
        </Card>
    )
}

function EventsCalendarView({ events, onDateClick, onEventClick }: { events: Event[], onDateClick: (date: Date) => void, onEventClick: (event: Event) => void }) {
    const calendarEvents = events.map(event => ({
        ...event,
        date: parseISO(event.startDate), // Or use a range
    }));

    return (
        <CalendarIcon
            mode="multiple"
            selected={calendarEvents.map(e => e.date)}
            onDayClick={(day, modifiers) => {
                if (!modifiers.disabled) {
                    onDateClick(day);
                }
            }}
            components={{
                DayContent: ({ date }) => {
                  const dailyEvents = events.filter(e => format(parseISO(e.startDate), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
                  return (
                    <div className="relative h-full w-full">
                      <p>{date.getDate()}</p>
                      {dailyEvents.length > 0 && (
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                          {dailyEvents.slice(0, 3).map(e => (
                             <div key={e.id} className="h-1.5 w-1.5 rounded-full bg-primary" onClick={(ev) => { ev.stopPropagation(); onEventClick(e); }}></div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
            }}
            className="rounded-md border"
        />
    )
}

export default function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [project, setProject] = useState<Project | null | undefined>(undefined);
  const [openCreatePhaseDialog, setOpenCreatePhaseDialog] = useState(false);
  const [openUpsertEventDialog, setOpenUpsertEventDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const fetchProject = async () => {
    const projectData = await getProjectById(params.id);
    setProject(projectData);
  };

  useEffect(() => {
    fetchProject();
  }, [params.id, openCreatePhaseDialog, openUpsertEventDialog]);

  const handlePhaseDeleted = (phaseId: string) => {
    setProject(prev => prev ? ({...prev, phases: prev.phases?.filter(p => p.id !== phaseId)}) : null);
  }

  const handleEventDeleted = (eventId: string) => {
    setProject(prev => prev ? ({...prev, events: prev.events?.filter(e => e.id !== eventId)}) : null);
  }
  
  const handleEventEdited = (event: Event) => {
    setSelectedEvent(event);
    setOpenUpsertEventDialog(true);
  };

  const handleCalendarDateClick = (date: Date) => {
    // Potentially open create dialog with date pre-filled
    setSelectedEvent(null);
    setOpenUpsertEventDialog(true);
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
        <Tabs defaultValue="phases">
            <div className="flex justify-between items-center mb-4">
                <TabsList>
                    <TabsTrigger value="phases">Phases</TabsTrigger>
                    <TabsTrigger value="events">Events</TabsTrigger>
                </TabsList>
                <div className="flex gap-2">
                    <CreatePhaseDialog
                        projectId={params.id}
                        open={openCreatePhaseDialog}
                        onOpenChange={setOpenCreatePhaseDialog}
                    />
                     <UpsertEventDialog
                        projectId={params.id}
                        event={selectedEvent}
                        open={openUpsertEventDialog}
                        onOpenChange={(isOpen) => {
                            setOpenUpsertEventDialog(isOpen);
                            if (!isOpen) setSelectedEvent(null);
                        }}
                    />
                </div>
            </div>
            
            <TabsContent value="phases">
                <Card>
                    <CardHeader>
                        <CardTitle>Project Phases</CardTitle>
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
            </TabsContent>
            <TabsContent value="events">
                <Card>
                    <CardHeader>
                        <CardTitle>Project Events</CardTitle>
                        <CardDescription>All scheduled events for this project.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    {project.events && project.events.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           <div className="md:col-span-1">
                             <EventsCalendarView events={project.events} onDateClick={handleCalendarDateClick} onEventClick={handleEventEdited}/>
                           </div>
                           <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">
                             {project.events.map((event) => (
                                <EventCard key={event.id} event={event} onEventDeleted={handleEventDeleted} onEventEdited={handleEventEdited}/>
                             ))}
                           </div>
                        </div>

                    ) : (
                        <div className="text-center text-muted-foreground p-8 border-dashed border-2 rounded-lg">
                            <Video className="mx-auto h-12 w-12" />
                            <h3 className="mt-4 text-lg font-semibold">No Events Yet</h3>
                            <p className="mt-1 text-sm">Get started by creating the first event for your project.</p>
                        </div>
                    )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>

        </div>
      </main>
    </SidebarInset>
  );
}

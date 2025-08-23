"use client";
import Header from "@/components/layout/header";
import { SidebarInset } from "@/components/ui/sidebar";
import { getCollectionById } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label as UiLabel } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label, Collection } from "@/lib/types";
import Link from "next/link";
import {
  ArrowLeft,
  EllipsisVertical,
  PlusCircle,
  GripVertical,
} from "lucide-react";
import React, { useEffect, useState, useTransition, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createLabelAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";

function SubmitButton() {
    const [isPending, startTransition] = useTransition();
    const { pending } = useFormStatus();
    return (
      <Button type="submit" disabled={pending}>
        {pending ? "Creating..." : "Create Label"}
      </Button>
    );
  }

function CreateLabelDialog({ collectionId, open, onOpenChange }: { collectionId: string, open: boolean, onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const initialState = { message: "", collectionId };
  const [state, formAction] = useActionState(createLabelAction, initialState);

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
          Create Label
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <form action={formAction}>
            <input type="hidden" name="collectionId" value={collectionId} />
          <DialogHeader>
            <DialogTitle>Create New Label</DialogTitle>
            <DialogDescription>
              Labels help you categorize and organize your items.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <UiLabel htmlFor="name" className="text-right">
                Name
              </UiLabel>
              <Input id="name" name="name" className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <UiLabel htmlFor="description" className="text-right">
                Description
              </UiLabel>
              <Input
                id="description"
                name="description"
                placeholder="A short description"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <UiLabel htmlFor="color" className="text-right">
                Color
              </UiLabel>
              <Input
                id="color"
                name="color"
                type="color"
                defaultValue="#A9A9A9"
                className="p-1"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <UiLabel htmlFor="icon" className="text-right">
                Icon
              </UiLabel>
              <Input
                id="icon"
                name="icon"
                placeholder="e.g., 'Tag'"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <UiLabel className="text-right">Permissions</UiLabel>
              <Select name="assignPermissions" defaultValue="team_admins">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select who can assign" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="anyone">Anyone</SelectItem>
                  <SelectItem value="specific_users">Specific Users</SelectItem>
                  <SelectItem value="team_admins">Team Admins</SelectItem>
                  <SelectItem value="team_members">Team Members</SelectItem>
                </SelectContent>
              </Select>
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

function LabelRow({ label }: { label: Label }) {
  return (
    <TableRow key={label.id}>
      <TableCell className="w-8">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </TableCell>
      <TableCell className="font-medium">
        <div className="flex items-center gap-3">
          <div
            className="h-4 w-4 rounded-full"
            style={{ backgroundColor: label.color }}
          />
          <span>{label.name}</span>
        </div>
      </TableCell>
      <TableCell>{label.description}</TableCell>
      <TableCell>
        <Badge variant="outline">
          {label.assignPermissions.type.replace("_", " ")}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <EllipsisVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Set Permissions</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export default function CollectionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [collection, setCollection] = useState<Collection | null | undefined>(undefined);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  useEffect(() => {
    const fetchCollection = async () => {
        const collectionData = await getCollectionById(params.id);
        setCollection(collectionData);
    };
    fetchCollection();
  }, [params.id, openCreateDialog]);

  if (collection === undefined) {
    return (
        <SidebarInset>
            <Header />
            <main className="flex-1 p-4 md:p-6 lg:p-8">
            <p>Loading...</p>
            </main>
        </SidebarInset>
    )
  }

  if (!collection) {
    return (
      <SidebarInset>
        <Header />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <h1 className="text-2xl font-bold">Collection not found</h1>
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
              <Link href="/collections">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Collections
              </Link>
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {collection.name}
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">
                  {collection.description}
                </p>
              </div>
              <CreateLabelDialog collectionId={params.id} open={openCreateDialog} onOpenChange={setOpenCreateDialog}/>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Labels</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collection.labels?.map((label) => (
                    <LabelRow key={label.id} label={label} />
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </SidebarInset>
  );
}

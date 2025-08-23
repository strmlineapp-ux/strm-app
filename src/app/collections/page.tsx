"use client";
import Header from "@/components/layout/header";
import { SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { getCollections, updateCollection } from "@/lib/firestore";
import { Collection } from "@/lib/types";
import Link from "next/link";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Share2, PlusCircle, EllipsisVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import React, { useEffect, useState, useTransition, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createCollectionAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { revalidatePath } from "next/cache";
import { useRouter } from "next/navigation";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating..." : "Create Collection"}
    </Button>
  );
}

function CreateCollectionDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const [state, formAction] = useActionState(createCollectionAction, {
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
          Create Collection
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>Create New Collection</DialogTitle>
            <DialogDescription>
              Collections are used to group and organize your labels.
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
                placeholder="A short description of the collection"
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

function CollectionCard({ collection }: { collection: Collection }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleShareToggle = async () => {
    startTransition(async () => {
        await updateCollection(collection.id, { isShared: !collection.isShared });
        router.refresh();
    });
  };
    
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{collection.name}</CardTitle>
            <CardDescription className="mt-1">
              {collection.description}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <EllipsisVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleShareToggle} disabled={isPending}>
                <Share2 className="mr-2 h-4 w-4" />
                <span>{isPending ? 'Updating...' : (collection.isShared ? "Unshare" : "Share")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        {collection.isShared && <Badge variant="secondary">Shared</Badge>}
      </CardContent>
      <CardFooter>
        <Button variant="link" asChild className="p-0 h-auto">
            <Link
            href={`/collections/${collection.id}`}
            className="block text-primary hover:underline"
            >
            View Details
            </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  useEffect(() => {
    const fetchCollections = async () => {
      setIsLoading(true);
      const collectionsData = await getCollections();
      setCollections(collectionsData);
      setIsLoading(false);
    };
    fetchCollections();
  }, [openCreateDialog]);


  return (
    <SidebarInset>
      <Header />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Collections
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Manage your shared and personal collections of labels.
              </p>
            </div>
            <CreateCollectionDialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}/>
          </div>
            {isLoading ? (
                <p>Loading collections...</p>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {collections.map((collection) => (
                    <CollectionCard key={collection.id} collection={collection} />
                    ))}
                </div>
            )}
        </div>
      </main>
    </SidebarInset>
  );
}

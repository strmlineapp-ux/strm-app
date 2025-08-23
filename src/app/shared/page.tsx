"use client";

import { useEffect, useState, useTransition } from "react";
import Header from "@/components/layout/header";
import { SidebarInset } from "@/components/ui/sidebar";
import {
  getSharedCollections,
  getLinkedCollectionIds,
  linkCollection,
  unlinkCollection,
} from "@/lib/firestore";
import { Collection } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Link2, Link2Off, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MOCK_USER_ID = "user1";

function SharedCollectionCard({
  collection,
  isLinked,
  onLinkToggle,
  isToggling,
}: {
  collection: Collection;
  isLinked: boolean;
  onLinkToggle: (collectionId: string) => void;
  isToggling: boolean;
}) {
  const isOwner = collection.ownerId === MOCK_USER_ID;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{collection.name}</CardTitle>
            <CardDescription className="mt-1">
              {collection.description}
            </CardDescription>
            {isOwner && (
              <Badge variant="secondary" className="mt-2">
                Owned by you
              </Badge>
            )}
          </div>
          {!isOwner && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onLinkToggle(collection.id)}
              disabled={isToggling}
              aria-label={isLinked ? "Unlink" : "Link"}
            >
              {isToggling ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isLinked ? (
                <Link2Off className="h-5 w-5 text-primary" />
              ) : (
                <Link2 className="h-5 w-5" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>
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

export default function SharedPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [linkedIds, setLinkedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [sharedCollections, linkedCollectionIds] = await Promise.all([
        getSharedCollections(),
        getLinkedCollectionIds(MOCK_USER_ID),
      ]);
      setCollections(sharedCollections);
      setLinkedIds(new Set(linkedCollectionIds));
    } catch (error) {
      console.error("Failed to fetch shared data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load shared collections.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleLinkToggle = async (collectionId: string) => {
    setTogglingId(collectionId);
    try {
      if (linkedIds.has(collectionId)) {
        await unlinkCollection(MOCK_USER_ID, collectionId);
        setLinkedIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(collectionId);
          return newSet;
        });
        toast({ title: "Success", description: "Collection unlinked." });
      } else {
        await linkCollection(MOCK_USER_ID, collectionId);
        setLinkedIds((prev) => new Set(prev).add(collectionId));
        toast({ title: "Success", description: "Collection linked." });
      }
    } catch (error) {
      console.error("Failed to toggle link:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <SidebarInset>
      <Header />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Shared Collections
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Discover and link collections shared by others.
            </p>
          </div>

          {isLoading ? (
            <p>Loading shared collections...</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {collections.map((collection) => (
                <SharedCollectionCard
                  key={collection.id}
                  collection={collection}
                  isLinked={linkedIds.has(collection.id)}
                  onLinkToggle={handleLinkToggle}
                  isToggling={togglingId === collection.id}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </SidebarInset>
  );
}

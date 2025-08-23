"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/header";
import { SidebarInset } from "@/components/ui/sidebar";
import {
  getSharedCollections,
  getSharedProjects,
  getLinkedEntityIds,
  linkEntity,
  unlinkEntity,
} from "@/lib/firestore";
import { Collection, Project } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Link2, Link2Off, Loader2, Library, FolderKanban } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MOCK_USER_ID = "user1";

function SharedCollectionCard({
  collection,
  isLinked,
  onLinkToggle,
  isToggling,
}: {
  collection: Collection;
  isLinked: boolean;
  onLinkToggle: (collectionId: string, type: 'collection') => void;
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
          </div>
          {!isOwner && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onLinkToggle(collection.id, 'collection')}
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
      <CardContent>
        {isOwner && (
          <Badge variant="secondary" className="mt-2">
            Owned by you
          </Badge>
        )}
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

function SharedProjectCard({
    project,
    isLinked,
    onLinkToggle,
    isToggling,
  }: {
    project: Project;
    isLinked: boolean;
    onLinkToggle: (projectId: string, type: 'project') => void;
    isToggling: boolean;
  }) {
    const isOwner = project.ownerId === MOCK_USER_ID;
  
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
            {!isOwner && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onLinkToggle(project.id, 'project')}
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
        <CardContent>
            {isOwner && (
                <Badge variant="secondary" className="mt-2">
                    Owned by you
                </Badge>
            )}
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
      </Card>
    );
  }

export default function SharedPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [linkedIds, setLinkedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [
        sharedCollections,
        sharedProjects,
        linkedCollectionIds,
        linkedProjectIds,
      ] = await Promise.all([
        getSharedCollections(),
        getSharedProjects(),
        getLinkedEntityIds(MOCK_USER_ID, 'collection'),
        getLinkedEntityIds(MOCK_USER_ID, 'project'),
      ]);
      setCollections(sharedCollections);
      setProjects(sharedProjects);
      setLinkedIds(new Set([...linkedCollectionIds, ...linkedProjectIds]));
    } catch (error) {
      console.error("Failed to fetch shared data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load shared items.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleLinkToggle = async (entityId: string, type: 'collection' | 'project') => {
    setTogglingId(entityId);
    try {
      if (linkedIds.has(entityId)) {
        await unlinkEntity(MOCK_USER_ID, entityId);
        setLinkedIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(entityId);
          return newSet;
        });
        toast({ title: "Success", description: `${type.charAt(0).toUpperCase() + type.slice(1)} unlinked.` });
      } else {
        await linkEntity(MOCK_USER_ID, entityId, type);
        setLinkedIds((prev) => new Set(prev).add(entityId));
        toast({ title: "Success", description: `${type.charAt(0).toUpperCase() + type.slice(1)} linked.` });
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
              Shared Pool
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Discover and link collections and projects shared by others.
            </p>
          </div>

          <Tabs defaultValue="collections">
            <TabsList className="mb-6">
                <TabsTrigger value="collections">
                    <Library className="mr-2"/>
                    Collections ({collections.length})
                </TabsTrigger>
                <TabsTrigger value="projects">
                    <FolderKanban className="mr-2"/>
                    Projects ({projects.length})
                </TabsTrigger>
            </TabsList>
            <TabsContent value="collections">
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
            </TabsContent>
            <TabsContent value="projects">
                {isLoading ? (
                    <p>Loading shared projects...</p>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <SharedProjectCard
                        key={project.id}
                        project={project}
                        isLinked={linkedIds.has(project.id)}
                        onLinkToggle={handleLinkToggle}
                        isToggling={togglingId === project.id}
                        />
                    ))}
                    </div>
                )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </SidebarInset>
  );
}

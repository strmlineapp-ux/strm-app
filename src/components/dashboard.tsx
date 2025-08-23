"use client";

import { useEffect, useState } from "react";
import { getDashboardData } from "@/lib/firestore";
import { Collection, Project } from "@/lib/types";
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
import { Link2, Library, FolderKanban, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MOCK_USER_ID = "user1";

function DashboardCollectionCard({
  collection,
}: {
  collection: Collection & { isLinked?: boolean };
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {collection.isLinked && <Link2 className="h-5 w-5 text-primary" />}
            <CardTitle>{collection.name}</CardTitle>
          </div>
        </div>
        <CardDescription className="mt-1">
          {collection.description}
        </CardDescription>
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

function DashboardProjectCard({
  project,
}: {
  project: Project & { isLinked?: boolean };
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {project.isLinked && <Link2 className="h-5 w-5 text-primary" />}
            <CardTitle>{project.name}</CardTitle>
          </div>
        </div>
        <CardDescription className="mt-1">
          {project.description}
        </CardDescription>
      </CardHeader>
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

export default function Dashboard() {
  const [data, setData] = useState<{
    collections: (Collection & { isLinked?: boolean })[],
    projects: (Project & { isLinked?: boolean })[],
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const dashboardData = await getDashboardData(MOCK_USER_ID);
        setData(dashboardData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load your dashboard.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-12">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Dashboard
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Your central hub for owned and linked items.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-4 text-muted-foreground">Loading your dashboard...</span>
        </div>
      ) : (
        <>
          <section>
            <div className="flex items-center gap-3 mb-6">
                <Library className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">My Collections</h2>
            </div>
            {data?.collections && data.collections.length > 0 ? (
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                 {data.collections.map((collection) => (
                   <DashboardCollectionCard key={collection.id} collection={collection} />
                 ))}
               </div>
            ) : (
                <p className="text-muted-foreground">You don't own or have any linked collections yet.</p>
            )}
          </section>

          <section>
            <div className="flex items-center gap-3 mb-6">
                <FolderKanban className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">My Projects</h2>
            </div>
            {data?.projects && data.projects.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {data.projects.map((project) => (
                    <DashboardProjectCard key={project.id} project={project} />
                ))}
                </div>
            ) : (
                <p className="text-muted-foreground">You don't own or have any linked projects yet.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}

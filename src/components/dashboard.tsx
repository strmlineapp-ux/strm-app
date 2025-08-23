"use client";

import { useEffect, useState } from "react";
import { getDashboardCollections } from "@/lib/firestore";
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
import { Link2 } from "lucide-react";
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

export default function Dashboard() {
  const [collections, setCollections] = useState<
    (Collection & { isLinked?: boolean })[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCollections = async () => {
      setIsLoading(true);
      try {
        const collectionsData = await getDashboardCollections(MOCK_USER_ID);
        setCollections(collectionsData);
      } catch (error) {
        console.error("Failed to fetch dashboard collections:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load your collections.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchCollections();
  }, []);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Dashboard
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Your central hub for owned and linked collections.
        </p>
      </div>
      {isLoading ? (
        <p>Loading your dashboard...</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <DashboardCollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      )}
    </div>
  );
}

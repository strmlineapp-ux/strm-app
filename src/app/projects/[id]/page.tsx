"use client";
import Header from "@/components/layout/header";
import { SidebarInset } from "@/components/ui/sidebar";
import { getProjectById } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Project } from "@/lib/types";
import Link from "next/link";
import {
  ArrowLeft,
} from "lucide-react";
import React, { useEffect, useState } from "react";

export default function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [project, setProject] = useState<Project | null | undefined>(undefined);

  useEffect(() => {
    const fetchProject = async () => {
        const projectData = await getProjectById(params.id);
        setProject(projectData);
    };
    fetchProject();
  }, [params.id]);

  if (project === undefined) {
    return (
        <SidebarInset>
            <Header />
            <main className="flex-1 p-4 md:p-6 lg:p-8">
            <p>Loading...</p>
            </main>
        </SidebarInset>
    )
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
              <CardTitle>Project Details</CardTitle>
              <CardDescription>
                This is where project details and related items will be shown.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Coming soon...</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </SidebarInset>
  );
}

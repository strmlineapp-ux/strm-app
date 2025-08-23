import Header from "@/components/layout/header";
import { SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { getCollections } from "@/lib/firestore";
import { Collection } from "@/lib/types";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Share2, PlusCircle, EllipsisVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>{collection.name}</CardTitle>
                <CardDescription className="mt-1">{collection.description}</CardDescription>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <EllipsisVertical className="h-5 w-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                        <Share2 className="mr-2 h-4 w-4" />
                        <span>{collection.isShared ? 'Unshare' : 'Share'}</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        {collection.isShared && <Badge variant="secondary">Shared</Badge>}
        <Link href={`/collections/${collection.id}`} className="block text-primary hover:underline mt-4">
          View Labels ({collection.labels?.length || 0})
        </Link>
      </CardContent>
    </Card>
  );
}

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <SidebarInset>
      <Header />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Collections</h1>
                    <p className="mt-2 text-lg text-muted-foreground">
                        Manage your shared and personal collections of labels.
                    </p>
                </div>
                <Button>
                    <PlusCircle className="mr-2"/>
                    Create Collection
                </Button>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {collections.map((collection) => (
                    <CollectionCard key={collection.id} collection={collection} />
                ))}
            </div>
        </div>
      </main>
    </SidebarInset>
  );
}

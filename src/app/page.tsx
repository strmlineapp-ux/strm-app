import Header from "@/components/layout/header";
import MeetingNotesAnalyzer from "@/components/meeting-notes-analyzer";
import { SidebarInset } from "@/components/ui/sidebar";

export default function Home() {
  return (
    <SidebarInset>
      <Header />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <MeetingNotesAnalyzer />
      </main>
    </SidebarInset>
  );
}

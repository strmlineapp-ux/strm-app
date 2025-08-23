"use client";

import { useEffect, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { analyzeMeetingNotesAction, FormState } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Lightbulb,
  CalendarDays,
  Users,
  CheckSquare,
} from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? "Analyzing..." : "Analyze Notes"}
    </Button>
  );
}

function AnalysisResults({ result }: { result: FormState["result"] }) {
  if (
    !result ||
    (result.suggestedDates.length === 0 &&
      result.suggestedInvitees.length === 0 &&
      result.suggestedTasks.length === 0)
  ) {
    return (
      <div className="mt-8 rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        <Lightbulb className="mx-auto h-12 w-12" />
        <p className="mt-4 font-medium">No Suggestions Found</p>
        <p className="mt-1 text-sm">
          Try providing more detailed meeting notes for better results.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-6 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <CalendarDays className="h-5 w-5 text-primary" />
            Suggested Dates
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {result.suggestedDates.length > 0 ? (
            result.suggestedDates.map((date, i) => (
              <Badge key={i} variant="secondary" className="text-sm">
                {date}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No dates suggested.</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Users className="h-5 w-5 text-primary" />
            Suggested Invitees
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {result.suggestedInvitees.length > 0 ? (
            result.suggestedInvitees.map((person, i) => (
              <Badge key={i} variant="secondary" className="text-sm">
                {person}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No invitees suggested.
            </p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <CheckSquare className="h-5 w-5 text-primary" />
            Suggested Tasks
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {result.suggestedTasks.length > 0 ? (
            result.suggestedTasks.map((task, i) => (
              <Badge key={i} variant="secondary" className="text-sm">
                {task}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No tasks suggested.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="mt-8 grid gap-6 md:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-6 w-1/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AnalysisSection({ formState }: { formState: FormState }) {
  const { pending } = useFormStatus();

  if (pending) {
    return <LoadingSkeleton />;
  }

  if (formState.result) {
    return <AnalysisResults result={formState.result} />;
  }

  if (!formState.error && !formState.result) {
    return (
      <div className="mt-8 rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        <Lightbulb className="mx-auto h-12 w-12" />
        <p className="mt-4 font-medium">Ready to Analyze</p>
        <p className="mt-1 text-sm">
          Your suggestions will appear here once you analyze your notes.
        </p>
      </div>
    );
  }

  return null;
}

export default function MeetingNotesAnalyzer() {
  const initialState: FormState = { message: "" };
  const [state, formAction] = useActionState(
    analyzeMeetingNotesAction,
    initialState
  );
  const { toast } = useToast();

  useEffect(() => {
    if (state.error) {
      toast({
        variant: "destructive",
        title: "Analysis Error",
        description: state.error,
      });
    }
  }, [state, toast]);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="text-center">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          AI Meeting Note Analysis
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Paste your meeting notes below and our AI will suggest potential
          dates, invitees, and tasks.
        </p>
      </div>

      <form action={formAction} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Meeting Notes</CardTitle>
            <CardDescription>
              Enter the raw text from your meeting notes below. For best
              results, include names, dates, and action items.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full gap-2">
              <Label htmlFor="meetingNotes" className="sr-only">
                Meeting Notes
              </Label>
              <Textarea
                id="meetingNotes"
                name="meetingNotes"
                placeholder="e.g., 'Team sync on May 15. Alice to schedule follow-up with Bob about the Q3 report. We should also invite Carol.'"
                className="min-h-[200px] text-base"
                required
              />
              {state.error && (
                <p className="text-sm font-medium text-destructive">
                  {state.error}
                </p>
              )}
            </div>
            <div className="flex justify-end">
              <SubmitButton />
            </div>
          </CardContent>
        </Card>

        <AnalysisSection formState={state} />
      </form>
    </div>
  );
}

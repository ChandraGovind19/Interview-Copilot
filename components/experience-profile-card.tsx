"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ExperienceProfile } from "@/lib/types";

interface ExperienceProfileCardProps {
  initialProfile: ExperienceProfile | null;
  isSupabaseConfigured: boolean;
}

function formatProfileDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function ExperienceProfileCard({
  initialProfile,
  isSupabaseConfigured,
}: ExperienceProfileCardProps) {
  const [profile, setProfile] = useState<ExperienceProfile | null>(initialProfile);
  const [title, setTitle] = useState(initialProfile?.title ?? "Core interview background");
  const [targetRole, setTargetRole] = useState(initialProfile?.targetRole ?? "");
  const [sourceText, setSourceText] = useState(initialProfile?.sourceText ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSaveProfile() {
    setError(null);
    setNotice(null);
    setSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          targetRole: targetRole.trim() || undefined,
          sourceText: sourceText.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.formErrors?.[0] ?? data.error ?? "Unable to save profile.");
      }

      setProfile(data);
      setTitle(data.title);
      setTargetRole(data.targetRole ?? "");
      setSourceText(data.sourceText);
      setNotice("Experience profile saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteProfile() {
    setError(null);
    setNotice(null);
    setDeleting(true);

    try {
      const response = await fetch("/api/profile", { method: "DELETE" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to delete profile.");
      }

      setProfile(null);
      setTitle("Core interview background");
      setTargetRole("");
      setSourceText("");
      setConfirmDelete(false);
      setNotice("Experience profile deleted.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete profile.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Card className="surface-soft border-border/70 shadow-none">
      <CardHeader>
        <CardTitle className="text-4xl text-foreground">Experience profile</CardTitle>
        <CardDescription>
          Paste resume-style background, project summaries, internships, leadership, or other
          experience so the next features can generate more personal interview practice.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-[24px] border border-amber-300/60 bg-amber-50/80 p-5 text-sm leading-7 text-amber-950">
          <p className="font-semibold">Privacy note</p>
          <p className="mt-2">
            Only paste information you are comfortable using for AI-generated coaching. Remove
            phone numbers, addresses, personal email addresses, student IDs, or any other
            sensitive information you do not want to share.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="profile-title">
                Profile label
              </label>
              <Input
                id="profile-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Core interview background"
                disabled={!isSupabaseConfigured}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="profile-role">
                Target role
              </label>
              <Input
                id="profile-role"
                value={targetRole}
                onChange={(event) => setTargetRole(event.target.value)}
                placeholder="Software Engineering Intern"
                disabled={!isSupabaseConfigured}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="profile-source">
                Experience text
              </label>
              <Textarea
                id="profile-source"
                rows={14}
                value={sourceText}
                onChange={(event) => setSourceText(event.target.value)}
                placeholder="Paste resume bullets, internships, projects, leadership, research, or extracurricular experience here."
                className="min-h-[320px] bg-white/70"
                disabled={!isSupabaseConfigured}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="surface-subtle p-5">
              <p className="metric-label">Status</p>
              <p className="mt-3 text-lg font-semibold text-foreground">
                {profile ? "Profile saved" : "No profile yet"}
              </p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                {profile
                  ? "This profile can be reused for future question generation and role-specific interview practice."
                  : "Save one strong background summary here before generating personalized interview questions."}
              </p>
            </div>

            <div className="surface-subtle p-5">
              <p className="metric-label">Last updated</p>
              <p className="mt-3 text-lg font-semibold text-foreground">
                {profile ? formatProfileDate(profile.updatedAt) : "Not saved"}
              </p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Keep this summary concise and relevant. Focus on impact, ownership, and measurable
                outcomes.
              </p>
            </div>

            <div className="space-y-3 rounded-[24px] border border-border/70 bg-background/55 p-5 dark:bg-card/45">
              <p className="metric-label">Recommended structure</p>
              <ul className="space-y-2 text-sm leading-7 text-muted-foreground">
                <li>- 1-2 internships or work experiences</li>
                <li>- 2-4 projects with impact and tools used</li>
                <li>- leadership, teamwork, or conflict examples</li>
                <li>- outcomes with metrics where possible</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={handleSaveProfile} disabled={saving || deleting || !isSupabaseConfigured}>
            {saving ? "Saving profile..." : profile ? "Save updates" : "Save experience profile"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setConfirmDelete(true)}
            disabled={!profile || deleting || saving || !isSupabaseConfigured}
          >
            Delete profile
          </Button>
        </div>

        {notice ? <p className="text-sm leading-7 text-emerald-700">{notice}</p> : null}
        {error ? <p className="text-sm leading-7 text-red-700">{error}</p> : null}
        {!isSupabaseConfigured ? (
          <p className="text-sm leading-7 text-amber-700">
            Add the Supabase environment variables before saving the experience profile.
          </p>
        ) : null}

        {confirmDelete ? (
          <div className="rounded-[24px] border border-border/70 bg-background/70 p-5 dark:bg-card/50">
            <p className="font-semibold text-foreground">Delete this experience profile?</p>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              This removes the saved background text used for future personalization features. This
              does not delete your sessions.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => setConfirmDelete(false)} disabled={deleting}>
                Cancel
              </Button>
              <Button onClick={handleDeleteProfile} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete profile"}
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

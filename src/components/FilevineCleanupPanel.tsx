import { Database, Link2, Search, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/StatCard";
import { useFilevineCaseReconciliationCandidates, useFilevineCaseReconciliationSummary } from "@/hooks/useSupabaseData";

const FilevineCleanupPanel = () => {
  const { data: summary, isLoading: summaryLoading, error: summaryError } = useFilevineCaseReconciliationSummary();
  const { data: candidates = [], isLoading: candidatesLoading, error: candidatesError } = useFilevineCaseReconciliationCandidates(25);

  if (summaryLoading || candidatesLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Filevine Cleanup</CardTitle>
          <CardDescription>Building project-id and name-based reconciliation candidates...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (summaryError || candidatesError || !summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Filevine Cleanup</CardTitle>
          <CardDescription>Unable to load Filevine cleanup candidates right now.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Filevine Cleanup
            </CardTitle>
            <CardDescription>
              Safe reconciliation queue based on Filevine project IDs and exact normalized names.
            </CardDescription>
          </div>
          <Badge variant="outline">Review before merge/delete</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Filevine Clients" value={String(Number(summary.filevine_clients) || 0)} icon={<Link2 className="h-5 w-5" />} />
          <StatCard label="Filevine Cases" value={String(Number(summary.filevine_cases) || 0)} icon={<Database className="h-5 w-5" />} />
          <StatCard label="Project-ID Matches" value={String(Number(summary.project_id_matches) || 0)} icon={<Search className="h-5 w-5" />} />
          <StatCard label="Projects Without Match" value={String(Number(summary.filevine_projects_without_match) || 0)} icon={<ShieldAlert className="h-5 w-5" />} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Link Health</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Cases missing client link</span>
                <span className="font-semibold">{Number(summary.cases_missing_client_link) || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Clients missing case link</span>
                <span className="font-semibold">{Number(summary.clients_missing_case_link) || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Exact name matches</span>
                <span className="font-semibold">{Number(summary.exact_name_matches) || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Unique Filevine projects</span>
                <span className="font-semibold">{Number(summary.unique_filevine_projects) || 0}</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">How To Use This</p>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              <p>Project-ID matches are the strongest cleanup signal.</p>
              <p>Exact-name matches are useful review candidates, but weaker than project IDs.</p>
              <p>Unmatched Filevine projects are likely Filevine-only matters or missing client links.</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border">
          <div className="border-b px-4 py-3">
            <h3 className="text-sm font-semibold text-foreground">Top Reconciliation Candidates</h3>
            <p className="text-xs text-muted-foreground">These are safe review candidates before any merge or delete action.</p>
          </div>
          <div className="max-h-[360px] overflow-y-auto">
            {candidates.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">No cleanup candidates available right now.</div>
            ) : (
              <div className="divide-y">
                {candidates.map((candidate: any) => (
                  <div key={`${candidate.case_id}-${candidate.client_id}-${candidate.match_type}`} className="grid gap-2 px-4 py-3 text-sm md:grid-cols-[120px_1fr_1fr]">
                    <div>
                      <Badge variant={candidate.match_type === "project_id" ? "default" : "secondary"}>
                        {candidate.match_type === "project_id" ? "Project ID" : "Exact Name"}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{candidate.case_name || "Unnamed Filevine case"}</p>
                      <p className="text-xs text-muted-foreground">Case ID: {candidate.case_id}</p>
                      <p className="text-xs text-muted-foreground">Project ID: {candidate.filevine_project_id || "None"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{candidate.client_name || "No matched client"}</p>
                      <p className="text-xs text-muted-foreground">Client ID: {candidate.client_id || "None"}</p>
                      <p className="text-xs text-muted-foreground">Contract Invoice: {candidate.contract_invoice_number || "None"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilevineCleanupPanel;

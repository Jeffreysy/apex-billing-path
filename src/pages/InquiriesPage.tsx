import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Inbox, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useWebsiteInquiries, updateWebsiteInquiryStatus, type WebsiteInquiry } from "@/hooks/useSupabaseData";

const STATUS_OPTIONS: WebsiteInquiry["status"][] = ["new", "contacted", "closed"];

const statusVariant = (status: WebsiteInquiry["status"]) => {
  if (status === "new") return "destructive" as const;
  if (status === "contacted") return "secondary" as const;
  return "outline" as const;
};

const InquiriesPage = () => {
  const { data, isLoading, error } = useWebsiteInquiries();
  const queryClient = useQueryClient();
  const [kindFilter, setKindFilter] = useState<"all" | WebsiteInquiry["kind"]>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | WebsiteInquiry["status"]>("all");
  const [saving, setSaving] = useState<string | null>(null);

  const rows = useMemo(() => {
    return (data ?? []).filter(
      (r) => (kindFilter === "all" || r.kind === kindFilter) && (statusFilter === "all" || r.status === statusFilter),
    );
  }, [data, kindFilter, statusFilter]);

  const newCount = (data ?? []).filter((r) => r.status === "new").length;

  const setStatus = async (row: WebsiteInquiry, status: WebsiteInquiry["status"]) => {
    if (row.status === status) return;
    setSaving(row.id);
    try {
      await updateWebsiteInquiryStatus(row.id, status);
      queryClient.setQueryData<WebsiteInquiry[]>(["website-inquiries"], (prev) =>
        (prev ?? []).map((r) => (r.id === row.id ? { ...r, status } : r)),
      );
      toast.success(`Marked ${row.email} as ${status}`);
    } catch (e) {
      console.error(e);
      toast.error("Could not update the inquiry. Try again.");
    } finally {
      setSaving(null);
    }
  };

  return (
    <DashboardLayout title="Website Inquiries">
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <Inbox className="h-6 w-6 text-primary" /> Website Inquiries
            </h1>
            <p className="text-sm text-muted-foreground">
              Diagnostic requests and newsletter sign-ups from the public site.{" "}
              {newCount > 0 && <span className="font-medium text-foreground">{newCount} new.</span>}
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={kindFilter} onValueChange={(v) => setKindFilter(v as typeof kindFilter)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="diagnostic">Diagnostic</SelectItem>
                <SelectItem value="newsletter">Newsletter</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Inbox</CardTitle>
            <CardDescription>Newest first. Change the status as you work each one.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading inquiries…
              </p>
            ) : error ? (
              <p className="text-sm text-destructive">
                Could not load inquiries. If the table doesn't exist yet, apply the website_inquiries migration.
              </p>
            ) : rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">No inquiries match these filters.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Received</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Who</TableHead>
                      <TableHead>Firm</TableHead>
                      <TableHead>Practice / size</TableHead>
                      <TableHead>Systems</TableHead>
                      <TableHead className="min-w-[260px]">Message</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="whitespace-nowrap text-sm">
                          {format(new Date(r.created_at), "MMM d, yyyy h:mm a")}
                          {r.source_page && <div className="text-xs text-muted-foreground">from {r.source_page}</div>}
                        </TableCell>
                        <TableCell>
                          <Badge variant={r.kind === "diagnostic" ? "default" : "outline"}>{r.kind}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="font-medium">{r.full_name || "—"}</div>
                          <a className="flex items-center gap-1 text-xs text-primary hover:underline" href={`mailto:${r.email}`}>
                            <Mail className="h-3 w-3" /> {r.email}
                          </a>
                          {r.phone && <div className="text-xs text-muted-foreground">{r.phone}</div>}
                        </TableCell>
                        <TableCell className="text-sm">{r.firm_name || "—"}</TableCell>
                        <TableCell className="text-sm">
                          {r.practice_area || "—"}
                          {r.firm_size && <div className="text-xs text-muted-foreground">{r.firm_size}</div>}
                        </TableCell>
                        <TableCell className="text-sm">{r.systems || "—"}</TableCell>
                        <TableCell className="whitespace-pre-wrap text-sm">{r.message || "—"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                            <Select
                              value={r.status}
                              onValueChange={(v) => void setStatus(r, v as WebsiteInquiry["status"])}
                              disabled={saving === r.id}
                            >
                              <SelectTrigger className="h-8 w-[130px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {STATUS_OPTIONS.map((s) => (
                                  <SelectItem key={s} value={s}>
                                    {s}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default InquiriesPage;

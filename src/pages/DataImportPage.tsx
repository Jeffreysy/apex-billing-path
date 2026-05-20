import { useState, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  Upload,
  FileSpreadsheet,
  Users,
  Briefcase,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Info,
} from "lucide-react";

type ImportType = "contacts" | "cases" | "invoices";

interface ImportResult {
  success: boolean;
  type: string;
  total: number;
  upserted: number;
  matched: number;
  unmatched: number;
  errors: string[];
}

const IMPORT_CONFIGS: Record<
  ImportType,
  { label: string; icon: typeof Users; description: string; columns: string }
> = {
  contacts: {
    label: "Contacts",
    icon: Users,
    description:
      "Import client contacts from MyCase. Matches to existing clients by name, email, or MyCase ID. Backfills missing email/phone on matched clients.",
    columns:
      "id, first_name, last_name, name, email, phone, company, type",
  },
  cases: {
    label: "Cases",
    icon: Briefcase,
    description:
      "Import cases from MyCase. Links to clients by case number or name. Updates immigration_cases and mycase_cases tables.",
    columns:
      "id, case_number, name, case_type, case_stage, practice_area, lead_attorney, open_date, closed_date",
  },
  invoices: {
    label: "Invoices",
    icon: Receipt,
    description:
      "Import invoices from MyCase AR report. Matches to clients via case linkage or client name. Updates AR data for dashboards.",
    columns:
      "id, case_id, invoice_number, status, amount, amount_paid, amount_due, issue_date, due_date, client_name",
  },
};

const DataImportPage = () => {
  const [importType, setImportType] = useState<ImportType>("contacts");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [lastImports, setLastImports] = useState<
    Record<string, { date: string; rows: number } | null>
  >({});

  const loadLastImports = useCallback(async () => {
    const types = ["contacts", "cases", "invoices"];
    const imports: Record<string, { date: string; rows: number } | null> = {};
    for (const t of types) {
      const { data } = await supabase
        .from("mycase_sync_state")
        .select("meta")
        .eq("sync_key", `import_${t}`)
        .maybeSingle();
      if (data?.meta) {
        const m = data.meta as Record<string, unknown>;
        imports[t] = {
          date: String(m.last_import || ""),
          rows: Number(m.rows_received || 0),
        };
      } else {
        imports[t] = null;
      }
    }
    setLastImports(imports);
  }, []);

  useState(() => {
    loadLastImports();
  });

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f && (f.name.endsWith(".csv") || f.name.endsWith(".CSV"))) {
        setFile(f);
        setResult(null);
      } else {
        toast.error("Please drop a CSV file");
      }
    },
    []
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) {
        setFile(f);
        setResult(null);
      }
    },
    []
  );

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", importType);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || "https://qbrufeewsisljtoegops.supabase.co"}/functions/v1/mycase-import`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.access_token || ""}`,
          },
          body: formData,
        }
      );

      const data = await resp.json();

      if (!resp.ok) {
        toast.error(data.error || "Import failed");
        setResult(null);
      } else {
        setResult(data as ImportResult);
        toast.success(
          `Imported ${data.upserted} ${importType} (${data.matched} matched)`
        );
        loadLastImports();
      }
    } catch (err) {
      toast.error(`Import error: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const config = IMPORT_CONFIGS[importType];
  const IconComponent = config.icon;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Import</h1>
          <p className="text-muted-foreground mt-1">
            Upload MyCase CSV exports to keep LexCollect data current
          </p>
        </div>

        {/* Last import status cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.keys(IMPORT_CONFIGS) as ImportType[]).map((t) => {
            const cfg = IMPORT_CONFIGS[t];
            const Icon = cfg.icon;
            const last = lastImports[t];
            return (
              <Card
                key={t}
                className={`cursor-pointer transition-colors ${
                  importType === t
                    ? "border-primary ring-1 ring-primary"
                    : "hover:border-muted-foreground/50"
                }`}
                onClick={() => {
                  setImportType(t);
                  setFile(null);
                  setResult(null);
                }}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <CardTitle className="text-sm font-medium">
                        {cfg.label}
                      </CardTitle>
                    </div>
                    {last ? (
                      <Badge variant="outline" className="text-xs">
                        {last.rows} rows
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">
                        Never imported
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {last
                      ? `Last: ${new Date(last.date).toLocaleDateString()} ${new Date(last.date).toLocaleTimeString()}`
                      : "No imports yet"}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload area */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconComponent className="h-5 w-5" />
                  Import {config.label}
                </CardTitle>
                <CardDescription>{config.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Drop zone */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragOver
                      ? "border-primary bg-primary/5"
                      : file
                        ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                        : "border-muted-foreground/25 hover:border-muted-foreground/50"
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  {file ? (
                    <div className="space-y-2">
                      <FileSpreadsheet className="h-10 w-10 mx-auto text-green-600" />
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFile(null);
                          setResult(null);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                      <p className="font-medium">
                        Drop a CSV file here or click to browse
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Export from MyCase and upload the CSV
                      </p>
                      <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        id="csv-upload"
                        onChange={handleFileSelect}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          document.getElementById("csv-upload")?.click()
                        }
                      >
                        Browse Files
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <Select
                    value={importType}
                    onValueChange={(v) => setImportType(v as ImportType)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contacts">Contacts</SelectItem>
                      <SelectItem value="cases">Cases</SelectItem>
                      <SelectItem value="invoices">Invoices</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={handleImport}
                    disabled={!file || loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Import {config.label}
                      </>
                    )}
                  </Button>
                </div>

                {/* Results */}
                {result && (
                  <Alert
                    variant={
                      result.errors.length > 0 ? "destructive" : "default"
                    }
                  >
                    {result.errors.length > 0 ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    <AlertTitle>
                      {result.errors.length > 0
                        ? "Import completed with warnings"
                        : "Import successful"}
                    </AlertTitle>
                    <AlertDescription>
                      <div className="mt-2 space-y-1">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <span>Total rows:</span>
                          <span className="font-medium">{result.total}</span>
                          <span>Upserted:</span>
                          <span className="font-medium text-green-600">
                            {result.upserted}
                          </span>
                          <span>Matched to clients:</span>
                          <span className="font-medium text-blue-600">
                            {result.matched}
                          </span>
                          <span>Unmatched:</span>
                          <span className="font-medium text-amber-600">
                            {result.unmatched}
                          </span>
                        </div>
                        {result.errors.length > 0 && (
                          <div className="mt-3 max-h-32 overflow-y-auto">
                            <p className="text-xs font-medium mb-1">
                              Errors ({result.errors.length}):
                            </p>
                            {result.errors.slice(0, 10).map((e, i) => (
                              <p key={i} className="text-xs text-destructive">
                                {e}
                              </p>
                            ))}
                            {result.errors.length > 10 && (
                              <p className="text-xs text-muted-foreground">
                                ...and {result.errors.length - 10} more
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Instructions sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  How to Export from MyCase
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                <div>
                  <p className="font-medium">Contacts:</p>
                  <ol className="list-decimal list-inside text-muted-foreground text-xs space-y-1 mt-1">
                    <li>Go to MyCase &rarr; Contacts</li>
                    <li>Click Export / Download</li>
                    <li>Select CSV format</li>
                    <li>Upload the file here</li>
                  </ol>
                </div>
                <div>
                  <p className="font-medium">Cases:</p>
                  <ol className="list-decimal list-inside text-muted-foreground text-xs space-y-1 mt-1">
                    <li>Go to MyCase &rarr; Cases</li>
                    <li>Filter as needed (open/closed)</li>
                    <li>Export to CSV</li>
                    <li>Upload the file here</li>
                  </ol>
                </div>
                <div>
                  <p className="font-medium">Invoices / AR:</p>
                  <ol className="list-decimal list-inside text-muted-foreground text-xs space-y-1 mt-1">
                    <li>Go to MyCase &rarr; Billing &rarr; Reports</li>
                    <li>Run the AR Aging report</li>
                    <li>Export to CSV</li>
                    <li>Upload the file here</li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Expected Columns</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground font-mono leading-relaxed">
                  {config.columns}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Column names are matched flexibly — headers are
                  normalized to lowercase with underscores.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DataImportPage;

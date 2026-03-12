import { tasks } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUpRight, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const priorityVariant: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
  low: "outline", medium: "secondary", high: "default", urgent: "destructive",
};

const statusVariant: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
  open: "outline", in_progress: "secondary", completed: "default", escalated: "destructive",
};

interface TaskPanelProps {
  department: "collections" | "legal" | "ar" | "admin";
  showAll?: boolean;
}

const TaskPanel = ({ department, showAll = false }: TaskPanelProps) => {
  const [createOpen, setCreateOpen] = useState(false);

  const myTasks = showAll
    ? tasks.filter((t) => t.status !== "completed").slice(0, 12)
    : tasks.filter((t) => (t.targetDepartment === department || t.department === department) && t.status !== "completed").slice(0, 10);

  const escalated = myTasks.filter((t) => t.status === "escalated" || t.department !== department);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Task created and assigned successfully!");
    setCreateOpen(false);
  };

  return (
    <div className="dashboard-section">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {showAll ? "All Department Tasks" : "Tasks & Escalations"}
        </h2>
        <div className="flex items-center gap-2">
          {escalated.length > 0 && (
            <Badge variant="destructive" className="gap-1">
              <ArrowUpRight className="h-3 w-3" />
              {escalated.length} escalated
            </Badge>
          )}
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1">
                <Plus className="h-3 w-3" /> New Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Task / Escalation</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input placeholder="Task title..." />
                </div>
                <div>
                  <Label>Assign to Department</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="collections">Collections</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                      <SelectItem value="ar">AR Oversight</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea placeholder="Describe the task..." />
                </div>
                <DialogFooter>
                  <Button type="submit">Create Task</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="space-y-2">
        {myTasks.map((t) => (
          <div key={t.id} className="flex items-start justify-between rounded-md border p-3">
            <div className="flex-1">
              <p className="text-sm font-medium">{t.title}</p>
              <p className="text-xs text-muted-foreground">{t.clientName} · Due: {t.dueDate}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                <Badge variant={priorityVariant[t.priority]} className="text-xs capitalize">{t.priority}</Badge>
                <Badge variant={statusVariant[t.status]} className="text-xs capitalize">{t.status.replace(/_/g, " ")}</Badge>
                {t.department !== department && (
                  <Badge variant="outline" className="text-xs">From: {t.assignedByName}</Badge>
                )}
              </div>
            </div>
          </div>
        ))}
        {myTasks.length === 0 && <p className="text-sm text-muted-foreground">No pending tasks.</p>}
      </div>
    </div>
  );
};

export default TaskPanel;

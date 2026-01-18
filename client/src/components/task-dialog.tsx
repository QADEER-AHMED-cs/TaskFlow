import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTaskSchema, type Task } from "@shared/schema";
import { useTasks } from "@/hooks/use-tasks";
import { useAI } from "@/hooks/use-ai";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2 } from "lucide-react";

type TaskDialogProps = {
  task?: Task;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

// Form schema with some refined validation
const formSchema = insertTaskSchema.extend({
  title: z.string().min(1, "Title is required"),
  priority: z.enum(["low", "medium", "high"]),
  dueDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
});

type FormValues = z.infer<typeof formSchema>;

export function TaskDialog({ task, trigger, open: controlledOpen, onOpenChange }: TaskDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;

  const { createTask, updateTask } = useTasks();
  const { prioritize, summarize } = useAI();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      priority: (task?.priority as "low" | "medium" | "high") || "medium",
      status: (task?.status as "todo" | "in_progress" | "completed") || "todo",
      // Format date for input type="date"
      dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : undefined,
    } as any, // Cast to any because of date transform mismatch in types
  });

  // Reset form when task changes
  useEffect(() => {
    if (open) {
      form.reset({
        title: task?.title || "",
        description: task?.description || "",
        priority: (task?.priority as "low" | "medium" | "high") || "medium",
        status: (task?.status as "todo" | "in_progress" | "completed") || "todo",
        dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : undefined,
      } as any);
    }
  }, [task, open, form]);

  const onSubmit = (data: FormValues) => {
    if (task) {
      updateTask.mutate({ id: task.id, data }, {
        onSuccess: () => setOpen(false)
      });
    } else {
      createTask.mutate(data, {
        onSuccess: () => setOpen(false)
      });
    }
  };

  const handleAIPriority = async () => {
    const title = form.getValues("title");
    const description = form.getValues("description");
    
    if (!title) return;

    prioritize.mutate({ title, description: description || "" }, {
      onSuccess: (data) => {
        form.setValue("priority", data.priority);
      }
    });
  };

  const isPending = createTask.isPending || updateTask.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[500px] glass-card border-white/10 text-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">{task ? "Edit Task" : "Create New Task"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input 
              id="title" 
              placeholder="e.g. Redesign portfolio homepage" 
              {...form.register("title")} 
              className="bg-background/50 border-white/10 focus:border-primary/50"
            />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="description">Description</Label>
              <Button 
                type="button"
                variant="ghost" 
                size="sm"
                className="h-6 text-xs text-primary hover:text-primary/80"
                disabled={prioritize.isPending}
                onClick={handleAIPriority}
              >
                {prioritize.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
                Suggest Priority
              </Button>
            </div>
            <Textarea 
              id="description" 
              placeholder="Add details about your task..." 
              {...form.register("description")} 
              className="bg-background/50 border-white/10 focus:border-primary/50 min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select 
                onValueChange={(val) => form.setValue("priority", val as any)}
                value={form.watch("priority")}
              >
                <SelectTrigger className="bg-background/50 border-white/10">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                onValueChange={(val) => form.setValue("status", val as any)}
                value={form.watch("status")}
              >
                <SelectTrigger className="bg-background/50 border-white/10">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input 
              id="dueDate" 
              type="date"
              {...form.register("dueDate")} 
              className="bg-background/50 border-white/10 focus:border-primary/50"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button 
              type="submit" 
              className="btn-gradient"
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {task ? "Save Changes" : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

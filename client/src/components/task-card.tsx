import { Task } from "@shared/schema";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { 
  Calendar, 
  MoreVertical, 
  Trash2, 
  Edit, 
  CheckCircle2, 
  Circle, 
  Clock,
  Sparkles,
  Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TaskDialog } from "./task-dialog";
import { useState } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { useAI } from "@/hooks/use-ai";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function TaskCard({ task }: { task: Task }) {
  const [editOpen, setEditOpen] = useState(false);
  const { deleteTask, updateTask } = useTasks();
  const { summarize } = useAI();
  const [summary, setSummary] = useState(task.aiSummary);

  const priorityColors = {
    low: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    high: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const statusIcons = {
    todo: <Circle className="w-4 h-4 text-muted-foreground" />,
    in_progress: <Clock className="w-4 h-4 text-blue-400" />,
    completed: <CheckCircle2 className="w-4 h-4 text-green-400" />,
  };

  const handleStatusToggle = () => {
    const nextStatus = 
      task.status === "todo" ? "in_progress" :
      task.status === "in_progress" ? "completed" : "todo";
    
    updateTask.mutate({ id: task.id, data: { status: nextStatus } });
  };

  const handleSummarize = () => {
    if (!task.description) return;
    summarize.mutate({ description: task.description }, {
      onSuccess: (data) => {
        setSummary(data.summary);
        // Optimistically update AI summary on task if needed, or rely on local state
      }
    });
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-card rounded-xl p-5 hover:border-primary/30 transition-all duration-300 group"
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleStatusToggle}
              className="hover:scale-110 transition-transform"
            >
              {statusIcons[task.status as keyof typeof statusIcons]}
            </button>
            <h3 className={`font-medium text-lg leading-tight ${task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {task.title}
            </h3>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-white/10">
              <DropdownMenuItem onClick={() => setEditOpen(true)} className="cursor-pointer">
                <Edit className="w-4 h-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => deleteTask.mutate(task.id)} 
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {summary || task.description || "No description provided."}
        </p>

        {task.description && !summary && task.description.length > 100 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-primary h-6 p-0 mb-3 hover:bg-transparent hover:underline"
            onClick={handleSummarize}
            disabled={summarize.isPending}
          >
            {summarize.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
            Summarize with AI
          </Button>
        )}

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
          <div className="flex gap-2">
            <Badge variant="outline" className={`${priorityColors[task.priority as keyof typeof priorityColors]} border capitalize`}>
              {task.priority}
            </Badge>
          </div>

          {task.dueDate && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="w-3 h-3 mr-1" />
              {format(new Date(task.dueDate), "MMM d")}
            </div>
          )}
        </div>
      </motion.div>

      <TaskDialog 
        task={task} 
        open={editOpen} 
        onOpenChange={setEditOpen} 
      />
    </>
  );
}

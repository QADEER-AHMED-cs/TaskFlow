import { useState } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { Layout } from "@/components/layout";
import { TaskCard } from "@/components/task-card";
import { StatsChart } from "@/components/stats-chart";
import { TaskDialog } from "@/components/task-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { tasks, isLoading } = useTasks();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const filteredTasks = tasks?.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) || 
                          (task.description && task.description.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <Layout>
      <div className="space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display text-white">Dashboard</h1>
            <p className="text-muted-foreground">Manage your productivity efficiently</p>
          </div>
          
          <TaskDialog 
            trigger={
              <Button className="btn-gradient">
                <Plus className="mr-2 h-5 w-5" /> New Task
              </Button>
            } 
          />
        </header>

        {/* Stats Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-colors" />
            
            <h2 className="text-xl font-semibold font-display mb-4 relative z-10">Welcome Back!</h2>
            <p className="text-muted-foreground max-w-lg relative z-10">
              You have {tasks?.filter(t => t.status !== 'completed').length || 0} pending tasks today. 
              The AI priority engine suggests focusing on high-impact items first.
            </p>
          </div>
          
          <div className="lg:col-span-1">
            {isLoading ? (
              <Skeleton className="h-[300px] w-full rounded-2xl bg-white/5" />
            ) : (
              <StatsChart tasks={tasks || []} />
            )}
          </div>
        </section>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-white/5">
          <div className="relative w-full md:w-auto md:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search tasks..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background/50 border-white/10 w-full"
            />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[150px] bg-background/50 border-white/10">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-[150px] bg-background/50 border-white/10">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Task Grid */}
        <section>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[200px] rounded-xl bg-white/5" />
              ))}
            </div>
          ) : filteredTasks?.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="w-8 h-8 opacity-50" />
              </div>
              <p>No tasks found matching your filters.</p>
              <Button 
                variant="link" 
                onClick={() => { setSearch(""); setStatusFilter("all"); setPriorityFilter("all"); }}
                className="mt-2 text-primary"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <motion.div 
              layout 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence>
                {filteredTasks?.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </section>
      </div>
    </Layout>
  );
}

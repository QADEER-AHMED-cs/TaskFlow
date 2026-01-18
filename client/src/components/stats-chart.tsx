import { useMemo } from "react";
import { Task } from "@shared/schema";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { motion } from "framer-motion";

export function StatsChart({ tasks }: { tasks: Task[] }) {
  const data = useMemo(() => {
    const total = tasks.length;
    if (total === 0) return [];

    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = tasks.filter(t => t.status !== 'completed').length;

    return [
      { name: 'Completed', value: completed },
      { name: 'Pending', value: pending },
    ];
  }, [tasks]);

  const COLORS = ['#10b981', '#8b5cf6']; // Green for completed, Purple for pending

  if (tasks.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card rounded-2xl p-6 h-[300px] flex flex-col items-center justify-center relative overflow-hidden"
    >
      <h3 className="absolute top-6 left-6 text-lg font-semibold font-display">Task Overview</h3>
      
      <div className="w-full h-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e1e2e', border: 'none', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Centered stat */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mt-2">
        <span className="text-3xl font-bold font-display">{tasks.length}</span>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Total</p>
      </div>
    </motion.div>
  );
}

'use client';

import { useState } from 'react';
import { Task } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatRelativeTime, getDaysUntil, getTaskColor, getCategoryIcon } from '@/lib/utils';
import { CheckCircle2, Circle, Clock, AlertCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineProps {
  tasks: Task[];
  onUpdateStatus: (taskId: string, status: Task['status']) => void;
}

export function Timeline({ tasks, onUpdateStatus }: TimelineProps) {
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'urgent' | 'completed'>('all');

  const sortedTasks = [...tasks].sort((a, b) => {
    // Sort by priority first
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    // Then by due date
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });

  const urgentTasks = sortedTasks.filter(t => t.priority === 'urgent' && t.status !== 'completed');
  const highTasks = sortedTasks.filter(t => t.priority === 'high' && t.status !== 'completed');
  const mediumTasks = sortedTasks.filter(t => t.priority === 'medium' && t.status !== 'completed');
  const completedTasks = sortedTasks.filter(t => t.status === 'completed');

  const filteredTasks = filter === 'all' 
    ? sortedTasks.filter(t => t.status !== 'completed')
    : filter === 'urgent'
    ? sortedTasks.filter(t => t.priority === 'urgent' && t.status !== 'completed')
    : sortedTasks.filter(t => t.status === 'completed');

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-gradient-to-r from-accent-500 to-accent-600 text-white border-accent-400';
      case 'high':
        return 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-400';
      case 'medium':
        return 'bg-gradient-to-r from-primary-500 to-primary-600 text-white border-primary-400';
      default:
        return 'bg-warm-100 text-warm-600 border-warm-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-2 p-4 border-b border-warm-100">
        {(['all', 'urgent', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
              filter === f 
                ? 'bg-primary-100 text-primary-700' 
                : 'text-warm-500 hover:text-warm-700 hover:bg-warm-50'
            )}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'urgent' && urgentTasks.length > 0 && (
              <span className="ml-1.5 bg-accent-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {urgentTasks.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="p-4 space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-primary-500" />
            </div>
            <h3 className="text-lg font-bold text-warm-900 mb-2">
              {filter === 'completed' ? 'No completed tasks yet!' : 'All caught up!'}
            </h3>
            <p className="text-warm-500 text-sm">
              {filter === 'completed' 
                ? 'Complete some tasks to see them here.' 
                : 'You have no pending tasks. Great job!'}
            </p>
          </div>
        ) : (
          filteredTasks.map((task, index) => (
            <Card
              key={task.id}
              className={cn(
                'group transition-all duration-300 hover:shadow-soft',
                'border-l-4',
                task.priority === 'urgent' ? 'border-l-accent-500' :
                task.priority === 'high' ? 'border-l-amber-500' :
                task.priority === 'medium' ? 'border-l-primary-500' :
                'border-l-warm-300'
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    onClick={() => onUpdateStatus(task.id, task.status === 'completed' ? 'pending' : 'completed')}
                    className="mt-0.5 group/check transition-transform active:scale-95"
                  >
                    {task.status === 'completed' ? (
                      <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center shadow-soft">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 border-2 border-warm-300 rounded-full flex items-center justify-center group-hover/check:border-primary-400 transition-colors">
                        <CheckCircle2 className="w-3.5 h-3.5 text-transparent group-hover/check:text-primary-300 transition-colors" />
                      </div>
                    )}
                  </button>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-lg">{getCategoryIcon(task.category)}</span>
                      <h3 className={cn(
                        "font-semibold text-warm-900",
                        task.status === 'completed' && "line-through text-warm-400"
                      )}>
                        {task.title}
                    </h3>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold",
                        getPriorityStyles(task.priority)
                      )}>
                        {task.priority}
                      </span>
                      
                      {task.due_date && task.status !== 'completed' && (
                        <span className={cn(
                          "inline-flex items-center gap-1 text-xs",
                          getDaysUntil(task.due_date) < 0 ? 'text-accent-600 font-medium' : 'text-warm-500'
                        )}>
                          <Clock className="w-3 h-3" />
                          {formatRelativeTime(task.due_date)}
                          {getDaysUntil(task.due_date) < 0 && (
                            <AlertCircle className="w-3 h-3" />
                          )}
                        </span>
                      )}
                      
                      {task.estimated_time && (
                        <span className="text-xs text-warm-400">
                          {task.estimated_time} min
                        </span>
                      )}
                    </div>
                    
                    {expandedTask === task.id && task.description && (
                      <div className="mt-3 p-3 bg-cream-100 rounded-xl">
                        <p className="text-warm-700 text-sm leading-relaxed">{task.description}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Expand button */}
                  {task.description && (
                    <button
                      onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                      className="p-1.5 hover:bg-warm-100 rounded-lg transition-colors text-warm-400"
                    >
                      {expandedTask === task.id ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

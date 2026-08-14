/**
 * useTasks Hook
 * 
 * Extracted from SmartTaskManager.tsx
 * Handles task data fetching and state management
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  category?: string;
  priority_weight?: number;
  completion_date?: string;
}

const PRIORITY_WEIGHTS: Record<string, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};

const DEFAULT_TASKS = [
  { title: 'Add Baby to Health Insurance', description: 'Critical: Add baby within 30-60 days of birth', category: 'insurance', priority: 'urgent', icon: 'shield', order: 0 },
  { title: 'Get Social Security Number', description: 'Required for taxes and claiming as dependent', category: 'legal', priority: 'urgent', icon: 'file', order: 1 },
  { title: 'Open 529 College Savings Plan', description: 'Start saving for education with tax advantages', category: '529', priority: 'high', icon: 'wallet', order: 2 },
  { title: 'Update W-4 Tax Withholdings', description: 'Add dependent to increase take-home pay', category: 'tax', priority: 'high', icon: 'dollar', order: 3 },
  { title: 'Get Term Life Insurance', description: 'Essential protection for your family', category: 'insurance', priority: 'high', icon: 'heart', order: 4 },
  { title: 'Create or Update Your Will', description: 'Name guardians for your child', category: 'legal', priority: 'high', icon: 'file', order: 5 },
  { title: 'Maximize FSA or HSA', description: 'Use pre-tax dollars for medical expenses', category: 'tax', priority: 'high', icon: 'dollar', order: 6 },
  { title: 'Freeze Child Credit (3 Bureaus)', description: 'Protect against identity theft', category: 'legal', priority: 'high', icon: 'shield', order: 7 },
  { title: 'Set Up Custodial Roth IRA', description: 'If baby has earned income, start retirement savings early', category: 'general', priority: 'medium', icon: 'trending', order: 8 },
  { title: 'Get Umbrella Insurance', description: 'Protect against lawsuits', category: 'insurance', priority: 'medium', icon: 'shield', order: 9 },
];

interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTasks(userId: string | null | undefined): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*, completion_date')
        .eq('user_id', userId);

      if (error) throw error;

      // Bootstrap default tasks for new users
      if (!data || data.length === 0) {
        const tasksToInsert = DEFAULT_TASKS.map((task) => ({
          user_id: userId,
          title: task.title,
          description: task.description,
          category: task.category,
          priority: task.priority,
          priority_weight: PRIORITY_WEIGHTS[task.priority] || 2,
          status: 'pending',
          order: task.order,
        }));

        const { error: insertError } = await supabase
          .from('tasks')
          .insert(tasksToInsert);

        if (insertError) {
          console.error('Error creating default tasks:', insertError);
          setError('Failed to create default tasks');
          setLoading(false);
          return;
        }

        // Refetch after insert
        const { data: newData } = await supabase
          .from('tasks')
          .select('*, completion_date')
          .eq('user_id', userId);

        if (newData) {
          const transformedTasks = sortTasksByPriority(newData);
          setTasks(transformedTasks);
        }
      } else {
        const transformedTasks = sortTasksByPriority(data);
        setTasks(transformedTasks);
      }

      setError(null);
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      setError(err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { tasks, loading, error, refetch: fetchTasks };
}

function sortTasksByPriority(dbTasks: any[]): Task[] {
  return dbTasks
    .map((dbTask: any) => ({
      id: dbTask.id,
      title: dbTask.title,
      description: dbTask.description || undefined,
      status: dbTask.status,
      priority: dbTask.priority,
      priority_weight: dbTask.priority_weight ?? PRIORITY_WEIGHTS[dbTask.priority] ?? 2,
      due_date: dbTask.due_date || undefined,
      category: dbTask.category || undefined,
      completion_date: dbTask.completion_date || undefined,
    }))
    .sort((a, b) => {
      const weightDiff = (b.priority_weight ?? 2) - (a.priority_weight ?? 2);
      if (weightDiff !== 0) return weightDiff;
      return 0;
    });
}

// Hook for managing task actions (toggle, add, delete)
export function useTaskActions(userId: string | null | undefined) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleTask = useCallback(async (taskId: string, currentStatus: string) => {
    if (!userId) return;

    try {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      const completionDate = newStatus === 'completed' ? new Date().toISOString() : null;

      const { error } = await supabase
        .from('tasks')
        .update({
          status: newStatus,
          completion_date: completionDate,
        })
        .eq('id', taskId);

      if (error) throw error;
      return { success: true, newStatus };
    } catch (err) {
      console.error('Error toggling task:', err);
      return { success: false, error: err };
    }
  }, [userId]);

  const addTask = useCallback(async (task: Omit<Task, 'id'>) => {
    if (!userId) return { success: false, error: 'No user ID' };

    setIsSubmitting(true);
    try {
      const taskData = {
        user_id: userId,
        title: task.title,
        description: task.description,
        category: task.category,
        priority: task.priority,
        due_date: task.due_date,
        status: 'pending',
        priority_weight: PRIORITY_WEIGHTS[task.priority] || 2,
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single();

      if (error) throw error;
      return { success: true, task: data };
    } catch (err) {
      console.error('Error adding task:', err);
      return { success: false, error: err };
    } finally {
      setIsSubmitting(false);
    }
  }, [userId]);

  const deleteTask = useCallback(async (taskId: string) => {
    if (!userId) return { success: false, error: 'No user ID' };

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error('Error deleting task:', err);
      return { success: false, error: err };
    }
  }, [userId]);

  return { toggleTask, addTask, deleteTask, isSubmitting };
}

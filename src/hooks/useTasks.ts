import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Task, TaskInput, DerivedTask, Metrics } from '@/types';
import {
  computeAverageROI,
  computePerformanceGrade,
  computeRevenuePerHour,
  computeTimeEfficiency,
  computeTotalRevenue,
  withDerived,
  sortTasks,
} from '@/utils/logic';
import { generateSalesTasks } from '@/utils/seed';

interface UseTasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  derivedSorted: DerivedTask[];
  metrics: Metrics;
  lastDeleted: Task | null;
  addTask: (task: TaskInput) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  undoDelete: () => void;
}

const INITIAL_METRICS: Metrics = {
  totalRevenue: 0,
  totalTimeTaken: 0,
  timeEfficiencyPct: 0,
  revenuePerHour: 0,
  averageROI: 0,
  performanceGrade: 'Needs Improvement',
};

export function useTasks(): UseTasksState {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDeleted, setLastDeleted] = useState<Task | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch('/tasks.json');
        const data = res.ok ? await res.json() : [];
        if (mounted) {
          setTasks(data.length ? data : generateSalesTasks(50));
        }
      } catch {
        if (mounted) setError('Failed to load tasks');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      load();
    }
    return () => {
      mounted = false;
    };
  }, []);

  const derivedSorted = useMemo(() => {
    return sortTasks(tasks.map(withDerived));
  }, [tasks]);

  const metrics = useMemo(() => {
    if (!tasks.length) return INITIAL_METRICS;
    const avgROI = computeAverageROI(tasks);
    return {
      totalRevenue: computeTotalRevenue(tasks),
      totalTimeTaken: tasks.reduce((s, t) => s + t.timeTaken, 0),
      timeEfficiencyPct: computeTimeEfficiency(tasks),
      revenuePerHour: computeRevenuePerHour(tasks),
      averageROI: avgROI,
      performanceGrade: computePerformanceGrade(avgROI),
    };
  }, [tasks]);

  const addTask = useCallback((task: TaskInput) => {
    setTasks(prev => {
      const id = task.id ?? crypto.randomUUID();
      const createdAt = new Date().toISOString();
      const completedAt = task.status === 'Done' ? createdAt : undefined;
      return [...prev, { ...task, id, createdAt, completedAt }];
    });
  }, []);

  const updateTask = useCallback((id: string, patch: Partial<Task>) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === id ? { ...t, ...patch } : t
      )
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => {
      const found = prev.find(t => t.id === id) || null;
      setLastDeleted(found);
      return prev.filter(t => t.id !== id);
    });
  }, []);

  const undoDelete = useCallback(() => {
    if (!lastDeleted) return;
    setTasks(prev => [...prev, lastDeleted]);
    setLastDeleted(null);
  }, [lastDeleted]);

  return {
    tasks,
    loading,
    error,
    derivedSorted,
    metrics,
    lastDeleted,
    addTask,
    updateTask,
    deleteTask,
    undoDelete,
  };
}

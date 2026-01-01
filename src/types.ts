export type Priority = 'High' | 'Medium' | 'Low';
export type Status = 'Todo' | 'In Progress' | 'Done';

export interface Task {
  id: string;
  title: string;
  revenue: number;
  timeTaken: number;
  priority: Priority;
  status: Status;
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

/**
 * Used for forms / creation / updates
 * createdAt & completedAt are generated internally
 */
export type TaskInput = {
  id?: string;
  title: string;
  revenue: number;
  timeTaken: number;
  priority: Priority;
  status: Status;
  notes?: string;
};

export interface DerivedTask extends Task {
  roi: number;
  priorityWeight: 3 | 2 | 1;
}

export interface Metrics {
  totalRevenue: number;
  totalTimeTaken: number;
  timeEfficiencyPct: number;
  revenuePerHour: number;
  averageROI: number;
  performanceGrade: 'Excellent' | 'Good' | 'Needs Improvement';
}



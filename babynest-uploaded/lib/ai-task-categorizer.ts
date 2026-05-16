// AI-powered task categorization
// Uses simple rule-based logic (can be upgraded to AI API calls)

export interface TaskCategory {
  category: 'urgent' | 'this-week' | 'quick-wins' | 'financial-impact' | 'planning' | 'later';
  reason: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedMinutes: number;
  potentialSavings?: number;
}

const KEYWORDS = {
  urgent: ['urgent', 'asap', 'immediately', 'deadline', 'due', 'overdue', 'critical', 'required'],
  financial: ['insurance', 'budget', 'cost', 'save', 'money', 'tax', '529', 'expense', 'payment', 'bill'],
  quick: ['call', 'email', 'download', 'register', 'appointment', 'schedule', '10 min', 'quick'],
  planning: ['plan', 'research', 'compare', 'decide', 'choose', 'select', 'book', 'order'],
};

export function categorizeTask(title: string, description: string = '', dueDate?: string): TaskCategory {
  const text = `${title} ${description}`.toLowerCase();
  
  // Check for urgency
  const isUrgent = KEYWORDS.urgent.some(kw => text.includes(kw));
  const isFinancial = KEYWORDS.financial.some(kw => text.includes(kw));
  const isQuick = KEYWORDS.quick.some(kw => text.includes(kw));
  const isPlanning = KEYWORDS.planning.some(kw => text.includes(kw));
  
  // Calculate days until due
  const daysUntilDue = dueDate 
    ? Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  
  // Determine category
  let category: TaskCategory['category'] = 'later';
  let priority: TaskCategory['priority'] = 'low';
  
  if (isUrgent || (daysUntilDue !== null && daysUntilDue <= 3)) {
    category = 'urgent';
    priority = 'urgent';
  } else if (daysUntilDue !== null && daysUntilDue <= 7) {
    category = 'this-week';
    priority = 'high';
  } else if (isQuick && isFinancial) {
    category = 'quick-wins';
    priority = 'high';
  } else if (isFinancial) {
    category = 'financial-impact';
    priority = 'medium';
  } else if (isPlanning) {
    category = 'planning';
    priority = 'medium';
  }
  
  // Estimate time
  let estimatedMinutes = 30; // default
  if (text.includes('call') || text.includes('phone')) estimatedMinutes = 15;
  if (text.includes('email')) estimatedMinutes = 10;
  if (text.includes('research') || text.includes('compare')) estimatedMinutes = 60;
  if (text.includes('apply') || text.includes('enroll')) estimatedMinutes = 45;
  if (text.includes('quick') || text.includes('10 min')) estimatedMinutes = 10;
  
  // Estimate potential savings (simplified)
  let potentialSavings: number | undefined;
  if (isFinancial) {
    // Extract numbers from text
    const numbers = text.match(/\$?([0-9,]+)/g);
    if (numbers) {
      const amounts = numbers.map(n => parseInt(n.replace(/[^0-9]/g, ''))).filter(n => !isNaN(n));
      if (amounts.length > 0) {
        potentialSavings = Math.max(...amounts);
      }
    }
    // Default estimates
    if (!potentialSavings) {
      if (text.includes('529')) potentialSavings = 10000;
      if (text.includes('insurance')) potentialSavings = 5000;
      if (text.includes('tax')) potentialSavings = 2000;
    }
  }
  
  return {
    category,
    reason: generateReason(category, priority, daysUntilDue),
    priority,
    estimatedMinutes,
    potentialSavings,
  };
}

function generateReason(
  category: TaskCategory['category'], 
  priority: TaskCategory['priority'],
  daysUntilDue: number | null
): string {
  if (category === 'urgent') {
    return daysUntilDue !== null && daysUntilDue <= 0
      ? 'Overdue - needs immediate attention'
      : 'Due within 3 days - high priority';
  }
  if (category === 'this-week') return 'Due this week - plan to complete soon';
  if (category === 'quick-wins') return 'Quick task with financial impact - do this first!';
  if (category === 'financial-impact') return 'Could save you money - worth prioritizing';
  if (category === 'planning') return 'Requires research/planning - start early';
  return 'Lower priority - can be done later';
}

export function groupTasksByCategory(tasks: any[]) {
  const grouped: Record<string, { tasks: any[]; stats: any }> = {
    urgent: { tasks: [], stats: { count: 0, totalSavings: 0 } },
    'this-week': { tasks: [], stats: { count: 0, totalSavings: 0 } },
    'quick-wins': { tasks: [], stats: { count: 0, totalSavings: 0 } },
    'financial-impact': { tasks: [], stats: { count: 0, totalSavings: 0 } },
    planning: { tasks: [], stats: { count: 0, totalSavings: 0 } },
    later: { tasks: [], stats: { count: 0, totalSavings: 0 } },
  };
  
  tasks.forEach(task => {
    const category = categorizeTask(task.title, task.description, task.due_date);
    
    if (!grouped[category.category]) {
      grouped[category.category] = { tasks: [], stats: { count: 0, totalSavings: 0 } };
    }
    
    grouped[category.category].tasks.push({
      ...task,
      aiCategory: category,
    });
    
    grouped[category.category].stats.count++;
    if (category.potentialSavings) {
      grouped[category.category].stats.totalSavings += category.potentialSavings;
    }
  });
  
  return grouped;
}

export function getMotivationalMessage(completedTasks: number, totalTasks: number): string {
  const percentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  if (percentage === 100) return "🎉 Incredible! All tasks complete!";
  if (percentage >= 75) return "🔥 You're crushing it! Almost done!";
  if (percentage >= 50) return "💪 Halfway there! Keep the momentum!";
  if (percentage >= 25) return "👍 Great start! You're getting organized!";
  if (completedTasks > 0) return "🌟 Nice work! Every task counts!";
  return "🚀 Let's get started! Small steps lead to big savings!";
}

export function getSmartRecommendation(tasks: any[]): string {
  const grouped = groupTasksByCategory(tasks.filter(t => t.status !== 'completed'));
  
  if (grouped.urgent.tasks.length > 0) {
    return `⚠️ You have ${grouped.urgent.tasks.length} urgent task(s) - tackle these first!`;
  }
  
  if (grouped['quick-wins'].tasks.length > 0) {
    const task = grouped['quick-wins'].tasks[0];
    return `💡 Quick win: "${task.title}" - only takes ${task.aiCategory.estimatedMinutes} min!`;
  }
  
  if (grouped['financial-impact'].tasks.length > 0) {
    const totalSavings = grouped['financial-impact'].stats.totalSavings;
    return `💰 Complete ${grouped['financial-impact'].tasks.length} financial tasks to save ~$${totalSavings.toLocaleString()}!`;
  }
  
  if (tasks.filter(t => t.status === 'completed').length === 0) {
    return "🎯 Start with one quick task to build momentum!";
  }
  
  return "✨ You're all caught up! Check back for new recommendations.";
}

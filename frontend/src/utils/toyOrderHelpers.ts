export const getScoreColor = (score: number): string => {
  if (score >= 90) return '#16a34a';
  if (score >= 75) return '#84cc16';
  if (score >= 60) return '#eab308';
  if (score >= 45) return '#f97316';
  return '#dc2626';
};

export const getScoreLabel = (score: number): string => {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 45) return 'Poor';
  return 'Very Poor';
};

export const getStatusEmoji = (status: string): string => {
  switch (status) {
    case 'To Do': return '📋';
    case 'In Progress': return '🔨';
    case 'Quality Check': return '🔍';
    case 'Ready to Deliver': return '🎁';
    default: return '📦';
  }
};


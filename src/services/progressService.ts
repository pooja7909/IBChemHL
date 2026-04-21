
export interface TopicProgress {
  topicId: string;
  status: 'not_started' | 'revising' | 'practicing' | 'completed';
  lastActivity: string;
}

const STORAGE_KEY = 'atomic_tutor_progress';

export const progressService = {
  getProgress(): Record<string, TopicProgress> {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  },

  updateTopicStatus(topicId: string, status: TopicProgress['status']) {
    const progress = this.getProgress();
    progress[topicId] = {
      topicId,
      status,
      lastActivity: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    // Trigger storage event for local updates across tabs/components
    window.dispatchEvent(new Event('storage'));
  },

  getTopicProgress(topicId: string): TopicProgress {
    const progress = this.getProgress();
    return progress[topicId] || {
      topicId,
      status: 'not_started',
      lastActivity: new Date().toISOString()
    };
  }
};

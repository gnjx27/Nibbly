// Imports
import { formatDistanceToNow } from 'date-fns';

/**
 * Convert Firestore timestamp to "time ago" string
 * @param {Object} timestamp Firestore timestamp { seconds, nanoseconds }
 * @returns string like "2 hours ago", "3 days ago"
 */
export const timeAgo = (timestamp) => {
  if (!timestamp?.seconds) return '';
  return formatDistanceToNow(new Date(timestamp.seconds * 1000), { addSuffix: true });
};
import { format, formatDistanceToNow, differenceInMinutes } from 'date-fns';

/**
 * Format currency amount
 */
export function formatCurrency(amount, currency = '₹') {
  const num = Number(amount) || 0;
  return `${currency}${num.toFixed(2)}`;
}

/**
 * Format date to readable string
 */
export function formatDate(date, pattern = 'MMM dd, yyyy') {
  if (!date) return '';
  return format(new Date(date), pattern);
}

/**
 * Format date with time
 */
export function formatDateTime(date) {
  if (!date) return '';
  return format(new Date(date), 'MMM dd, yyyy HH:mm');
}

/**
 * Format time only
 */
export function formatTime(date) {
  if (!date) return '';
  return format(new Date(date), 'HH:mm');
}

/**
 * Format relative time (e.g., "5 minutes ago")
 */
export function formatRelativeTime(date) {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/**
 * Get elapsed minutes from a date
 */
export function getElapsedMinutes(date) {
  if (!date) return 0;
  return differenceInMinutes(new Date(), new Date(date));
}

/**
 * Format elapsed time as mm:ss
 */
export function formatElapsedTime(startDate) {
  if (!startDate) return '00:00';
  const totalSeconds = Math.floor((Date.now() - new Date(startDate).getTime()) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Format order number with padding
 */
export function formatOrderNumber(num) {
  return `#${String(num).padStart(4, '0')}`;
}

/**
 * Format percentage
 */
export function formatPercent(value) {
  const num = Number(value) || 0;
  return `${num.toFixed(1)}%`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text, maxLength = 30) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

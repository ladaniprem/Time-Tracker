// Theme configuration
export const defaultTheme = 'light' as const;

// Date and time formatting options
export const dateFormatOptions: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

export const timeFormatOptions: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
};

// Pagination defaults
export const defaultPageSize = 50;
export const maxPageSize = 100;

// Application metadata
export const appName = 'AttendanceHub';
export const appDescription = 'Comprehensive Workforce Management System';

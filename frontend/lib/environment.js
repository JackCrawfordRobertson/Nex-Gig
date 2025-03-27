export const isDevelopment = 
  typeof window !== 'undefined' 
    ? window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    : process.env.NODE_ENV === "development";

export const appUrl = typeof window !== 'undefined'
  ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:3000'
      : 'https://next.gig.jack-robertson.co.uk')
  : (process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : 'https://next.gig.jack-robertson.co.uk');

export const ALLOWED_PRODUCTION_EMAILS = [
  'jack@ya-ya.co.uk',
  // Add other authorized emails
];
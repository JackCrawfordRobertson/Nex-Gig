const { builder } = require('@netlify/functions');

async function handler(event, context) {
  // Log the request for debugging
  console.log('Auth request:', {
    path: event.path,
    httpMethod: event.httpMethod,
    headers: event.headers,
    body: event.body ? JSON.parse(event.body) : null
  });

  try {
    // Pass through to Next.js API routes
    // This relies on the @netlify/plugin-nextjs plugin
    const nextHandler = require('../../.netlify/functions-internal/next_api_auth').handler;
    return await nextHandler(event, context);
  } catch (error) {
    console.error('Error in Netlify function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' })
    };
  }
}

exports.handler = builder(handler);
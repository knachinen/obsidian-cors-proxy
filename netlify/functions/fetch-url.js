// netlify/functions/fetch-url.js
const fetch = require('node-fetch'); // Import node-fetch for making HTTP requests

exports.handler = async function(event, context) {
    // Ensure the request method is GET (or POST if you prefer)
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed',
            headers: { 'Access-Control-Allow-Origin': '*' } // Allow all origins for the error response too
        };
    }

    // Get the target URL from the query parameters (e.g., ?url=https://example.com)
    const targetUrl = event.queryStringParameters.url;

    // Validate if a URL was provided
    if (!targetUrl) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'URL parameter is missing.' }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*' // Allow all origins to read this error
            }
        };
    }

    try {
        // Make the request to the target URL
        // Node.js fetch is not subject to browser CORS restrictions.
        const response = await fetch(targetUrl);

        // If the target server responded with an error status
        if (!response.ok) {
            return {
                statusCode: response.status, // Pass through the target's status code
                body: JSON.stringify({ error: `Failed to fetch target URL: ${response.statusText}` }),
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            };
        }

        // Get the HTML content as text
        const htmlContent = await response.text();

        // Return the HTML content wrapped in a JSON object.
        // Crucially, set 'Access-Control-Allow-Origin: *' to allow your Obsidian plugin
        // (running in a WebView) to read the response.
        return {
            statusCode: 200,
            body: JSON.stringify({ contents: htmlContent }), // Wrap in 'contents' key
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*' // This is vital for CORS to work on the client-side
            }
        };

    } catch (error) {
        console.error('Function error:', error); // Log the error for debugging in Netlify logs
        return {
            statusCode: 500,
            body: JSON.stringify({ error: `Serverless function experienced an error: ${error.message}` }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        };
    }
};
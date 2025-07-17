// netlify/functions/fetch-url.js

// No need to import or require fetch anymore.
// It's globally available in modern Node.js environments like Netlify's.

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed',
            headers: { 'Access-Control-Allow-Origin': '*' }
        };
    }

    const targetUrl = event.queryStringParameters.url;

    if (!targetUrl) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'URL parameter is missing.' }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        };
    }

    try {
        // Define browser-like headers
        const requestHeaders = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36', // Example Chrome User-Agent (updated for mid-2025)
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'Accept-Language': 'en-US,en;q=0.9,ko;q=0.8', // Added Korean as per context
            'DNT': '1', // Do Not Track request header
            'Connection': 'keep-alive',
            // 'Referer': 'https://www.google.com/' // Sometimes adding a referer helps, but can also be specific
        };

        // Use the native fetch API available in Node.js, including headers
        const response = await fetch(targetUrl, {
            headers: requestHeaders
        });

        if (!response.ok) {
            // Log the full response status and text for debugging
            console.error(`Fetch to ${targetUrl} failed with status: ${response.status}, text: ${response.statusText}`);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: `Failed to fetch target URL: ${response.statusText}` }),
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            };
        }

        const htmlContent = await response.text();

        return {
            statusCode: 200,
            body: JSON.stringify({ contents: htmlContent }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        };

    } catch (error) {
        console.error('Function error:', error);
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
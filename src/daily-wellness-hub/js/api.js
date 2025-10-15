/**
 * API MODULE (js/api.js)
 * Responsible for all external data fetching.
 * * * APIs Used:
 * 1. Quotable API (Motivation) - No key required
 * 2. YouTube Data API (Curated Videos) - Key required
 */

// --- API Keys ---
// ***************************************************************
// !!! ACTION REQUIRED: Paste your YouTube Data API Key here !!!
// ***************************************************************
const YOUTUBE_API_KEY = 'AIzaSyCONoQnrxPcSUayzdH175rFwXO2uIjuzn0';

// --- YouTube API Settings ---
const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';

// --- QUOTE API URL (Using Quotable API) ---
const QUOTE_API_URL = 'https://api.quotable.io/random';


/**
 * Fetches a random daily motivational quote.
 * @returns {Promise<string>} A promise that resolves to a formatted quote string "Quote Text — Author Name".
 */
export async function fetchQuote() {
    try {
        const response = await fetch(QUOTE_API_URL);

        if (!response.ok) {
            // Log specific HTTP error if API responds but status is not 200
            console.error(`Quote fetch failed with status: ${response.status} ${response.statusText}`);
            throw new Error(`Quote API response failed.`);
        }

        const data = await response.json();
        console.log("Successfully fetched daily quote.");
        // Returns a single string formatted as: "Quote Text — Author Name"
        return `${data.content} — ${data.author}`;
    } catch (error) {
        // Log the root error (e.g., network failure)
        console.error("Error fetching quote (using fallback):", error);
        // Fallback quote
        return "Always code as if the person who ends up maintaining your code will be a violent psychopath who knows where to live. — Martin Golding";
    }
}

/**
 * Fetches relevant videos from YouTube based on a query (e.g., 'meditation', 'yoga').
 * @param {string} query The search term for YouTube videos.
 * @returns {Promise<Array<Object>>} An array of simplified video objects.
 */
export async function fetchVideos(query = 'daily motivation') {
    // Check for placeholder key
    if (YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY' || !YOUTUBE_API_KEY) {
        console.error("YouTube API Key is not set. Please insert your key into js/api.js to enable videos.");
        // Return mock data if key is missing
        return [
            { videoId: 'e-g-j8Jt4_8', title: '5 Minute Morning Meditation', channelTitle: 'Mock Wellness Channel' },
            { videoId: '5q3IqjGf_mY', title: 'Quick De-stress Breathing', channelTitle: 'Mock Wellness Channel' }
        ];
    }

    const maxResults = 5;
    const type = 'video';
    // CRITICAL FIX: Add videoEmbeddable=true to filter for videos allowed to be embedded.
    // Also adding videoLicense=creativeCommon to find more reusable/available content.
    const embeddableParam = '&videoEmbeddable=true&videoLicense=creativeCommon';
    const apiUrl = `${YOUTUBE_SEARCH_URL}?key=${YOUTUBE_API_KEY}&q=${encodeURIComponent(query)}&part=snippet&maxResults=${maxResults}&type=${type}&videoDuration=short${embeddableParam}`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`YouTube API status: ${response.status}. Response details: ${errorText}`);
            // This error will be caught by app.js and displayed to the user
            throw new Error(`YouTube API failed. Status: ${response.status}. Check your API Key or quota usage.`);
        }

        const data = await response.json();

        // Map the complex YouTube response to a simplified object array
        return data.items.map(item => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            channelTitle: item.snippet.channelTitle
        }));

    } catch (error) {
        console.error("Error fetching YouTube videos:", error);
        // Fallback to empty array
        return [];
    }
}

// The module exports both functions
export default { fetchQuote, fetchVideos };

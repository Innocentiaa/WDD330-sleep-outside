// --- ES MODULE: API HANDLER (js/api.js) ---

// Replace these placeholders with your actual keys and URLs
const ZENQUOTES_API_URL = 'https://api.zenquotes.io/v1/random';
const YOUTUBE_API_KEY = 'YOUR_YOUTUBE_API_KEY';
const YOUTUBE_SEARCH_URL = (query) =>
    `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&part=snippet&type=video&maxResults=5&q=${encodeURIComponent(query)}`;

/**
 * Fetches a daily motivational quote from ZenQuotes API.
 * @returns {Promise<Object>} An object containing the quote, author, and ID.
 */
export async function fetchQuote() {
    try {
        // --- TODO: Replace with actual fetch ---
        // const response = await fetch(ZENQUOTES_API_URL);
        // const data = await response.json();
        // if (data && data.length > 0) return data[0];

        // MOCK DATA for demonstration
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
            q: "The journey of a thousand miles begins with a single step.",
            a: "Lao Tzu",
            id: 'q-lao-tzu'
        };

    } catch (error) {
        console.error("Error fetching quote:", error);
        throw new Error("Could not load daily quote. Check API connection.");
    }
}

/**
 * Fetches curated videos related to wellness using the YouTube Data API.
 * @param {string} query - The search term (e.g., 'meditation', 'fitness').
 * @returns {Promise<Array<Object>>} An array of video objects.
 */
export async function fetchVideos(query = 'daily wellness') {
    try {
        // --- TODO: Replace with actual fetch ---
        // const url = YOUTUBE_SEARCH_URL(query);
        // const response = await fetch(url);
        // const data = await response.json();
        // return data.items.map(item => ({...})); // Map to required attributes

        // MOCK DATA for demonstration
        await new Promise(resolve => setTimeout(resolve, 800));
        return [
            {
                videoId: '3s-rJd210hK',
                title: '10 Minute Guided Morning Meditation',
                channelTitle: 'Mindful World',
                thumbnail: 'https://placehold.co/128x72/00a896/ffffff?text=MEDITATION',
                publishedAt: '2024-01-15'
            },
            {
                videoId: '4h-tUd55rPZ',
                title: 'Beginner Full Body Workout (No Equipment)',
                channelTitle: 'Fitness Pro',
                thumbnail: 'https://placehold.co/128x72/f9a825/ffffff?text=WORKOUT',
                publishedAt: '2024-03-01'
            }
        ];

    } catch (error) {
        console.error("Error fetching videos:", error);
        // Use a placeholder image URL for the thumbnail error fallback
        throw new Error("Could not load videos. Check YouTube API key and connection.");
    }
}

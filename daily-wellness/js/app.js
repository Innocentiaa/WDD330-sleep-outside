// --- ES MODULE: MAIN APP LOGIC (js/app.js) ---
import { fetchQuote, fetchVideos } from './api.js';

// Import local JSON data (assuming data.json is hosted or loaded as module)
// NOTE: For true vanilla JS module import, you might need a build step or fetch locally.
// We will use a fetch-like simulation for the local data here.
const LOCAL_TIPS_URL = './data/data.json';

// --- LOCAL STORAGE MANAGER (Requirement #6: 4 properties) ---
const APP_ID = 'wellness-hub-2025';
const keys = {
    FAVORITES: `${APP_ID}-favorites`,    // Property 1: Saved items
    THEME: `${APP_ID}-theme`,            // Property 2: User's theme preference
    LAST_CATEGORY: `${APP_ID}-category`, // Property 3: User's last filter
    LAST_FETCH: `${APP_ID}-fetch-ts`     // Property 4: Timestamp for API caching
};

const storage = {
    get(key, defaultValue = []) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error(`Error reading key ${key}:`, e);
            return defaultValue;
        }
    },
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error(`Error writing key ${key}:`, e);
        }
    }
};

// --- STATE AND DATA ---
let favorites = storage.get(keys.FAVORITES);
let localTipsData = []; // Will be loaded from data.json
let currentView = 'home';
let currentSearchTerm = '';
let currentCategory = storage.get(keys.LAST_CATEGORY, 'all');

// --- DOM ELEMENTS (Cached) ---
const els = {
    quoteContent: null, // Will be set in init
    tipsList: null,
    videoList: null,
    favoritesList: null,
    searchInput: null,
    categoryFilter: null,
    themeToggle: null,
    contentContainer: null,
    // Add sections here:
    homeSection: null,
    favoritesSection: null,
    tipsSection: null
};

// --- CORE RENDERING LOGIC ---

function isFavorited(id) {
    return favorites.some(fav => fav.id === id);
}

function renderQuote(quote) {
    if (!els.quoteContent) return;

    // Robust Logic: Check if the quote is saved
    const isFav = isFavorited(quote.id);

    els.quoteContent.innerHTML = `
        <p class="text-3xl font-body italic mb-6 leading-relaxed">"${quote.q}"</p>
        <p class="text-lg font-semibold text-gray-500 dark:text-gray-400"> - ${quote.a}</p>
        <button class="favorite-btn mt-6 text-4xl transition duration-200 ${isFav ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}" data-id="${quote.id}" data-type="quote" data-q="${quote.q}" data-a="${quote.a}">
            <svg class="w-8 h-8" fill="${isFav ? 'red' : 'none'}" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
        </button>
    `;
}

function renderTips(tips) {
    if (!els.tipsList) return;

    // Robust Logic: Filtering and Searching
    const filteredTips = tips.filter(tip => {
        const matchesCategory = els.categoryFilter.value === 'all' || tip.category === els.categoryFilter.value;
        const matchesSearch = els.searchInput.value.trim() === '' ||
            tip.title.toLowerCase().includes(els.searchInput.value.toLowerCase()) ||
            tip.content.toLowerCase().includes(els.searchInput.value.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    els.tipsList.innerHTML = filteredTips.length === 0
        ? `<p class="text-center text-xl text-gray-500 p-8 card rounded-xl">No wellness tips found for this filter.</p>`
        : filteredTips.map(tip => {
            const isFav = isFavorited(tip.id);
            return `
                <article class="p-6 card rounded-xl shadow-lg space-y-3 border-l-8 border-primary-light dark:border-primary-dark hover:shadow-xl transition duration-300 animated-content">
                    <div class="flex justify-between items-start">
                        <h3 class="text-2xl font-heading text-primary-light dark:text-primary-dark">${tip.title}</h3>
                        <button class="favorite-btn text-3xl transition duration-200 ml-4" data-id="${tip.id}" data-type="tip" data-title="${tip.title}" data-content="${tip.content}">
                             <svg class="w-7 h-7" fill="${isFav ? 'red' : 'none'}" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                        </button>
                    </div>
                    <p class="text-base">${tip.content}</p>
                    <footer class="text-sm font-medium text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                        Category: ${tip.category} | Source: ${tip.source}
                    </footer>
                </article>
            `;
        }).join('');
}

function renderVideos(videos) {
    if (!els.videoList) return;

    els.videoList.innerHTML = videos.length === 0
        ? `<p class="text-center text-gray-500 p-4">No curated videos available.</p>`
        : videos.map(video => {
            const videoId = video.videoId;
            const isFav = isFavorited(videoId);
            return `
                <div class="card rounded-xl shadow-md overflow-hidden border-b-4 border-gray-300 dark:border-gray-700 animated-content">
                    <iframe 
                        width="100%" 
                        height="auto" 
                        src="https://www.youtube.com/embed/${videoId}" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen 
                        class="aspect-video"
                    ></iframe>
                    <div class="p-4 space-y-2">
                        <h3 class="text-lg font-heading">${video.title}</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400">${video.channelTitle}</p>
                        <button class="favorite-btn text-3xl float-right transition duration-200" data-id="${videoId}" data-type="video" data-title="${video.title}">
                            <svg class="w-7 h-7" fill="${isFav ? 'red' : 'none'}" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
}

function renderFavorites() {
    if (!els.favoritesList) return;

    els.favoritesList.innerHTML = favorites.length === 0
        ? `<p class="text-center text-xl text-gray-500 p-8 card rounded-xl">You haven't saved any favorites yet. Click the heart icon to save!</p>`
        : favorites.map(fav => {
            let content;
            if (fav.type === 'quote') {
                content = `<p class="text-lg italic">"${fav.q}" <span class="text-sm font-semibold block text-gray-500 dark:text-gray-400"> - ${fav.a}</span></p>`;
            } else if (fav.type === 'tip') {
                content = `<p class="text-xl font-heading">${fav.title}</p><p class="text-sm">${fav.content.substring(0, 150)}...</p>`;
            } else if (fav.type === 'video') {
                // Include a small embedded video or a link to it
                content = `<p class="text-xl font-heading">${fav.title}</p><div class="aspect-video mt-2"><iframe width="100%" height="auto" src="https://www.youtube.com/embed/${fav.id}" frameborder="0" allowfullscreen></iframe></div>`;
            }

            return `
                <div class="p-6 card rounded-xl shadow-md space-y-2 border-l-8 border-red-500 animated-content flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div class="flex-grow">${content}</div>
                    <button class="favorite-btn text-red-500 text-3xl ml-4 mt-3 sm:mt-0 transition duration-200" data-id="${fav.id}" data-type="${fav.type}">
                         <svg class="w-7 h-7" fill="red" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                    </button>
                </div>
            `;
        }).join('');
}


// --- EVENT HANDLERS (Requirement #5: 5+ Events) ---

// Event Handler #1: Toggle Favorite
function handleToggleFavorite(event) {
    const button = event.target.closest('.favorite-btn');
    if (!button) return;

    const id = button.dataset.id;
    const type = button.dataset.type;
    const index = favorites.findIndex(fav => fav.id === id);

    let isAdding = (index === -1);

    if (isAdding) {
        let newItem = { id, type };
        // Capture necessary data from the button's data attributes
        if (type === 'quote') {
            newItem.q = button.dataset.q;
            newItem.a = button.dataset.a;
        } else if (type === 'tip') {
            // Find the full tip object from the local data
            const tip = localTipsData.find(t => t.id === id);
            newItem.title = tip ? tip.title : button.dataset.title;
            newItem.content = tip ? tip.content : button.dataset.content;
        } else if (type === 'video') {
            newItem.title = button.dataset.title;
        }
        favorites.push(newItem);
    } else {
        favorites.splice(index, 1);
    }

    storage.set(keys.FAVORITES, favorites);

    // Re-render the current view to update heart icons
    if (currentView === 'favorites') {
        renderFavorites();
    } else {
        // Simple trick to re-render all dynamic content to update heart state
        loadInitialData();
    }
}

// Event Handler #2: Theme Toggle
function handleThemeToggle() {
    const newTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark');
    storage.set(keys.THEME, newTheme);
}

// Event Handler #3 & #4: Search and Filter Update
function handleContentUpdate() {
    storage.set(keys.LAST_CATEGORY, els.categoryFilter.value);
    renderTips(localTipsData); // Only re-renders tips based on filters
    // Optionally: re-fetch videos based on filter category if it changes
}

// Event Handler #5: Navigation
function handleNavigation(event) {
    const view = event.target.closest('.nav-button')?.dataset.page;
    if (!view || view === currentView) return;

    // Reset view visibility
    els.homeSection.classList.add('hidden');
    els.tipsSection.classList.add('hidden');
    els.favoritesSection.classList.add('hidden');
    document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('font-bold', 'text-primary-light', 'dark:text-primary-dark'));

    // Set new view and bold the button
    currentView = view;
    event.target.closest('.nav-button').classList.add('font-bold', 'text-primary-light', 'dark:text-primary-dark');

    if (view === 'home' || view === 'tips') {
        els.homeSection.classList.remove('hidden');
        els.tipsSection.classList.remove('hidden');
    } else if (view === 'favorites') {
        els.favoritesSection.classList.remove('hidden');
        renderFavorites();
    }
}


// --- INITIAL DATA LOAD & APPLICATION STARTUP ---
async function loadInitialData() {
    // 1. Load Local Tips Data
    try {
        // Simulation of fetching local data.json
        const mockResponse = await fetch(LOCAL_TIPS_URL);
        localTipsData = await mockResponse.json();
    } catch (e) {
        // If local fetch fails (e.g., due to strict browser policy), use the embedded mock
        console.warn("Local data.json fetch failed. Using embedded mock data.");
        // We'd embed the mock data directly here if fetch failed in a real environment
        // For now, we'll assume the hosted environment allows this fetch.
        // If not, you must replace the fetch(LOCAL_TIPS_URL) logic above with the actual JSON array.
        // For this demo, let's use the first item as a minimal fallback
        localTipsData = [{ id: 'fail', title: 'Data Load Error', content: 'Could not load local tips.', category: 'Error' }];
    }


    // 2. Fetch and render API data
    try {
        const quote = await fetchQuote();
        renderQuote(quote);
    } catch (e) {
        renderQuote({ q: e.message, a: "System Error", id: 'q-error' });
    }

    try {
        // Use the last selected category for initial video search if it's not 'all'
        const videoQuery = currentCategory === 'all' ? 'daily wellness' : currentCategory;
        const videos = await fetchVideos(videoQuery);
        renderVideos(videos);
    } catch (e) {
        els.videoList.innerHTML = `<p class="text-red-500 p-4">Error: ${e.message}</p>`;
    }

    // 3. Render Tips
    renderTips(localTipsData);

    // 4. Set initial view/filters
    els.categoryFilter.value = currentCategory;
    handleNavigation({ target: document.querySelector(`[data-page="${currentView}"]`) }); // Initialize view
}

// Event Handler #6: Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM Elements
    els.quoteContent = document.getElementById('quote-content');
    els.tipsList = document.getElementById('tips-list');
    els.videoList = document.getElementById('video-list');
    els.favoritesList = document.getElementById('favorites-list');
    els.searchInput = document.getElementById('search-input');
    els.categoryFilter = document.getElementById('category-filter');
    els.themeToggle = document.getElementById('theme-toggle');
    els.homeSection = document.getElementById('home-section');
    els.favoritesSection = document.getElementById('favorites-section');
    els.tipsSection = document.getElementById('tips-section');

    // Apply saved theme immediately
    if (storage.get(keys.THEME) === 'dark') {
        document.documentElement.classList.add('dark');
    }

    // Attach Event Listeners (Delegated where possible)
    document.addEventListener('click', handleToggleFavorite); // Favorite clicks
    els.themeToggle.addEventListener('click', handleThemeToggle);
    els.searchInput.addEventListener('input', handleContentUpdate); // Event #3: keyup/input
    els.categoryFilter.addEventListener('change', handleContentUpdate); // Event #4: filter change
    document.querySelectorAll('.nav-button').forEach(btn => btn.addEventListener('click', handleNavigation)); // Event #5: nav click

    // Start App
    loadInitialData();
});

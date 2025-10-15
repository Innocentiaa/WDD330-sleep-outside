/**
 * ES MODULE: MAIN APP LOGIC (js/app.js)
 * * CRITICAL FIX: The handleNavigation function has been modified to aggressively hide all main content
 * sections when navigating to the 'favorites' view, preventing content overlap.
 * * Ensures only 'video' type content is rendered on the Favorites page.
 */
import { fetchQuote, fetchVideos } from './api.js';

// Import local JSON data (assuming data.json is hosted or loaded as module)
const LOCAL_TIPS_URL = './data/data.json';

// --- LOCAL STORAGE MANAGER (Requirement #6: 4 properties) ---
const APP_ID = 'wellness-hub-2025';
const keys = {
    FAVORITES: `${APP_ID}-favorites`,    // Property 1: Saved items
    THEME: `${APP_ID}-theme`,            // Property 2: User's theme preference
    LAST_CATEGORY: `${APP_ID}-category`, // Property 3: User's last filter
    LAST_FETCH: `${APP_ID}-fetch-ts`     // Property 4: Timestamp for API caching
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
    homeSection: null, // Main wrapper for Home/Tips content
    favoritesSection: null, // Main wrapper for Favorites content
    tipsSection: null, // Sub-section within homeSection for Tips list
    // Elements for selective hiding/showing
    quoteSection: null, // Sub-section within homeSection for Quote
    videoSidebar: null, // Sub-section within homeSection for Videos
};

// --- HELPER FUNCTIONS ---

// Provides a stable ID for the Daily Quote element, ensuring it can be saved persistently.
function getDailyQuoteId() {
    return 'daily-quote-inspiration';
}

// --- CORE RENDERING LOGIC ---

function isFavorited(id) {
    return favorites.some(fav => fav.id === id);
}

function renderQuote(quote) {
    if (!els.quoteContent) {
        console.error("renderQuote failed: els.quoteContent (ID: 'quote-content') element not found in the DOM.");
        return;
    }

    const quoteId = quote.id;
    const isFav = isFavorited(quoteId);

    els.quoteContent.innerHTML = `
        <p class="text-3xl font-body italic mb-6 leading-relaxed">"${quote.q || quote}"</p>
        <p class="text-lg font-semibold text-gray-500 dark:text-gray-400"> - ${quote.a || 'Zen Master'}</p>
        <button class="favorite-btn mt-6 text-4xl transition duration-200 ${isFav ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}" 
            data-id="${quoteId}" 
            data-type="quote" 
            data-q="${quote.q || quote}" 
            data-a="${quote.a || 'Zen Master'}">
            <svg class="w-8 h-8" fill="${isFav ? 'red' : 'none'}" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
        </button>
    `;
}

function renderTips(tips) {
    if (!els.tipsList) return;

    // Robust Logic: Filtering and Searching
    const filteredTips = tips.filter(tip => {
        const categoryValue = els.categoryFilter ? els.categoryFilter.value : 'all';
        const searchValue = els.searchInput ? els.searchInput.value.trim().toLowerCase() : '';

        const matchesCategory = categoryValue === 'all' || tip.category === categoryValue;
        const matchesSearch = searchValue === '' ||
            tip.title.toLowerCase().includes(searchValue) ||
            tip.content.toLowerCase().includes(searchValue);
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
        ? `<p class="text-center text-gray-500 p-4">No curated videos available. Please check your YouTube API key and quota.</p>`
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
                        <button class="favorite-btn text-3xl float-right transition duration-200" 
                            data-id="${videoId}" 
                            data-type="video" 
                            data-title="${video.title}">
                            <svg class="w-7 h-7" fill="${isFav ? 'red' : 'none'}" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
}

function renderFavorites() {
    if (!els.favoritesList) return;

    // CRITICAL FIX: Filter the persistent favorites array to only include 'video' types.
    const favoriteVideos = favorites.filter(fav => fav.type === 'video');

    els.favoritesList.innerHTML = favoriteVideos.length === 0
        ? `<p class="text-center text-xl text-gray-500 p-8 card rounded-xl">You haven't saved any favorite **videos** yet. Click the heart icon on the Home or Tips page to save a video!</p>`
        : favoriteVideos.map(fav => {
            // Since we filtered, we can assume all items here are videos.

            return `
                <div class="card rounded-xl shadow-lg p-5 border-l-8 border-red-500 animated-content flex flex-col md:flex-row items-start space-x-0 md:space-x-6">
                    <!-- Video Content Area -->
                    <div class="w-full md:w-2/3">
                        <p class="text-xl font-heading text-gray-800 dark:text-gray-100 mb-3">${fav.title}</p>
                        <!-- Responsive Iframe Container -->
                        <div class="aspect-video">
                            <iframe 
                                width="100%" 
                                height="100%" 
                                src="https://www.youtube.com/embed/${fav.id}" 
                                frameborder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen
                            ></iframe>
                        </div>
                    </div>
                    
                    <!-- Remove Button Area -->
                    <div class="w-full md:w-1/3 flex justify-end md:justify-center items-center pt-4 md:pt-0">
                        <button class="favorite-btn text-red-500 text-4xl transition duration-200 hover:scale-105" 
                            data-id="${fav.id}" 
                            data-type="${fav.type}" 
                            title="Remove from Favorites">
                            <!-- Filled Heart Icon (since it's already a favorite) -->
                             <svg class="w-9 h-9" fill="red" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                             <span class="sr-only">Remove</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
}


// --- EVENT HANDLERS ---

function handleToggleFavorite(event) {
    const button = event.target.closest('.favorite-btn');
    if (!button) return;

    const id = button.dataset.id;
    const type = button.dataset.type;
    const index = favorites.findIndex(fav => fav.id === id);

    let isAdding = (index === -1);

    if (isAdding) {
        let newItem = { id, type };
        if (type === 'quote') {
            newItem.q = button.dataset.q;
            newItem.a = button.dataset.a;
        } else if (type === 'tip') {
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

    // After updating favorites, re-render the relevant view
    if (currentView === 'favorites') {
        renderFavorites();
    } else {
        // Re-load to update heart icons on the current view (Home or Tips)
        loadInitialData(false); // Do not re-fetch all data, just re-render
    }
}

function handleThemeToggle() {
    const newTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark');
    storage.set(keys.THEME, newTheme);
}

async function handleContentUpdate() {
    storage.set(keys.LAST_CATEGORY, els.categoryFilter.value);

    // Rerender tips based on filters
    renderTips(localTipsData);

    // Re-fetch and render videos based on the new category filter
    const videoQuery = els.categoryFilter.value === 'all' ? 'daily wellness' : els.categoryFilter.value;
    const videos = await fetchVideos(videoQuery);
    renderVideos(videos);
}

function handleNavigation(event) {
    const view = event.target.closest('.nav-button')?.dataset.page;
    if (!view || view === currentView) return;

    // 1. Reset view visibility for top-level containers
    els.homeSection.classList.add('hidden');
    els.favoritesSection.classList.add('hidden');
    document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('font-bold', 'text-primary-light', 'dark:text-primary-dark'));

    // Set new view and bold the button
    currentView = view;
    const navButton = event.target.closest('.nav-button');
    if (navButton) {
        navButton.classList.add('font-bold', 'text-primary-light', 'dark:text-primary-dark');
    }

    if (view === 'home') {
        // HOME: Show Home section and ALL its sub-sections
        els.homeSection.classList.remove('hidden');
        els.quoteSection.classList.remove('hidden');
        els.videoSidebar.classList.remove('hidden');
        els.tipsSection.classList.remove('hidden');
        loadInitialData(false);

    } else if (view === 'tips') {
        // TIPS: Show Home section but hide non-tip sub-sections
        els.homeSection.classList.remove('hidden');

        // Hide elements not needed for the Tips focus view
        els.quoteSection.classList.add('hidden');
        els.videoSidebar.classList.add('hidden');

        // Ensure Tips section is visible
        els.tipsSection.classList.remove('hidden');
        loadInitialData(false);

    } else if (view === 'favorites') {
        // FAVORITES: Show ONLY favorites section.
        els.favoritesSection.classList.remove('hidden');

        // CRITICAL FIX: Aggressively hide all sub-components of the home view 
        // in case els.homeSection is not a perfect wrapper.
        els.quoteSection.classList.add('hidden');
        els.videoSidebar.classList.add('hidden');
        els.tipsSection.classList.add('hidden');

        renderFavorites();
    }
}


// --- INITIAL DATA LOAD & APPLICATION STARTUP ---
async function loadInitialData(fullFetch = true) {
    // 1. Load Local Tips Data (always load, as it's quick)
    if (localTipsData.length === 0) {
        try {
            const mockResponse = await fetch(LOCAL_TIPS_URL);
            localTipsData = await mockResponse.json();
        } catch (e) {
            console.warn("Local data.json fetch failed. Using embedded mock data.");
            localTipsData = [{ id: 'fail', title: 'Data Load Error', content: 'Could not load local tips.', category: 'Error', source: 'System' }];
        }
    }


    if (fullFetch) {
        // 2. Fetch and render API data (Quote + Videos)
        try {
            const quoteString = await fetchQuote();
            const parts = quoteString.split('—').map(s => s.trim());
            const q = parts[0] || quoteString;
            const a = parts.length > 1 ? parts.slice(1).join('—') : 'Zen Master';
            const quoteId = getDailyQuoteId();

            renderQuote({ q, a, id: quoteId });
        } catch (e) {
            console.error("Critical error in loadInitialData during quote fetch/render:", e.message);
            renderQuote({ q: `Error loading quote: ${e.message}`, a: "System Error", id: getDailyQuoteId() });
        }

        // 3. YouTube Video Fetch
        try {
            const videoQuery = currentCategory === 'all' ? 'daily wellness' : currentCategory;
            const videos = await fetchVideos(videoQuery);
            renderVideos(videos);
        } catch (e) {
            console.error("Critical error in loadInitialData during video fetch:", e.message);
            els.videoList.innerHTML = `<p class="text-red-500 p-4">Error: ${e.message}</p>`;
        }
    }

    // 4. Render Tips
    renderTips(localTipsData);

    // 5. Set initial view/filters
    if (els.categoryFilter) {
        els.categoryFilter.value = currentCategory;
    }
    const initialNavButton = document.querySelector(`[data-page="${currentView}"]`);
    if (initialNavButton) {
        // Call handleNavigation to ensure the correct sections are visible/hidden
        handleNavigation({ target: initialNavButton });
    } else {
        currentView = 'home';
        document.getElementById('home-section')?.classList.remove('hidden');
    }
}

// Event Handler #6: Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Cache ALL required DOM Elements
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
    els.quoteSection = document.getElementById('quote-section');
    els.videoSidebar = document.getElementById('video-sidebar');

    if (!els.quoteContent) {
        console.error("Initialization Failed: Could not find element with ID 'quote-content'. Check your index.html.");
    }

    // Apply saved theme immediately
    if (storage.get(keys.THEME) === 'dark') {
        document.documentElement.classList.add('dark');
    }

    // Attach Event Listeners
    document.addEventListener('click', handleToggleFavorite);
    els.themeToggle.addEventListener('click', handleThemeToggle);
    els.searchInput.addEventListener('input', handleContentUpdate);
    els.categoryFilter.addEventListener('change', handleContentUpdate);
    document.querySelectorAll('.nav-button').forEach(btn => btn.addEventListener('click', handleNavigation));

    // Start App
    loadInitialData();
});

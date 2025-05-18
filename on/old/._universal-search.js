/**
 * Universal Satellite Search Integration
 * This script works across domains and handles CORS issues gracefully
 */
(function() {
  // ===== CONFIGURATION =====
  // Change these settings to match your environment
  const config = {
    // The URL of your search API (change this to your actual API URL)
    apiUrl: "https://search.wromo.com/api",
    
    // DOM selector for where to mount the search interface
    selector: "#satellite-search",
    
    // Display mode: 'redirect' or 'embed'
    displayMode: "redirect",
    
    // Number of results per page
    resultsPerPage: 10,
    
    // Placeholder text for search input
    placeholderText: "Search for anything...",
    
    // Whether to show search suggestions
    showSuggestions: true,
    
    // JSONP callback parameter name (for CORS-free requests)
    // Only change if your API uses a different parameter name
    jsonpCallback: "callback",
    
    // Styling
    theme: {
      primaryColor: "#3b82f6",
      borderRadius: "8px",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }
  };

  // ===== CORE FUNCTIONALITY =====
  
  // Initialize when DOM is ready
  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(initSearch, 1);
  } else {
    document.addEventListener("DOMContentLoaded", initSearch);
  }
  
  function initSearch() {
    // Find the container element
    const container = document.querySelector(config.selector);
    if (!container) {
      console.error(`Satellite Search: Container element "${config.selector}" not found`);
      return;
    }
    
    // Create and inject CSS
    injectStyles();
    
    // Create search UI
    createSearchUI(container);
    
    // Initialize event listeners
    initEventListeners();
  }
  
  // ===== UI CREATION =====
  
  function injectStyles() {
    if (document.getElementById("satellite-search-styles")) return;
    
    const style = document.createElement("style");
    style.id = "satellite-search-styles";
    style.textContent = `
      .satellite-search-container * {
        box-sizing: border-box;
        font-family: ${config.theme.fontFamily};
      }
      
      .satellite-search-container {
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
      }
      
      .satellite-search-input-container {
        position: relative;
        margin-bottom: 20px;
      }
      
      .satellite-search-input {
        width: 100%;
        padding: 12px 15px;
        font-size: 16px;
        border: 1px solid #ddd;
        border-radius: ${config.theme.borderRadius};
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        transition: all 0.2s ease;
      }
      
      .satellite-search-input:focus {
        outline: none;
        border-color: ${config.theme.primaryColor};
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
      }
      
      .satellite-search-button {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        background: ${config.theme.primaryColor};
        border: none;
        color: white;
        padding: 8px 16px;
        border-radius: ${config.theme.borderRadius};
        cursor: pointer;
        font-size: 14px;
      }
      
      .satellite-search-button:hover {
        background: #2563eb;
      }
      
      .satellite-search-suggestions {
        position: absolute;
        width: 100%;
        background: white;
        border: 1px solid #ddd;
        border-top: none;
        border-radius: 0 0 ${config.theme.borderRadius} ${config.theme.borderRadius};
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 10;
        display: none;
      }
      
      .satellite-suggestion-item {
        padding: 10px 15px;
        cursor: pointer;
      }
      
      .satellite-suggestion-item:hover {
        background-color: #f5f5f5;
      }
      
      .satellite-results-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 20px;
      }
      
      .satellite-result-card {
        border: 1px solid #eee;
        border-radius: ${config.theme.borderRadius};
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        transition: transform 0.2s, box-shadow 0.2s;
        cursor: pointer;
        background-color: white;
      }
      
      .satellite-result-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0,0,0,0.1);
      }
      
      .satellite-card-image {
        width: 100%;
        height: 180px;
        object-fit: cover;
        background-color: #f5f5f5;
      }
      
      .satellite-card-content {
        padding: 15px;
      }
      
      .satellite-card-title {
        margin: 0 0 10px 0;
        font-size: 18px;
        font-weight: 600;
        color: #333;
      }
      
      .satellite-card-description {
        margin: 0 0 15px 0;
        font-size: 14px;
        color: #666;
        line-height: 1.4;
      }
      
      .satellite-card-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .satellite-card-source {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 12px;
        color: #666;
      }
      
      .satellite-card-price {
        font-weight: 600;
        color: #2e7d32;
      }
      
      .satellite-card-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        margin-top: 10px;
      }
      
      .satellite-tag {
        background-color: #f1f1f1;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        color: #666;
      }
      
      .satellite-modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.7);
        z-index: 100;
        overflow: auto;
      }
      
      .satellite-modal-content {
        background-color: white;
        margin: 50px auto;
        padding: 20px;
        width: 80%;
        max-width: 800px;
        border-radius: ${config.theme.borderRadius};
        position: relative;
      }
      
      .satellite-close-modal {
        position: absolute;
        top: 10px;
        right: 15px;
        font-size: 24px;
        cursor: pointer;
      }
      
      .satellite-embed-container {
        width: 100%;
        height: 600px;
        border: none;
      }
      
      .satellite-error {
        padding: 20px;
        background-color: #fee2e2;
        border: 1px solid #ef4444;
        border-radius: ${config.theme.borderRadius};
        color: #b91c1c;
        margin-bottom: 20px;
      }
      
      .satellite-loading {
        text-align: center;
        padding: 20px;
      }
      
      @media (max-width: 768px) {
        .satellite-results-container {
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        }
        
        .satellite-modal-content {
          width: 95%;
          margin: 20px auto;
        }
        
        .satellite-embed-container {
          height: 400px;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  function createSearchUI(container) {
    container.classList.add("satellite-search-container");
    
    // Create search input
    const inputContainer = document.createElement("div");
    inputContainer.className = "satellite-search-input-container";
    
    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.className = "satellite-search-input";
    searchInput.placeholder = config.placeholderText;
    searchInput.id = "satellite-search-input";
    
    const searchButton = document.createElement("button");
    searchButton.className = "satellite-search-button";
    searchButton.textContent = "Search";
    searchButton.id = "satellite-search-button";
    
    inputContainer.appendChild(searchInput);
    inputContainer.appendChild(searchButton);
    
    // Create suggestions container
    if (config.showSuggestions) {
      const suggestionsContainer = document.createElement("div");
      suggestionsContainer.className = "satellite-search-suggestions";
      suggestionsContainer.id = "satellite-search-suggestions";
      inputContainer.appendChild(suggestionsContainer);
    }
    
    // Create results container
    const resultsContainer = document.createElement("div");
    resultsContainer.className = "satellite-results-container";
    resultsContainer.id = "satellite-search-results";
    
    // Create modal for embed mode
    if (config.displayMode === "embed") {
      const modal = document.createElement("div");
      modal.className = "satellite-modal";
      modal.id = "satellite-search-modal";
      
      const modalContent = document.createElement("div");
      modalContent.className = "satellite-modal-content";
      
      const closeButton = document.createElement("span");
      closeButton.className = "satellite-close-modal";
      closeButton.id = "satellite-close-modal";
      closeButton.innerHTML = "&times;";
      
      const iframe = document.createElement("iframe");
      iframe.className = "satellite-embed-container";
      iframe.id = "satellite-embed-container";
      
      modalContent.appendChild(closeButton);
      modalContent.appendChild(iframe);
      modal.appendChild(modalContent);
      
      container.appendChild(inputContainer);
      container.appendChild(resultsContainer);
      container.appendChild(modal);
    } else {
      container.appendChild(inputContainer);
      container.appendChild(resultsContainer);
    }
  }
  
  // ===== EVENT LISTENERS =====
  
  function initEventListeners() {
    const searchInput = document.getElementById("satellite-search-input");
    const searchButton = document.getElementById("satellite-search-button");
    const suggestionsContainer = document.getElementById("satellite-search-suggestions");
    const resultsContainer = document.getElementById("satellite-search-results");
    const modal = document.getElementById("satellite-search-modal");
    const embedContainer = document.getElementById("satellite-embed-container");
    const closeModal = document.getElementById("satellite-search-modal") ? 
                       document.getElementById("satellite-close-modal") : null;
    
    // Debounce function to limit API calls
    function debounce(func, wait) {
      let timeout;
      return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    }
    
    // Search button click
    searchButton.addEventListener("click", () => {
      const query = searchInput.value.trim();
      if (query) {
        performSearch(query);
      }
    });
    
    // Fetch suggestions as user types
    if (config.showSuggestions) {
      
      // Render suggestions
      function renderSuggestions(suggestions) {
        suggestionsContainer.innerHTML = "";
        
        suggestions.forEach(suggestion => {
          const item = document.createElement("div");
          item.className = "satellite-suggestion-item";
          item.textContent = suggestion;
          item.addEventListener("click", () => {
            searchInput.value = suggestion;
            suggestionsContainer.style.display = "none";
            performSearch(suggestion);
          });
          
          suggestionsContainer.appendChild(item);
        });
        
        suggestionsContainer.style.display = "block";
      }
      
      const fetchSuggestions = debounce((query) => {
        if (!query || query.length < 2) {
          suggestionsContainer.style.display = "none";
          return;
        }
        
        // Try multiple methods to get suggestions
        fetchSuggestionsWithJSONP(query)
          .catch(() => fetchSuggestionsWithCORS(query))
          .catch(() => fetchSuggestionsWithProxy(query))
          .catch(error => {
            console.error("All suggestion fetch methods failed:", error);
            suggestionsContainer.style.display = "none";
          });
      }, 300);
      
      
      searchInput.addEventListener("input", (e) => fetchSuggestions(e.target.value));
      
      // Close suggestions when clicking outside
      document.addEventListener("click", (e) => {
        if (e.target !== searchInput && e.target !== suggestionsContainer) {
          suggestionsContainer.style.display = "none";
        }
      });
    }
    
    // Search on Enter key
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        if (suggestionsContainer) {
          suggestionsContainer.style.display = "none";
        }
        const query = e.target.value.trim();
        if (query) {
          performSearch(query);
        }
      }
    });
    
    // Modal event listeners
    if (config.displayMode === "embed" && modal && closeModal) {
      // Close modal when clicking the X
      closeModal.addEventListener("click", () => {
        modal.style.display = "none";
        embedContainer.src = "";
      });
      
      // Close modal when clicking outside of it
      window.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.style.display = "none";
          embedContainer.src = "";
        }
      });
    }
    
    // ===== DATA FETCHING METHODS =====
    
    // Method 1: JSONP (works across domains without CORS)
    function fetchSuggestionsWithJSONP(query) {
      return new Promise((resolve, reject) => {
        const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
        window[callbackName] = function(data) {
          delete window[callbackName];
          document.body.removeChild(script);
          if (data.success && data.suggestions && data.suggestions.length > 0) {
            renderSuggestions(data.suggestions);
            resolve(data);
          } else {
            suggestionsContainer.style.display = "none";
            reject(new Error("No suggestions found"));
          }
        };
        
        const script = document.createElement('script');
        script.src = `${config.apiUrl}/suggestions?q=${encodeURIComponent(query)}&${config.jsonpCallback}=${callbackName}`;
        
        // Set timeout to handle failed requests
        const timeoutId = setTimeout(() => {
          delete window[callbackName];
          document.body.removeChild(script);
          reject(new Error("JSONP request timed out"));
        }, 5000);
        
        script.onerror = () => {
          clearTimeout(timeoutId);
          delete window[callbackName];
          document.body.removeChild(script);
          reject(new Error("JSONP request failed"));
        };
        
        document.body.appendChild(script);
      });
    }
    
    // Method 2: Standard CORS fetch
    function fetchSuggestionsWithCORS(query) {
      return new Promise((resolve, reject) => {
        fetch(`${config.apiUrl}/suggestions?q=${encodeURIComponent(query)}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          mode: 'cors',
          credentials: 'omit' // Don't send cookies
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.success && data.suggestions && data.suggestions.length > 0) {
            renderSuggestions(data.suggestions);
            resolve(data);
          } else {
            suggestionsContainer.style.display = "none";
            reject(new Error("No suggestions found"));
          }
        })
        .catch(error => {
          console.error("CORS fetch failed:", error);
          reject(error);
        });
      });
    }
    
    // Method 3: Use a CORS proxy
    function fetchSuggestionsWithProxy(query) {
      return new Promise((resolve, reject) => {
        const corsProxyUrl = "https://corsproxy.io/?";
        fetch(`${corsProxyUrl}${encodeURIComponent(`${config.apiUrl}/suggestions?q=${encodeURIComponent(query)}`)}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.success && data.suggestions && data.suggestions.length > 0) {
            renderSuggestions(data.suggestions);
            resolve(data);
          } else {
            suggestionsContainer.style.display = "none";
            reject(new Error("No suggestions found"));
          }
        })
        .catch(error => {
          console.error("Proxy fetch failed:", error);
          reject(error);
        });
      });
    }
    
    // Perform search with multiple fallback methods
    function performSearch(query) {
      resultsContainer.innerHTML = '<div class="satellite-loading">Searching...</div>';
      
      // Try multiple methods to get search results
      fetchSearchResultsWithJSONP(query)
        .catch(() => fetchSearchResultsWithCORS(query))
        .catch(() => fetchSearchResultsWithProxy(query))
        .catch(error => {
          console.error("All search methods failed:", error);
          resultsContainer.innerHTML = `
            <div class="satellite-error">
              <p>Sorry, we couldn't complete your search. Please try again later.</p>
              <p>Error: ${error.message}</p>
            </div>
          `;
        });
    }
    
    // Method 1: JSONP for search results
    function fetchSearchResultsWithJSONP(query) {
      return new Promise((resolve, reject) => {
        const callbackName = 'jsonp_search_' + Math.round(100000 * Math.random());
        window[callbackName] = function(data) {
          delete window[callbackName];
          document.body.removeChild(script);
          if (data.success && data.results) {
            renderResults(data.results);
            resolve(data);
          } else {
            resultsContainer.innerHTML = '<p>No results found</p>';
            reject(new Error("No results found"));
          }
        };
        
        const script = document.createElement('script');
        script.src = `${config.apiUrl}/search?q=${encodeURIComponent(query)}&num=${config.resultsPerPage}&${config.jsonpCallback}=${callbackName}`;
        
        // Set timeout to handle failed requests
        const timeoutId = setTimeout(() => {
          delete window[callbackName];
          document.body.removeChild(script);
          reject(new Error("JSONP request timed out"));
        }, 10000);
        
        script.onerror = () => {
          clearTimeout(timeoutId);
          delete window[callbackName];
          document.body.removeChild(script);
          reject(new Error("JSONP request failed"));
        };
        
        document.body.appendChild(script);
      });
    }
    
    // Method 2: Standard CORS fetch for search results
    function fetchSearchResultsWithCORS(query) {
      return new Promise((resolve, reject) => {
        fetch(`${config.apiUrl}/search?q=${encodeURIComponent(query)}&num=${config.resultsPerPage}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          mode: 'cors',
          credentials: 'omit' // Don't send cookies
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.success && data.results) {
            renderResults(data.results);
            resolve(data);
          } else {
            resultsContainer.innerHTML = '<p>No results found</p>';
            reject(new Error("No results found"));
          }
        })
        .catch(error => {
          console.error("CORS fetch failed:", error);
          reject(error);
        });
      });
    }
    
    // Method 3: Use a CORS proxy for search results
    function fetchSearchResultsWithProxy(query) {
      return new Promise((resolve, reject) => {
        const corsProxyUrl = "https://corsproxy.io/?";
        fetch(`${corsProxyUrl}${encodeURIComponent(`${config.apiUrl}/search?q=${encodeURIComponent(query)}&num=${config.resultsPerPage}`)}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.success && data.results) {
            renderResults(data.results);
            resolve(data);
          } else {
            resultsContainer.innerHTML = '<p>No results found</p>';
            reject(new Error("No results found"));
          }
        })
        .catch(error => {
          console.error("Proxy fetch failed:", error);
          reject(error);
        });
      });
    }
    
    // Render search results
    function renderResults(results) {
      if (!results || results.length === 0) {
        resultsContainer.innerHTML = '<p>No results found</p>';
        return;
      }
      
      resultsContainer.innerHTML = '';
      
      results.forEach(result => {
        const card = document.createElement('div');
        card.className = 'satellite-result-card';
        card.dataset.result = JSON.stringify(result);
        card.addEventListener('click', () => handleCardClick(result));
        
        // Determine if we have an image
        const imageUrl = result.image || 'https://via.placeholder.com/300x200?text=No+Image';
        
        // Create card HTML
        card.innerHTML = `
          <img src="${imageUrl}" alt="${result.title}" class="satellite-card-image" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
          <div class="satellite-card-content">
            <h3 class="satellite-card-title">${result.title}</h3>
            <p class="satellite-card-description">${window.innerWidth <= 768 ? result.description.mobile : result.description.full}</p>
            <div class="satellite-card-meta">
              <div class="satellite-card-source">
                <img src="${result.source.favicon}" alt="${result.source.name}" width="16" height="16" onerror="this.style.display='none'">
                <span>${result.source.name}</span>
              </div>
              ${result.price ? `<div class="satellite-card-price">${result.price}</div>` : ''}
            </div>
            ${result.tags && result.tags.length > 0 ? `
              <div class="satellite-card-tags">
                ${result.tags.map(tag => `<span class="satellite-tag">${tag}</span>`).join('')}
              </div>
            ` : ''}
          </div>
        `;
        
        resultsContainer.appendChild(card);
      });
    }
    
    // Handle card click based on display mode
    function handleCardClick(result) {
      if (config.displayMode === 'redirect') {
        window.open(result.link, '_blank');
      } else if (config.displayMode === 'embed' && modal) {
        embedContainer.src = result.link;
        modal.style.display = 'block';
      }
    }
  }
})();

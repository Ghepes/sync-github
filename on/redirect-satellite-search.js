/**
 * Satellite Search - Frontend Integration (Redirect Mode)
 *
 * This script can be embedded in any website to add search functionality
 * using the Satellite Search backend. This version always opens results in a new tab.
 */
;(() => {
  // Configuration - CHANGE THIS URL TO YOUR DEPLOYED API URL
  const config = {
    apiUrl: "https://search.wromo.com/api", // Update this to your deployed API URL
    selector: "#satellite-search",
    displayMode: "redirect", // Always redirect to new tab
    resultsPerPage: 12,
    placeholderText: "Search for anything...",
    showSuggestions: true,
    theme: {
      primaryColor: "#3b82f6",
      borderRadius: "8px",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
  }

  // Initialize when DOM is ready
  document.addEventListener("DOMContentLoaded", () => {
    initSatelliteSearch(config)
  })

  function initSatelliteSearch(config) {
    // Find the container element
    const container = document.querySelector(config.selector)
    if (!container) {
      console.error(`Satellite Search: Container element "${config.selector}" not found`)
      return
    }

    // Create and inject CSS
    injectStyles(config)

    // Create search UI
    createSearchUI(container, config)

    // Initialize event listeners
    initEventListeners(config)
  }

  function injectStyles(config) {
    const style = document.createElement("style")
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
      
      .satellite-external-link-icon {
        display: inline-block;
        margin-left: 5px;
        width: 14px;
        height: 14px;
        vertical-align: middle;
      }
      
      @media (max-width: 768px) {
        .satellite-results-container {
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        }
      }
    `
    document.head.appendChild(style)
  }

  function createSearchUI(container, config) {
    container.classList.add("satellite-search-container")

    // Create search input
    const inputContainer = document.createElement("div")
    inputContainer.className = "satellite-search-input-container"

    const searchInput = document.createElement("input")
    searchInput.type = "text"
    searchInput.className = "satellite-search-input"
    searchInput.placeholder = config.placeholderText
    searchInput.id = "satellite-search-input"

    const searchButton = document.createElement("button")
    searchButton.className = "satellite-search-button"
    searchButton.textContent = "Search"
    searchButton.id = "satellite-search-button"

    inputContainer.appendChild(searchInput)
    inputContainer.appendChild(searchButton)

    // Create suggestions container
    if (config.showSuggestions) {
      const suggestionsContainer = document.createElement("div")
      suggestionsContainer.className = "satellite-search-suggestions"
      suggestionsContainer.id = "satellite-search-suggestions"
      inputContainer.appendChild(suggestionsContainer)
    }

    // Create results container
    const resultsContainer = document.createElement("div")
    resultsContainer.className = "satellite-results-container"
    resultsContainer.id = "satellite-search-results"

    container.appendChild(inputContainer)
    container.appendChild(resultsContainer)
  }

  function initEventListeners(config) {
    const searchInput = document.getElementById("satellite-search-input")
    const searchButton = document.getElementById("satellite-search-button")
    const suggestionsContainer = document.getElementById("satellite-search-suggestions")
    const resultsContainer = document.getElementById("satellite-search-results")

    // Debounce function to limit API calls
    function debounce(func, wait) {
      let timeout
      return function (...args) {
        clearTimeout(timeout)
        timeout = setTimeout(() => func.apply(this, args), wait)
      }
    }

    // Search button click
    searchButton.addEventListener("click", () => {
      const query = searchInput.value.trim()
      if (query) {
        performSearch(query)
      }
    })

    // Fetch suggestions as user types
    if (config.showSuggestions) {
      const fetchSuggestions = debounce(async (query) => {
        if (!query || query.length < 2) {
          suggestionsContainer.style.display = "none"
          return
        }

        try {
          const response = await fetch(`${config.apiUrl}/suggestions?q=${encodeURIComponent(query)}`)
          const data = await response.json()

          if (data.success && data.suggestions.length > 0) {
            renderSuggestions(data.suggestions)
          } else {
            suggestionsContainer.style.display = "none"
          }
        } catch (error) {
          console.error("Satellite Search: Error fetching suggestions:", error)
          suggestionsContainer.style.display = "none"
        }
      }, 300)

      // Render suggestions
      function renderSuggestions(suggestions) {
        suggestionsContainer.innerHTML = ""

        suggestions.forEach((suggestion) => {
          const item = document.createElement("div")
          item.className = "satellite-suggestion-item"
          item.textContent = suggestion
          item.addEventListener("click", () => {
            searchInput.value = suggestion
            suggestionsContainer.style.display = "none"
            performSearch(suggestion)
          })

          suggestionsContainer.appendChild(item)
        })

        suggestionsContainer.style.display = "block"
      }

      searchInput.addEventListener("input", (e) => fetchSuggestions(e.target.value))

      // Close suggestions when clicking outside
      document.addEventListener("click", (e) => {
        if (e.target !== searchInput && e.target !== suggestionsContainer) {
          suggestionsContainer.style.display = "none"
        }
      })
    }

    // Perform search
    async function performSearch(query) {
      try {
        resultsContainer.innerHTML = "<p>Searching...</p>"

        const response = await fetch(
          `${config.apiUrl}/search?q=${encodeURIComponent(query)}&num=${config.resultsPerPage}`,
        )
        const data = await response.json()

        if (data.success) {
          renderResults(data.results)
        } else {
          resultsContainer.innerHTML = "<p>No results found</p>"
        }
      } catch (error) {
        console.error("Satellite Search: Error performing search:", error)
        resultsContainer.innerHTML = "<p>An error occurred while searching</p>"
      }
    }

    // Render search results
    function renderResults(results) {
      if (!results || results.length === 0) {
        resultsContainer.innerHTML = "<p>No results found</p>"
        return
      }

      resultsContainer.innerHTML = ""

      results.forEach((result) => {
        const card = document.createElement("div")
        card.className = "satellite-result-card"
        card.dataset.result = JSON.stringify(result)
        card.addEventListener("click", () => handleCardClick(result))

        // Determine if we have an image
        const imageUrl =
          result.image ||
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23eee'/%3E%3Ctext x='50%25' y='50%25' font-size='18' text-anchor='middle' alignment-baseline='middle' font-family='Arial, sans-serif' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E"

        // Create card HTML
        card.innerHTML = `
          <img src="${imageUrl}" alt="${result.title}" class="satellite-card-image" onerror="if(this.src !== 'data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'300\\' height=\\'200\\' viewBox=\\'0 0 300 200\\'%3E%3Crect width=\\'300\\' height=\\'200\\' fill=\\'%23eee\\'/&gt%3Ctext x=\\'50%25\\' y=\\'50%25\\' font-size=\\'18\\' text-anchor=\\'middle\\' alignment-baseline=\\'middle\\' font-family=\\'Arial, sans-serif\\' fill=\\'%23999\\'%3ENo Image%3C/text%3E%3C/svg%3E') this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'300\\' height=\\'200\\' viewBox=\\'0 0 300 200\\'%3E%3Crect width=\\'300\\' height=\\'200\\' fill=\\'%23eee\\'/&gt%3Ctext x=\\'50%25\\' y=\\'50%25\\' font-size=\\'18\\' text-anchor=\\'middle\\' alignment-baseline=\\'middle\\' font-family=\\'Arial, sans-serif\\' fill=\\'%23999\\'%3ENo Image%3C/text%3E%3C/svg%3E'">
          <div class="satellite-card-content">
            <h3 class="satellite-card-title">
              ${result.title}
              <svg class="satellite-external-link-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </h3>
            <p class="satellite-card-description">${window.innerWidth <= 768 ? result.description.mobile : result.description.full}</p>
            <div class="satellite-card-meta">
              <div class="satellite-card-source">
                <img src="${result.source.favicon}" alt="${result.source.name}" width="16" height="16" onerror="this.style.display='none'">
                <span>${result.source.name}</span>
              </div>
              ${result.price ? `<div class="satellite-card-price">${result.price}</div>` : ""}
            </div>
            ${
              result.tags && result.tags.length > 0
                ? `
              <div class="satellite-card-tags">
                ${result.tags.map((tag) => `<span class="satellite-tag">${tag}</span>`).join("")}
              </div>
            `
                : ""
            }
          </div>
        `

        resultsContainer.appendChild(card)
      })
    }

    // Handle card click - always open in new tab
    function handleCardClick(result) {
      window.open(result.link, "_blank")
    }

    // Search on Enter key
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        if (suggestionsContainer) {
          suggestionsContainer.style.display = "none"
        }
        const query = e.target.value.trim()
        if (query) {
          performSearch(query)
        }
      }
    })

    // Responsive description adjustment
    window.addEventListener(
      "resize",
      debounce(() => {
        const cards = document.querySelectorAll(".satellite-result-card")
        cards.forEach((card) => {
          const descriptionElement = card.querySelector(".satellite-card-description")
          if (descriptionElement) {
            const result = JSON.parse(card.dataset.result || "{}")
            if (result.description) {
              descriptionElement.textContent =
                window.innerWidth <= 768 ? result.description.mobile : result.description.full
            }
          }
        })
      }, 200),
    )
  }
})()

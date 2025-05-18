/**
 * Satellite Search - Frontend Integration
 *
 * This script can be embedded in any website to add search functionality
 * using the Satellite Search backend.
 */
;(() => {
  // Configuration - CHANGE THIS URL TO YOUR DEPLOYED API URL
  const config = {
    apiUrl: "https://your-api-url.vercel.app/api",
    selector: "#satellite-search",
    displayMode: "embed", // 'redirect' or 'embed'
    resultsPerPage: 10,
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

    inputContainer.appendChild(searchInput)

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

    // Create modal for embed mode
    if (config.displayMode === "embed") {
      const modal = document.createElement("div")
      modal.className = "satellite-modal"
      modal.id = "satellite-search-modal"

      const modalContent = document.createElement("div")
      modalContent.className = "satellite-modal-content"

      const closeButton = document.createElement("span")
      closeButton.className = "satellite-close-modal"
      closeButton.id = "satellite-close-modal"
      closeButton.innerHTML = "&times;"

      const iframe = document.createElement("iframe")
      iframe.className = "satellite-embed-container"
      iframe.id = "satellite-embed-container"

      modalContent.appendChild(closeButton)
      modalContent.appendChild(iframe)
      modal.appendChild(modalContent)

      container.appendChild(inputContainer)
      container.appendChild(resultsContainer)
      container.appendChild(modal)
    } else {
      container.appendChild(inputContainer)
      container.appendChild(resultsContainer)
    }
  }

  function initEventListeners(config) {
    const searchInput = document.getElementById("satellite-search-input")
    const suggestionsContainer = document.getElementById("satellite-search-suggestions")
    const resultsContainer = document.getElementById("satellite-search-results")
    const modal = document.getElementById("satellite-search-modal")
    const embedContainer = document.getElementById("satellite-embed-container")
    const closeModal = document.getElementById("satellite-close-modal")

    // Debounce function to limit API calls
    function debounce(func, wait) {
      let timeout
      return function (...args) {
        clearTimeout(timeout)
        timeout = setTimeout(() => func.apply(this, args), wait)
      }
    }

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
        const imageUrl = result.image || "https://via.placeholder.com/300x200?text=No+Image"

        // Create card HTML
        card.innerHTML = `
          <img src="${imageUrl}" alt="${result.title}" class="satellite-card-image" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
          <div class="satellite-card-content">
            <h3 class="satellite-card-title">${result.title}</h3>
            <p class="satellite-card-description">${window.innerWidth <= 768 ? result.description.mobile : result.description.full}</p>
            <div class="satellite-card-meta">
              <div class="satellite-card-source">
                <img src="${result.source.favicon}" alt="${result.source.name}" width="16" height="16">
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

    // Handle card click based on display mode
    function handleCardClick(result) {
      if (config.displayMode === "redirect") {
        window.open(result.link, "_blank")
      } else if (config.displayMode === "embed" && modal) {
        embedContainer.src = result.link
        modal.style.display = "block"
      }
    }

    // Search on Enter key
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        if (suggestionsContainer) {
          suggestionsContainer.style.display = "none"
        }
        performSearch(e.target.value)
      }
    })

    // Modal event listeners
    if (config.displayMode === "embed" && modal && closeModal) {
      // Close modal when clicking the X
      closeModal.addEventListener("click", () => {
        modal.style.display = "none"
        embedContainer.src = ""
      })

      // Close modal when clicking outside of it
      window.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.style.display = "none"
          embedContainer.src = ""
        }
      })
    }

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

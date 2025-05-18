"use client"

import { useState, useEffect } from "react"

// The URL to your deployed Satellite Search API
const API_URL = "https://your-api-url.vercel.app/api"

export default function SearchComponent() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Fetch suggestions as the user types
  useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestions([])
      return
    }

    const timer = setTimeout(() => {
      fetchSuggestions(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const fetchSuggestions = async (query) => {
    try {
      const response = await fetch(`${API_URL}/suggestions?q=${encodeURIComponent(query)}`)
      const data = await response.json()

      if (data.success && data.suggestions.length > 0) {
        setSuggestions(data.suggestions)
      } else {
        setSuggestions([])
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error)
      setSuggestions([])
    }
  }

  const performSearch = async (searchQuery) => {
    setLoading(true)
    setShowSuggestions(false)

    try {
      const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()

      if (data.success) {
        setResults(data.results)
      } else {
        setResults([])
      }
    } catch (error) {
      console.error("Error performing search:", error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      performSearch(query)
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion)
    performSearch(suggestion)
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="relative mb-6">
        <form onSubmit={handleSubmit} className="flex">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
            className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search for anything..."
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Search
          </button>
        </form>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute w-full bg-white border border-gray-300 mt-1 rounded-md shadow-lg z-10">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center">
          <p>Searching...</p>
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((result) => (
            <div
              key={result.id}
              className="border border-gray-200 rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              onClick={() => window.open(result.link, "_blank")}
            >
              <div className="h-48 bg-gray-100">
                {result.image && (
                  <img
                    src={result.image || "/placeholder.svg"}
                    alt={result.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = "https://via.placeholder.com/300x200?text=No+Image"
                    }}
                  />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{result.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{result.description.full}</p>

                <div className="flex justify-between items-center">
                  <div className="flex items-center text-xs text-gray-500">
                    <img
                      src={result.source.favicon || "/placeholder.svg"}
                      alt={result.source.name}
                      className="w-4 h-4 mr-1"
                    />
                    <span>{result.source.name}</span>
                  </div>
                  {result.price && <span className="font-semibold text-green-600">{result.price}</span>}
                </div>

                {result.tags && result.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {result.tags.map((tag, idx) => (
                      <span key={idx} className="bg-gray-100 text-xs px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : query ? (
        <div className="text-center">
          <p>No results found</p>
        </div>
      ) : null}
    </div>
  )
}

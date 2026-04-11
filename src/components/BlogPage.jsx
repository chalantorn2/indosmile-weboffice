import { useState, useEffect, useMemo } from "react";
import BlogCard from "./BlogCard";

const API_BASE = "/backend/api";

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [featuredPost, setFeaturedPost] = useState(null);
  const postsPerPage = 9;

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch posts when filters change (including active search term)
  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, currentPage, activeSearch]);

  // Fetch featured post on mount
  useEffect(() => {
    fetchFeaturedPost();
  }, []);

  // Debounce search input to support live search
  useEffect(() => {
    const handler = setTimeout(() => {
      // Only reset page and update activeSearch if it actually changed
      if (searchQuery.trim() !== activeSearch) {
        setCurrentPage(1);
        setActiveSearch(searchQuery.trim());
      }
    }, 400); // 400ms delay

    return () => clearTimeout(handler);
  }, [searchQuery, activeSearch]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/blog_categories.php?active=1`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchFeaturedPost = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/blog_posts.php?featured=1&status=published&limit=1`
      );
      const data = await res.json();
      if (data.success && data.data.items && data.data.items.length > 0) {
        setFeaturedPost(data.data.items[0]);
      }
    } catch (err) {
      console.error("Error fetching featured post:", err);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let url = `${API_BASE}/blog_posts.php?status=published&page=${currentPage}&limit=${postsPerPage}`;

      if (selectedCategory !== "all") {
        url += `&category=${selectedCategory}`;
      }

      if (activeSearch.trim()) {
        url += `&search=${encodeURIComponent(activeSearch.trim())}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setPosts(data.data.items || []);
        setTotalPages(data.data.pagination?.total_pages || 1);
        setTotalPosts(data.data.pagination?.total_items || 0);
      } else {
        setError(data.message || "Failed to load posts");
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Unable to load blog posts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setActiveSearch(searchQuery.trim());
  };

  const handleCategoryChange = (slug) => {
    setSelectedCategory(slug);
    setCurrentPage(1);
  };

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  return (
    <section className="min-h-screen bg-light-gray">
      {/* Hero Section */}
      <div className="bg-navy relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 50%, rgba(255,212,71,0.3) 0%, transparent 50%),
                               radial-gradient(circle at 75% 50%, rgba(255,212,71,0.2) 0%, transparent 50%)`,
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10">
          <div className="text-center">
            <h1 className="font-heading text-5xl md:text-6xl text-white mb-4">
              Our Blog
            </h1>
            <p className="font-body text-lg text-white/70 max-w-2xl mx-auto mb-8">
              Discover travel tips, destination guides, and stories from our
              adventures across Thailand and beyond
            </p>

            {/* Search Bar */}
            <form
              onSubmit={handleSearch}
              className="max-w-xl mx-auto relative"
            >
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 pl-12 rounded-xl font-body text-navy bg-white/95 backdrop-blur-sm border-2 border-transparent focus:border-yellow focus:outline-none shadow-lg transition-all duration-300"
              />
              <svg
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-yellow text-navy px-5 py-2 rounded-lg font-body font-semibold hover:bg-yellow/90 transition-all duration-200"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {/* Wave Bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" className="w-full h-auto fill-light-gray">
            <path d="M0,60 L0,20 Q360,0 720,20 Q1080,40 1440,20 L1440,60 Z" />
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Post */}
        {featuredPost && selectedCategory === "all" && currentPage === 1 && !activeSearch && (
          <div className="mb-12">
            <BlogCard post={featuredPost} featured={true} />
          </div>
        )}

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => handleCategoryChange("all")}
            className={`px-5 py-2.5 rounded-full font-body text-sm font-medium transition-all duration-300 ${
              selectedCategory === "all"
                ? "bg-navy text-white shadow-lg shadow-navy/20"
                : "bg-white text-navy hover:bg-navy/5 shadow-sm"
            }`}
          >
            All Posts
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.slug)}
              className={`px-5 py-2.5 rounded-full font-body text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                selectedCategory === cat.slug
                  ? "text-white shadow-lg"
                  : "bg-white text-navy hover:bg-navy/5 shadow-sm"
              }`}
              style={
                selectedCategory === cat.slug
                  ? { backgroundColor: cat.color, boxShadow: `0 4px 14px ${cat.color}40` }
                  : {}
              }
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor:
                    selectedCategory === cat.slug ? "#fff" : cat.color,
                }}
              />
              {cat.name}
              {cat.post_count > 0 && (
                <span
                  className={`text-xs ${
                    selectedCategory === cat.slug
                      ? "text-white/70"
                      : "text-gray-400"
                  }`}
                >
                  ({cat.post_count})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Results Count */}
        {!loading && (
          <div className="mb-6">
            <p className="font-body text-gray-500 text-sm">
              Showing{" "}
              <span className="font-semibold text-navy">{totalPosts}</span>{" "}
              article{totalPosts !== 1 ? "s" : ""}
              {activeSearch && (
                <span>
                  {" "}
                  for "<span className="font-semibold text-navy">{activeSearch}</span>"
                </span>
              )}
              {selectedCategory !== "all" && (
                <span>
                  {" "}
                  in{" "}
                  <span className="font-semibold text-navy">
                    {categories.find((c) => c.slug === selectedCategory)?.name}
                  </span>
                </span>
              )}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-navy" />
            <p className="mt-4 font-body text-gray-500">
              Loading articles...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 text-center">
            <p className="font-body text-red-600 mb-3">{error}</p>
            <button
              onClick={fetchPosts}
              className="bg-navy text-white px-6 py-2.5 rounded-lg font-body font-semibold hover:bg-opacity-90 transition-all"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Posts Grid */}
        {!loading && !error && posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts
              .filter(
                (p) =>
                  !(
                    featuredPost &&
                    p.id === featuredPost.id &&
                    selectedCategory === "all" &&
                    currentPage === 1 &&
                    !activeSearch
                  )
              )
              .map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && posts.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
            <h3 className="font-heading text-2xl text-navy mb-2">
              No articles found
            </h3>
            <p className="font-body text-gray-500 mb-6">
              We couldn't find any articles matching your criteria.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
                setActiveSearch("");
                setCurrentPage(1);
              }}
              className="bg-yellow text-navy px-6 py-3 rounded-lg font-body font-semibold hover:bg-yellow/90 transition-all"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2.5 rounded-lg border border-gray-200 bg-white text-navy hover:bg-navy hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                if (totalPages <= 7) return true;
                if (page === 1 || page === totalPages) return true;
                if (Math.abs(page - currentPage) <= 1) return true;
                return false;
              })
              .map((page, idx, arr) => (
                <span key={page}>
                  {idx > 0 && arr[idx - 1] !== page - 1 && (
                    <span className="px-2 text-gray-400 font-body">...</span>
                  )}
                  <button
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg font-body text-sm font-medium transition-all duration-200 ${
                      currentPage === page
                        ? "bg-navy text-white shadow-lg shadow-navy/20"
                        : "bg-white text-navy border border-gray-200 hover:bg-navy/5"
                    }`}
                  >
                    {page}
                  </button>
                </span>
              ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2.5 rounded-lg border border-gray-200 bg-white text-navy hover:bg-navy hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

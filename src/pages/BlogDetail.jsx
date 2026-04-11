import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import BlogCard from "../sections/BlogCard";

const API_BASE = "/backend/api";

export default function BlogDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchPost();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/blog_posts.php?slug=${slug}`);
      const data = await res.json();

      if (data.success) {
        setPost(data.data);
      } else {
        setError(data.message || "Post not found");
      }
    } catch (err) {
      console.error("Error fetching post:", err);
      setError("Unable to load this article. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = post?.title || "";

    switch (platform) {
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          "_blank",
          "width=600,height=400",
        );
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
          "_blank",
          "width=600,height=400",
        );
        break;
      case "line":
        window.open(
          `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`,
          "_blank",
          "width=600,height=400",
        );
        break;
      case "copy":
        navigator.clipboard.writeText(url).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
        break;
    }
  };

  // Loading
  if (loading) {
    return (
      <section className="min-h-screen bg-light-gray flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-navy" />
          <p className="mt-4 font-body text-gray-500">Loading article...</p>
        </div>
      </section>
    );
  }

  // Error
  if (error || !post) {
    return (
      <section className="min-h-screen bg-light-gray flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="font-heading text-2xl text-navy mb-2">
            Article Not Found
          </h2>
          <p className="font-body text-gray-500 mb-6">
            {error || "This article doesn't exist or has been removed."}
          </p>
          <Link
            to="/blog"
            className="inline-block bg-navy text-white px-6 py-3 rounded-lg font-body font-semibold hover:bg-opacity-90 transition-all"
          >
            Back to Blog
          </Link>
        </div>
      </section>
    );
  }

  return (
    <article className="min-h-screen bg-white">
      {/* Cover Image */}
      <div className="relative h-[50vh] md:h-[60vh] bg-navy overflow-hidden">
        {post.cover_image && (
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover opacity-60"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-transparent" />

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-4xl mx-auto">
            {/* Back link & Category */}
            <div className="flex items-center gap-4 mb-4">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-white/70 hover:text-white font-body text-sm transition-colors duration-200"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Blog
              </Link>

              {/* Category */}
              {post.category_name && (
                <Link
                  to={`/blog?category=${post.category_slug}`}
                  className="inline-block px-4 py-1.5 rounded-full font-body text-xs font-semibold text-white hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: post.category_color || "#010048" }}
                >
                  {post.category_name}
                </Link>
              )}
            </div>

            {/* Title */}
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-white mb-4 leading-tight">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-white/60 font-body text-sm">
              {post.author_name && (
                <span className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-yellow flex items-center justify-center">
                    <span className="text-navy text-xs font-bold">
                      {post.author_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-white/80">{post.author_name}</span>
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {formatDate(post.published_at)}
              </span>

              <span className="flex items-center gap-1.5">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                {post.views || 0} views
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Article Body */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-12">
          {/* Content */}
          <div>
            {/* Excerpt */}
            {post.excerpt && (
              <p className="font-body text-xl text-gray-600 leading-relaxed mb-8 pb-8 border-b border-gray-100 italic">
                {post.excerpt}
              </p>
            )}

            {/* Article HTML Content */}
            <div
              className="blog-content font-body text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
              <div className="mt-10 pt-8 border-t border-gray-100">
                <h4 className="font-body font-semibold text-navy text-sm mb-3 uppercase tracking-wider">
                  Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, i) => (
                    <Link
                      key={i}
                      to={`/blog?tag=${tag}`}
                      className="px-4 py-2 bg-navy/5 text-navy rounded-full font-body text-sm hover:bg-navy hover:text-white transition-all duration-200"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Share Buttons */}
            <div className="mt-10 pt-8 border-t border-gray-100">
              <h4 className="font-body font-semibold text-navy text-sm mb-4 uppercase tracking-wider">
                Share this article
              </h4>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleShare("facebook")}
                  className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:opacity-80 transition-opacity"
                  title="Share on Facebook"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleShare("twitter")}
                  className="w-10 h-10 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center hover:opacity-80 transition-opacity"
                  title="Share on Twitter"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleShare("line")}
                  className="w-10 h-10 rounded-full bg-[#06C755] text-white flex items-center justify-center hover:opacity-80 transition-opacity"
                  title="Share on LINE"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                  </svg>
                </button>
                <button
                  onClick={() => handleShare("copy")}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                    copied
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  }`}
                  title={copied ? "Link copied!" : "Copy link"}
                >
                  {copied ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Sticky Side - Share (Desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <div className="flex flex-col items-center gap-3">
                <span className="font-body text-xs text-gray-400 uppercase tracking-wider mb-1">
                  Share
                </span>
                <button
                  onClick={() => handleShare("facebook")}
                  className="w-10 h-10 rounded-full bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-all duration-200"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleShare("twitter")}
                  className="w-10 h-10 rounded-full bg-[#1DA1F2]/10 text-[#1DA1F2] flex items-center justify-center hover:bg-[#1DA1F2] hover:text-white transition-all duration-200"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleShare("line")}
                  className="w-10 h-10 rounded-full bg-[#06C755]/10 text-[#06C755] flex items-center justify-center hover:bg-[#06C755] hover:text-white transition-all duration-200"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                  </svg>
                </button>
                <button
                  onClick={() => handleShare("copy")}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${copied ? "bg-green-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                >
                  {copied ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Related Posts */}
      {post.related_posts && post.related_posts.length > 0 && (
        <div className="bg-light-gray py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="font-heading text-3xl text-navy mb-2">
                Related Articles
              </h2>
              <p className="font-body text-gray-500">
                You might also enjoy these articles
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {post.related_posts.map((related) => (
                <BlogCard key={related.id} post={related} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Back to Blog CTA */}
      <div className="bg-white py-12 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 bg-navy text-white px-8 py-4 rounded-xl font-body font-semibold hover:bg-opacity-90 transition-all duration-200 shadow-lg shadow-navy/20"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to All Articles
          </Link>
        </div>
      </div>
    </article>
  );
}

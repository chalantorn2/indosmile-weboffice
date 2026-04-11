import { Link } from "react-router-dom";

export default function BlogCard({ post, featured = false }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (featured) {
    return (
      <Link
        to={`/blog/${post.slug}`}
        className="group block bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Image */}
          <div className="relative h-64 lg:h-full min-h-[320px] bg-gray-200 overflow-hidden">
            <img
              src={
                post.cover_image ||
                "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800"
              }
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/30 to-transparent" />
            {post.is_featured == 1 && (
              <div className="absolute top-4 left-4 bg-yellow text-navy px-3 py-1 rounded-full font-body text-xs font-bold uppercase tracking-wider">
                Featured
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-8 lg:p-10 flex flex-col justify-center">
            {post.category_name && (
              <span
                className="inline-block w-fit px-3 py-1 rounded-full font-body text-xs font-semibold text-white mb-4"
                style={{ backgroundColor: post.category_color || "#010048" }}
              >
                {post.category_name}
              </span>
            )}
            <h2 className="font-heading text-3xl lg:text-4xl text-navy mb-4 group-hover:text-yellow transition-colors duration-300">
              {post.title}
            </h2>
            <p className="font-body text-gray-600 mb-6 leading-relaxed line-clamp-3 text-base">
              {post.excerpt || ""}
            </p>
            <div className="flex items-center gap-4 text-sm font-body text-gray-400">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(post.published_at)}
              </span>

              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {post.views || 0} views
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Regular card
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group block bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-400"
    >
      {/* Image */}
      <div className="relative h-52 bg-gray-200 overflow-hidden">
        <img
          src={
            post.cover_image ||
            "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600"
          }
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        {post.category_name && (
          <span
            className="absolute top-4 left-4 px-3 py-1 rounded-full font-body text-xs font-semibold text-white shadow-lg"
            style={{ backgroundColor: post.category_color || "#010048" }}
          >
            {post.category_name}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="font-heading text-xl text-navy mb-2 line-clamp-2 group-hover:text-yellow transition-colors duration-300 leading-snug">
          {post.title}
        </h3>
        <p className="font-body text-gray-500 mb-4 leading-relaxed line-clamp-3 text-sm">
          {post.excerpt || ""}
        </p>

        {/* Tags */}
        {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="text-xs font-body text-navy/60 bg-navy/5 px-2 py-0.5 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs font-body text-gray-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(post.published_at)}
            </span>

          </div>
          <span className="text-navy font-semibold group-hover:text-yellow transition-colors duration-300 flex items-center gap-1">
            Read
            <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

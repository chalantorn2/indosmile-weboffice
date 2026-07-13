    <!-- Blog Post Modal -->
    <div id="blogPostModal" class="modal">
      <div class="modal-panel bg-white w-[95%] max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        <!-- Header -->
        <div class="flex items-center justify-between px-7 py-5 border-b border-gray-100 bg-gradient-to-r from-navy/[0.03] to-transparent">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-navy/10 flex items-center justify-center"><i data-lucide="file-text" class="w-5 h-5 text-navy"></i></div>
            <div>
              <h2 id="blogModalTitle" class="text-lg font-bold text-navy">Add New Post</h2>
              <p class="text-xs text-gray-400 mt-0.5" id="blogModalSubtitle">Create a new blog article</p>
            </div>
          </div>
          <button class="blog-modal-close w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all text-xl">&times;</button>
        </div>

        <!-- Tabs -->
        <div class="flex px-7 bg-gray-50/80 border-b border-gray-100 gap-1" id="blogModalTabBar">
          <button type="button" class="blog-tab-btn group flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 -mb-px transition-all text-navy border-navy" data-tab="b-content">
            <i data-lucide="edit-3" class="w-4 h-4"></i>
            <span>Content</span>
          </button>
          <button type="button" class="blog-tab-btn group flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 -mb-px transition-all text-gray-400 border-transparent hover:text-gray-600" data-tab="b-media">
            <i data-lucide="image" class="w-4 h-4"></i>
            <span>Media</span>
          </button>
          <button type="button" class="blog-tab-btn group flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 -mb-px transition-all text-gray-400 border-transparent hover:text-gray-600" data-tab="b-settings">
            <i data-lucide="settings" class="w-4 h-4"></i>
            <span>Settings</span>
          </button>
        </div>

        <!-- Scrollable Body -->
        <div class="flex-1 overflow-y-auto p-7" id="blogModalBody">
          <form id="blogPostForm" novalidate>
            <input type="hidden" id="blogPostId" />

            <!-- Tab: Content -->
            <div class="blog-tab-panel" data-tab="b-content">
              <div class="section-card mb-5">
                <div class="section-header">
                  <span class="section-icon"><i data-lucide="type" class="w-4 h-4 text-navy"></i></span>
                  <h3 class="section-title">Article Content</h3>
                </div>
                <div class="section-body">
                  <div class="mb-4">
                    <label for="blogTitle" class="field-label">Title <span class="text-red-400">*</span></label>
                    <input type="text" id="blogTitle" name="title" required placeholder="e.g. Top 10 Things to Do in Phuket" class="field-input" />
                  </div>
                  <div class="mb-4">
                    <label for="blogExcerpt" class="field-label">Excerpt <span class="text-gray-300 font-normal text-xs">(summary shown on cards)</span></label>
                    <textarea id="blogExcerpt" name="excerpt" rows="2" placeholder="Brief summary of the article..." maxlength="500" class="field-input resize-y"></textarea>
                  </div>
                  <div>
                    <label for="blogContent" class="field-label">Content <span class="text-red-400">*</span></label>
                    <div class="field-input p-0 overflow-hidden" style="display: flex; flex-direction: column;">
                      <div id="blogQuillEditor" style="min-height: 400px; border: none; font-size: 15px; font-family: 'Be Vietnam Pro', sans-serif;"></div>
                    </div>
                    <textarea id="blogContent" name="content" required style="display:none;"></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab: Media -->
            <div class="blog-tab-panel hidden" data-tab="b-media">
              <div class="section-card mb-5">
                <div class="section-header">
                  <span class="section-icon"><i data-lucide="camera" class="w-4 h-4 text-navy"></i></span>
                  <h3 class="section-title">Cover Image</h3>
                  <span class="ml-auto text-xs text-gray-400">Displayed at the top of the article</span>
                </div>
                <div class="section-body">
                  <input type="hidden" id="blogCoverImage" name="cover_image" />
                  <div id="blogCoverDropzone" class="dropzone border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-navy/40 hover:bg-navy/[0.02] transition-all min-h-[160px] flex flex-col items-center justify-center relative">
                    <div id="blogCoverPreview" class="dropzone-preview w-full"></div>
                    <div id="blogCoverPlaceholder" class="dropzone-placeholder pointer-events-none">
                      <div class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gray-100 flex items-center justify-center"><i data-lucide="upload" class="w-6 h-6 text-gray-300"></i></div>
                      <p class="text-sm font-medium text-gray-500 mb-1">Drag & drop or click to upload</p>
                      <small class="text-xs text-gray-400">JPEG, PNG, WebP (max 5MB) &bull; Recommended 1200x630</small>
                    </div>
                    <input type="file" id="blogCoverFile" accept="image/jpeg,image/png,image/webp" class="dropzone-input hidden" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab: Settings -->
            <div class="blog-tab-panel hidden" data-tab="b-settings">
              <div class="section-card mb-5">
                <div class="section-header">
                  <span class="section-icon"><i data-lucide="folder" class="w-4 h-4 text-navy"></i></span>
                  <h3 class="section-title">Category & Tags</h3>
                </div>
                <div class="section-body">
                  <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label for="blogCategory" class="field-label">Category</label>
                      <select id="blogCategory" name="category_id" class="field-input">
                        <option value="">-- No category --</option>
                      </select>
                    </div>
                    <div>
                      <label for="blogAuthorName" class="field-label">Author Name</label>
                      <input type="text" id="blogAuthorName" name="author_name" placeholder="e.g. Indo Smile Team" class="field-input" />
                    </div>
                  </div>
                  <div>
                    <label for="blogTags" class="field-label">Tags <span class="text-gray-300 font-normal text-xs">(comma-separated)</span></label>
                    <input type="text" id="blogTags" name="tags" placeholder="e.g. phuket, travel-tips, beach" class="field-input" />
                  </div>
                </div>
              </div>

              <div class="section-card mb-5">
                <div class="section-header">
                  <span class="section-icon"><i data-lucide="search" class="w-4 h-4 text-navy"></i></span>
                  <h3 class="section-title">SEO</h3>
                </div>
                <div class="section-body">
                  <div class="mb-4">
                    <label for="blogMetaTitle" class="field-label">Meta Title <span class="text-gray-300 font-normal text-xs">(defaults to post title)</span></label>
                    <input type="text" id="blogMetaTitle" name="meta_title" placeholder="Custom SEO title" maxlength="200" class="field-input" />
                  </div>
                  <div>
                    <label for="blogMetaDescription" class="field-label">Meta Description</label>
                    <textarea id="blogMetaDescription" name="meta_description" rows="2" placeholder="SEO description for search engines" maxlength="500" class="field-input resize-y"></textarea>
                  </div>
                </div>
              </div>

              <div class="section-card">
                <div class="section-header">
                  <span class="section-icon"><i data-lucide="eye" class="w-4 h-4 text-navy"></i></span>
                  <h3 class="section-title">Publishing</h3>
                </div>
                <div class="section-body">
                  <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label for="blogStatus" class="field-label">Status</label>
                      <select id="blogStatus" name="status" class="field-input">
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                    <div>
                      <label for="blogPublishedAt" class="field-label">Publish Date <span class="text-gray-300 font-normal text-xs">(auto-set on publish)</span></label>
                      <input type="datetime-local" id="blogPublishedAt" name="published_at" class="field-input" />
                    </div>
                  </div>
                  <div class="flex flex-col gap-4">
                    <label class="toggle-row">
                      <div class="flex items-center gap-3">
                        <input type="checkbox" id="blogFeatured" name="is_featured" class="toggle-checkbox" />
                        <span class="toggle-switch toggle-navy"></span>
                        <div>
                          <span class="text-sm font-medium text-gray-700">Featured Post</span>
                          <p class="text-xs text-gray-400">Show this post prominently at the top of the blog page</p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between px-7 py-4 border-t border-gray-100 bg-gray-50/80">
          <div></div>
          <div class="flex gap-3">
            <button type="button" class="blog-modal-close px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">Cancel</button>
            <button type="submit" form="blogPostForm" class="px-6 py-2.5 text-sm font-semibold text-white bg-navy rounded-xl hover:bg-navy/90 transition-all flex items-center gap-2 shadow-sm shadow-navy/20">
              <i data-lucide="save" class="w-4 h-4"></i> Save Post
            </button>
          </div>
        </div>

      </div>
    </div>

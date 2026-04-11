// =====================
// Blog Posts
// =====================
let blogPosts = [];
let blogCategories = [];
let blogQuillEditor = null;

async function loadBlogPosts() {
    try {
        // Load categories for filter dropdown
        await loadBlogCategories();

        const categoryId = document.getElementById('blogCategoryFilter').value;
        const status = document.getElementById('blogStatusFilter').value;

        let url = `${API_BASE}/blog_posts.php?all=1&limit=100`;
        if (categoryId) url += `&category_id=${categoryId}`;
        if (status) url += `&status=${status}`;

        const response = await fetch(url, { credentials: 'include' });
        const data = await response.json();

        if (data.success) {
            blogPosts = data.data.items || [];
            displayBlogPosts(blogPosts);
        }
    } catch (error) {
        console.error('Error loading blog posts:', error);
    }
}

async function loadBlogCategories() {
    try {
        const response = await fetch(`${API_BASE}/blog_categories.php`, { credentials: 'include' });
        const data = await response.json();

        if (data.success) {
            blogCategories = data.data || [];

            // Update filter dropdown
            const filterSelect = document.getElementById('blogCategoryFilter');
            const currentVal = filterSelect.value;
            filterSelect.innerHTML = '<option value="">All Categories</option>';
            blogCategories.forEach(cat => {
                filterSelect.innerHTML += `<option value="${cat.id}">${cat.name} (${cat.post_count || 0})</option>`;
            });
            filterSelect.value = currentVal;

            // Update modal category dropdown
            const modalSelect = document.getElementById('blogCategory');
            const modalVal = modalSelect.value;
            modalSelect.innerHTML = '<option value="">-- No category --</option>';
            blogCategories.forEach(cat => {
                modalSelect.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
            });
            modalSelect.value = modalVal;
        }
    } catch (error) {
        console.error('Error loading blog categories:', error);
    }
}

function displayBlogPosts(posts) {
    const container = document.getElementById('blogPostsTable');

    if (!posts || posts.length === 0) {
        container.innerHTML = '<p>No blog posts found. Click "+ Add New Post" to create one.</p>';
        return;
    }

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Image</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Views</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${posts.map(post => `
                    <tr>
                        <td>
                            ${post.cover_image
                                ? `<img src="${post.cover_image}" alt="${post.title}" class="tour-thumb" onerror="this.style.display='none'">`
                                : '<span class="no-image">No img</span>'}
                        </td>
                        <td>
                            <strong>${post.title}</strong>
                            ${post.is_featured == 1 ? '<span class="badge badge-confirmed" style="margin-left:6px;font-size:10px">Featured</span>' : ''}
                        </td>
                        <td>
                            ${post.category_name
                                ? `<span style="display:inline-flex;align-items:center;gap:4px"><span style="width:8px;height:8px;border-radius:50%;background:${post.category_color || '#010048'}"></span>${post.category_name}</span>`
                                : '<span style="color:#9ca3af">—</span>'}
                        </td>
                        <td>
                            <span class="badge badge-${post.status === 'published' ? 'confirmed' : post.status === 'draft' ? 'pending' : 'cancelled'}">${post.status}</span>
                        </td>
                        <td>${post.views || 0}</td>
                        <td>${post.published_at ? formatDate(post.published_at) : '<span style="color:#9ca3af">—</span>'}</td>
                        <td class="actions-cell">
                            <button class="btn btn-sm btn-primary" onclick="editBlogPost(${post.id})">Edit</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteBlogPost(${post.id})">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function switchBlogTab(tabId) {
    // Update tab buttons
    document.querySelectorAll('#blogModalTabBar .blog-tab-btn').forEach(btn => {
        if (btn.dataset.tab === tabId) {
            btn.classList.remove('text-gray-400', 'border-transparent');
            btn.classList.add('text-navy', 'border-navy');
        } else {
            btn.classList.remove('text-navy', 'border-navy');
            btn.classList.add('text-gray-400', 'border-transparent');
        }
    });

    // Update tab panels
    document.querySelectorAll('.blog-tab-panel').forEach(panel => {
        if (panel.dataset.tab === tabId) {
            panel.classList.remove('hidden');
        } else {
            panel.classList.add('hidden');
        }
    });
}

function openBlogPostModal(postId = null) {
    const modal = document.getElementById('blogPostModal');
    const form = document.getElementById('blogPostForm');
    const title = document.getElementById('blogModalTitle');
    const subtitle = document.getElementById('blogModalSubtitle');

    form.reset();
    switchBlogTab('b-content');
    setBlogCoverPreview('');

    if (postId) {
        title.textContent = 'Edit Post';
        subtitle.textContent = 'Update the blog article';
        const post = blogPosts.find(p => p.id == postId);
        if (post) {
            document.getElementById('blogPostId').value = post.id;
            document.getElementById('blogTitle').value = post.title || '';
            document.getElementById('blogExcerpt').value = post.excerpt || '';
            document.getElementById('blogContent').value = post.content || '';
            if (blogQuillEditor) {
                blogQuillEditor.root.innerHTML = post.content || '';
            }
            document.getElementById('blogCategory').value = post.category_id || '';
            document.getElementById('blogAuthorName').value = post.author_name || '';
            document.getElementById('blogTags').value =
                Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || '');
            document.getElementById('blogStatus').value = post.status || 'draft';
            document.getElementById('blogFeatured').checked = post.is_featured == 1;
            document.getElementById('blogMetaTitle').value = post.meta_title || '';
            document.getElementById('blogMetaDescription').value = post.meta_description || '';

            if (post.published_at) {
                const dt = new Date(post.published_at);
                const pad = n => String(n).padStart(2, '0');
                document.getElementById('blogPublishedAt').value =
                    `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
            }

            setBlogCoverPreview(post.cover_image || '');
        }
    } else {
        title.textContent = 'Add New Post';
        subtitle.textContent = 'Create a new blog article';
        document.getElementById('blogPostId').value = '';
        document.getElementById('blogContent').value = '';
        if (blogQuillEditor) {
            blogQuillEditor.root.innerHTML = '';
        }
    }

    modal.classList.add('active');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

async function handleBlogPostSubmit(e) {
    e.preventDefault();

    const title = document.getElementById('blogTitle').value.trim();
    const content = document.getElementById('blogContent').value.trim();

    if (!title) {
        switchBlogTab('b-content');
        document.getElementById('blogTitle').focus();
        showToast('Please enter a title', 'warning');
        return;
    }
    if (!content) {
        switchBlogTab('b-content');
        document.getElementById('blogContent').focus();
        showToast('Please enter content', 'warning');
        return;
    }

    const postId = document.getElementById('blogPostId').value;
    const tagsRaw = document.getElementById('blogTags').value;
    const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(t => t) : [];

    const postData = {
        title: title,
        content: content,
        excerpt: document.getElementById('blogExcerpt').value || '',
        category_id: document.getElementById('blogCategory').value || null,
        author_name: document.getElementById('blogAuthorName').value || null,
        tags: tags,
        status: document.getElementById('blogStatus').value || 'draft',
        is_featured: document.getElementById('blogFeatured').checked ? 1 : 0,
        cover_image: document.getElementById('blogCoverImage').value || null,
        meta_title: document.getElementById('blogMetaTitle').value || null,
        meta_description: document.getElementById('blogMetaDescription').value || null,
        published_at: document.getElementById('blogPublishedAt').value || null
    };

    try {
        const url = postId ? `${API_BASE}/blog_posts.php?id=${postId}` : `${API_BASE}/blog_posts.php`;
        const method = postId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(postData)
        });

        const data = await response.json();

        if (data.success) {
            closeModal('blogPostModal');
            loadBlogPosts();
            showToast(postId ? 'Post updated successfully!' : 'Post created successfully!', 'success');
        } else {
            showToast('Error: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error saving blog post:', error);
        showToast('Error saving post. Please try again.', 'error');
    }
}

function editBlogPost(id) {
    openBlogPostModal(id);
}

async function deleteBlogPost(id) {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
        const response = await fetch(`${API_BASE}/blog_posts.php?id=${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        const data = await response.json();

        if (data.success) {
            loadBlogPosts();
            showToast('Blog post deleted successfully!', 'success');
        } else {
            showToast('Error deleting post: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error deleting blog post:', error);
        showToast('Error deleting post', 'error');
    }
}

// =====================
// Blog Cover Image
// =====================
async function handleBlogCoverUpload(files) {
    const file = files[0];
    const preview = document.getElementById('blogCoverPreview');
    const placeholder = document.getElementById('blogCoverPlaceholder');

    placeholder.style.display = 'none';
    preview.innerHTML = '<div class="upload-loading"><div class="spinner"></div><span>Uploading...</span></div>';

    try {
        const data = await uploadFile(file, 'blogs');

        if (data.success) {
            const url = data.data.url;
            document.getElementById('blogCoverImage').value = url;
            preview.innerHTML = `
                <div class="img-preview-item main-preview">
                    <img src="${url}" alt="Cover image">
                    <button type="button" class="img-remove-btn" onclick="removeBlogCover(event)">&times;</button>
                </div>`;
        } else {
            showToast('Upload failed: ' + data.message, 'error');
            preview.innerHTML = '';
            placeholder.style.display = '';
        }
    } catch (error) {
        console.error('Blog cover upload error:', error);
        showToast('Upload error. Please try again.', 'error');
        preview.innerHTML = '';
        placeholder.style.display = '';
    }
}

function removeBlogCover(e) {
    e.stopPropagation();
    document.getElementById('blogCoverImage').value = '';
    document.getElementById('blogCoverPreview').innerHTML = '';
    document.getElementById('blogCoverPlaceholder').style.display = '';
}

function setBlogCoverPreview(url) {
    const preview = document.getElementById('blogCoverPreview');
    const placeholder = document.getElementById('blogCoverPlaceholder');

    if (url) {
        document.getElementById('blogCoverImage').value = url;
        preview.innerHTML = `
            <div class="img-preview-item main-preview">
                <img src="${url}" alt="Cover image">
                <button type="button" class="img-remove-btn" onclick="removeBlogCover(event)">&times;</button>
            </div>`;
        placeholder.style.display = 'none';
    } else {
        document.getElementById('blogCoverImage').value = '';
        preview.innerHTML = '';
        placeholder.style.display = '';
    }
}

// =====================
// Blog Categories
// =====================
function openCategoriesModal() {
    const modal = document.getElementById('blogCategoriesModal');
    modal.classList.add('active');
    renderCategoriesList();
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderCategoriesList() {
    const container = document.getElementById('blogCategoriesList');

    if (!blogCategories || blogCategories.length === 0) {
        container.innerHTML = '<p style="color:#9ca3af;text-align:center;padding:20px 0">No categories yet</p>';
        return;
    }

    container.innerHTML = blogCategories.map(cat => `
        <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #f3f4f6">
            <span style="width:16px;height:16px;border-radius:4px;background:${cat.color || '#010048'};flex-shrink:0"></span>
            <span style="flex:1;font-weight:500;color:#010048">${cat.name}</span>
            <span style="font-size:12px;color:#9ca3af">${cat.post_count || 0} posts</span>
            <button class="btn btn-sm btn-danger" onclick="deleteBlogCategory(${cat.id})" style="font-size:11px;padding:3px 8px">Delete</button>
        </div>
    `).join('');
}

async function handleAddCategory() {
    const nameInput = document.getElementById('newCategoryName');
    const colorInput = document.getElementById('newCategoryColor');
    const name = nameInput.value.trim();

    if (!name) {
        showToast('Please enter a category name', 'warning');
        nameInput.focus();
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/blog_categories.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                name: name,
                color: colorInput.value
            })
        });

        const data = await response.json();

        if (data.success) {
            nameInput.value = '';
            await loadBlogCategories();
            renderCategoriesList();
            showToast('Category created!', 'success');
        } else {
            showToast('Error: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error creating category:', error);
        showToast('Error creating category', 'error');
    }
}

async function deleteBlogCategory(id) {
    if (!confirm('Delete this category? Posts in this category will become uncategorized.')) return;

    try {
        const response = await fetch(`${API_BASE}/blog_categories.php?id=${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        const data = await response.json();

        if (data.success) {
            await loadBlogCategories();
            renderCategoriesList();
            showToast('Category deleted', 'success');
        } else {
            showToast('Error: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error deleting category:', error);
        showToast('Error deleting category', 'error');
    }
}

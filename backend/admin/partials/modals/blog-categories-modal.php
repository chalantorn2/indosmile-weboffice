    <!-- Blog Categories Modal -->
    <div id="blogCategoriesModal" class="modal">
      <div class="modal-panel bg-white w-[95%] max-w-lg max-h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div class="flex items-center justify-between px-7 py-5 border-b border-gray-100">
          <h2 class="text-lg font-bold text-navy">Manage Categories</h2>
          <button class="blog-cat-modal-close w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all text-xl">&times;</button>
        </div>
        <div class="flex-1 overflow-y-auto p-7">
          <div id="blogCategoriesList" class="mb-6"></div>
          <div class="border-t border-gray-100 pt-5">
            <h4 class="text-sm font-semibold text-navy mb-3">Add New Category</h4>
            <div class="flex gap-3 items-end">
              <div class="flex-1">
                <input type="text" id="newCategoryName" placeholder="Category name" class="field-input" />
              </div>
              <div style="width:80px">
                <input type="color" id="newCategoryColor" value="#4F46E5" class="field-input" style="height:42px;padding:4px;cursor:pointer" />
              </div>
              <button type="button" id="addCategoryBtn" class="px-5 py-2.5 text-sm font-semibold text-white bg-navy rounded-xl hover:bg-navy/90 transition-all whitespace-nowrap">Add</button>
            </div>
          </div>
        </div>
      </div>
    </div>

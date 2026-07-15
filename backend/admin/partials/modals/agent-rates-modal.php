    <!-- Agent Contract Rates Modal -->
    <div id="agentRatesModal" class="modal">
      <div class="modal-panel bg-white w-[95%] max-w-5xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        <!-- Header -->
        <div class="flex items-center justify-between px-7 py-5 border-b border-gray-100 bg-gradient-to-r from-navy/[0.03] to-transparent">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-navy/10 flex items-center justify-center"><i data-lucide="tag" class="w-5 h-5 text-navy"></i></div>
            <div>
              <h2 id="agentRatesTitle" class="text-lg font-bold text-navy">Contract Rates</h2>
              <p class="text-xs text-gray-400 mt-0.5" id="agentRatesSubtitle">Only tours with a rate are visible to this agent</p>
            </div>
          </div>
          <button class="agent-rates-modal-close w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all text-xl">&times;</button>
        </div>

        <!-- Toolbar -->
        <div class="px-7 py-4 border-b border-gray-100 bg-gray-50/60 flex flex-wrap items-center gap-3">
          <input type="text" id="agentRatesSearch" placeholder="Search tours..." class="field-input flex-1 min-w-[200px]" style="margin:0" />
          <div class="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
            <button type="button" class="agent-rates-filter px-3 py-1.5 text-xs font-semibold rounded-lg transition-all" data-filter="all">All</button>
            <button type="button" class="agent-rates-filter px-3 py-1.5 text-xs font-semibold rounded-lg transition-all" data-filter="rated">With rate</button>
            <button type="button" class="agent-rates-filter px-3 py-1.5 text-xs font-semibold rounded-lg transition-all" data-filter="unrated">No rate</button>
          </div>
        </div>

        <!-- Table -->
        <div class="flex-1 overflow-y-auto px-7 py-5">
          <div id="agentRatesTable" class="table-container">
            <p class="loading">Loading...</p>
          </div>
        </div>

        <!-- Bulk apply footer -->
        <div class="px-7 py-4 border-t border-gray-100 bg-gray-50/80">
          <div class="flex flex-wrap items-end gap-4">
            <div class="text-sm text-navy font-semibold shrink-0 pb-2.5">
              <span id="agentRatesSelectedCount">0</span> selected
            </div>
            <div class="w-36">
              <label for="agentRatesAdultMarkup" class="field-label">Adult markup</label>
              <input type="number" id="agentRatesAdultMarkup" min="0" step="1" placeholder="150" class="field-input" style="margin:0" />
            </div>
            <div class="w-36">
              <label for="agentRatesChildMarkup" class="field-label">Child markup</label>
              <input type="number" id="agentRatesChildMarkup" min="0" step="1" placeholder="100" class="field-input" style="margin:0" />
            </div>
            <div class="flex gap-3 ml-auto">
              <button type="button" id="agentRatesRemoveBtn" class="px-5 py-2.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-xl hover:bg-red-50 transition-all flex items-center gap-2">
                <i data-lucide="trash-2" class="w-4 h-4"></i> Remove selected
              </button>
              <button type="button" id="agentRatesApplyBtn" class="px-6 py-2.5 text-sm font-semibold text-white bg-navy rounded-xl hover:bg-navy/90 transition-all flex items-center gap-2 shadow-sm shadow-navy/20">
                <i data-lucide="check" class="w-4 h-4"></i> Apply to selected
              </button>
            </div>
          </div>
          <p class="text-xs text-gray-400 mt-3">
            Click a row to select it, <span class="font-semibold">Shift+click</span> to select a range.
            Markup is money added on top of our net price — net 1,000 with a markup of 100 gives the agent 1,100 — so their rate follows any change to what the tour costs us. Removing a tour hides it from their portal.
          </p>
        </div>

      </div>
    </div>

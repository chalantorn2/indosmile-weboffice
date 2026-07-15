    <!-- Booking Detail Modal -->
    <div id="bookingModal" class="modal">
      <div class="modal-panel bg-white w-[95%] max-w-2xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        <!-- Header -->
        <div class="flex items-center justify-between px-7 py-5 border-b border-gray-100 bg-gradient-to-r from-navy/[0.03] to-transparent">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-navy/10 flex items-center justify-center"><i data-lucide="calendar-check" class="w-5 h-5 text-navy"></i></div>
            <div>
              <h2 id="bookingModalRef" class="text-lg font-bold text-navy font-mono">—</h2>
              <div id="bookingModalBadges" class="flex items-center gap-2 mt-1"></div>
            </div>
          </div>
          <button class="booking-modal-close w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all text-xl">&times;</button>
        </div>

        <!-- Scrollable Body -->
        <div class="flex-1 overflow-y-auto p-7">
          <div id="bookingModalBody"></div>

          <!-- Mark-paid panel: revealed by the Mark Paid button, not a second modal. -->
          <div id="markPaidPanel" class="hidden mt-5 rounded-xl border border-green-200 bg-green-50 p-5">
            <h3 class="text-sm font-bold text-navy mb-1">Record an offline payment</h3>
            <p class="text-xs text-gray-500 mb-4">
              Card payments record themselves via Stripe. Use this only for money received another way.
            </p>
            <label class="block text-xs font-semibold text-navy mb-1.5">Payment method</label>
            <select id="markPaidMethod" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white mb-4">
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
              <option value="other">Other</option>
            </select>
            <div class="flex gap-2">
              <button id="markPaidConfirm" class="btn btn-sm btn-success">Confirm Payment Received</button>
              <button id="markPaidCancel" class="btn btn-sm btn-secondary">Back</button>
            </div>
          </div>

          <!-- Cancel panel -->
          <div id="cancelPanel" class="hidden mt-5 rounded-xl border border-red-200 bg-red-50 p-5">
            <h3 class="text-sm font-bold text-navy mb-1">Cancel this booking</h3>
            <p class="text-xs text-gray-500 mb-4">The reason is stored for your records.</p>
            <label class="block text-xs font-semibold text-navy mb-1.5">Reason</label>
            <textarea id="cancelReason" rows="3" placeholder="e.g. Customer requested cancellation"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white mb-4 resize-none"></textarea>
            <div class="flex gap-2">
              <button id="cancelConfirm" class="btn btn-sm btn-danger">Cancel Booking</button>
              <button id="cancelBack" class="btn btn-sm btn-secondary">Back</button>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div id="bookingModalActions" class="px-7 py-4 border-t border-gray-100 bg-gray-50 flex items-center gap-2 flex-wrap"></div>
      </div>
    </div>

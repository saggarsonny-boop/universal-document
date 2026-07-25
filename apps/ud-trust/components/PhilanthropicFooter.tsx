export default function PhilanthropicFooter() {
  return (
    <footer className="mt-24 border-t border-[#e2e8f0] bg-white pt-16 pb-12 px-8 text-sm text-[#243b53]">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h4 className="font-bold text-[#1E3A8A] text-base mb-4 tracking-wide uppercase">A social experiment in collective tool-building.</h4>
          <p className="mb-4">
            <strong className="text-[#102a43]">The rules:</strong> No investors. No ads. No agenda. Tools should be free. The ones here are. Free at the base tier, forever.
          </p>
          <p className="mb-4">
            <strong className="text-[#102a43]">How it works:</strong> You suggest engines. They get built. The planet grows. Every glowing cell is a live tool. The dark ones are coming. What gets built next is decided by what people ask for. Not a roadmap. Not a board. Just the community.
          </p>
          <p>
            <strong className="text-[#102a43]">Say something:</strong> The Hive reads everything. <a href="mailto:hive@hive.baby" className="text-[#2563eb] hover:underline">hive@hive.baby</a>
          </p>
        </div>
        
        <div className="bg-[#f8fafc] p-6 rounded-lg border border-[#e2e8f0] shadow-sm">
          <h4 className="font-bold text-[#1E3A8A] text-base mb-3 tracking-wide uppercase">Support the Hive</h4>
          <p className="mb-6 text-[#475569]">
            Optional support keeps the lights on. If a tool earns a place in your day, support it when you can. Not a subscription. Not a paywall. Just an honest ask.
          </p>
          <div className="flex flex-col gap-3">
            <a href="https://buy.stripe.com/test_123" className="w-full text-center py-2 px-4 border border-[#2563eb] text-[#2563eb] hover:bg-[#eff6ff] rounded transition-colors font-medium">
              $1.99 per month
            </a>
            <a href="https://buy.stripe.com/test_456" className="w-full text-center py-2 px-4 border border-[#2563eb] text-[#2563eb] hover:bg-[#eff6ff] rounded transition-colors font-medium">
              $19 per year
            </a>
            <a href="https://buy.stripe.com/test_789" className="w-full text-center py-2 px-4 bg-[#2563eb] text-white hover:bg-[#1d4ed8] rounded transition-colors font-medium shadow-sm">
              $5 one-time
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
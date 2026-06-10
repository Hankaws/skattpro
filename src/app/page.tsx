// Root page: render the marketing landing (the beautiful glassmorphism one from skattpro-landing).
// We manually wrap with the marketing layout so the full original design (header, hero, features, pricing, etc.) shows at "/".
// The (marketing) route group keeps marketing code organized separately from the authenticated app.

import MarketingPage from './(marketing)/page';
import MarketingLayout from './(marketing)/layout';

// Re-export the beautiful landing's metadata (title, description, etc.)
export { metadata } from './(marketing)/layout';

export default function RootPage() {
  return (
    <MarketingLayout>
      <MarketingPage />
    </MarketingLayout>
  );
}

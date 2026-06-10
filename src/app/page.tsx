// Root now served by the marketing experience in (marketing)/page.tsx
// This file can stay minimal or be removed. Marketing handles / with the beautiful landing.

import { redirect } from "next/navigation";

export default function RootRedirect() {
  // In case the route group doesn't catch, fall back gracefully to marketing intent
  redirect("/#home");
}

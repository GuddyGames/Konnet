// This file used to seed demo users/posts/stories/notifications/conversations
// into localStorage. Since the app now reads and writes all of that through
// Firestore instead, none of this localStorage seed data is used anymore —
// keeping it around only risked confusing future debugging (stale data that
// looks real but nothing in the app actually reads it).
//
// seedData() is kept as a no-op so existing `import { seedData } from
// './utils/seed'` and `seedData();` calls elsewhere (e.g. App.jsx) don't
// break — but it does nothing now. Feel free to remove both the import and
// the call from App.jsx entirely next time you're in there; it's just
// safely inert either way.

export const seedData = () => {
  // Intentionally empty — see note above.
};

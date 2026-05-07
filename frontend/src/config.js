// Central configuration for the frontend.
// Resolution order (runtime override -> Vite env -> default):
// 1. `window.__BACKEND_URL__` set in index.html at deploy time
// 2. `import.meta.env.VITE_BASE_URL` (build-time env)
// 3. Fallback hardcoded URL
const DEFAULT_BACKEND = 'https://real-estate-kut3.onrender.com';

export const BACKEND_URL =
	(typeof window !== 'undefined' && window.__BACKEND_URL__) ||
	import.meta.env.VITE_BASE_URL ||
	DEFAULT_BACKEND;

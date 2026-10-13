
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'

// Fast Scroll Speed Booster across all pages (especially /account and /track)
if (typeof window !== 'undefined') {
  window.addEventListener(
    'wheel',
    (e: WheelEvent) => {
      // Ignore horizontal scrolling, pinch zoom (ctrl), or zero delta
      if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY) || !e.deltaY) return;

      // Check if target is inside an internally scrollable container (modals, dropdowns)
      let el = e.target as HTMLElement | null;
      let hasScrollableParent = false;
      while (el && el !== document.body && el !== document.documentElement) {
        if (el.scrollHeight > el.clientHeight + 4) {
          const overflowY = window.getComputedStyle(el).overflowY;
          if (overflowY === 'auto' || overflowY === 'scroll') {
            const atTop = el.scrollTop <= 0 && e.deltaY < 0;
            const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1 && e.deltaY > 0;
            if (!atTop && !atBottom) {
              hasScrollableParent = true;
              break;
            }
          }
        }
        el = el.parentElement;
      }
      if (hasScrollableParent) return;

      // Boost scroll speed: extra fast on Account and Tracking pages
      const path = window.location.pathname.toLowerCase();
      const isPriorityPage = path.startsWith('/account') || path.startsWith('/profile') || path.startsWith('/track');
      const multiplier = isPriorityPage ? 2.4 : 2.0;

      e.preventDefault();
      window.scrollBy({
        top: e.deltaY * multiplier,
        left: 0,
        behavior: 'auto'
      });
    },
    { passive: false }
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)


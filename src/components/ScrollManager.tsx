import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollManager ensures:
 * 1. Scroll position resets to top on route change (e.g. opening a service detail page).
 * 2. Hash navigations (e.g. /#hizmetler) wait for DOM stabilization and scroll smoothly with navbar offset.
 */
export const ScrollManager = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      return;
    }

    let attempts = 0;
    const maxAttempts = 25;
    let timerId: ReturnType<typeof setTimeout>;

    const tryScroll = () => {
      const element = document.querySelector(hash);
      if (element) {
        const navbarHeight = 80;
        const elementTop = element.getBoundingClientRect().top;
        const targetY = window.scrollY + elementTop - navbarHeight;

        window.scrollTo({
          top: Math.max(0, targetY),
          behavior: "smooth",
        });
      } else if (attempts < maxAttempts) {
        attempts++;
        timerId = setTimeout(tryScroll, 50);
      }
    };

    // Allow the new page component and suspended chunks to mount
    timerId = setTimeout(tryScroll, 60);

    return () => {
      clearTimeout(timerId);
    };
  }, [pathname, hash]);

  return null;
};

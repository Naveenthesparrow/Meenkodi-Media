import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export default function ScrollToTop() {
    const { pathname, state } = useLocation();
    const navigationType = useNavigationType();

    useEffect(() => {
        const savedScrollPosition = sessionStorage.getItem('homeScrollPosition');

        // Restore saved home scroll position first when available.
        if (pathname === '/' && savedScrollPosition && !state?.scrollTo) {
            const y = parseInt(savedScrollPosition, 10);
            if (!Number.isNaN(y)) {
                requestAnimationFrame(() => window.scrollTo(0, y));
                setTimeout(() => window.scrollTo(0, y), 80);
            }
            sessionStorage.removeItem('homeScrollPosition');
            return;
        }

        // Don't force scroll-to-top on browser back/forward navigation.
        if (navigationType === 'POP') {
            return;
        }

        // Custom section scrolling handles its own position.
        if (!state?.scrollTo) {
            window.scrollTo(0, 0);
        }
    }, [pathname, state, navigationType]);

    return null;
}

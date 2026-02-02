import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
    const { pathname, state } = useLocation();

    useEffect(() => {
        // Check if we have a saved scroll position for home page
        const savedScrollPosition = sessionStorage.getItem('homeScrollPosition');
        
        // Don't scroll to top if:
        // 1. state.scrollTo is set (custom scroll position)
        // 2. We're on home page and have a saved scroll position
        if (!state?.scrollTo && !(pathname === '/' && savedScrollPosition)) {
            window.scrollTo(0, 0);
        }
    }, [pathname, state]);

    return null;
}

import { useLocation } from "react-router-dom";
import { useLayoutEffect } from "react";

export function ScrollRestoration() {
    const { pathname } = useLocation();

    useLayoutEffect(() => {
        // Comment this out if you want to preserve scroll:
        window.scrollTo(0, 0);
        // Leave empty → browser keeps scroll position
    }, [pathname]);

    return null;
}
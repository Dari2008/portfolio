import { createContext, useContext } from "react";


export type LoadingAnimation = {
    addLoadingState: (key: string) => Promise<void>;
    removeLoadingState: (key: string) => Promise<void>;
    addOnComponentLoad: (func: (key: string) => void) => void;
    removeOnComponentLoad: (func: (key: string) => void) => void;
    areAllLoaded: () => boolean;
    addOnFinishedLoading: (func: () => void) => void;
    removeOnFinishedLoading: (func: () => void) => void;
    hasLoadedCurrentPage: () => boolean;
}

export const LoadingAnimationContext = createContext<LoadingAnimation | undefined>(undefined);

export function useLoadingAnimation() {
    const ctx = useContext(LoadingAnimationContext);
    if (!ctx) {
        throw new Error("useLoadingAnimation must be used inside LoadingAnimationProvider");
    }
    return ctx as LoadingAnimation;
};
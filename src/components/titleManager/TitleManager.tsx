import { createContext, useContext, type ReactNode } from "react";


export type TitleManagerContextType = {
    setTitle: (title: string) => void;
    title: string;
}

export const TitleManagerContext = createContext<TitleManagerContextType | undefined>(undefined);

export function useTitle() {
    const ctx = useContext(TitleManagerContext);
    if (!ctx) {
        throw new Error("useLoadingAnimation must be used inside LoadingAnimationProvider");
    }
    return ctx as TitleManagerContextType;
};

export function TitleManager({ children }: { children: ReactNode }) {
    const setTitle = (title: string) => {
        document.title = title;
    }

    return <TitleManagerContext.Provider value={{ setTitle, title: document.title }}>{children}</TitleManagerContext.Provider>
}
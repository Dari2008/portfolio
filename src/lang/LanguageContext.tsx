import { createContext, useContext, useState } from "react";
import type { LanguageCode, LanguageManager } from "./LanguageManager";

export type LangContextVal = [LanguageCode, (l: LanguageCode) => void];

export const LanguageContext = createContext<LangContextVal | undefined>(undefined);

export function useLanguage() {
    const ctx = useContext(LanguageContext);
    if (!ctx) {
        throw new Error("useLanguage must be used inside LanguageContextProvider");
    }
    return ctx as LangContextVal;
};
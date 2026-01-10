import { useState, type ReactNode } from "react";
import { LanguageContext } from "./LanguageContext";

export class LanguageManager {
    public static readonly DEFAULT_LANGUAGE: LanguageCode = "en";
    public static readonly SUPPORTED_LANGUAGES: LanguageCode[] = ["en", "de"];
    public static readonly LANGUAGE_NAMES: Record<LanguageCode, string> = {
        en: "English",
        de: "Deutsch"
    };
    public static readonly LANGUAGE_FLAGS: { [key in LanguageCode]: string } = {
        en: "/lang-flags/english.png",
        de: "/lang-flags/german.jpg"
    }
    public CURRENT_LANGUAGE: LanguageCode = LanguageManager.DEFAULT_LANGUAGE;

    public init() {
        // const savedLanguage = localStorage.getItem("language") as LanguageCode | null;
        // if (savedLanguage && LanguageManager.SUPPORTED_LANGUAGES.includes(savedLanguage)) {
        //     this.CURRENT_LANGUAGE = savedLanguage;
        // } else {
        //     this.CURRENT_LANGUAGE = LanguageManager.DEFAULT_LANGUAGE;
        // }
        // LanguageManager.updateLanguageInDOM();
    }

    public setLanguage(language: LanguageCode) {
        if (LanguageManager.SUPPORTED_LANGUAGES.includes(language)) {
            this.CURRENT_LANGUAGE = language;
            // localStorage.setItem("language", language);
            // LanguageManager.updateLanguageInDOM();
        } else {
            throw new Error(`Unsupported language: ${language}`);
        }
    }

    public getLanguage(): LanguageCode {
        return this.CURRENT_LANGUAGE;
    }

    public getLanguageName(language: LanguageCode): string {
        return LanguageManager.LANGUAGE_NAMES[language];
    }

    public getSupportedLanguages(): LanguageCode[] {
        return LanguageManager.SUPPORTED_LANGUAGES;
    }

    public isDefaultLanguage(): boolean {
        return this.CURRENT_LANGUAGE === LanguageManager.DEFAULT_LANGUAGE;
    }

    public isLanguageSupported(language: LanguageCode | string): boolean {
        return LanguageManager.SUPPORTED_LANGUAGES.includes(language as LanguageCode);
    }

    public resetToDefaultLanguage() {
        this.setLanguage(LanguageManager.DEFAULT_LANGUAGE);
    }

    // private static saveInitialValues() {

    //     const allElements = [...document.querySelectorAll("*[data-lang-path]")];
    //     allElements.forEach((el) => {
    //         const path = el.getAttribute("data-lang-path");
    //         if (!path) return;
    //         this.initialValues[path] = el.innerHTML;
    //     });
    // }

    // public static updateLanguageInDOM() {
    //     const allElements = [...document.querySelectorAll("*[data-lang-path]")];
    //     allElements.forEach((el) => {
    //         const path = el.getAttribute("data-lang-path");
    //         if (!path) return;
    //         let content = this.getElementFromPath(path);
    //         if (!content) {
    //             content = this.initialValues[path];
    //         }

    //         if (!content) return;
    //         el.innerHTML = content;
    //     });
    // }


    // private static getElementFromPath(path: string, element: any = this.LANGUAGE_DATA): string | null {
    //     let root = element;
    //     let parts = path.split(".");
    //     if (parts.length == 0) return null;
    //     for (let part of parts) {
    //         root = root[part];
    //         if (!root) return null;
    //     }
    //     return root;
    // }

}

export default function LanguageManagerProvider({ children }: { children: ReactNode; }) {
    const [language, setL] = useState<LanguageCode>((localStorage.getItem("language") ?? "en") as LanguageCode);

    const setLanguage = (l: LanguageCode) => {
        localStorage.setItem("language", l);
        setL(l);
    };

    return <LanguageContext.Provider value={[language, setLanguage]}>
        {children}
    </LanguageContext.Provider>
}

export type LanguageCode = "en" | "de";

export type LanguageData = any;
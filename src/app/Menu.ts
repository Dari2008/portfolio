import type { ReactNode } from "react";
import { AboutMe, Contact, CV, Home, Projects } from "../pages";
import type { LanguageCode } from "../lang/LanguageManager";

export let MENU_ITEMS: MenuItem[] = [
    {
        name: {
            en: "Home",
            de: "Home"
        }, path: "/", element: Home, priority: 4
    },
    {
        name: {
            en: "About Me",
            de: "Über mich"
        }, path: "/aboutMe", element: AboutMe, priority: 3
    },
    {
        name: {
            en: "Curriculum Vitae",
            de: "Lebenslauf"
        }, path: "/cv", element: CV, priority: 2
    },
    {
        name: {
            en: "Projects",
            de: "Projekte"
        }, path: "/projects", element: Projects, priority: 1
    },
    {
        name: {
            en: "Contact",
            de: "Kontakt"
        }, path: "/contact", element: Contact, priority: 0
    },
];

export type MenuItem = {
    name: {
        [key in LanguageCode]: string;
    };
    path: string;
    index?: boolean;
    element: () => ReactNode;
    priority: number;
};
import type { ReactNode } from "react";
import { AboutMe, Contact, CV, Home, Projects } from "../pages";

export let MENU_ITEMS: MenuItem[] = [
    { name: "Home", path: "/", element: Home, priority: 4 },
    { name: "About Me", path: "/aboutMe", element: AboutMe, priority: 3 },
    { name: "Curriculum Vitae", path: "/cv", element: CV, priority: 2 },
    { name: "Projects", path: "/projects", element: Projects, priority: 1 },
    { name: "Contact", path: "/contact", element: Contact, priority: 0 },
];

export type MenuItem = {
    name: string;
    path: string;
    index?: boolean;
    element: () => ReactNode;
    priority: number;
};
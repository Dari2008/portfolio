import dayjs from "dayjs";
import type { Project, PortfolioImage, Technology } from "../components/project/Project";
import type { LanguageCode } from "../lang/LanguageManager";
// import PROJECTS_RAW from "./projects.json";
// import PROGRAMMING_LANGUAGE_LINKS_RAW from "./programmingLanguagesLinks.json";
// import PROGRAMMING_LANGUAGE_COLORS_RAW from "./ProgrammingLanguagesColors.json";
// import ABOUT_ME_EN from "./aboutMe-en.json";
// import CONTACT_RAW from "./contact.json";


// export const PROJECTS: Project[] = PROJECTS_RAW as Project[];
// export const PROGRAMMING_LANGUAGE_LINKS: ProgramingLanguageLinkLookup = PROGRAMMING_LANGUAGE_LINKS_RAW;
// export const PROGRAMMING_LANGUAGE_COLORS: ProgramingLanguageColorLookup = PROGRAMMING_LANGUAGE_COLORS_RAW;
// export const ABOUT_ME: AboutMe = ABOUT_ME_EN;
// export const CONTACT: Contact = CONTACT_RAW;

export let PROJECTS: Project[] = [];
export let PROGRAMMING_LANGUAGE_LINKS: ProgramingLanguageLinkLookup = {};
export let PROGRAMMING_LANGUAGE_COLORS: ProgramingLanguageColorLookup = {};
export let ABOUT_ME: AboutMe = {} as any;
export let CONTACT: Contact = {} as any;
export let CURRICULUM_VITAE: CurriculumVitae = {} as any;
export let STATISTICS: Statistics = [];
export let SPECIALS_STEM_RACING: SpecialsStemRacing = {} as any;


export type ProgramingLanguageLinkLookup = { [key in Technology]?: string; };
export type ProgramingLanguageColorLookup = { [key: string]: string; };
export type AboutMe = {
    name: string;
    role: string;
    location: string;
    currentlyWorkingOn: string;

    hero: {
        hi: LanguageString;
        slogan: LanguageString;
        subline: LanguageString;
    },
    texts: {
        intro: LanguageObject<string | string[]>;
        techStack: LanguageObject<string | string[]>;
        origin: LanguageObject<string | string[]>;
        interests: LanguageObject<string | string[]>;
        learning: LanguageObject<string | string[]>;
        goals: LanguageObject<string | string[]>;
    };

    whatIAm: LanguageString;
    technologies: AboutMeCategory[];
    motiviation: LanguageString;
    whatILearnCurrently: LanguageString;
}

export type AboutMeCategory = {
    category: string;
    tech: (Technology | string)[];
}

export type Contact = {
    name: string;
    email: string;
    linkedIn: string;
    discord: string;
    phone: {
        prefix: string;
        number: string;
        optionalZero?: boolean;
    }
    github: string;
}

export type CurriculumVitae = {
    name: {
        firstName: string;
        lastName: string;
    };
    infos: Info[];
    location: string;
    entrys: CurriculumVitaeEntry[];
};

export type CurriculumVitaeEntry = {
    from: string;
    to: string;
    title: LanguageString;
    image?: PortfolioImage;
    description: LanguageString;
    downloadItems?: CurriculumVitaeDownloadItem[];
    color: string;
    category: LanguageString;
};

export type CurriculumVitaeDownloadItem = {
    downloadLink: string;
    name: LanguageString;
    extension?: string;
}


type Info = {
    icon: string;
    value: string;
    title: LanguageString;
}

export type Statistic = {
    title: LanguageString;
    value: number | string;
    icon: string;
    unit?: string;
    importance: 1 | 2 | 3 | 4;
}

export type Statistics = Statistic[];

export type LanguageString = {
    [key in LanguageCode]: string;
}

export type LanguageObject<T> = {
    [key in LanguageCode]: T;
}

export async function load(url: string): Promise<any> {
    try {

        const parseEtc = async (res: Response, parseAsXML: boolean) => {
            if (parseAsXML) {
                return await loadAllTXTFiles(await parseXML(await res.text()));
            } else {
                return await loadAllTXTFiles(await res.json());
            }
        }

        switch (url) {
            case "projects":
                return await parseEtc(await fetch("/data/projects.xml"), true);
            case "programmingLanguageLinks":
                return await parseEtc(await fetch("/data/programmingLanguagesLinks.json"), false);
            case "programmingLanguageColors":
                return await parseEtc(await fetch("/data/programmingLanguagesColors.json"), false);
            case "aboutMe":
                return await parseEtc(await fetch("/data/aboutMe-en.xml"), true);
            case "contact":
                return await parseEtc(await fetch("/data/contact.xml"), true);
            case "cv":
                return await parseEtc(await fetch("/data/cv.xml"), true);
            case "statistics":
                return await parseEtc(await fetch("/data/statistics.json"), false);
            case "specials-stemRacing":
                return await parseEtc(await fetch("/data/specials/stemRacing.xml"), true);
        }
        return await (await fetch(url)).json();
    } catch (ex) {
        return {
            error: ex,
            message: "An error happed when loading the data from " + url
        };
    }
}

async function loadAllTXTFiles(data: any): Promise<any> {
    if (typeof data != "object" && typeof data != "string") return data;

    if (typeof data == "string") {
        return await loadTextFromTXTString(data);
    }

    if (Array.isArray(data)) {
        const result: any[] = [];
        for (const value of data) {
            result.push(await loadAllTXTFiles(value));
        }
        return result;
    }

    const result: any = {};
    for (const key in data) {
        const value = data[key];
        result[key] = await loadAllTXTFiles(value);
    }

    return result;
}

async function loadTextFromTXTString(str: string): Promise<string> {
    if (str.startsWith("#/")) {
        return await loadTextFrom(str);
    }
    if (str.startsWith("\\/")) {
        return str.replace("\\/", "");
    }
    return str;
}

async function loadTextFrom(url: string): Promise<string> {
    try {
        const response = await fetch(url);
        return await response.text();
    } catch (ex) {
        return "An error happed when loading the data";
    }
}


export async function loadProjects(): Promise<Project[]> {
    const projects = await loadOnce("projects") as Project[];
    PROJECTS = projects;
    fireLoadEvent("projects", PROJECTS);
    return PROJECTS;
}

export async function loadAboutMe(): Promise<AboutMe> {
    const aboutMe = await loadOnce("aboutMe") as AboutMe;
    ABOUT_ME = aboutMe;
    fireLoadEvent("aboutMe", ABOUT_ME);
    return ABOUT_ME;
}

export async function loadContact(): Promise<Contact> {
    const contact = await loadOnce("contact") as Contact;
    CONTACT = contact;
    fireLoadEvent("contact", CONTACT);
    return CONTACT;
}

export async function loadProgrammingLanguageColors(): Promise<ProgramingLanguageColorLookup> {
    const colors = await loadOnce("programmingLanguageColors") as ProgramingLanguageColorLookup;
    PROGRAMMING_LANGUAGE_COLORS = colors;
    fireLoadEvent("programmingLanguageColors", PROGRAMMING_LANGUAGE_COLORS);
    return PROGRAMMING_LANGUAGE_COLORS;
}

export async function loadPorgrammingLanguageLinks(): Promise<ProgramingLanguageLinkLookup> {
    const links = await loadOnce("programmingLanguageLinks") as ProgramingLanguageLinkLookup;
    PROGRAMMING_LANGUAGE_LINKS = links;
    fireLoadEvent("programmingLanguageLinks", PROGRAMMING_LANGUAGE_LINKS);
    return PROGRAMMING_LANGUAGE_LINKS;
}

export async function loadStatistics(): Promise<Statistics> {
    const links = await loadOnce("statistics") as Statistics;
    STATISTICS = links;
    fireLoadEvent("statistics", STATISTICS);
    return STATISTICS;
}

export async function loadSpecialsStemRacing(): Promise<SpecialsStemRacing> {
    const links = await loadOnce("specials-stemRacing") as SpecialsStemRacing;
    SPECIALS_STEM_RACING = links;
    fireLoadEvent("specials-stemRacing", SPECIALS_STEM_RACING);
    return SPECIALS_STEM_RACING;
}

export async function loadCV(): Promise<CurriculumVitae> {
    const cv = await loadOnce("cv") as CurriculumVitae;
    CURRICULUM_VITAE = cv;
    CURRICULUM_VITAE.entrys = CURRICULUM_VITAE.entrys.sort((a, b) => {
        return dayjs(a.from, "DD.MM.YYYY").diff(dayjs(b.from, "DD.MM.YYYY"));
    }).reverse();
    fireLoadEvent("cv", CURRICULUM_VITAE);
    return CURRICULUM_VITAE;
}

const loadingListeners: {
    [key: string]: ((data: any) => void)[];
} = {};


export function addOnLoadListener(name: string, onLoad: (data: any) => void) {
    if (!loadingListeners[name]) {
        loadingListeners[name] = [];
    }
    loadingListeners[name].push(onLoad);
}

export function listenerCount(name: string): number {
    if (!loadingListeners[name]) return 0;
    return loadingListeners[name].length;
}

export function removeOnLoadListener(name: string, onLoad: (data: any) => void) {
    if (!loadingListeners[name]) return;
    const index = loadingListeners[name].indexOf(onLoad);
    if (index != -1) {
        loadingListeners[name].splice(index, 1);
    }
}


function fireLoadEvent(key: string, data: any) {
    loadingListeners[key]?.forEach(e => e(data));
}

let currentlyLoading: {
    [key: string]: Promise<any> | undefined;
} = {};

async function loadOnce(name: string): Promise<any> {
    const wrapper = async () => {
        const response = await load(name);
        return response;
    };

    if (currentlyLoading[name]) {
        return currentlyLoading[name];
    }

    const promise = wrapper();
    currentlyLoading[name] = promise;
    return promise;
}


export type SpecialsStemRacing = {
    images: Image[];
    whatILearned: WhatILearned[];
    whatIDid: WhatIDidEntry[];
}

export type WhatIDidEntry = {
    title: LanguageString;
    elements: LanguageString | Elements;
}

export type Elements = Element[];
export type Element = LinkElement | TextElement | ListElement;

export type TextElement = {
    type: "text";
    value: LanguageString;
}

export type ListElement = {
    type: "list";
    value: LanguageString[];
}

export type LinkElement = {
    type: "link";
    link: string;
    text: LanguageString;
}

export type Image = {
    folder: string;
    baseName: string;
    extension: string;
    description: LanguageString;
}

export type WhatILearned = {
    title: LanguageString;
    items: LanguageString[];
};




// XML Parser

function parseXML(xml: string): any {
    const doc = new XMLToJsonParser(xml);
    return doc.toJSON();
}


class XMLToJsonParser {
    constructor(xml: string) {
        const parser = new DOMParser();
        this.xmlDoc = parser.parseFromString(xml.trim(), "text/xml");
    }

    xmlDoc: Document;

    toJSON(): any {
        let node = this.xmlDoc.documentElement;
        let result: any = this.parseNode(node);
        return result;
    }

    parseNode(node: HTMLElement) {
        if (node.childElementCount == 0) return node.textContent;
        if (this.allChildrenSame(node)) {
            let result: JsonParsedArray = [];
            for (const child of node.children) {
                const current = this.parseNode(child as HTMLElement);
                result.push(current);
            }
            return result;
        } else {
            let result: JsonParsed = {};
            for (const child of node.children) {
                const current = this.parseNode(child as HTMLElement);
                if (result[child.tagName] != undefined && !Array.isArray(result[child.tagName])) {
                    result[child.tagName] = [
                        result[child.tagName],
                        current
                    ]
                } else if (Array.isArray((result as JsonParsed)[child.tagName])) {
                    (result[child.tagName] as any[]).push(current);
                } else {
                    result[child.tagName] = current;
                }
            }
            return result;
        }
    }

    private allChildrenSame(node: HTMLElement) {
        if (node.childElementCount == 0) return false;
        let element = null;
        for (const c of node.children) {
            if (element == null) {
                element = c.tagName;
                continue;
            }
            if (element != c.tagName) return false;
        }
        return true;
    }

}

type JsonParsed = {
    [key: string]: JsonParsedValue;
}

type JsonParsedValue = string | JsonParsed | JsonParsedArray;
type JsonParsedArray = (string | JsonParsed | JsonParsedValue)[];
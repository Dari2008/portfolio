import { useEffect } from "react";
import { Statics } from "../../../utils";
import type { LoadingAnimation } from "../../backgroundAnimation/LoadingAnimationContext";
import type { Technology } from "../Project";
import { loadPorgrammingLanguageLinks, PROGRAMMING_LANGUAGE_LINKS } from "../../../data/Data";

const globalCache = globalThis as any;

globalCache.__IMAGE_LOAD_CACHE__ ??= {};
globalCache.__THEME_COLORED_IMAGES__ ??= {};

export const THEME_COLORED_IMAGES: { [key in Technology]?: string } = globalCache.__THEME_COLORED_IMAGES__;
export const CURRENT_QUERYS: {
    [key in Technology]?: Promise<string>;
} = {};

export const IMAGE_LOAD_CACHE: {
    [key in Technology]?: string;
} = globalCache.__IMAGE_LOAD_CACHE__;

const IMAGE_LOADING_QUERYS: {
    [key in Technology]?: Promise<string>;
} = {};


export default async function resolveProgrammingLanguageIcon(technology: Technology): Promise<string> {
    if (IMAGE_LOAD_CACHE[technology]) return IMAGE_LOAD_CACHE[technology]!;

    const currentQuery = IMAGE_LOADING_QUERYS[technology];
    if (currentQuery) return currentQuery;

    const wrapper = async () => {
        if (technology == "html") technology = "html5";
        const el = IMAGE_LOAD_CACHE[technology];
        if (el) return el;

        const url = "/technology-icons/" + technology + ".svg";
        const content = await (await fetch(url)).text();
        if (!content) {
            console.error(technology + " was not found!");
            IMAGE_LOAD_CACHE[technology] = url;
            return url;
        }
        IMAGE_LOAD_CACHE[technology] = `${SVG_DATA_URL}${encodeURIComponent(content)}`;

        return IMAGE_LOAD_CACHE[technology]!;
    };

    const currentAsync = wrapper();
    IMAGE_LOADING_QUERYS[technology] = currentAsync;
    currentAsync.then(() => {
        IMAGE_LOADING_QUERYS[technology] = undefined;
        delete IMAGE_LOADING_QUERYS[technology];
    });
    return currentAsync;
}

const SVG_DATA_URL = "data:image/svg+xml;charset=utf-8,";

export async function resolveProgrammingLanguageThemeColorIcon(technology: Technology): Promise<string> {
    if (THEME_COLORED_IMAGES[technology]) return THEME_COLORED_IMAGES[technology]!;

    if (technology == "html") {
        technology = "html5";
    }

    const wrapper = async () => {

        const url = await resolveProgrammingLanguageIcon(technology);

        const content = url.startsWith(SVG_DATA_URL) ? decodeURIComponent(url.replace(SVG_DATA_URL, "")) : (await (await fetch(url)).text());
        if (!content) {
            console.error(technology + " was not found!");
            THEME_COLORED_IMAGES[technology] = url;
            return url;
        }

        let replacedContent = content;
        replacedContent = replacedContent.replaceAll(/(fill|stroke|stop-color)(=|:)(["'`])((?:#|rgb|rgba)[^"'`]*?)\3|(fill|stroke|stop-color)(=|:)\s?()((?:#|rgb|rgba)[^;]*?);/gm, (
            str,
            g1, g2, g3, g4,
            g5, g6, g7, g8,
        ) => {
            const type = g1 || g5;
            const equalSign = g2 || g6;
            const brackets = g3 || g7;
            const content = g4 || g8;

            if (str.includes("url")) return str;
            if (str.includes("mask")) return str;
            if (!content) console.log(str, type,
                equalSign,
                brackets,
                content);
            const color = parseColor(content);
            if (!color) return str;

            if (technology == "css3" || technology == "javascript") {

                const brightness = (color.r * 299 + color.g * 587 + color.b * 114) / 1000;
                const baseColor = {
                    r: 146,
                    g: 72,
                    b: 122
                };

                type RGB = { r: number; g: number; b: number };

                const clamp = (v: number) => Math.max(0, Math.min(255, v));

                const brighten = (color: RGB, amount: number): RGB => {
                    const factor = clamp(amount) / 130;
                    return {
                        r: clamp(color.r + (255 - color.r) * factor),
                        g: clamp(color.g + (255 - color.g) * factor),
                        b: clamp(color.b + (255 - color.b) * factor)
                    };
                };

                const darken = (color: RGB, amount: number): RGB => {
                    const factor = clamp(-amount) / 130;
                    return {
                        r: clamp(color.r * (1 - factor)),
                        g: clamp(color.g * (1 - factor)),
                        b: clamp(color.b * (1 - factor))
                    };
                };


                const getColorForBrightness = (brightnessValue: number) => {
                    brightnessValue = brightnessValue > 175 ? 175 : (brightnessValue < 75 ? 75 : brightnessValue);
                    if (brightnessValue > 125) {
                        return brighten(baseColor, brightnessValue - 125);
                    } else {
                        return darken(baseColor, brightnessValue - 125);
                    }
                };

                const colorStr = getColorForBrightness(brightness);

                return `${type}${equalSign}${brackets}${`rgb(${colorStr.r}, ${colorStr.g}, ${colorStr.b})`}${brackets}`;

            }

            if (color.r == color.g && color.r == color.b) {
                const brightness = color.r;
                if (brightness > 125) {
                    return `${type}${equalSign}${brackets}${Statics.THEME_COLORS[0]}${brackets}`;
                } else {
                    return `${type}${equalSign}${brackets}${Statics.THEME_COLORS[3]}${brackets}`;
                }
            }

            return `${type}${equalSign}${brackets}${Statics.THEME_COLORS[2]}${brackets}`;
        });
        const resultUrl = `${SVG_DATA_URL}${encodeURIComponent(replacedContent)}`;
        THEME_COLORED_IMAGES[technology] = resultUrl;
        return resultUrl;
    };

    const currentQuery = CURRENT_QUERYS[technology];
    if (currentQuery) return currentQuery;

    const promise = wrapper();
    promise.then(() => {
        CURRENT_QUERYS[technology] = undefined;
        delete CURRENT_QUERYS[technology];
    });
    CURRENT_QUERYS[technology] = promise;
    return promise as Promise<string>;
}

export function parseColor(input: string) {
    // console.log(input);
    input = input.trim().toLowerCase();

    // --- Hex formats ---
    if (input.startsWith("#")) {
        const hex = input.slice(1);

        // #RGB
        if (hex.length === 3) {
            return {
                r: parseInt(hex[0] + hex[0], 16),
                g: parseInt(hex[1] + hex[1], 16),
                b: parseInt(hex[2] + hex[2], 16),
                a: 1
            };
        }

        // #RRGGBB
        if (hex.length === 6) {
            return {
                r: parseInt(hex.slice(0, 2), 16),
                g: parseInt(hex.slice(2, 4), 16),
                b: parseInt(hex.slice(4, 6), 16),
                a: 1
            };
        }

        // #RRGGBBAA
        if (hex.length === 8) {
            return {
                r: parseInt(hex.slice(0, 2), 16),
                g: parseInt(hex.slice(2, 4), 16),
                b: parseInt(hex.slice(4, 6), 16),
                a: parseInt(hex.slice(6, 8), 16) / 255,
            };
        }

        throw new Error("Invalid hex color format: " + input);
    }

    // --- rgb(...) or rgba(...) ---
    const rgbRegex =
        /^rgba?\s*\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})(?:\s*,\s*(0|1|0?\.\d+))?\s*\)$/;

    const match = input.match(rgbRegex);

    if (match) {
        return {
            r: Math.min(255, parseInt(match[1])),
            g: Math.min(255, parseInt(match[2])),
            b: Math.min(255, parseInt(match[3])),
            a: match[4] !== undefined ? parseFloat(match[4]) : 1
        };
    }

    return null;
}


export function hasLoadedAll(techs: Technology[]) {
    return techs.map(e => THEME_COLORED_IMAGES[e]).filter(e => !e).length == 0;
}

export function hasLoadedAllLinks() {
    return Object.keys(PROGRAMMING_LANGUAGE_LINKS).length != 0
}

export async function loadAllImagesFromList(loadingAnimation: LoadingAnimation, techs: Technology[], key: string): Promise<boolean> {
    if (!hasLoadedAll(techs)) {
        loadingAnimation.addLoadingState(key);
        await Promise.all(techs.map(async tech => {

            let result = THEME_COLORED_IMAGES[tech];
            if (!result) {
                result = await resolveProgrammingLanguageThemeColorIcon(tech);
            }
            THEME_COLORED_IMAGES[tech] = result;
        }));
        loadingAnimation.removeLoadingState(key);
        return true;
    }
    return false;
}

export function loadALlImagesFromListWithEffect(loadingAnimation: LoadingAnimation, techs: Technology[], key: string, onLoad?: React.Dispatch<React.SetStateAction<number>>) {
    useEffect(() => {
        (async () => {
            const update = await loadAllImagesFromList(loadingAnimation, techs, key);
            if (update) onLoad?.(e => e + 1);
        })();
    }, [techs]);
}



export async function loadAllLinksFromList(loadingAnimation: LoadingAnimation, key: string): Promise<boolean> {
    if (!hasLoadedAllLinks()) {
        loadingAnimation.addLoadingState(key);
        await loadPorgrammingLanguageLinks();
        loadingAnimation.removeLoadingState(key);
        return true;
    }
    return false;
}

export function loadALlLinksFromListWithEffect(loadingAnimation: LoadingAnimation, key: string, onLoad?: React.Dispatch<React.SetStateAction<number>>) {
    useEffect(() => {
        (async () => {
            const update = await loadAllLinksFromList(loadingAnimation, key);
            if (update) onLoad?.(e => e + 1);
        })();
    }, []);
}
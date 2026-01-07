import { Statics } from "../../utils";

export function move(circle: HTMLDivElement, to: [string, string], time?: string, speedFunc: string = "linear") {
    if (time) circle.style.setProperty("--time", time);
    circle.style.transitionTimingFunction = speedFunc != "linear" ? speedFunc + " !important" : speedFunc;
    circle.style.left = to[0] + "";
    circle.style.top = to[1] + "";
}

export function movePercentage(circle: HTMLDivElement, to: [string, string], time?: string, speedFunc: string = "linear") {
    if (time) circle.style.setProperty("--time", time);
    circle.style.transitionTimingFunction = speedFunc != "linear" ? speedFunc + " !important" : speedFunc;
    circle.style.setProperty("--top", to[1]);
    circle.style.setProperty("--left", to[0]);
}

export function generateRandomPosition() {

    const width = window.innerWidth;
    const height = window.innerHeight;

    const size = Math.min(width, height) / 2;

    const cx = width / 2;
    const cy = height / 2;

    const radius = size / 2 - randomBetween(0, size / 20);

    const angle = randomFloatBetween(0, Math.PI * 2);

    const x = cx + Math.sin(angle) * radius;
    const y = cy + Math.cos(angle) * radius;


    return {
        top: Math.round(y) + "px",
        left: Math.round(x) + "px",
        "--warp-y": Math.round(y) + "px",
        "--warp-x": Math.round(x) + "px",
        "--circle-size": randomFloatBetween(1, Statics.BACKGROUND_ANIMATION_MAX_SIZE)
    };
}

export function randomBetween(min: number, max: number): number {
    return Math.round(Math.random() * (max - min) + min);
}

export function randomFloatBetween(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

let isFirstLoadB = true;

export function isFirstLoad(): boolean {
    return isFirstLoadB;
}

export function firstLoaded() {
    isFirstLoadB = false;
    callbackOnLoad?.();
}

var callbackOnLoad: (() => void) | undefined = undefined;

export function setCallbackOnLoad(callback: () => void) {
    callbackOnLoad = callback;
}
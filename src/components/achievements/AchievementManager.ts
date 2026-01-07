export default class AchievementManager {

    private achievements: AchievementType[] = [];
    public onAchievementAdd: ((achievement: Achievement) => void) | undefined;
    public onAchievementAddForPage: (() => void) | undefined;

    constructor() {
        this.loadFromDisc();
        console.log("Created");

        // scrolledToBottomOfPage
        let scrolledToBottom = this.achievements.includes("scrolledToBottomOfPage");
        let hasScrolled = () => {
            if (location.pathname.includes("achievements")) return;
            console.log("Scrolled");
            const scrollTop = window.scrollY; // or document.documentElement.scrollTop
            const windowHeight = window.innerHeight;
            const docHeight = document.documentElement.scrollHeight;

            if (scrollTop + windowHeight >= docHeight) {
                this.achievementFinished().scrolledToBottomOfPage();
                window.removeEventListener("scroll", hasScrolled);
                scrolledToBottom = true;
            }
        };
        if (!scrolledToBottom) window.addEventListener("scroll", hasScrolled);

        // openedDeveloperTools
        let areOpened = this.achievements.includes("openedDeveloperTools");

        // const checkConsoleOpened = async () => {
        //     return new Promise((resolve) => {
        //         var devtools = function () { };
        //         (devtools as any).toString = () => {
        //             if (!areOpened) {
        //                 resolve(true);
        //                 clearTimeout(id);
        //             }
        //         }

        //         console.log('%c', devtools);
        //         let id = setTimeout(() => resolve(false), 100);
        //     });
        // }

        const func = async () => {
            console.log(areOpened);
            if (areOpened) {
                return;
            }

            // if (await checkConsoleOpened() || window.console) {
            //     areOpened = true;
            //     this.achievementFinished().openedDevTools();
            //     return;
            // }

            let start = Date.now();
            debugger; // Pauses if DevTools are open
            let end = Date.now();
            if (end - start > 100) {
                areOpened = true;
                this.achievementFinished().openedDevTools();
            } else {
                setTimeout(func, 1000);
            }
        };
        if (!areOpened) setTimeout(func, 1000);

        // spentFiveMinutes
        let hasSpentFiveMinutes = this.achievements.includes("spentFiveMinutes");
        if (!hasSpentFiveMinutes) setTimeout(() => {
            this.achievementFinished().spentFiveMinutes();
            hasSpentFiveMinutes = true;
        }, 1000 * 60 * 5);

        let hasBeenHereAt0 = this.achievements.includes("visitedPageAt00_00");
        if (!hasBeenHereAt0) {
            let id = setInterval(() => {
                let currentTime = new Date();
                if (currentTime.getHours() == 0 && currentTime.getMinutes() == 0) {
                    clearInterval(id);
                    this.achievementFinished().hasBeenHereAt0();
                }
            }, 1000);
        }

    }

    public hasAchievement(key: AchievementType) {
        return this.achievements.includes(key);
    }

    public getAchievements(): Achievement[] {
        return this.achievements.map(e => ACHIEVEMENT_REGISTRY[e]);
    }

    public loadFromDisc(): Achievement[] | undefined {
        const achievementsString = localStorage.getItem("achievements");
        if (!achievementsString) return;

        const achievements = JSON.parse(achievementsString);
        if (!achievements) return;

        this.achievements = achievements;
        return this.achievements.map(e => ACHIEVEMENT_REGISTRY[e]);
    }

    public saveAchievements() {
        localStorage.setItem("achievements", JSON.stringify(this.achievements));
    }

    private loadAtt<T>(key: string): T | undefined {
        const k = localStorage.getItem("achievements-" + key);
        return !k ? undefined : JSON.parse(k) as T;
    }

    private saveAtt(key: string, val: any) {
        localStorage.setItem("achievements-" + key, JSON.stringify(val));
    }

    public achievementFinished(): AchievementFinishedFunctions {

        const onAchievmentDone = (achievementName: AchievementType) => {
            console.log(this.achievements);
            if (this.achievements.length == Object.keys(ACHIEVEMENT_REGISTRY).length) {

                for (const ach of Object.keys(ACHIEVEMENT_REGISTRY)) {
                    if (!this.achievements.includes(ach as AchievementType)) return;
                }

                this.achievementFinished().finishedAllAchievements();
                this.onAchievementAdd?.(ACHIEVEMENT_REGISTRY["finishedAllAchievements"]);
                this.onAchievementAddForPage?.();
            } else {

                this.onAchievementAdd?.(ACHIEVEMENT_REGISTRY[achievementName]);
                this.onAchievementAddForPage?.();
            }
            this.saveAchievements();
        }

        return {
            scrolledToBottomOfPage: () => {
                if (this.achievements.includes("scrolledToBottomOfPage")) return;
                this.achievements.push("scrolledToBottomOfPage");
                onAchievmentDone("scrolledToBottomOfPage");
            },
            openedDevTools: () => {
                if (this.achievements.includes("openedDeveloperTools")) return;
                this.achievements.push("openedDeveloperTools");
                onAchievmentDone("openedDeveloperTools");
            },
            visitedProject: (project) => {
                const all = this.loadAtt<string[]>("projects-opened") ?? [];
                if (all.includes(project)) return;

                all.push(project);

                const checkIfAllOpened = () => {
                    if (ALL_PROJECTS.length != all.length) return false;
                    for (const project of ALL_PROJECTS) {
                        if (!all.includes(project)) return false;
                    }
                    return true;
                };

                this.saveAtt("projects-opened", all);

                if (checkIfAllOpened()) {
                    this.achievements.push("visitedAllProjects");
                    onAchievmentDone("visitedAllProjects");
                }
            },
            triggeredEasterEgg: (easterEggName) => {
                if (this.achievements.includes("triggeredEasterEgg")) return;
                if (easterEggName == "konamiCode") {
                    this.achievements.push("triggeredEasterEgg");
                }
                onAchievmentDone("triggeredEasterEgg");
            },
            spentFiveMinutes: () => {
                if (this.achievements.includes("scrolledToBottomOfPage")) return;
                this.achievements.push("scrolledToBottomOfPage");
                onAchievmentDone("scrolledToBottomOfPage");
            },
            visitedPage: (page) => {
                switch (page) {
                    case "home":
                        if (this.achievements.includes("visitedHomePage")) return;
                        this.achievements.push("visitedHomePage");
                        onAchievmentDone("visitedHomePage");
                        break;
                    case "cv":
                        if (this.achievements.includes("visitedCVPage")) return;
                        this.achievements.push("visitedCVPage");
                        onAchievmentDone("visitedCVPage");
                        break;
                    case "aboutMe":
                        if (this.achievements.includes("visitedAboutMePage")) return;
                        this.achievements.push("visitedAboutMePage");
                        onAchievmentDone("visitedAboutMePage");
                        break;
                    case "contact":
                        if (this.achievements.includes("visitedContactPage")) return;
                        this.achievements.push("visitedContactPage");
                        onAchievmentDone("visitedContactPage");
                        break;
                }
            },
            usedConsole: () => {
                if (this.achievements.includes("usedConsole")) return;
                this.achievements.push("usedConsole");
                onAchievmentDone("usedConsole");
            },
            submittedContactForm: () => {
                if (this.achievements.includes("submittedContactForm")) return;
                this.achievements.push("submittedContactForm");
                onAchievmentDone("submittedContactForm");
            },
            finishedAllAchievements: () => {
                if (this.achievements.includes("finishedAllAchievements")) return;
                this.achievements.push("finishedAllAchievements");
            },
            hasBeenHereAt0: () => {
                if (this.achievements.includes("visitedPageAt00_00")) return;
                this.achievements.push("visitedPageAt00_00");
            }
        }

    }

}

type AchievementFinishedFunctions = {
    scrolledToBottomOfPage: () => void;
    openedDevTools: () => void;
    visitedProject: (project: string) => void;
    triggeredEasterEgg: (easterEggName: string) => void;
    spentFiveMinutes: () => void;
    visitedPage: (page: string) => void;
    usedConsole: () => void;
    submittedContactForm: () => void;
    finishedAllAchievements: () => void;
    hasBeenHereAt0: () => void;
}

export type AchievementType =
    | "scrolledToBottomOfPage"
    | "openedDeveloperTools"
    | "visitedAllProjects"
    | "triggeredEasterEgg"
    | "spentFiveMinutes"
    | "visitedHomePage"
    | "visitedAboutMePage"
    | "visitedCVPage"
    | "visitedContactPage"
    | "usedConsole"
    | "submittedContactForm"
    | "finishedAllAchievements"
    | "visitedPageAt00_00";

type URL = string;

export type Achievement = {
    icon: string | URL;
    title: string;
    info: string;
}

const ALL_PROJECTS: string[] = [
    "untiscombiner",
    "ascentwebsite",
    "led-matrix"
];

export const ACHIEVEMENT_REGISTRY: {
    [key in AchievementType]: Achievement
} = {
    scrolledToBottomOfPage: {
        icon: "\uf70e",
        title: "Completionist",
        info: "Scrolled all the way to the bottom of the page."
    },

    openedDeveloperTools: {
        icon: "\uf121",
        title: "Inspector",
        info: "Opened developer tools to explore the site."
    },

    visitedAllProjects: {
        icon: "\uf542",
        title: "Full Tour",
        info: "Visited every project in the portfolio."
    },

    triggeredEasterEgg: {
        icon: "\uf7fb",
        title: "You Found It",
        info: "Discovered a hidden feature on the site."
    },

    spentFiveMinutes: {
        icon: "\uf251",
        title: "Taking Your Time",
        info: "Spent at least five minutes exploring the site."
    },

    visitedHomePage: {
        icon: "\uf015",
        title: "Welcome Explorer",
        info: "Visited the home page."
    },

    visitedAboutMePage: {
        icon: "\uf406",
        title: "Getting Personal",
        info: "Opened the About Me page."
    },

    visitedCVPage: {
        icon: "\uf02d",
        title: "Career Scout",
        info: "Visited the CV / Resume page."
    },

    visitedContactPage: {
        icon: "\uf2b6",
        title: "Say Hello",
        info: "Visited the Contact page."
    },

    usedConsole: {
        icon: "\uf120",
        title: "Curious Coder",
        info: "Opened or used the console feature."
    },

    submittedContactForm: {
        icon: "\uf1d8",
        title: "Reacher",
        info: "Submitted a message through the contact form."
    },

    finishedAllAchievements: {
        icon: "\uf005", // fa-star
        title: "Master Explorer",
        info: "Unlocked all achievements! You’ve seen everything the site has to offer."
    },

    visitedPageAt00_00: {
        icon: "\uf017",
        title: "Midnight Visitor",
        info: "Visited the site at exactly midnight!"
    },
};
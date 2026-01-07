import type { LanguageString } from "../../data/Data";

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
    title: LanguageString;
    info: LanguageString;
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
        title: {
            en: "Completionist",
            de: "Vollender"
        },
        info: {
            en: "Scrolled all the way to the bottom of the page.",
            de: "Bis ganz nach unten auf der Seite gescrollt."
        }
    },

    openedDeveloperTools: {
        icon: "\uf121",
        title: {
            en: "Inspector",
            de: "Inspektor"
        },
        info: {
            en: "Opened developer tools to explore the site.",
            de: "Die Entwicklerwerkzeuge geöffnet, um die Seite zu erkunden."
        }
    },

    visitedAllProjects: {
        icon: "\uf542",
        title: {
            en: "Full Tour",
            de: "Kompletttour"
        },
        info: {
            en: "Visited every project in the portfolio.",
            de: "Alle Projekte im Portfolio besucht."
        }
    },

    triggeredEasterEgg: {
        icon: "\uf7fb",
        title: {
            en: "You Found It",
            de: "Gefunden"
        },
        info: {
            en: "Discovered a hidden feature on the site.",
            de: "Ein verstecktes Feature der Seite entdeckt."
        }
    },

    spentFiveMinutes: {
        icon: "\uf251",
        title: {
            en: "Taking Your Time",
            de: "Zeit genommen"
        },
        info: {
            en: "Spent at least five minutes exploring the site.",
            de: "Mindestens fünf Minuten auf der Seite verbracht."
        }
    },

    visitedHomePage: {
        icon: "\uf015",
        title: {
            en: "Welcome, Explorer",
            de: "Willkommen, Entdecker"
        },
        info: {
            en: "Visited the home page.",
            de: "Die Startseite besucht."
        }
    },

    visitedAboutMePage: {
        icon: "\uf406",
        title: {
            en: "Getting Personal",
            de: "Persönlich geworden"
        },
        info: {
            en: "Opened the About Me page.",
            de: "Die „Über mich“-Seite geöffnet."
        }
    },

    visitedCVPage: {
        icon: "\uf02d",
        title: {
            en: "Career Scout",
            de: "Karriere-Scout"
        },
        info: {
            en: "Visited the CV / Resume page.",
            de: "Die Lebenslauf- bzw. CV-Seite besucht."
        }
    },

    visitedContactPage: {
        icon: "\uf2b6",
        title: {
            en: "Say Hello",
            de: "Sag Hallo"
        },
        info: {
            en: "Visited the Contact page.",
            de: "Die Kontaktseite besucht."
        }
    },

    usedConsole: {
        icon: "\uf120",
        title: {
            en: "Curious Coder",
            de: "Neugieriger Coder"
        },
        info: {
            en: "Opened or used the console feature.",
            de: "Die Konsolenfunktion geöffnet oder verwendet."
        }
    },

    submittedContactForm: {
        icon: "\uf1d8",
        title: {
            en: "Reacher",
            de: "Kontakt aufgenommen"
        },
        info: {
            en: "Submitted a message through the contact form.",
            de: "Eine Nachricht über das Kontaktformular gesendet."
        }
    },

    finishedAllAchievements: {
        icon: "\uf005",
        title: {
            en: "Master Explorer",
            de: "Meister-Entdecker"
        },
        info: {
            en: "Unlocked all achievements! You’ve seen everything the site has to offer.",
            de: "Alle Erfolge freigeschaltet! Du hast alles gesehen, was die Seite zu bieten hat."
        }
    },

    visitedPageAt00_00: {
        icon: "\uf017",
        title: {
            en: "Midnight Visitor",
            de: "Mitternachtsbesucher"
        },
        info: {
            en: "Visited the site at exactly midnight!",
            de: "Die Seite exakt um Mitternacht besucht!"
        }
    },
};

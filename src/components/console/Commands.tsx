import Bowser from "bowser";
import { PROGRAMMING_LANGUAGE_COLORS, PROJECTS as PROJECTS_JSON, loadCV, loadContact, loadAboutMe, loadProjects } from "../../data/Data";
import { NavLink } from "react-router";
import Snake from "./snake/Snake";
import { compileRelativePath, getRouteFromPath } from "./RouteManager";

function closeConsole() {
    document.querySelector(".consoleButton.hidden")?.classList.remove("hidden");
}

export type Command = {
    shortName: string;
    name: string;
    description: string;
    arguments: Argument[];
    callback: (args: { [key: string]: ArgumentValue }, currentState: CurrentState) => (CommandOutput | Promise<CommandOutput>);
    completions?: (input: CompletionInput, currentState: CurrentState) => Completion[];
}

export type ThemeColor = "light" | "dark";

export type Completion = {
    displayElement: (string | React.ReactElement);
    replacement: string;
}

export type CompletionInput = {
    start: number;
    end: number;
    length: number;
    value: string;
}

export type CurrentState = {
    currentDir: string;
    currentUser: string;
    navigateTo: (path: string) => void;
    setCurrentTypedText: (text: string) => void;
}

export type Status = "error" | "success" | "pending";

export type CommandOutput = {
    outValue: string | React.ReactElement;
    status: Status;
    currentDir?: string;
    currentUser?: string;
    clearCommands?: true;
}

export type ArgumentValue = {
    argument?: Argument;
    value: InputTypeValue;
}

export type Argument = {
    name: string;
    alias?: string;
    inputType: InputType;
    defaultIndex: number;
}

export type InputType = "number" | "string" | "flag" | string[];
export type InputTypeValue = number | string | boolean;


function completionsFromStringList(list: string[], searchValue: string): Completion[] {
    return list.map(e => {
        if (e.includes(searchValue)) {
            const startIndexFound = e.indexOf(searchValue);
            const length = searchValue.length;
            return {
                displayElement: (
                    <div className="highlightWrapper">
                        <span className="before">{e.substring(0, startIndexFound)}</span>
                        <span className="found">{e.substring(startIndexFound, startIndexFound + length)}</span>
                        <span className="after">{e.substring(startIndexFound + length, e.length)}</span>
                    </div>
                ),
                replacement: e
            } as Completion;
        }
    }).filter(e => !!e);
}


export const LS: Command = {
    shortName: "ls",
    name: "ls",
    description: "Lists all Paths in the current directory",
    arguments: [],
    // @ts-ignore
    async callback(args, status) {
        const currentDir = status.currentDir;

        if (currentDir.includes("projects")) {
            await loadProjects();
        }

        const currentRoute = getRouteFromPath(currentDir);


        return {
            outValue: typeof currentRoute != "string" ? (currentRoute.children.length > 0 ? (
                <>
                    <table className="ls-table console-table">
                        <thead>
                            <tr>
                                <td>Name</td>
                                <td></td>
                                <td>Description</td>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                currentRoute.children.sort((a, b) => {
                                    if (a.name == "/") return 1;
                                    if (b.name == "/") return -1;
                                    return b.priority - a.priority;
                                }).map(route => {
                                    return <tr key={route.name}>
                                        <td className="name" data-key-to-display-when-screen-too-small="Name">/{route.name}</td>
                                        <td className="seperator" data-key-to-display-when-screen-too-small=""></td>
                                        <td className="desc" data-key-to-display-when-screen-too-small="Description">{route.desc}</td>
                                    </tr>
                                })
                            }
                        </tbody>
                    </table>
                </>
            ) : "") : "",
            status: "success",
            currentDir: typeof currentRoute == "string" ? currentRoute : undefined
        };
    },
};
export const CD: Command = {
    shortName: "cd",
    name: "cd",
    description: "Move to the specified path",
    arguments: [
        {
            name: "path",
            alias: "-p",
            defaultIndex: 0,
            inputType: "string"
        }
    ],
    completions(currentTyped, currentState) {
        const currentRoute = getRouteFromPath(currentState.currentDir);
        if (!currentRoute) return [];
        if (typeof currentRoute == "string") return [];
        return completionsFromStringList(currentRoute.children.map(e => e.name), currentTyped.value);
    },
    callback(args, currentState) {
        let pathToNaviageTo = (args.path?.value ?? "/") as string;
        pathToNaviageTo = pathToNaviageTo.startsWith("/") ? pathToNaviageTo.substring(1, pathToNaviageTo.length) : pathToNaviageTo;
        pathToNaviageTo = pathToNaviageTo.endsWith("/") ? pathToNaviageTo.substring(0, pathToNaviageTo.length - 1) : pathToNaviageTo;
        let currentDirSplit = currentState.currentDir.endsWith("/") ? currentState.currentDir.substring(0, currentState.currentDir.length - 1) : currentState.currentDir;
        let navigateToSplit = pathToNaviageTo.split("/").filter(e => !!e);
        let couldntFindPath = false;
        let currentPath = "";
        for (const path of navigateToSplit) {
            if (path == "..") {
                currentDirSplit = currentDirSplit.substring(0, (currentDirSplit.endsWith("/") ? currentDirSplit.substring(0, currentDirSplit.length - 1) : currentDirSplit).lastIndexOf("/"));
            } else {
                currentDirSplit = currentDirSplit + (currentDirSplit.endsWith("/") ? "" : "/") + path;
            }
            currentPath = path;
            const changedPath = getRouteFromPath(currentDirSplit.length == 0 ? "/" : currentDirSplit);
            if (!changedPath || typeof changedPath == "string") {
                couldntFindPath = true;
                break;
            }
        }

        return {
            outValue: couldntFindPath ? <>
                cd: {currentPath}: No such directory
            </> : "",
            status: "success",
            currentDir: couldntFindPath ? undefined : (currentDirSplit.length == 0 ? "/" : currentDirSplit)
        };
    },
};
export const OPEN: Command = {
    shortName: "open",
    name: "open",
    description: "Opens the current or specified path in the browser",
    arguments: [
        {
            name: "path",
            inputType: "string",
            alias: "-p",
            defaultIndex: 0
        }
    ],
    completions(input, currentState) {
        const currentPathInput = input.value;
        const endOfPath = currentPathInput.substring(currentPathInput.lastIndexOf("/"), currentPathInput.length);
        if (currentPathInput.startsWith("http")) return [];
        const path = compileRelativePath(currentState.currentDir, currentPathInput.substring(0, currentPathInput.length - endOfPath.length));
        const route = getRouteFromPath(path);
        if (!route || typeof route == "string") return [];

        return completionsFromStringList(route.children.map(e => e.name), endOfPath);
    },
    callback(args, currentState) {
        const pathToOpen = args.path?.value as string;
        let pathToOpenResult = pathToOpen;
        if (!pathToOpen) {
            currentState.navigateTo(currentState.currentDir);
            return {
                outValue: "Successfully opened external link!",
                status: "success"
            };
        } else {
            if (!pathToOpen.startsWith("http")) {
                const path = compileRelativePath(currentState.currentDir, pathToOpen);
                const route = getRouteFromPath(path);
                if (!route || typeof route == "string") {
                    return {
                        outValue: <span>The path '<span className="notFoundName">{pathToOpen}</span>' could not be found.</span>,
                        status: "error"
                    }
                }
                pathToOpenResult = path;
            }
            currentState.navigateTo(pathToOpenResult);
        }
        closeConsole();
        return {
            outValue: `Successfully Opened '${pathToOpen}'`,
            status: "success",
            currentDir: pathToOpenResult
        }
    },
};

export const THEME: Command = {
    shortName: "theme",
    name: "theme",
    description: "Changes the theme to dark or light mode",
    arguments: [
        {
            name: "theme",
            alias: "-t",
            inputType: ["dark", "light", "toggle"],
            defaultIndex: 0
        }
    ],
    callback(args) {
        const theme = args.theme?.value ?? "toggle";

        let currentTheme: ThemeColor = document.body.classList.contains("light") ? "light" : "dark";
        let initialTheme = currentTheme;

        switch (theme) {
            case "toggle":
                currentTheme = currentTheme == "dark" ? "light" : "dark";
                break;
            case "light":
                currentTheme = "light";
                break;
            case "dark":
                currentTheme = "dark";
                break;
            default:
                return {
                    outValue: <span>The theme '<span className="notFoundName">{theme}</span>' was not found.</span>,
                    status: "error"
                }
        }

        switch (currentTheme) {
            case "light":
                document.body.classList.add("light");
                break;
            case "dark":
                document.body.classList.remove("light");
                break;
        }

        if (initialTheme == theme) {
            return {
                outValue: <span>Nothing changed</span>,
                status: "success"
            };
        }

        return {
            outValue: <span>Successfully Changed the theme to '<span className="theme-set-successfully">{currentTheme}</span>'</span>,
            status: "success"
        }
    },
    completions(input) {
        const completionInput = input.value;
        const possibleThemes = ["dark", "light", "toggle"];
        return completionsFromStringList(possibleThemes, completionInput);
    },
};

export const CLEAR: Command = {
    shortName: "clear",
    name: "clear",
    arguments: [],
    description: "Clears the Screen",
    callback() {
        return {
            outValue: "",
            status: "success",
            clearCommands: true
        }
    },
};

export const HELP: Command = {
    shortName: "?",
    name: "help",
    description: "Shows this help dialog",
    arguments: [],
    callback() {
        return {
            outValue: (
                <>
                    <table className="help-table console-table">
                        <thead>
                            <tr>
                                <td>Command</td>
                                <td>Description</td>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                COMMANDS.map(command => {
                                    return <tr key={command.name}>
                                        <td className="name" data-key-to-display-when-screen-too-small="Name">{command.name} {command.arguments.map(arg => {
                                            return `${arg.alias ?? ""} <${arg.name}> `;
                                        }).join("")}</td>
                                        <td className="desc" data-key-to-display-when-screen-too-small="Description">{command.description}</td>
                                    </tr>
                                })
                            }
                        </tbody>
                    </table>
                </>
            ),
            status: "success"
        }
    },
};

export const PROJECTS: Command = {
    shortName: "projects",
    name: "projects",
    description: "Shows a list of projects that I made",
    arguments: [],
    // @ts-ignore
    callback: async (args, state) => {
        const projects = await loadProjects();
        return {
            outValue: (
                <div className="projects">
                    <table className="projects-table console-table">
                        <thead>
                            <tr>
                                <td>Name</td>
                                <td>Id</td>
                                <td>Technologies</td>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                projects.map((project) => {
                                    return (
                                        <tr key={project.id}>
                                            <td data-key-to-display-when-screen-too-small="Title">{project.title}</td>
                                            <td data-key-to-display-when-screen-too-small="Id">{project.id}</td>
                                            <td data-key-to-display-when-screen-too-small="Technologies">{project.technologies.join(", ")}</td>
                                        </tr>
                                    );
                                })
                            }
                        </tbody>
                    </table>
                    <span className="whatToDoNext">Type '<span className="command" onClick={() => state.setCurrentTypedText("project")}>project &lt;projectId&gt;</span>' to see the specifics of the project.</span>
                </div>
            ),
            status: "success"
        };
    },
};

export const PROJECT: Command = {
    shortName: "project",
    name: "project",
    description: "Show details of a project",
    arguments: [
        {
            name: "project",
            alias: "-p",
            inputType: "string",
            defaultIndex: 0
        }
    ],
    callback: async (args) => {
        if (!args.project) {
            return {
                outValue: "No <projectId> was specified.",
                status: "error"
            };
        }

        const projects = await loadProjects();

        const project = projects.find(pr => pr.id == args.project.value);
        if (!project) {
            return {
                outValue: `Project with id '${args.project}' not found.`,
                status: "error"
            };
        }
        return {
            outValue: (
                <div className="project">
                    <h2 className="title">{project.title}</h2>
                    <table>
                        <tbody>
                            <tr key={"date"}>
                                <td>Date: </td>
                                <td>{project.date}</td>
                            </tr>
                            {
                                project.liveLink && <tr key={"liveLink"}>
                                    <td>Live Link: </td>
                                    <td>{project.liveLink}</td>
                                </tr>
                            }
                            {
                                project.sourceCodeLink && <tr key={"sourceCodeLink"}>
                                    <td>Source Code: </td>
                                    <td>{project.sourceCodeLink}</td>
                                </tr>
                            }
                            <tr key={"technologies"}>
                                <td>Technologies: </td>
                                <td>{project.technologies.map((tech, index) => <span key={tech} ><span style={{ color: PROGRAMMING_LANGUAGE_COLORS[tech.toLowerCase()] }}>{tech}</span>{index < project.technologies.length ? ", " : ""}</span>)}</td>
                            </tr>
                            {
                                project.shortDescription && <tr key={"shortDescription"}>
                                    <td>Short Description: </td>
                                    <td>{project.shortDescription}</td>
                                </tr>
                            }
                            <tr key={"features"}>
                                <td>Features: </td>
                                <td>
                                    <ul>
                                        {
                                            project.features.map((feature, index) => <li key={feature + index}>{feature}</li>)
                                        }
                                    </ul>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            ),
            status: "success"
        };
    },
    completions(input) {
        const inputValue = input.value;

        return completionsFromStringList(PROJECTS_JSON.map(e => e.id), inputValue);
    },
};

export const ABOUT: Command = {
    shortName: "about",
    name: "about",
    description: "Information about me",
    arguments: [],
    // @ts-ignore
    callback: async (args, state) => {
        const aboutMe = await loadAboutMe();
        return {
            outValue: (
                <div className="aboutMe">
                    <table className="aboutMe-table console-table">
                        <tbody>
                            <tr>
                                <td>Name:</td>
                                <td>{aboutMe.name}</td>
                            </tr>
                            <tr>
                                <td>Role:</td>
                                <td>{aboutMe.role}</td>
                            </tr>
                            <tr>
                                <td>Location:</td>
                                <td>{aboutMe.location}</td>
                            </tr>
                            <tr>
                                <td>Currently Working on:</td>
                                <td>{aboutMe.currentlyWorkingOn}</td>
                            </tr>
                        </tbody>
                    </table>
                    <span className="whatToDoNext">Type '<span className="command" onClick={() => state.setCurrentTypedText("projects")}>projects</span>' to see what I'm working on.</span>
                </div>
            ),
            status: "success"
        }
    },
};

export const CONTACT: Command = {
    shortName: "contact",
    name: "contact",
    description: "Shows my contact information",
    arguments: [],
    callback: async () => {
        const contact = await loadContact();
        return {
            outValue: <>
                <table className="contact-table console-table">
                    <tbody>
                        <tr>
                            <td>Name</td>
                            <td>{contact.name}</td>
                        </tr>
                        <tr>
                            <td>E-Mail</td>
                            <td>{contact.email}</td>
                        </tr>
                        <tr>
                            <td>Phone</td>
                            <td>{`${contact.phone.prefix} ${contact.phone.optionalZero ? "(0)" : ""}${contact.phone.number}`}</td>
                        </tr>
                        <tr>
                            <td>Github</td>
                            <td>{contact.github}</td>
                        </tr>
                    </tbody>
                </table>
            </>,
            status: "success"
        };
    },
};


export const TIME: Command = {
    shortName: "time",
    name: "time",
    description: "Shows the current time",
    arguments: [],
    callback() {
        return {
            outValue: new Date().toLocaleTimeString(),
            status: "success"
        };
    }
};

export const UPTIME: Command = {
    shortName: "uptime",
    name: "uptime",
    description: "Shows the time you`ve spent on this website",
    arguments: [],
    callback() {
        const now = new Date().getTime();
        const timeSpent = now - performance.timeOrigin;
        const seconds = Math.round(timeSpent / 1000 % 60);
        const minutes = Math.round(timeSpent / 1000 / 60 % 60);
        const hours = Math.round(timeSpent / 1000 / 60 / 60 % 24);
        const days = Math.round(timeSpent / 1000 / 60 / 60);
        return {
            outValue: `${days != 0 ? days + "d " : ""}${hours != 0 ? hours + "h " : ""}${minutes != 0 ? minutes + "m " : ""}${seconds + "s"}`,
            status: "success"
        }
    }
}

export const VERSION: Command = {
    shortName: "version",
    name: "version",
    arguments: [],
    description: "Shows the current console version",
    callback() {
        return {
            outValue: "v2.1",
            status: "success"
        }
    },
};

export const SYSINFO: Command = {
    shortName: "sysinfo",
    name: "sysinfo",
    arguments: [],
    description: "Shows the current system information",
    callback() {
        const browserData = Bowser.parse(navigator.userAgent);
        const DATA = [
            {
                key: "Browser Name",
                value: browserData.browser.name
            },
            {
                key: "Browser Version",
                value: browserData.browser.version
            },
            {
                key: "OS Name",
                value: browserData.os.name
            },
            {
                key: "OS Version",
                value: browserData.os.version ?? browserData.os.versionName
            },
            {
                key: "Platform Type",
                value: browserData.platform.type
            },
            {
                key: "Platform Model",
                value: browserData.platform.model
            },
            {
                key: "Platform Vendor",
                value: browserData.platform.vendor
            }
        ].filter(e => !!e.value);
        return {
            outValue: <>
                <table className="sysinfo-table console-table">
                    <tbody>
                        {
                            DATA.map(data => {
                                return <tr key={data.key}>
                                    <td>{data.key}</td>
                                    <td>{data.value}</td>
                                </tr>
                            })
                        }
                    </tbody>
                </table>
            </>,
            status: "success"
        };
    },
};

export const FORTUNE: Command = {
    shortName: "fortune",
    name: "fortune",
    arguments: [],
    description: "Prints out a random fortune message",
    async callback() {
        const fortuneData = await (await fetch("https://aphorismcookie.herokuapp.com")).json();
        if (!fortuneData || !fortuneData.data || !fortuneData.data.message || !fortuneData.meta || !fortuneData.meta.status || fortuneData.meta.status != 200) {
            return {
                outValue: "An Error happend contacting the fortune service",
                status: "error"
            }
        }
        return {
            outValue: fortuneData.data.message,
            status: "success"
        }
    },
}

export const ECHO: Command = {
    shortName: "echo",
    name: "echo",
    arguments: [
        {
            name: "text",
            defaultIndex: 0,
            inputType: "string"
        }
    ],
    description: "Prints out <text>.",
    callback(args) {
        const text = (args.text?.value as string) ?? "";
        return {
            outValue: text,
            status: "success"
        };
    },
};

export const DOWNLOAD: Command = {
    shortName: "download",
    name: "download",
    description: "Downloads <fileName>.",
    arguments: [
        {
            name: "file",
            defaultIndex: 0,
            inputType: "string"
        },
        {
            name: "list",
            alias: "--l",
            inputType: "flag",
            defaultIndex: 1
        }
    ],
    callback: async (args, currentState) => {
        if (currentState.currentDir.endsWith("cv") || currentState.currentDir.endsWith("cv/") || currentState.currentDir.endsWith("curriculumVitae")) {

            const cv = await loadCV();

            if (args.list?.value) {
                return {
                    outValue: (
                        <table className="downloadTable">
                            <thead>
                                <tr>
                                    <td className="id">Download Id</td>
                                    <td className="downloadName">Download Name</td>
                                    <td className="entryTitle">CV Entry Title</td>
                                </tr>
                            </thead>
                            <tbody>
                                <tr key="cvDownload">
                                    <td>cv</td>
                                    <td>CV</td>
                                    <td>CV</td>
                                </tr>
                                {
                                    cv.entrys.map(e => {
                                        return e.downloadItems && <>
                                            {
                                                e.downloadItems.map(download => {
                                                    return <tr key={download.name}>
                                                        <td>{`${download.name.replaceAll(" ", "-")}_${e.title.replaceAll(" ", "-")}`}</td>
                                                        <td>{download.name}</td>
                                                        <td>{e.title}</td>
                                                    </tr>
                                                })
                                            }
                                        </>
                                    })
                                }
                            </tbody>
                        </table>
                    ),
                    status: "success"
                }
            }

            if (args.file) {

                const finds = cv.entrys.map(e => {
                    return e.downloadItems && e.downloadItems.find(download => {
                        return `${download.name.replaceAll(" ", "-")}_${e.title.replaceAll(" ", "-")}`.toLowerCase() == (args.file.value as string).toLowerCase();
                    });
                }).filter(e => !!e);

                if (!finds || finds[0] == undefined || finds[0] == null) {
                    return {
                        outValue: `No download with Id '${args.file.value ?? ""}' found!`,
                        status: "error"
                    }
                } else if (finds.length > 1) {
                    return {
                        outValue: `Multiple downloads with the same name (add a index at the end (0-${finds.length - 1}))!`,
                        status: "error"
                    }
                }

                const found = finds[0];


                const a = document.createElement("a");
                a.href = found.downloadLink;
                a.download = found.name + (found.extension ?? "");
                a.click();

                return {
                    outValue: <span>Starting download.</span>,
                    status: "success"
                }
            } else {
                return {
                    outValue: `file argument is needed`,
                    status: "error"
                }
            }
        } else {
            return {
                outValue: <span>Nothing to download here</span>,
                status: "error"
            }
        }
    },
};

export const SOCIALS: Command = {
    shortName: "socials",
    name: "socials",
    arguments: [],
    description: "Shows my social media link",
    callback: async () => {
        const contact = await loadContact();
        return {
            outValue: <>
                <table className="console-table">
                    <tbody>
                        <tr>
                            <td>Github</td>
                            <td><NavLink to={contact.github} target="_blank" className="consoleLink">{contact.github}</NavLink></td>
                        </tr>
                        <tr>
                            <td>LinkedIn</td>
                            <td><NavLink to={contact.linkedIn} target="_blank" className="consoleLink">{contact.linkedIn}</NavLink></td>
                        </tr>
                        <tr>
                            <td>Email</td>
                            <td><NavLink to={"mailTo:" + contact.email} className="consoleLink">{contact.email}</NavLink></td>
                        </tr>
                    </tbody>
                </table>
            </>,
            status: "success"
        }
    },
};

export const LANGUAGE: Command = {
    shortName: "lang",
    name: "language",
    arguments: [
        {
            name: "language",
            alias: "-l",
            inputType: ["en", "de"],
            defaultIndex: 0
        }
    ],
    description: "Changes the language of the website",
    callback: async (args) => {
        const language = args.language?.value ?? "en";

        return {
            outValue: <span>
                Language is not supported!
                If you want you can help me translate the website into {language}
                by translating the en.json file into {language} and creating a
                pull request on github or contacting me via email.
            </span>,
            status: "success"
        }
    }
};

export const SNAKE: Command = {
    shortName: "snake",
    name: "snake",
    arguments: [],
    description: "Lets you play snake",
    callback() {
        return {
            outValue: <Snake />,
            status: "success"
        };
    },
};

export const COMMANDS: Command[] = [
    LS,
    CD,
    CLEAR,
    HELP,
    OPEN,
    VERSION,
    SYSINFO,
    ECHO,

    THEME,
    FORTUNE,
    // SNAKE,

    TIME,
    UPTIME,

    ABOUT,
    PROJECTS,
    PROJECT,
    CONTACT,
    DOWNLOAD,
    SOCIALS
];
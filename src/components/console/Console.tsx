import type React from "react";
import "./Console.scss";
import "./CommandOutputs.scss";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { COMMANDS, type ArgumentValue, type Command, type CommandOutput, type Completion, type CompletionInput, type CurrentState, type Status } from "./Commands";
import { ROOT_ROUTE, type RouteDef } from "./RouteManager";
import { loadProjects } from "../../data/Data";
import { useAchievements } from "../achievements/AchievementContext";


type HistoryCommand = {
    command: string;
    dir: string;
    user: string;
    output: string | React.ReactElement;
    status: Status;
}

type PastCommand = {
    command: string;
    last?: true;
};

type SizeState = "default-size" | "maximal-size";

function beep() {
    var context = new AudioContext();
    var oscillator = context.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.value = 400;
    oscillator.connect(context.destination);
    oscillator.start();
    setTimeout(function () {
        oscillator.stop();
    }, 30);
}

function closeConsole() {
    document.querySelector(".consoleButton.hidden")?.classList.remove("hidden");
}

let lastPath = "";

export function Console() {

    const navigateTo = useNavigate();
    const reactLocation = useLocation();
    const achievements = useAchievements();

    const consoleContent = useRef<HTMLDivElement>(null);

    const [sizeState, setSizeState] = useState<SizeState>("default-size");

    const [currentTypedCommand, setCurrentTypedCommand] = useState("");
    const [currentCursorIndex, setCurrentCursorIndex] = useState(0);
    const [currentDir, setCurrentDir] = useState("/");
    const [currentUser, setCurrentUser] = useState("visitor");
    const [currentHistoryScrollUpIndex, setCurrentHistoryScrollUpIndex] = useState(-1);
    const [completions, setCurrentCompletions] = useState<Completion[]>();
    const [COMMAND_HISTORY, setCommandHistory] = useState<PastCommand[]>([])
    const [COMMANDS_EXECUTED, setCommandsExecuted] = useState<HistoryCommand[]>([]);

    useEffect(() => {
        (async () => {
            const dir = await getCurrentPathAsDir(reactLocation.pathname);
            if (lastPath != reactLocation.pathname) {
                lastPath = dir;
                setCurrentDir(dir);
            }
        })();
    }, [reactLocation.pathname]);

    const CURRENT_STATE: CurrentState = {
        currentDir: currentDir,
        currentUser: currentUser,
        navigateTo: navigateTo,
        setCurrentTypedText: (text: string) => {
            setCurrentTypedCommand(text);
            setCurrentCursorIndex(text.length);
        }
    };

    function isAtEnd() {
        return currentTypedCommand.length <= currentCursorIndex;
    }

    function isAtBegin() {
        return 0 == currentCursorIndex;
    }

    function getCurrentTypingCommand(): Command | undefined {
        const names = currentTypedCommand.split(" ");
        if (names.length == 0) return;
        const name = names[0];

        const foundCommand = COMMANDS.find(command => command.name == name || command.shortName == name);
        return foundCommand;
    }

    function getCurrentTypingArgument(): CompletionInput & {
        currentCommand: Command;
    } | undefined {
        const currentTypingCommand = getCurrentTypingCommand();
        if (!currentTypingCommand) return;

        const args = currentTypedCommand.split(" ");
        if (args.length == 0 || args.length == 1) return;
        const commandName = args.shift();
        let currentIndex = (commandName?.length ?? 0) + 1;
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            const length = arg.length + (i <= args.length - 1 ? 0 : 1);

            if (currentCursorIndex >= currentIndex && currentCursorIndex <= currentIndex + length) return {
                value: arg,
                start: currentIndex,
                end: currentIndex + length,
                length: length,
                currentCommand: currentTypingCommand
            };

            currentIndex += length;
        }

    }

    async function compileCommand(command: string) {
        if (command.length == 0) return;
        if (command.trim().length == 0) return;
        const historyCommands = COMMAND_HISTORY.filter(e => !e.last);
        if (historyCommands.length == 0 || historyCommands[0].command != command) {
            COMMAND_HISTORY.unshift({
                command: command
            });
            setCommandHistory(COMMAND_HISTORY);
        }
        setCurrentTypedCommand("");
        setCurrentHistoryScrollUpIndex(-1);
        setCurrentCursorIndex(0);

        const COMMAND: HistoryCommand = {
            command: command,
            dir: currentDir,
            user: currentUser,
            output: "",
            status: "pending"
        };
        COMMANDS_EXECUTED.push(COMMAND);
        setCommandsExecuted(COMMANDS_EXECUTED);

        const result = await runCommandLookup(command);
        if (result.currentDir) {
            setCurrentDir(result.currentDir);
        }
        if (result.currentUser) {
            setCurrentUser(result.currentUser);
        }
        if (result.clearCommands) {
            setCommandsExecuted([]);
            return;
        }

        if (result.status == "success") {
            achievements.achievementFinished().usedConsole();
        }

        COMMAND.output = result.outValue;
        COMMAND.status = result.status;
        setCommandsExecuted(COMMANDS_EXECUTED.map(c =>
            c === COMMAND
                ?
                { ...c, output: result.outValue, status: result.status }
                :
                c));
    }
    useEffect(() => {
        const evenHandler = (e: Event) => {
            if (!document.querySelector(".consoleButton.hidden")?.classList.contains("hidden")) return;
            if ((e as KeyboardEvent).ctrlKey || (e as KeyboardEvent).altKey) return;
            const key = (e as KeyboardEvent).key;
            if (key == "Enter") {
                setCommandHistory(COMMAND_HISTORY.filter(e => !e.last));
                compileCommand(currentTypedCommand);
                setCurrentCompletions([]);
                setCurrentHistoryScrollUpIndex(-1);
            } else if (key == "Escape") {
                closeConsole();
            } else if (key == "Backspace") {
                setCurrentTypedCommand(currentTypedCommand.substring(0, currentCursorIndex - 1) + currentTypedCommand.substring(currentCursorIndex, currentTypedCommand.length));
                setCurrentCursorIndex(clampCap(currentCursorIndex - 1, 0, currentTypedCommand.length));
                setCurrentCompletions([]);
                setCurrentHistoryScrollUpIndex(-1);
            } else if (key == "Delete") {
                setCurrentTypedCommand(currentTypedCommand.substring(0, currentCursorIndex) + currentTypedCommand.substring(currentCursorIndex + 1, currentTypedCommand.length));
                setCurrentCursorIndex(clampCap(currentCursorIndex - 1, 0, currentTypedCommand.length));
                setCurrentCompletions([]);
                setCurrentHistoryScrollUpIndex(-1);
            } else if (key == "ArrowLeft") {
                if (isAtBegin()) {
                    beep();
                    return;
                }
                setCurrentCursorIndex(clampCap(currentCursorIndex - 1, 0, currentTypedCommand.length));
            } else if (key == "ArrowRight") {
                if (isAtEnd()) {
                    beep();
                    return;
                }
                setCurrentCursorIndex(clampCap(currentCursorIndex + 1, 0, currentTypedCommand.length));
            } else if (key == "ArrowUp") {

                if (currentHistoryScrollUpIndex + 1 > COMMAND_HISTORY.length - 1) return;
                if (currentHistoryScrollUpIndex == -1) {
                    if (COMMAND_HISTORY.length > 0) COMMAND_HISTORY.unshift({
                        command: currentTypedCommand,
                        last: true
                    });
                }

                setCurrentHistoryScrollUpIndex(clampCap(currentHistoryScrollUpIndex + 1, -1, COMMAND_HISTORY.length - 1));
                const command = COMMAND_HISTORY.filter(e => !e.last).at(clampCap(currentHistoryScrollUpIndex + 1, 0, COMMAND_HISTORY.length - 1));
                if (command) {
                    console.log(command);
                    setCurrentTypedCommand(command.command);
                    setCurrentCursorIndex(command.command.length);
                }
            } else if (key == "ArrowDown") {
                if (currentHistoryScrollUpIndex - 1 < -1) return;
                if (currentHistoryScrollUpIndex - 1 == -1 && COMMAND_HISTORY.length == 0) return;
                let currentCommand = undefined;
                if (currentHistoryScrollUpIndex - 1 == -1) {
                    const lastCommand = COMMAND_HISTORY.find(e => !!e.last);
                    if (lastCommand) {
                        setCommandHistory(COMMAND_HISTORY.filter(e => e != lastCommand));
                        setCurrentTypedCommand(lastCommand.command);
                    }
                } else {
                    currentCommand = COMMAND_HISTORY.filter(e => !e.last).at(clampCap(currentHistoryScrollUpIndex - 1, 0, COMMAND_HISTORY.length - 1));
                }

                setCurrentHistoryScrollUpIndex(clampCap(currentHistoryScrollUpIndex - 1, -1, COMMAND_HISTORY.length - 1));
                if (currentCommand) {
                    console.log(currentCommand);
                    setCurrentTypedCommand(currentCommand.command);
                    setCurrentCursorIndex(currentCommand.command.length);
                }
            } else if (key == "Tab") {
                const currentTypingArgument = getCurrentTypingArgument();
                if (!currentTypingArgument) return;
                const completions = currentTypingArgument.currentCommand.completions?.(currentTypingArgument, CURRENT_STATE);
                console.log(completions);
                if (!completions) return;
                if (completions.length == 0) return;
                if (completions.length == 1) {
                    let resultStartInclusiveCompletion = currentTypedCommand.substring(0, currentTypingArgument.start) + completions[0].replacement;
                    let resultTyped = resultStartInclusiveCompletion + currentTypedCommand.substring(currentTypingArgument.end, currentTypedCommand.length);
                    setCurrentTypedCommand(resultTyped);
                    setCurrentCursorIndex(resultStartInclusiveCompletion.length);
                    setCurrentCompletions([]);
                    return;
                }
                setCurrentCompletions(completions);
            } else if (key.length == 1) {
                setCommandHistory(COMMAND_HISTORY.filter(e => !e.last));
                setCurrentCompletions([]);
                setCurrentHistoryScrollUpIndex(-1);
                setCurrentTypedCommand(currentTypedCommand.substring(0, currentCursorIndex) + key + currentTypedCommand.substring(currentCursorIndex, currentTypedCommand.length));
                setCurrentCursorIndex(clampCap(currentCursorIndex + 1, 0, currentTypedCommand.length + 1));
            }
            e.preventDefault();
            e.stopImmediatePropagation();
        };

        const onClickForPaste = async (e: Event) => {
            if (!document.querySelector(".consoleButton.hidden")?.classList.contains("hidden")) return;
            if (!consoleContent.current) return;
            if (!consoleContent.current.contains(e.target as Node)) return;
            if ((e as MouseEvent).button != 2) return;
            e.preventDefault();
            e.stopImmediatePropagation();

            const clipboardContent = await navigator.clipboard.readText();
            if (!clipboardContent) return;

            setCurrentTypedCommand(currentTypedCommand.substring(0, currentCursorIndex) + clipboardContent + currentTypedCommand.substring(currentCursorIndex, currentTypedCommand.length));
        };

        document.addEventListener("keydown", evenHandler);
        document.addEventListener("contextmenu", onClickForPaste);

        const goToBottom = () => {
            if (consoleContent.current) consoleContent.current.scrollTo({
                behavior: "smooth",
                top: consoleContent.current.scrollHeight
            });
        };

        setTimeout(goToBottom, 50);
        goToBottom();

        return () => {
            document.removeEventListener("keydown", evenHandler);
            document.removeEventListener("contextmenu", onClickForPaste);
        };
    }, [currentTypedCommand, currentCursorIndex]);




    return (
        <div className="consoleBackgroundWrapper doNotAnimate">
            <div className="console" data-size-state={sizeState}>
                <div className="topBar">
                    <div className="controls">
                        <div className="closeBtn" onClick={() => closeConsole()}></div>
                        <div className="minimizeBtn" onClick={() => setSizeState("default-size")}></div>
                        <div className="maximizeBtn" onClick={() => setSizeState("maximal-size")}></div>
                    </div>
                    <span className="title">Console</span>
                </div>
                <div className="content" ref={consoleContent}>
                    <input type="text" className="keyboardOpener" />
                    {
                        [...COMMANDS_EXECUTED, {
                            command: currentTypedCommand,
                            dir: currentDir,
                            user: currentUser,
                            last: true
                        }].map((command, index) => {
                            return <div key={command.command + index} className="commandWrapper">
                                <div className={(command as any).last ? "currentLine" : "pastLine"}>
                                    <div className="currentDirWrapper">
                                        <span className='user'>{command.user}@{location.hostname}</span>
                                        <span className='colun'>:</span>
                                        <span className="currentDir">{command.dir}</span>
                                        <span className='dollar'>$</span>
                                    </div>
                                    {
                                        (command as any).last && (
                                            <>
                                                <span className="before">{command.command.substring(0, currentCursorIndex).replaceAll(" ", "\u00A0")}</span>
                                                <span className="currentCursorPos"
                                                    aria-autocomplete="none"
                                                    inputMode="text"
                                                    role="presentation"
                                                    data-lpignore="true"
                                                    data-form-type="other"
                                                    data-currentselected={command.command.charAt(currentCursorIndex)}>{command.command.charAt(currentCursorIndex) != " " ? (command.command.charAt(currentCursorIndex) ?? "\u00A0") : "\u00A0"}</span>
                                                <span className="after">{command.command.substring(currentCursorIndex + 1, command.command.length).replaceAll(" ", "\u00A0")}</span>
                                            </>
                                        )
                                    }
                                    {
                                        !(command as any).last && (
                                            <>
                                                <span className="historyCommand">{command.command}</span>
                                            </>
                                        )
                                    }
                                </div>
                                {
                                    ((command as HistoryCommand).output || (command as HistoryCommand).status == "pending") && (
                                        <div className="outputLine" data-status={(command as HistoryCommand).status}>
                                            {(command as HistoryCommand).output ?? ""}
                                        </div>
                                    )
                                }
                            </div>;
                        })
                    }
                    {
                        completions && (
                            <div key={"completions"} className="completions">
                                <ul>
                                    {
                                        completions.map((completion) => {
                                            return <li key={completion.replacement}>{completion.displayElement}</li>
                                        })
                                    }
                                </ul>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    );

    function commandDoesntExist(command: string): React.ReactElement {
        const name = command.split(" ");
        if (name.length == 0) return <span>Command '<span className="notFoundName">{command}</span>' not found.</span>;

        const numSimilarOnes = COMMANDS.filter(c => c.name.includes(name[0]) || c.shortName.includes(name[0]));

        if (numSimilarOnes.length == 0) return <span>Command '<span className="notFoundName">{command}</span>' not found.</span>;

        if (numSimilarOnes.length <= 5) {
            return <>
                <span className="notFound">Command '<span className="notFoundName">{name[0].trim()}</span>' not found, did you mean:</span>
                <ul className="suggestion-commands">
                    {
                        numSimilarOnes.map((command, index) => {
                            const args = command.arguments.map(e => {
                                return `${e.alias ? e.alias + " " : ""}<${e.name}>`;
                            })
                            if (command.shortName == command.name) {
                                return <li key={command.name + index}>{command.name} {args.join(" ")}</li>
                            }
                            return <li key={command.name + index}>{command.name} - {command.shortName}</li>
                        })
                    }
                </ul>
            </>
        } else {
            return <span className="notFound">Command '<span className="notFoundName">{name[0].trim()}</span>' not found, but there are {numSimilarOnes.length} similar ones.</span>;
        }
    }

    async function runCommandLookup(command: string): Promise<CommandOutput> {
        if (!/^(.*?)( (("[^"]*?")|(.*?))){0,}$/g.test(command)) {
            return {
                outValue: commandDoesntExist(command),
                status: "error"
            };
        }
        const regex = /\s*(?:(["'`])(.*?)\1|([^"'`\s]+))\s*/gm;
        const args = command.matchAll(regex);
        if (!args) {
            return {
                outValue: commandDoesntExist(command),
                status: "error"
            };
        }

        const replaceBrackets = (arg: string) => {
            if (arg.length == 0) return arg;
            if (arg.match(/^("|'|`)/g)) arg = arg.substring(1, arg.length);
            if (arg.match(/("|'|`)$/g)) arg = arg.substring(0, arg.length - 1);
            return arg;
        };

        const argsSplit = [];

        for (const arg of args) {
            const argVal = arg[0].trim();
            argsSplit.push(argVal);
        }

        const commandParsed = argsSplit.shift();
        const commandData = COMMANDS.find(c => c.shortName == commandParsed || c.name == commandParsed);

        if (!commandData) {
            return {
                outValue: commandDoesntExist(command),
                status: "error"
            };
        }

        const keysPossible = [...commandData.arguments.filter(arg => !!arg.alias).map(arg => arg.alias), ...commandData.arguments.map(arg => arg.name)];

        const parsedArgs: {
            [key: string]: ArgumentValue;
        } = {};
        const indexesUsed = [];

        for (let i = 0; i < argsSplit.length; i++) {
            const arg = argsSplit[i];
            if (keysPossible.includes(arg)) {
                const argumentFound = commandData.arguments.find(c => c.alias == arg || c.name == arg);
                if (argumentFound) {
                    if (argumentFound.inputType == "flag") {
                        parsedArgs[argumentFound?.name.replace("-", "")] = {
                            argument: argumentFound,
                            value: true
                        };
                    } else {
                        parsedArgs[argumentFound?.name.replace("-", "")] = {
                            argument: argumentFound,
                            value: argsSplit.length > i + 1 ? replaceBrackets(argsSplit[i + 1]) : true
                        };
                    }
                } else {
                    parsedArgs[arg] = {
                        value: argsSplit.length > i + 1 ? replaceBrackets(argsSplit[i + 1]) : true
                    };
                }
                indexesUsed.push(i);
                if (argsSplit.length > i + 1 && (argumentFound?.inputType != "flag")) {
                    indexesUsed.push(i + 1);
                    i++;
                }
            }
        }

        for (let i = 0; i < argsSplit.length; i++) {
            if (indexesUsed.includes(i)) continue;
            const argumentFound = commandData.arguments.find(e => e.defaultIndex == i);
            if (argumentFound) {
                parsedArgs[argumentFound.name.replace("-", "")] = {
                    argument: argumentFound,
                    value: replaceBrackets(argsSplit[i])
                }
            } else {
                parsedArgs[i] = {
                    value: replaceBrackets(argsSplit[i])
                }
            }
        }

        const result = commandData.callback(parsedArgs, CURRENT_STATE);

        return await result;
    }


}

export function ConsoleButton() {
    return (
        <>
            <button className="consoleButton fa fa-terminal" onClick={clickedConsoleBtn}></button>
        </>
    );
}

function clickedConsoleBtn(e: React.MouseEvent<HTMLButtonElement>) {
    const btn = (e.target as HTMLButtonElement);
    if (!btn) return;

    btn.classList.add("transitionToFullScreen");
    setTimeout(() => {
        btn.classList.add("hidden");
        btn.classList.remove("transitionToFullScreen");
    }, 300);
}

function clampCap(val: number, min: number, max: number): number {
    if (val < min) return min;
    if (val > max) return max;
    return val;
}

// function clamp(val: number, min: number, max: number): number {
//     if (val < min) return max - 1;
//     if (val >= max) return min;
//     return val;
// }

async function getCurrentPathAsDir(currentPath: string) {
    let allElements: string[] = [];
    currentPath = currentPath.startsWith("/")
        ?
        (
            currentPath.endsWith("/")
                ?
                currentPath.substring(0, currentPath.length - 1)
                :
                currentPath
        )
        :
        "/" + (
            currentPath.endsWith("/")
                ?
                currentPath.substring(0, currentPath.length - 1)
                :
                currentPath
        );

    if (currentPath.includes("/projects/")) {
        await loadProjects();
    }

    for (const c of ROOT_ROUTE.children) {
        const r = getAllFrom(c, "/");
        if (Array.isArray(r)) allElements.push(...r);
        else allElements.push(r);
    }
    if (allElements.length == 0) return "/";
    allElements = allElements.map(e => {
        if (e == "/") return e;
        return e.endsWith("/") ? e.substring(0, e.length - 1) : e;
    })

    if (allElements.includes(currentPath)) {
        return currentPath;
    }
    return "/";
}

function getAllFrom(def: RouteDef, currentPath: string): string | string[] {
    if (def.children.length == 0) return currentPath + def.name;
    const all = def.children.map(e => currentPath + getAllFrom(e, def.name + "/")).flat();
    if (Array.isArray(all)) {
        return [
            ...all,
            currentPath + def.name + "/"
        ]
    }
    return [
        all,
        currentPath + def.name + "/"
    ];
}
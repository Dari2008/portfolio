// import { PROJECTS } from "../../data/Data";
import { MENU_ITEMS } from "../../app/Menu";
import { addOnLoadListener, listenerCount, PROJECTS } from "../../data/Data";

export type RouteDef = {
    name: string;
    desc: string;
    children: RouteDef[];
    priority: number;
}

export const ROOT_ROUTE: RouteDef = {
    name: "/",
    desc: "Root",
    priority: 1,
    children: [
        {
            name: "imprint",
            desc: "",
            priority: -1,
            children: []
        },
        {
            name: "privacyPolicy",
            desc: "",
            priority: -1,
            children: []
        }
    ]
};

for (const menuItem of MENU_ITEMS) {
    ROOT_ROUTE.children.unshift({
        name: menuItem.path.replace("/", ""),
        desc: menuItem.name.en,
        children: [],
        priority: menuItem.priority
    });

}

export function getRouteFromPath(pathStr: string) {
    const path = pathStr.split("/").filter(e => e.trim().length != 0);
    let currentRoute = ROOT_ROUTE;
    let pathUntilNow = "/";
    for (const routePath of path) {
        const found = currentRoute.children.find(r => r.name == routePath);
        if (!found) {
            return pathUntilNow;
        }
        currentRoute = found;
        pathUntilNow += routePath + "/";
    }
    return currentRoute;
}

export function compileRelativePath(currentDir: string, relativePath: string): string {
    let resultDir = currentDir;
    if (relativePath.startsWith("/")) return currentDir;
    const parts = relativePath.split("/").filter(e => e.length > 0);
    for (const part of parts) {
        if (part == ".") continue;
        if (part == "..") {
            resultDir = resultDir.substring(0, (resultDir.endsWith("/") ? resultDir.substring(0, resultDir.length - 1) : resultDir).lastIndexOf("/"));
        }
        resultDir += (resultDir.endsWith("/") ? "" : "/") + part;
    }
    return resultDir;
}

export function updateRouteDefs() {
    const PROJECTS_ROUTE = ROOT_ROUTE.children.find(e => e.name == "projects");
    if (PROJECTS_ROUTE) {
        if (PROJECTS_ROUTE.children.length > 0) return;
        for (const project of PROJECTS) {
            PROJECTS_ROUTE.children.push({
                name: project.id.replace("/", ""),
                desc: project.shortDescription?.en ?? "",
                children: [],
                priority: 1
            });
        }
    }
}

if (listenerCount("projects") == 0) {
    addOnLoadListener("projects", () => {
        updateRouteDefs();
    });
}
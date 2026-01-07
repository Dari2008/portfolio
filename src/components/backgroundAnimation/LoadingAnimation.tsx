import { useRef, type ReactNode } from "react";
import { LoadingAnimationContext } from "./LoadingAnimationContext";
import { firstLoaded, generateRandomPosition, isFirstLoad } from "./Utils";


let globalLoadingStates: Set<string> = new Set([]);
let onComponentLoadFunctions: ((key: string) => void)[] = [];
let onAllLoaded: (() => void)[] = [];
export default function LoadingAnimation(atts: { children: ReactNode }) {

    const loadingAnimationRef = useRef<HTMLDivElement>(null);
    const hasLoadedAll = useRef<boolean>(false);


    const addLoadingState = async (key: string) => {
        globalLoadingStates.add(key);
        hasLoadedAll.current = false;
        // haveAllLoadingStatesResolved = Object.values(globalLoadingStates).filter(e => e == "loading").length == 0 || haveAllLoadingStatesResolved;
        if (globalLoadingStates.size > 0) {
            loadingAnimationRef.current?.classList.add("loading");
        }
    };

    let currentTimeoutId = -1;

    const removeLoadingState = async (key: string) => {
        globalLoadingStates.delete(key);
        if (currentTimeoutId != -1) {
            clearTimeout(currentTimeoutId);
            currentTimeoutId = -1;
        }
        currentTimeoutId = setTimeout(() => {
            if (globalLoadingStates.size == 0 && isFirstLoad()) firstLoaded();
            if (globalLoadingStates.size == 0) {
                if (loadingAnimationRef.current?.classList.contains("loading")) {
                    loadingAnimationRef.current?.classList.remove("loading");
                    onAllLoaded.forEach(e => e());
                    hasLoadedAll.current = true;
                }
            }
        }, 100);
        onComponentLoadFunctions.forEach(e => e(key));
        console.log(globalLoadingStates);
    };

    const addOnComponentLoad = (func: (key: string) => void) => {
        onComponentLoadFunctions.push(func);
    };

    const removeOnComponentLoad = (func: (key: string) => void) => {
        onComponentLoadFunctions = onComponentLoadFunctions.filter(f => f != func);
    };

    const addOnFinishedLoading = (func: () => void) => {
        onAllLoaded.push(func);
    }

    const removeOnFinishedLoading = (func: () => void) => {
        onAllLoaded = onAllLoaded.filter(f => f != func);
    }

    const areAllLoaded = () => {
        return globalLoadingStates.size == 0;
    };

    const hasLoadedCurrentPage = () => {
        return hasLoadedAll.current;
    };

    const DOT_COUNT = (document.body.clientWidth * document.body.clientHeight) / 5000;

    const allCircles = useRef<ReactNode[]>(Array.from({ length: DOT_COUNT }).map((_, i) => {
        return (
            <div
                key={i}
                className={`loadingAnimation__circle loadingAnimation__circle--${i + 1}`}
                style={{ "--index": i, ...generateRandomPosition() } as React.CSSProperties}
            ></div>
        );
    }));

    return <LoadingAnimationContext.Provider value={{ addLoadingState, removeLoadingState, addOnComponentLoad, removeOnComponentLoad, areAllLoaded, addOnFinishedLoading, removeOnFinishedLoading, hasLoadedCurrentPage }}>
        {atts.children}
        <div className="loadingAnimation" style={{ "--numDots": DOT_COUNT } as any} ref={loadingAnimationRef}>
            {
                allCircles.current
            }
            <div className="finalLoadingStrike"></div>
        </div>
    </LoadingAnimationContext.Provider>;
}
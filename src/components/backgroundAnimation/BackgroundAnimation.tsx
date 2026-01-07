import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import "./BackgroundAnimation.scss";
import { Statics } from "../../utils";
import { movePercentage, randomFloatBetween } from "./Utils";
import { useLoadingAnimation } from "./LoadingAnimationContext";



export default function BackgroundAnimation() {
    const loadingAnimation = useLoadingAnimation();
    const bgAnimationRef = useRef<HTMLDivElement>(null);
    const isRunning = useRef<boolean>(false);
    const DOT_COUNT = 200;

    const allCircles = useRef<ReactNode[]>(Array.from({ length: Math.round(DOT_COUNT) }).map((_, i) => (
        <div
            key={i}
            className={`backgroundAnimation__circle backgroundAnimation__circle--${i + 1}`}
            style={{ "--index": i } as React.CSSProperties}
        ></div>
    )));

    let animationFrameId = -1;

    loadingAnimation.addOnFinishedLoading(() => {
        if (animationFrameId != -1) {
            cancelAnimationFrame(animationFrameId);
        }
        animationFrameId = requestAnimationFrame(() => {
            updateAllCirclesAfterResize(false, "0.2s");
            animationFrameId = -1;
        });
        isRunning.current = true;
    });

    type TimeTrackingHtmlDivElement = HTMLDivElement & {
        lastTime: number;
    }

    useEffect(() => {
        bgAnimationRef.current?.style.setProperty("--numDots", DOT_COUNT + "");

        const onTransitionEnd = (e: Event) => {
            const circle = e.target as TimeTrackingHtmlDivElement;
            if (circle.lastTime) {
                if (performance.now() - circle.lastTime < 1000) {
                    return;
                }
            }
            circle.lastTime = performance.now();
            updateCircleBackground(circle);
        };

        bgAnimationRef.current?.addEventListener("transitionend", onTransitionEnd);

        return () => {
            bgAnimationRef.current?.removeEventListener("transitionend", onTransitionEnd);
        };
    }, [bgAnimationRef]);

    useLayoutEffect(() => {
        const observer = new ResizeObserver(entries => {


            for (const entry of entries) {
                document.body.style.setProperty("--body-width", Math.round(entry.contentRect.width) + "px");
                document.body.style.setProperty("--body-height", Math.round(entry.contentRect.height) + "px");
            }
        });
        observer.observe(document.body);

        return () => {
            observer.unobserve(document.body);
            observer.disconnect();
        };
    }, []);

    return <div className="backgroundAnimation" ref={bgAnimationRef}>
        {
            allCircles.current
        }
    </div>

    function updateAllCirclesAfterResize(forcepositionFirst: boolean = false, animationSpeed?: string) {
        const container = bgAnimationRef.current;
        if (!container) return;
        for (let c of container.children) {
            const circle = c as HTMLDivElement;
            if (forcepositionFirst) movePercentage(circle, [
                randomFloatBetween(0, 100) + "",
                randomFloatBetween(0, 100) + ""
            ], "0.01s");
            circle.style.setProperty("--circle-size", randomBetween(1, Statics.BACKGROUND_ANIMATION_MAX_SIZE) + "");

            requestAnimationFrame(() => {
                updateCircleBackground(circle, animationSpeed);
            });
        }
    }
}



function randomBetween(min: number, max: number): number {
    return Math.round(Math.random() * (max - min) + min);
}

function updateCircleBackground(circle: HTMLDivElement, animationSpeed?: string) {
    movePercentage(circle, [
        randomFloatBetween(0, 100) + "",
        randomFloatBetween(0, 100) + ""
    ],
        animationSpeed ?? (randomBetween(Statics.BACKGROUND_ANIMATION_MIN_TIME, Statics.BACKGROUND_ANIMATION_MAX_TIME) + "s")
    );
    circle.style.setProperty("--circle-size", randomBetween(1, Statics.BACKGROUND_ANIMATION_MAX_SIZE) + "");
}



// function showImage() {

//     if (!bgAnimationRef.current) return;
//     const circles = bgAnimationRef.current.children;

//     const maped = Array.from(circles).map(circle => {
//         const computed = getComputedStyle(circle);
//         return {
//             circle: circle,
//             x: Math.round(parseFloat(computed.left.replace("px", ""))),
//             y: Math.round(parseFloat(computed.top.replace("px", "")))
//         } as Dot;
//     }).filter(e => e.x != 0 && e.y != 0);

//     const points = CURRENT_LOGO_TO_DISPLAY.points.map(e => ({ x: e[0], y: e[1], a: e[2] ?? undefined }));

//     assignNearestUniquePoints(maped, points).forEach((index) => {
//         const circle = index.dot;
//         const point = index.point;
//         if (!point || !circle) {
//             (circle.circle as HTMLDivElement).style.opacity = 0 + "";
//             return;
//         }

//         if (point && point.a == 0) {
//             (circle.circle as HTMLDivElement).style.opacity = 0 + "";
//             return;
//         } else {
//             (circle.circle as HTMLDivElement).style.opacity = 1 + "";
//         }
//         updateCircle(circle.circle as HTMLDivElement, point);
//     });
// }
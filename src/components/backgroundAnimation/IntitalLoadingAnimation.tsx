import { useRef, useState } from "react";
import "./LoadingAnimation.scss";
import { generateRandomPosition, setCallbackOnLoad } from "./Utils";
import IMAGE_JSON_BIG_RAW from "./data/image-big.json";
import IMAGE_JSON_SMALL_RAW from "./data/image-small.json";

const isSmall = window.innerWidth <= 800;

const IMAGE: DotImage = isSmall ? IMAGE_JSON_SMALL_RAW : IMAGE_JSON_BIG_RAW;

type DotImage = {
    points: number[][],
    width: number;
    height: number;
};

export default function InitialLoadingAnimation() {
    const bgAnimationRef = useRef<HTMLDivElement>(null);
    const DOT_COUNT = IMAGE.points.length;
    const [isFinishedAnimating, setFinishedAnimating] = useState(false);
    const isLoadingOfPageFinished = useRef(false);

    const finishedLoading = () => {
        setTimeout(() => {
            isLoadingOfPageFinished.current = true;

            const c = bgAnimationRef.current;
            if (!c) return;
            const circles = c.children;
            showImage(Array.from(circles) as HTMLDivElement[], IMAGE);

            c.classList.add("animateToIcon");
            c.classList.remove("warp");

            const animationEnd = (e: AnimationEvent) => {
                if (e.animationName != "fadeOut") return;
                c.removeEventListener("animationend", animationEnd);
                setFinishedAnimating(true);
            };

            c.addEventListener("animationend", animationEnd);
        }, 300);

    };
    setCallbackOnLoad(finishedLoading);

    const allCircles = Array.from({ length: Math.round(DOT_COUNT) }).map((_, i) => (
        <div
            key={i}
            className={`initialLoadingAnimation__circle initialLoadingAnimation__circle--${i + 1}`}
            style={{ "--index": i, ...generateRandomPosition() } as React.CSSProperties}
        ></div>
    ));
    return !isFinishedAnimating && <div className={`initialLoadingAnimation warp`} style={{ "--numDots": DOT_COUNT } as any} ref={bgAnimationRef}>
        {
            allCircles
        }
    </div>

}




function showImage(circles: HTMLDivElement[], image: DotImage) {

    const maped = Array.from(circles).map(circle => {
        const computed = getComputedStyle(circle);
        const x = Math.round(parseFloat(computed.left.replace("px", "")));
        const y = Math.round(parseFloat(computed.top.replace("px", "")));
        circle.style.setProperty("--init-x", x + "px");
        circle.style.setProperty("--init-y", y + "px");
        return {
            circle: circle,
            x: x,
            y: y
        } as Dot;
    }).filter(e => e.x != 0 && e.y != 0);

    const points = image.points.map(e => ({ x: e[0], y: e[1], a: e[2] ?? undefined }));

    assignNearestUniquePoints(maped, points).forEach((index) => {
        const circle = index.dot;
        const point = index.point;
        if (!point || !circle) {
            (circle.circle as HTMLDivElement).style.opacity = 0 + "";
            return;
        }

        if (point && point.a == 0) {
            (circle.circle as HTMLDivElement).style.opacity = 0 + "";
            return;
        } else {
            (circle.circle as HTMLDivElement).style.opacity = 1 + "";
        }
        updateCircleForImage(circle.circle as HTMLDivElement, point, image);
    });
}



type Point = { x: number; y: number, a?: number };
type Dot = {
    x: number;
    y: number;
    circle: HTMLDivElement;
}

// if (isInitialLoad) document.querySelector("#root")?.classList.remove("loaded");

function assignNearestUniquePoints(dots: Dot[], points: Point[]) {
    const dotCount = dots.length;
    const pointCount = points.length;

    const dotToPoint: (number | null)[] = new Array(dotCount).fill(null);
    const pointToDot: (number | null)[] = new Array(pointCount).fill(null);

    function dist(a: Point, b: Point) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return dx * dx + dy * dy;
    }

    // Build a list of all (dot, point, distance) triples
    const allPairs: { dotIndex: number; pointIndex: number; d: number }[] = [];
    for (let di = 0; di < dotCount; di++) {
        for (let pi = 0; pi < pointCount; pi++) {
            allPairs.push({ dotIndex: di, pointIndex: pi, d: dist(dots[di], points[pi]) });
        }
    }

    // Sort all pairs by distance ascending
    allPairs.sort((a, b) => a.d - b.d);

    // Assign each dot to the closest available point
    for (const { dotIndex, pointIndex } of allPairs) {
        if (dotToPoint[dotIndex] === null && pointToDot[pointIndex] === null) {
            dotToPoint[dotIndex] = pointIndex;
            pointToDot[pointIndex] = dotIndex;
        }
    }

    // Build result
    const result = dots.map((dot, i) => {
        const pointIndex = dotToPoint[i];
        return {
            dot,
            point: pointIndex !== null ? points[pointIndex] : null,
            dotIndex: i,
            pointIndex
        };
    });

    return result;
}


function updateCircleForImage(circle: HTMLDivElement, point: Point, currentLogo: DotImage) {

    if (!point) return;

    let [x, y] = [point.x, point.y];

    x = x / currentLogo.width;
    y = y / currentLogo.height;

    const aspectRatio = currentLogo.width / currentLogo.height;

    let width = window.innerWidth;
    let height = window.innerHeight;

    let min = Math.min(width, height);

    if (width == min) {
        height = width / aspectRatio;
    } else if (height == min) {
        width = height * aspectRatio;
    }

    const size = min / 4;


    width = width - size;
    height = height - size;

    x = x * width;
    y = y * height;

    x += (window.innerWidth - width) / 2;
    y += (window.innerHeight - height) / 2;

    circle.style.setProperty("--icon-x", Math.round(x) + "px");
    circle.style.setProperty("--icon-y", Math.round(y) + "px");
    circle.style.setProperty("--circle-size", 10 + "");

}
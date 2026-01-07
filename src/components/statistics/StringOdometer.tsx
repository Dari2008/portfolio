import { useEffect, useRef } from "react";
import "./string-odometer.scss";
import { randomBetween } from "../backgroundAnimation/Utils";

const CHARSET = " ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!?.-@+0123456789";

export default function StringOdometer({
    value,
    duration,
    className,
    setOnLoad,
    hasAllreadyLoaded,
    onClick
}: {
    value: string;
    duration: number;
    className: string;
    setOnLoad: (onLoad: () => void) => void;
    hasAllreadyLoaded: boolean;
    onClick?: () => void;
}) {
    const containerRef = useRef<(HTMLSpanElement | null)[]>([]);
    const indexes = useRef<number[]>([]);
    const tickerSpeed = useRef<number[]>([]);
    const charactersToRun = useRef<number[]>([]);
    const timePassed = useRef<number>(0);
    const hasLoaded = useRef<boolean>(false);

    const TICKER_SPEED = 10;
    const NUMBER_OF_LOOPS = duration / TICKER_SPEED;

    if (hasLoaded.current || hasAllreadyLoaded) {
        indexes.current = charactersToRun.current;
        indexes.current.forEach((v, i) => {
            const el = containerRef.current[i];
            if (el) el.innerHTML = CHARSET[v] == " " ? "&nbsp;" : CHARSET[v];
        });
    }

    const onLoad = () => {
        hasLoaded.current = true;
        const chars = value.split("");

        charactersToRun.current = chars.map((char) => {
            const idx = CHARSET.indexOf(char);
            return idx === -1 ? 0 : idx;
        });

        indexes.current = chars.map(() => randomBetween(0, CHARSET.length - 1));

        tickerSpeed.current = charactersToRun.current.map((targetIndex, i) => {
            const startIndex = indexes.current[i];

            let toSkip;
            if (targetIndex > startIndex) {
                toSkip = targetIndex - startIndex;
            } else if (targetIndex < startIndex) {
                toSkip = CHARSET.length - startIndex + targetIndex;
            } else {
                toSkip = CHARSET.length;
            }

            toSkip += CHARSET.length * 2;

            return toSkip / NUMBER_OF_LOOPS;
        });

        timePassed.current = 0;

        const interval = setInterval(() => {
            if (timePassed.current >= duration) {
                clearInterval(interval);

                // snap final characters
                indexes.current = charactersToRun.current;
                indexes.current.forEach((v, i) => {
                    const el = containerRef.current[i];
                    if (el) el.innerHTML = CHARSET[v] == " " ? "&nbsp;" : CHARSET[v];
                });
                return;
            }

            timePassed.current += TICKER_SPEED;

            indexes.current = indexes.current.map((v, i) => {
                const el = containerRef.current[i];
                if (!el) return v;

                const speed = tickerSpeed.current[i];
                const newVal = (v + speed) % CHARSET.length;

                el.innerHTML = CHARSET[Math.floor(newVal)] == " " ? "&nbsp;" : CHARSET[Math.floor(newVal)];
                return newVal;
            });
        }, TICKER_SPEED);
    };

    // register onLoad only once
    useEffect(() => {
        setOnLoad(onLoad);
    });

    return (
        <div className={"string-odometer " + className} onClick={onClick}>
            {value.split("").map((_, i) => (
                <span
                    key={i}
                    className="character-odometer"
                    ref={(el) => {
                        containerRef.current[i] = el;
                    }}
                >
                    {
                        (hasLoaded.current || hasAllreadyLoaded) &&
                        <>{value.at(i) == " " ? <>&nbsp;</> : value.at(i)}</>
                        ||
                        <>&nbsp;</>
                    }
                </span>
            ))}
        </div>
    );
}

import { useEffect, useState } from "react";
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
    const [displayChars, setDisplayChars] = useState<string[]>(() =>
        value.split("").map(() => "\u00A0") // start with non-breaking spaces
    );

    const [isFinished, setFinished] = useState<boolean>(false);

    const indexes = useState<number[]>(() =>
        value.split("").map(() => 0)
    )[0];
    const tickerSpeed = useState<number[]>(() =>
        value.split("").map(() => 0)
    )[0];
    const charactersToRun = useState<number[]>(() =>
        value.split("").map(() => 0)
    )[0];

    const TICKER_SPEED = 10;
    const NUMBER_OF_LOOPS = duration / TICKER_SPEED;
    let interval: number;

    const onLoad = () => {
        // initialize characters
        const chars = value.split("");
        chars.forEach((char, i) => {
            const idx = CHARSET.indexOf(char);
            charactersToRun[i] = idx === -1 ? 0 : idx;
            indexes[i] = randomBetween(0, CHARSET.length - 1);

            let toSkip;
            if (charactersToRun[i] > indexes[i]) {
                toSkip = charactersToRun[i] - indexes[i];
            } else if (charactersToRun[i] < indexes[i]) {
                toSkip = CHARSET.length - indexes[i] + charactersToRun[i];
            } else {
                toSkip = CHARSET.length;
            }
            toSkip += CHARSET.length * 2;
            tickerSpeed[i] = toSkip / NUMBER_OF_LOOPS;
        });

        let timePassed = 0;

        interval = setInterval(() => {
            timePassed += TICKER_SPEED;
            if (timePassed >= duration) {
                clearInterval(interval);
                // snap final characters
                setDisplayChars(chars.map((c) => (c === " " ? "\u00A0" : c)));
                setFinished(true);
                return;
            }

            setDisplayChars((prev) =>
                prev.map((_, i) => {
                    indexes[i] = (indexes[i] + tickerSpeed[i]) % CHARSET.length;
                    return CHARSET[Math.floor(indexes[i])] === " " ? "\u00A0" : CHARSET[Math.floor(indexes[i])];
                })
            );
        }, TICKER_SPEED);
    };

    setOnLoad(onLoad);
    useEffect(() => {

        return () => {
            clearInterval(interval);
        };
    }, []);

    // If already loaded, display final value
    useEffect(() => {
        if (hasAllreadyLoaded) {
            setDisplayChars(value.split("").map((c) => (c === " " ? "\u00A0" : c)));
        }
    }, [hasAllreadyLoaded]);

    return (
        <div className={"string-odometer " + className} onClick={onClick}>
            {
                !isFinished && displayChars.map((char, i) => (
                    <span key={i} className="character-odometer">
                        {char}
                    </span>
                ))}
            {
                isFinished && value.split("").map((char, i) => (
                    <span key={i} className="character-odometer">
                        {char === " " ? "\u00A0" : char}
                    </span>
                ))
            }
        </div>
    );
}

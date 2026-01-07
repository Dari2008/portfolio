import React, { useEffect, useRef, type ReactNode } from "react";
import { useOutlet } from "react-router";
import "./TypingSpan.scss";
import { useLoadingAnimation } from "../backgroundAnimation/LoadingAnimationContext";

export function TypingSpan(atts: { children: string; speed: number }) {
    const outlet = useOutlet();
    const span = useRef<HTMLSpanElement>(null);
    const loadingAnimation = useLoadingAnimation();

    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        const text = atts.children ?? extractText(outlet);
        const speed = atts.speed;
        if (!span.current) return;

        const WAIT_TIME = 1000;

        let index = 0;
        let clearing = false;

        let lastStepTime = 0;
        let waitUntil: number | null = null;

        const step = (now: number) => {
            if (!span.current) return;

            // Handle waiting phases
            if (waitUntil !== null) {
                if (now < waitUntil) {
                    rafRef.current = requestAnimationFrame(step);
                    return;
                }
                waitUntil = null;
            }

            if (now - lastStepTime < speed) {
                rafRef.current = requestAnimationFrame(step);
                return;
            }

            lastStepTime = now;

            // Finished typing → wait → start clearing
            if (index >= text.length && !clearing) {
                span.current.classList.add("waiting");
                waitUntil = now + WAIT_TIME;
                clearing = true;
                rafRef.current = requestAnimationFrame(step);
                return;
            }

            // Finished clearing → wait → start typing again
            if (clearing && index <= 0) {
                span.current.classList.add("waiting");
                waitUntil = now + WAIT_TIME / 2;
                clearing = false;
                rafRef.current = requestAnimationFrame(step);
                return;
            }

            span.current.classList.remove("waiting");
            span.current.classList.add("typing");

            index += clearing ? -1 : 1;
            span.current.textContent = text.slice(0, index);

            rafRef.current = requestAnimationFrame(step);
        };

        const start = () => {
            rafRef.current = requestAnimationFrame(step);
        };

        loadingAnimation.addOnFinishedLoading(start);

        return () => {
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
            }
            loadingAnimation.removeOnFinishedLoading(start);
        };
    }, []);

    return (
        <span className="typingSpanWrapper">
            <span className="typingSpan" ref={span}></span>
            <span className="typingPosition"></span>
            <span className="heightHolder">&nbsp;</span>
        </span>
    );
}

function extractText(node: ReactNode): string {
    if (typeof node === "string" || typeof node === "number") return String(node);
    if (Array.isArray(node)) return node.map(extractText).join("");
    if (React.isValidElement(node)) return extractText((node.props as any).children);
    return "";
}

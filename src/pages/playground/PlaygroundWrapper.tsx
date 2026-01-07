import { useParams } from "react-router";
import { NumberRecognizer } from "./content";
import Playground from "./Playground";
import type { ReactNode } from "react";

export default function PlaygroundWrapper() {
    let params = useParams();
    if (params.playgroundName) {
        const playground = PLAYGROUND_THINGS.find(e => e.name.toLowerCase().replaceAll(" ", "") == params.playgroundName);
        return playground?.element();
    }
    return <Playground />;
}

export const PLAYGROUND_THINGS: PlaygroundItem[] = [
    {
        element: NumberRecognizer,
        name: "Number Recognizer",
        desciption: "A Project where you can draw a number and it will recognize the number using a neural network."
    }
];

type PlaygroundItem = {
    element: () => ReactNode;
    name: string;
    desciption: string;
};
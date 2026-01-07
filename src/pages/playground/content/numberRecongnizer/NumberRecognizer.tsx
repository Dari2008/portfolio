import { useState } from "react";
import "./NumberRecognizer.scss";

const DEFAULTOUTPUT: Outputs = {
    "0": 0,
    "1": 0,
    "2": 0,
    "3": 0,
    "4": 0,
    "5": 0,
    "6": 0,
    "7": 0,
    "8": 0,
    "9": 0
}

const inputSize = 100;

// const network = new Netw

export default function NumberRecognizer() {

    const [outputs] = useState<Outputs>(DEFAULTOUTPUT);

    return <>
        <h1 className="title">Number Recognizer</h1>
        <div className="numberRecognizer">
            <canvas className="drawCanvas" width={inputSize} height={inputSize}></canvas>
            <div className="outputs">
                {
                    Object.keys(outputs).map(number => {
                        return <div key={number} className="output">
                            <span className="number">{number}</span>
                            <span className="percentage">{outputs[number as keyof Outputs]}</span>
                        </div>
                    })
                }
            </div>
        </div>
    </>;
}


type Outputs = {
    "0": number;
    "1": number;
    "2": number;
    "3": number;
    "4": number;
    "5": number;
    "6": number;
    "7": number;
    "8": number;
    "9": number;
}
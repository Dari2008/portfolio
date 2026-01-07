import { useEffect, useRef, useState } from "react";
import "./Statistics.scss";
import { useCountUp } from "react-countup";
import type { CountUpApi } from "react-countup/build/types";
import { useLoadingAnimation } from "../backgroundAnimation/LoadingAnimationContext";
import StringOdometer from "./StringOdometer";
import { loadStatistics, STATISTICS, type Statistic, type Statistics } from "../../data/Data";


let countUps: (CountUpApi | (() => void))[] = [];
export default function Statistics() {

    const loadingAnimation = useLoadingAnimation();
    const [statistics, setStatistics] = useState<Statistics>(STATISTICS);

    useEffect(() => {

        if (statistics.length == 0) {
            loadingAnimation.addLoadingState("statisticsLoading");
            (async () => {
                setStatistics(await loadStatistics());
                loadingAnimation.removeLoadingState("statisticsLoading");
            })();
        }

    }, [])

    countUps = [];

    loadingAnimation.addOnFinishedLoading(() => {
        const id = setInterval(() => {
            if (document.querySelector(".initialLoadingAnimation")) return;
            countUps.forEach(e => (typeof e == "function" ? e() : e.start()));
            clearInterval(id);
        }, 20);
    });


    return (
        <div className="statistics">
            <div className="statistics-container">
                {
                    statistics.map(s => <StatisticElement key={s.title} statistic={s}></StatisticElement>)
                }
            </div>
        </div>
    );
}

const StatisticElement = ({ statistic }: { statistic: Statistic }) => {
    const ref = useRef<HTMLDivElement>(document.createElement("div"));
    if (typeof statistic.value == "number") {
        let countUp = useCountUp({
            end: statistic.value,
            ref: ref,
            start: 0,
            suffix: statistic.unit ? " " + statistic.unit : "",
            duration: 2
        });
        countUps.push(countUp);
    }

    return <div className="statistic" key={statistic.title} data-importance={statistic.importance}>
        <div className="icon">{statistic.icon}</div>
        <span className="title">{statistic.title}</span>
        {
            typeof statistic.value == "number" && (
                <span ref={ref} className="value"></span>
            )
        }
        {
            typeof statistic.value == "string" && (
                <StringOdometer hasAllreadyLoaded={false} value={statistic.value} duration={2000} className="value" setOnLoad={func => { countUps.push(func); }}></StringOdometer>
            )
        }
    </div>;
};
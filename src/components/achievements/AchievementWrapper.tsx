import { useState, type ReactNode } from "react";
import { AchievementContext } from "./AchievementContext";
import AchievementManager, { type Achievement } from "./AchievementManager";
import "./AchievementWrapper.scss";
import { LangElement, useLanguage } from "../../lang";
import { useNavigate } from "react-router";

let manager = (globalThis as any).sdfsldjfsd;

export default function AchievementWrapper({ children }: { children: ReactNode }) {
    const [achievements, setAchievements] = useState<RecentAchievement[]>([]);
    const [language,] = useLanguage();
    const navigate = useNavigate();

    if (!manager) {
        manager = new AchievementManager();
        (globalThis as any).sdfsldjfsd = manager;
    }

    manager.onAchievementAdd = (achievement: Achievement) => setAchievements([...achievements, {
        ...achievement,
        timeoutId: setTimeout(() => {
            setAchievements(prev => prev.map(e => {
                if (e.title === achievement.title) {
                    return {
                        ...e,
                        isRemoving: true
                    };
                }
                return e;
            }));

            setTimeout(() => {
                setAchievements(prev => prev.filter(e => e.title !== achievement.title));
            }, 400);
        }, 6000)
    }]);


    return <AchievementContext.Provider value={manager}>
        {children}
        <div className="achievement-wrapper">
            {
                achievements.map(achievement => {
                    return <div key={achievement.title.en} onClick={() => navigate("/achievements")} className={"achievement" + (achievement.isRemoving ? " removing" : "")}>
                        <h3 className="genericTitle">
                            <LangElement
                                en="Achievement Unlocked"
                                de="Achievement Freigeschaltet"
                            />
                        </h3>
                        <h3 className="atitle">{achievement.title[language]}</h3>
                        <div className="icon">{achievement.icon}</div>
                        <div className="info">{achievement.info[language]}</div>
                    </div>
                })
            }
        </div>
    </AchievementContext.Provider>
}

type RecentAchievement = Achievement & {
    timeoutId: number;
    isRemoving?: boolean;
}
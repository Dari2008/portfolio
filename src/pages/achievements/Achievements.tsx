import { useEffect, useState } from "react";
import { useAchievements } from "../../components";
import { ACHIEVEMENT_REGISTRY, type AchievementType } from "../../components/achievements/AchievementManager";
import "./Achievements.scss";

export default function Achievements() {
    const achievementManager = useAchievements();

    const [, refresh] = useState(0);

    const update = () => refresh(e => e + 1);

    useEffect(() => {
        achievementManager.onAchievementAddForPage = update;
    });

    return <div className="achievements-page-wrapper">
        <h1 className="title">Achievements</h1>
        <div className="achievements">
            {
                Object.keys(ACHIEVEMENT_REGISTRY).map(achievmementKey => {
                    const achievement = ACHIEVEMENT_REGISTRY[achievmementKey as AchievementType];
                    const hasUnlocked = achievementManager.hasAchievement(achievmementKey as AchievementType);
                    return <div key={achievmementKey} className="achievement" data-unlocked={hasUnlocked ? "true" : "false"}>
                        <h3 className="atitle">{achievement.title}</h3>
                        <div className="icon">{achievement.icon}</div>
                        <div className="info">{achievement.info}</div>
                    </div>
                })
            }
        </div>
    </div>
}
import { createContext, useContext } from "react";
import AchievementManager from "./AchievementManager";

export const AchievementContext = createContext<AchievementManager | undefined>(undefined);

export function useAchievements() {
    const ctx = useContext(AchievementContext);
    if (!ctx) {
        throw new Error("useAchievements must be used inside AchievementsProvider");
    }
    return ctx as AchievementManager;
};
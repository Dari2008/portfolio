import { useEffect } from "react"
import "./KonamiCode.scss";
import { useAchievements } from "../../components";

export default function KonamiCode() {
    const achievements = useAchievements();

    function onKeyCodeCompleted() {
        console.log("KonamiCode");
        document.body.classList.add("konamiCodeActive");
        achievements.achievementFinished().triggeredEasterEgg("konamiCode");
    }

    useEffect(() => {

        const KEY_CODE = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
        let currentIndex = 0;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key == KEY_CODE[currentIndex]) {
                currentIndex++;
            } else {
                currentIndex = 0;
            }

            if (currentIndex >= KEY_CODE.length) {
                onKeyCodeCompleted();
            }

        };

        window.addEventListener('keydown', onKeyDown);

        return () => {
            window.removeEventListener('keydown', onKeyDown);
        };
    });

    return <></>
}
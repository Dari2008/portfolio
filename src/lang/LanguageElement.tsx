import type { ReactNode } from "react"
import type { LanguageCode } from "./LanguageManager"
import { useLanguage } from "./LanguageContext"

type Props = {
    [key in LanguageCode]?: ReactNode;
}

export default function LangElement(children: Props) {
    const [language,] = useLanguage();
    const currentReactNode = children[language];
    console.log(currentReactNode);
    return currentReactNode;
}
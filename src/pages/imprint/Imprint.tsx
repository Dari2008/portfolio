import { useTitle } from "../../components/titleManager/TitleManager";
import { Statics } from "../../utils";
import "./Imprint.scss";

export default function Imprint() {
    useTitle().setTitle(Statics.TITLE_SUFFIX + "Imprint");
    return (
        <>
            <h1 className="title">Imprint</h1>
        </>
    );
}
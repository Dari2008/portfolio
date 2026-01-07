import { useTitle } from "../../components/titleManager/TitleManager";
import { Statics } from "../../utils";
import "./PrivacyPolicy.scss";

export default function PrivacyPolicy() {
    useTitle().setTitle(Statics.TITLE_SUFFIX + "Privacy Policy");
    return (
        <>
            <h1 className="title">Privacy Policy</h1>
        </>
    );
}
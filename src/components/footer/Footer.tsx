import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import "./Footer.scss";
import { useEffect, useState } from "react";
import { MENU_ITEMS } from "../../app/Menu";
import { NavLink } from "react-router";
import { loadContact, type Contact } from "../../data/Data";
import { useLoadingAnimation } from "../backgroundAnimation/LoadingAnimationContext";
import { LangElement, useLanguage } from "../../lang";
import type { LanguageCode } from "../../lang/LanguageManager";

export default function Footer() {
    const [tabIndex, setTabIndex] = useState(0);

    const [language,] = useLanguage();
    const bg = useLoadingAnimation();
    const [contact, setContact] = useState<Contact | undefined>(undefined);
    useEffect(() => {
        if (contact == undefined) {
            bg.addLoadingState("contact");
            (async () => {
                setContact(await loadContact());
                bg.removeLoadingState("contact");
            })();
        }
    }, [bg]);

    return contact && (
        <>
            <footer className="footer">
                <div className="contact-card card-nohover">
                    <h2 className="title">
                        <LangElement
                            en={"Contact"}
                            de={"Kontakt"}
                        />
                    </h2>
                    <Tabs selectedIndex={tabIndex} onSelect={(index) => setTabIndex(index)}>
                        <TabList>
                            <Tab>Code</Tab>
                            <Tab>UI</Tab>
                        </TabList>
                        <TabPanel >
                            <pre className="code contactCode">
                                <button className="copy" onClick={e => copyContactToClipboard(e, language)}>
                                    <LangElement
                                        en={"Copy"}
                                        de={"Kopieren"}
                                    />
                                </button>
                                <span className="key key-opening">
                                    <span className="bracket">&lt;</span>
                                    <LangElement en="contact" de="kontakt" />
                                    <span className="bracket">&gt;</span>
                                </span><br />
                                <span className="tab"></span>
                                <span className="key-first key-opening">
                                    <span className="bracket">&lt;</span>
                                    name
                                    <span className="bracket">&gt;</span>
                                </span>
                                <span className="value">{contact.name}</span>
                                <span className="key-second key-closing">
                                    <span className="bracketAndSlash">&lt;/</span>
                                    name
                                    <span className="bracket">&gt;</span>
                                </span><br />
                                <span className="tab"></span>
                                <span className="key-first key-opening">
                                    <span className="bracket">&lt;</span>
                                    email
                                    <span className="bracket">&gt;</span>
                                </span>
                                <span className="value">{contact.email}</span>
                                <span className="key-second key-closing">
                                    <span className="bracketAndSlash">&lt;/</span>
                                    email
                                    <span className="bracket">&gt;</span>
                                </span><br />
                                <span className="tab"></span>
                                <span className="key-first key-opening">
                                    <span className="bracket">&lt;</span>
                                    phone
                                    <span className="bracket">&gt;</span>
                                </span>
                                <span className="value">{contact.phone.prefix} <span className="optional-zero">{contact.phone.optionalZero ? "0" : ""}</span>
                                    {contact.phone.number}</span>
                                <span className="key-second key-closing">
                                    <span className="bracketAndSlash">&lt;/</span>
                                    phone
                                    <span className="bracket">&gt;</span>
                                </span><br />
                                <span className="tab"></span>
                                <span className="key-first key-opening">
                                    <span className="bracket">&lt;</span>
                                    github
                                    <span className="bracket">&gt;</span>
                                </span>
                                <span className="value">{contact.github}</span>
                                <span className="key-second key-closing">
                                    <span className="bracketAndSlash">&lt;/</span>
                                    github
                                    <span className="bracket">&gt;</span>
                                </span><br />
                                <span className="key key-closing"><span className="bracketAndSlash">&lt;/</span><LangElement en="contact" de="kontakt" /><span className="bracket">&gt;</span></span><br />
                            </pre>
                        </TabPanel>
                        <TabPanel>
                            <div className="key-value-pairs">
                                <div className="key-value-pair">
                                    <span className="key">Name</span>
                                    <a className="value" onClick={() => navigator.clipboard.writeText(contact.name)}>{contact.name}</a>
                                </div>
                                <div className="key-value-pair">
                                    <span className="key">E-Mail</span>
                                    <a className="value" href="mailto:darius@frobeen.com">{contact.email}</a>
                                </div>
                                <div className="key-value-pair">
                                    <span className="key">Phone</span>
                                    <a className="value" href={`${contact.phone.prefix} ${contact.phone.optionalZero ? "0" : ""}${contact.phone.number}`}>{contact.phone.prefix} {contact.phone.optionalZero && <span className="optional-zero">0</span>} {contact.phone.number}</a>
                                </div>
                                <div className="key-value-pair">
                                    <span className="key">Github</span>
                                    <a className="value external-link" target="_blank" href={contact.github}>{contact.github}</a>
                                </div>
                            </div>
                        </TabPanel>
                    </Tabs>
                </div>

                <div className="footerMenu card-nohover">
                    <ul>
                        {
                            MENU_ITEMS.map(menuItem => {
                                return (<li key={menuItem.name + menuItem.path + "footer"}><NavLink to={menuItem.path}>
                                    <LangElement {...menuItem.name} />
                                </NavLink></li>);
                            })
                        }
                    </ul>
                </div>

                <div className="socials-footer">
                    <NavLink to={contact.github} target="_blank" className="externalLink social-wrapper">
                        <div className="logo-wrapper">
                            <i className="logo github-logo"></i>
                        </div>
                    </NavLink>
                    <NavLink to={contact.linkedIn} target="_blank" className="externalLink social-wrapper">
                        <div className="logo-wrapper">
                            <i className="logo linkedin-logo"></i>
                        </div>
                    </NavLink>
                    <NavLink to={contact.discord} target="_blank" className="externalLink social-wrapper">
                        <div className="logo-wrapper">
                            <i className="logo discord-logo"></i>
                        </div>
                    </NavLink>
                </div>


                <div className="bottom">
                    <div className="rights-wrapper">
                        <NavLink to="/imprint" className="imprint"><LangElement en="Imprint" de="Impressum" /></NavLink>
                        <NavLink to="/privacyPolicy" className="privacyPolicy"><LangElement en="Privacy Policy" de="Datenschutzrichtlinie" /></NavLink>
                    </div>
                    <p className="copyrightNotice">© {(new Date()).getFullYear() == 2025 ? "2025" : "2025 - " + (new Date()).getFullYear()} Darius Frobeen. <LangElement en="All rights reserved." de="Alle Rechte vorbehalten." /></p>
                </div>

            </footer>
        </>
    );
}

async function copyContactToClipboard(e: React.MouseEvent<HTMLButtonElement>, lang: LanguageCode) {
    try {
        await navigator.clipboard.writeText(
            `
<${lang == "en" ? "contact" : "kontakt"}>
    <name>Darius Frobeen</name>
    <email>darius@frobeen.com</email>
    <phone>+49 (0)1724067376</phone>
</${lang == "en" ? "contact" : "kontakt"}>
            `.trim());
        (e.target as HTMLElement)?.classList.add("successfullyCopied");
    } catch (ex) {
        (e.target as HTMLElement)?.classList.add("failedToCopy");
    }
    setTimeout(() => {
        (e.target as HTMLElement)?.classList.remove("successfullyCopied");
        (e.target as HTMLElement)?.classList.remove("failedToCopy");
    }, 1500);
}
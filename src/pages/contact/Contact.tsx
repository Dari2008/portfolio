import { useEffect, useRef, useState } from "react";
import { CONTACT, type Contact, loadContact } from "../../data/Data";
import "./Contact.scss";
import "./Socials.scss";
import { useAchievements, useLoadingAnimation } from "../../components";
import gsap from "gsap";
import { Statics } from "../../utils";
import { useTitle } from "../../components/titleManager/TitleManager";
import { LangElement, useLanguage } from "../../lang";

export default function Contact() {
    const achievements = useAchievements();
    useTitle().setTitle(Statics.TITLE_SUFFIX + "Contact");

    useEffect(() => achievements.achievementFinished().visitedPage("contact"));

    const loadingAnimation = useLoadingAnimation();
    const [contact, setContact] = useState<Contact>(CONTACT);
    const [language,] = useLanguage();


    const contactFormRef = useRef<HTMLDivElement>(null);

    const nameRef = useRef<HTMLInputElement>(null);
    const emailElement = useRef<HTMLInputElement>(null);
    const messageElement = useRef<HTMLTextAreaElement>(null);

    const errorName = useRef<HTMLSpanElement>(null);
    const errorEmail = useRef<HTMLSpanElement>(null);
    const errorMessage = useRef<HTMLSpanElement>(null);

    const checkName = () => {

        const name = nameRef.current?.value;

        if (!name) {
            if (errorName.current) {
                errorName.current.innerHTML = "Name has to be set!";
                errorName.current.classList.add("visible");
            }
            return false;
        }

        if (name.length <= 3) {
            if (errorName.current) {
                errorName.current.innerHTML = "Your Name has to be longer than 3 Charcacters!";
                errorName.current.classList.add("visible");
            }
            return false;
        }
        return name;
    }

    const checkEmail = () => {
        const email = emailElement.current?.value;

        if (!email) {
            if (errorEmail.current) {
                errorEmail.current.innerHTML = "Email has to be set!";
                errorEmail.current.classList.add("visible");
            }
            return false;
        }

        if (!email.match(/^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*$/)) {
            if (errorEmail.current) {
                errorEmail.current.innerHTML = "The email you entered is not valid!";
                errorEmail.current.classList.add("visible");
            }
            return false;
        }
        return email;
    }

    const checkMessage = () => {
        const message = messageElement.current?.value;

        if (!message) {
            if (errorMessage.current) {
                errorMessage.current.innerHTML = "You have to have a Message!";
                errorMessage.current.classList.add("visible");
            }
            return false;
        }

        if (message.length <= 5) {
            if (errorMessage.current) {
                errorMessage.current.innerHTML = "Message has to be longer than 5 characters!";
                errorMessage.current.classList.add("visible");
            }
            return false;
        }
        return message;
    };

    const sendMessage = () => {

        achievements.achievementFinished().submittedContactForm();

        return true;
    };

    const handleMessageSendClick = () => {

        const name = checkName();
        const email = checkEmail();
        const message = checkMessage();

        if (!name) return;
        if (!email) return;
        if (!message) return;

        typingInName();
        typingInEmail();
        typingInMessage();

        console.log(name, email, message);

        const successSendingMessage = sendMessage();
        if (!successSendingMessage) return;

        if (contactFormRef.current) showSendAnimation(contactFormRef.current);
        if (nameRef.current) nameRef.current.value = "";
        if (emailElement.current) emailElement.current.value = "";
        if (messageElement.current) messageElement.current.value = "";

    };

    const typingInName = () => removeErrorFrom(errorName.current);
    const typingInEmail = () => removeErrorFrom(errorName.current);
    const typingInMessage = () => removeErrorFrom(errorName.current);


    const removeErrorFrom = (errorElement: HTMLSpanElement | null) => errorElement && errorElement.classList.remove("visible");

    useEffect(() => {
        if (Object.values(contact).filter(e => !!e).length == 0) {
            loadingAnimation.addLoadingState("contactPage");
            (async () => {
                setContact(await loadContact());
                loadingAnimation.removeLoadingState("contactPage");
            })();
        }
    });

    const socials = [
        {
            text: "Github",
            link: contact.github
        },
        {
            text: "LinkedIn",
            link: contact.linkedIn
        },
        {
            text: "Discord",
            link: contact.discord
        }
    ]

    return (<>
        <h1 className="title">
            <LangElement
                en="Contact"
                de="Kontakt"
            />
        </h1>
        <span className="contact-text">
            <LangElement
                en="Let's talk! Whether it's a project, a collaboration, or just a question, I'm happy to hear from you."
                de="Lass uns reden! Egal, ob es um ein Projekt, eine Zusammenarbeit oder einfach nur eine Frage geht, ich freue mich, von dir zu hören."
            />
        </span>
        <div className="contact-wrapper">

            <div className="info-wrapper">
                <h2 className="title">Info</h2>
                <div className="name">
                    <span className="label">Name</span>
                    <span className="value">{contact.name}</span>
                </div>

                <div className="email">
                    <span className="label">E-Mail</span>
                    <span className="value">
                        <a href={`mailto:${contact.email}`}>{contact.email}</a>
                    </span>
                </div>
                <div className="phone">
                    <span className="label">Phone</span>
                    <span className="value">
                        <a href={`tel:${!contact.phone ? "" : `${contact.phone.prefix} ${(contact.phone.optionalZero ? "(0)" : "")}${contact.phone.number}`}`}>{!contact.phone ? "" : `${contact.phone.prefix} ${(contact.phone.optionalZero ? "(0)" : "")}${contact.phone.number}`}</a>
                    </span>
                </div>
            </div>


            <div className="socials-wrapper">
                <h2 className="title">Socials</h2>
                <div className="socials">
                    {
                        socials.map(social => {
                            return <a href={social.link} key={social.text} className="externalLink social-wrapper">
                                <div className="logo-wrapper">
                                    <span className={`${social.text.toLowerCase()}-logo logo`}></span>
                                    <span className="logo-name">{social.text}</span>
                                </div>
                            </a>
                        })
                    }
                </div>
            </div>

            <div className="contact-form-wrapper">
                <h2 className="title">
                    <LangElement
                        en="Contact Form"
                        de="Kontakt Formular"
                    />
                </h2>
                <div className="contact-form" ref={contactFormRef}>
                    <span className="default">
                        <input type="text" className="name" placeholder={language == "en" ? "Your Name" : "Dein Name"} ref={nameRef} onInput={typingInName} />
                        <span className="error error-name" ref={errorName}></span>
                        <input type="email" className="email" placeholder={language == "en" ? "Your E-mail adresse" : "Dein Email Addresse"} ref={emailElement} onInput={typingInEmail} />
                        <span className="error error-email" ref={errorEmail}></span>
                        <textarea className="message" placeholder={language == "en" ? "Message" : "Nachicht"} ref={messageElement} onInput={typingInMessage}></textarea>
                        <span className="error error-message" ref={errorMessage}></span>
                        <button className="sendMessage" onClick={handleMessageSendClick}>
                            <LangElement
                                en="Send"
                                de="Senden"
                            />
                        </button>
                    </span>
                    <span className="success">
                        <span className="mark">&#10003;</span><span ><LangElement en="Sent" de="Gesendet" /></span>
                    </span>
                    <svg className="trails" viewBox="0 0 33 64">
                        <path d="M26,4 C28,13.3333333 29,22.6666667 29,32 C29,41.3333333 28,50.6666667 26,60"></path>
                        <path d="M6,4 C8,13.3333333 9,22.6666667 9,32 C9,41.3333333 8,50.6666667 6,60"></path>
                    </svg>
                    <div className="plane">
                        <div className="left"></div>
                        <div className="right"></div>
                    </div>
                </div>
            </div>

        </div>
    </>);
}

function showSendAnimation(animationElement: HTMLDivElement) {

    let getVar = (variable: string) => getComputedStyle(animationElement).getPropertyValue(variable);
    if (!animationElement.classList.contains("active")) {
        animationElement.classList.add("active");

        gsap.to(animationElement, {
            keyframes: [
                {
                    "--left-wing-first-x": 50,
                    "--left-wing-first-y": 100,
                    "--right-wing-second-x": 50,
                    "--right-wing-second-y": 100,
                    duration: 0.2,
                    onComplete() {
                        gsap.set(animationElement, {
                            "--left-wing-first-y": 0,
                            "--left-wing-second-x": 40,
                            "--left-wing-second-y": 100,
                            "--left-wing-third-x": 0,
                            "--left-wing-third-y": 100,
                            "--left-body-third-x": 40,
                            "--right-wing-first-x": 50,
                            "--right-wing-first-y": 0,
                            "--right-wing-second-x": 60,
                            "--right-wing-second-y": 100,
                            "--right-wing-third-x": 100,
                            "--right-wing-third-y": 100,
                            "--right-body-third-x": 60
                        });
                    }
                },
                {
                    "--left-wing-third-x": 20,
                    "--left-wing-third-y": 90,
                    "--left-wing-second-y": 90,
                    "--left-body-third-y": 90,
                    "--right-wing-third-x": 80,
                    "--right-wing-third-y": 90,
                    "--right-body-third-y": 90,
                    "--right-wing-second-y": 90,
                    duration: 0.2
                },
                {
                    "--rotate": 50,
                    "--left-wing-third-y": 95,
                    "--left-wing-third-x": 27,
                    "--right-body-third-x": 45,
                    "--right-wing-second-x": 45,
                    "--right-wing-third-x": 60,
                    "--right-wing-third-y": 83,
                    duration: 0.25
                },
                {
                    "--rotate": 60,
                    "--plane-x": -8,
                    "--plane-y": 40,
                    duration: 0.2
                },
                {
                    "--rotate": 40,
                    "--plane-x": 45,
                    "--plane-y": -300,
                    "--plane-opacity": 0,
                    duration: 0.375,
                    onComplete() {
                        setTimeout(() => {
                            animationElement.removeAttribute("style");
                            animationElement.classList.remove("active");
                            // gsap.fromTo(
                            //     animationElement,
                            //     {
                            //         opacity: 0,
                            //         y: -8
                            //     },
                            //     {
                            //         opacity: 0,
                            //         y: 0,
                            //         clearProps: true,
                            //         duration: 0.3,
                            //         onComplete() {
                            //             animationElement.classList.remove("active");
                            //         }
                            //     }
                            // );
                        }, 1800);
                    }
                }
            ]
        });

        gsap.to(animationElement, {
            keyframes: [
                {
                    "--text-opacity": 0,
                    "--border-radius": 0,
                    "--left-wing-background": getVar("--primary-dark"),
                    "--right-wing-background": getVar("--primary-dark"),
                    duration: 0.11
                },
                {
                    "--left-wing-background": getVar("--primary"),
                    "--right-wing-background": getVar("--primary"),
                    duration: 0.14
                },
                {
                    "--left-body-background": getVar("--primary-dark"),
                    "--right-body-background": getVar("--primary-darkest"),
                    duration: 0.25,
                    delay: 0.1
                },
                {
                    "--trails-stroke": 171,
                    duration: 0.22,
                    delay: 0.22
                },
                {
                    "--success-opacity": 1,
                    "--success-x": 0,
                    duration: 0.2,
                    delay: 0.15
                },
                {
                    "--success-stroke": 0,
                    duration: 1
                }
            ]
        });
    }
}
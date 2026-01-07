import React from "react";
import { BackgroundAnimation, Footer, Header, IntitalLoadingAnimation } from "../components";
import { Outlet } from "react-router";
import { Console, ConsoleButton } from "../components/console/Console";
import { KonamiCode } from "../easterEggs";
import { ScrollRestoration } from "./ScrollRestoration";
import LanguageChangeButton from "../components/languageChange/LanguageChangeButton";

const Layout: React.FC = () => {
    return (
        <>
            <ScrollRestoration />
            <KonamiCode />
            <Header />
            <main>
                <Outlet />
            </main>
            <Footer />
            <Console />
            <ConsoleButton />
            <BackgroundAnimation />
            <IntitalLoadingAnimation />
            <LanguageChangeButton />
        </>
    );
};

export default Layout;
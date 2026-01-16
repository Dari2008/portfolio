import { createRoot } from 'react-dom/client'
import './index.scss'
import { BrowserRouter, Route, Routes } from 'react-router'
import { MENU_ITEMS } from './Menu'
import { Achievements, Imprint, PlaygroundWrapper, PrivacyPolicy, VisitorsPage } from '../pages'
import Layout from './Layout'
import ProjectViewerWrapper from '../pages/projectViewer/ProjectViewerWrapper'
import { StrictMode } from 'react'
import LoadingAnimation from '../components/backgroundAnimation/LoadingAnimation'
import { StemRacing } from '../pages/specials/stemRacing/StemRacing'
import { TitleManager, VisitorManager } from '../components'
import LanguageManagerProvider from '../lang/LanguageManager'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <LanguageManagerProvider>
            <TitleManager>
                <LoadingAnimation>
                    <BrowserRouter>
                        <Routes>
                            <Route element={<Layout />} caseSensitive={false}>

                                <Route path="/visitors" element={<VisitorsPage />} />

                                {
                                    MENU_ITEMS.map(item => {
                                        return (<Route key={item.path} index={item.index} path={item.path} element={<item.element />} />);
                                    })
                                }

                                <Route path="/imprint" element={<Imprint />}></Route>
                                <Route path="/privacyPolicy" element={<PrivacyPolicy />}></Route>
                                <Route path="/projects/:projectId" element={<ProjectViewerWrapper />}></Route>
                                <Route path="/projects" element={<ProjectViewerWrapper />}></Route>
                                <Route path="/playground/:playgroundName" element={<PlaygroundWrapper />}></Route>
                                <Route path="/playground" element={<PlaygroundWrapper />}></Route>
                                <Route path="/achievements" element={<Achievements />}></Route>

                                <Route path='specials'>
                                    <Route path='stemracing' element={<StemRacing />}></Route>
                                </Route>
                            </Route>
                        </Routes>
                    </BrowserRouter>
                </LoadingAnimation>
            </TitleManager>
        </LanguageManagerProvider>
    </StrictMode>
)

VisitorManager();
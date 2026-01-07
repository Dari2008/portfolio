import { NavLink } from "react-router";
import "./Playground.scss";
import { PLAYGROUND_THINGS } from "./PlaygroundWrapper";

export default function Playground() {
    return <div className="playgroundList">
        <h1 className="title">Playground</h1>
        <ul className="smallProjects">
            {
                PLAYGROUND_THINGS.map(pr => {
                    return <li key={pr.name}>
                        <span className="name">{pr.name}</span>
                        <span className="description">{pr.desciption}</span>
                        <NavLink to={pr.name.toLowerCase().replaceAll(" ", "")} className="open">Open</NavLink>
                    </li>
                })
            }
        </ul>
    </div>;
}
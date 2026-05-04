import React from "react";
import "./Logos.css";
// import { logos } from "../../utils/constants";

const TEXT_LOGOS = [
  "Le Bernardin","Nobu","The Ivy","Sketch","Brasserie Lipp",
  "El Celler","Zuma","Noma","Osteria Francescana","Eleven Madison",
  "Geranium","Mirazur","Central","Disfrutar","Alain Ducasse",
];

export default function Logos({ logos }) {
  const items = logos || TEXT_LOGOS;
  return (
    <section className="logos" aria-label="Trusted by top restaurants">
      <p className="logos__header">Trusted by 2,000+ restaurants worldwide</p>
      <div className="logos__track-wrap">
        <div className="logos__track">
          {[...items, ...items].map((item, i) => (
            <div className="logos__item" key={i} aria-hidden={i >= items.length}>
              {typeof item === "string"
                ? <span className="logos__text">{item}</span>
                : <img className="logos__img" src={item} alt="" />}
            </div>
          ))}
        </div>
        <div className="logos__fade logos__fade--left" />
        <div className="logos__fade logos__fade--right" />
      </div>
    </section>
  );
}
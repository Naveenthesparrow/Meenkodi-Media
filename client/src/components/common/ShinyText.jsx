import React from "react";
import "./ShinyText.css";

const ShinyText = ({ text, disabled = false, speed = 5, className = "", style = {}, lang, tint, glow }) => {
  const animationDuration = `${speed}s`;

  return (
    <span
      className={`shiny-text ${disabled ? "shiny-disabled" : "shiny-animate"} ${className}`}
      style={{
        animationDuration,
        ...(tint ? { "--shine-color": tint } : {}),
        ...(glow ? { "--shine-glow": glow } : {}),
        ...style,
      }}
      data-text={text}
      {...(lang ? { lang } : {})}
    >
      {text}
    </span>
  );
};

export default ShinyText;

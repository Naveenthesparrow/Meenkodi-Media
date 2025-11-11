import React from "react";
import { useTranslation } from "react-i18next";
import DockText from "./DockText";

/**
 * LanguageDockToggle – Desktop-only dock-style language switcher (EN/TA).
 * Falls back to simple toggle behavior; the mobile drawer still uses the Select.
 */
export default function LanguageDockToggle({ sx = {} }) {
  const { i18n, t } = useTranslation();
  const lang = i18n.language || "en";

  const toggle = () => {
    const next = lang.startsWith("ta") ? "en" : "ta";
    i18n.changeLanguage(next);
    try { localStorage.setItem("lang", next); } catch (_) {}
  };

  const label = lang.startsWith("ta") ? t("language.tamil") : t("language.english");

  return (
    <DockText
      text={label}
      onClick={toggle}
      baseSize={16}
      letterGap={2}
      color="#fff"
      sx={sx}
    />
  );
}

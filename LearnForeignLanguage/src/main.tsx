import React from "react";
import ReactDOM from "react-dom/client";
import languageFavicon from "@static/shared/assets/icons/language.svg";
import "@static/shared/styles.css";
import App from "./App";

const selectFaviconLink = (): HTMLLinkElement | null =>
  document.querySelector('link[data-app-icon], link[rel~="icon"]');

const createFaviconLink = (): HTMLLinkElement => {
  const link = document.createElement("link");
  link.rel = "icon";
  document.head.appendChild(link);
  return link;
};

const applySharedFavicon = (iconHref: string): void => {
  const link = selectFaviconLink() ?? createFaviconLink();
  link.rel = "icon";
  link.type = "image/svg+xml";
  link.href = iconHref;
};

applySharedFavicon(languageFavicon);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

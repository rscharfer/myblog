import Icon from "./icons";
import { site } from "../lib/site";

export default function SiteFooter() {
  return (
    <footer className="site">
      <span className="avatar" aria-hidden="true">
        {site.initials}
      </span>
      <b>{site.author}</b>
      {site.bio}
      <div className="links">
        <a href={site.github} target="_blank" rel="noopener">
          <Icon name="code" />
          GitHub
        </a>
        <a href={site.linkedin} target="_blank" rel="noopener">
          <Icon name="link" />
          LinkedIn
        </a>
        <a href={site.url} target="_blank" rel="noopener">
          <Icon name="globe" />
          {site.url.replace("https://", "")}
        </a>
      </div>
    </footer>
  );
}

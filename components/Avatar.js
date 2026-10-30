import { site } from "../lib/site";

// Decorative: the author's name is always next to it.
export default function Avatar() {
  return (
    <span className={site.avatar ? "avatar has-img" : "avatar"} aria-hidden="true">
      {site.avatar ? <img src={site.avatar} alt="" /> : site.initials}
    </span>
  );
}

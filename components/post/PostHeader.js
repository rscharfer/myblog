import Icon from "../icons";
import { TocMobile } from "./Toc";
import { site } from "../../lib/site";

export default function PostHeader({ post }) {
  const url = `${site.url}/post/${post.slug}`;
  const linkedIn = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  const x = `https://x.com/intent/post?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(url)}`;

  return (
    <header className="post">
      <h1>{post.title}</h1>
      {post.subtitle && <p className="subtitle">{post.subtitle}</p>}
      <div className="meta">
        <span className="author">
          <span className="avatar" aria-hidden="true">
            {site.initials}
          </span>
          {site.author}
        </span>
        <span className="m">
          <Icon name="calendar" />
          <time dateTime={post.date.iso}>{post.date.long}</time>
        </span>
        <span className="m">
          <Icon name="clock" />
          {post.readingTime} min read
        </span>
        <span className="share">
          <a href={linkedIn} target="_blank" rel="noopener">
            <Icon name="share" />
            LinkedIn
          </a>
          <a href={x} target="_blank" rel="noopener">
            <Icon name="share" />X
          </a>
        </span>
      </div>
      {post.toc.length > 0 && <TocMobile toc={post.toc} />}
    </header>
  );
}

import Icon from "../icons";

function Items({ toc }) {
  return (
    <ol>
      {toc.map((item) => (
        <li key={item.id} className={`l${item.depth}`}>
          <a href={`#${item.id}`}>{item.title}</a>
        </li>
      ))}
    </ol>
  );
}

// Below 1220px: a bordered <details> bar in the header.
export function TocMobile({ toc }) {
  return (
    <details className="toc toc-mobile">
      <summary>
        <span className="kicker">Contents</span>
        <span className="cnt">
          {toc.length} {toc.length === 1 ? "section" : "sections"}
        </span>
        <Icon name="chevron" />
      </summary>
      <Items toc={toc} />
    </details>
  );
}

// At 1220px and up: a sticky list in the left margin with "% read".
export function TocSide({ toc }) {
  return (
    <nav className="toc toc-side" aria-label="Table of contents">
      <div className="kicker">Contents</div>
      <Items toc={toc} />
      <div className="pct">
        <span data-pct>0%</span> read
      </div>
    </nav>
  );
}

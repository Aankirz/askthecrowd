import Wheel from "./Wheel.jsx";
import ExportCsv from "./ExportCsv.jsx";

const GROUPS = [
  ["questions", "Questions"],
  ["prepositions", "Prepositions"],
  ["comparisons", "Comparisons"],
  ["alphabetical", "Alphabetical"],
];

function Card({ title, map }) {
  const entries = Object.entries(map).filter(([, v]) => v.length);
  if (!entries.length) return null;
  return (
    <div className="card">
      <h3>{title}</h3>
      {entries.map(([mod, items]) => (
        <div className="sub" key={mod}>
          <span className="mod">{mod}</span>
          <ul>
            {items.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function RedditPanel({ reddit }) {
  return (
    <div className="card reddit">
      <h3>Real questions on Reddit</h3>
      <ul className="redlist">
        {reddit.map((p) => (
          <li key={p.url}>
            <a href={p.url} target="_blank" rel="noreferrer">
              {p.title}
            </a>
            <span className="meta">
              r/{p.subreddit} · ▲{p.ups}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Results({ data }) {
  const { seed, groups, reddit, total } = data;

  if (total === 0 && reddit.length === 0)
    return <p className="notice">Nothing came back for “{seed}”. Try a broader keyword.</p>;

  return (
    <section className="results" aria-label={`Results for ${seed}`}>
      <div className="resbar">
        <p className="count">
          <strong>{total}</strong> suggestions for <em>“{seed}”</em>
        </p>
        <ExportCsv data={data} />
      </div>

      {Object.values(groups.questions).some((v) => v.length) && (
        <Wheel seed={seed} questions={groups.questions} />
      )}

      <div className="cols">
        {GROUPS.map(([key, label]) => (
          <Card key={key} title={label} map={groups[key]} />
        ))}
        {groups.related.length > 0 && (
          <div className="card">
            <h3>Related</h3>
            <ul>
              {groups.related.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        )}
        {reddit.length > 0 && <RedditPanel reddit={reddit} />}
      </div>
    </section>
  );
}

import { headers } from "next/headers";
import { getResults } from "../lib/pipeline.js";
import { rateLimit } from "../lib/cache.js";
import SearchBox from "../components/SearchBox.jsx";
import Results from "../components/Results.jsx";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }) {
  const { q } = await searchParams;
  if (q) {
    const og = `/api/og?q=${encodeURIComponent(q)}`;
    return {
      title: `What people ask about “${q}” — AskTheCrowd`,
      description: `Questions, prepositions, comparisons and Reddit threads people search for “${q}”.`,
      openGraph: { title: `What people ask about “${q}”`, images: [og] },
      twitter: { card: "summary_large_image", images: [og] },
    };
  }
  return {};
}

export default async function Page({ searchParams }) {
  const { q } = await searchParams;
  const seed = (q ?? "").trim();

  let data = null;
  let limited = false;
  if (seed) {
    const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    if (rateLimit(ip)) data = await getResults(seed);
    else limited = true;
  }

  return (
    <main className="shell">
      <header className="masthead">
        <span className="pill">open source · free · no login</span>
        <a className="brand" href="/">
          Ask<span>The</span>Crowd
        </a>
        <p className="tagline">See what the internet is asking — for any keyword.</p>
      </header>

      <SearchBox initial={seed} autoFocusInput={!data} />

      {limited && <p className="notice">Easy there — too many searches. Wait a minute and try again.</p>}
      {data && <Results data={data} />}

      {!seed && (
        <>
          <section className="hint">
            <p>Try a keyword like</p>
            <div className="examples">
              {["ozempic", "remote work", "sourdough", "electric cars"].map((e) => (
                <a key={e} href={`/?q=${encodeURIComponent(e)}`}>
                  {e}
                </a>
              ))}
            </div>
          </section>

          <section className="features" aria-label="How it works">
            <div className="feat">
              <div className="feat-icon">❓</div>
              <h3>Questions people ask</h3>
              <p>Who, what, why, how, when, where — every angle your audience is searching for.</p>
            </div>
            <div className="feat">
              <div className="feat-icon">🔀</div>
              <h3>Comparisons & alternatives</h3>
              <p>Uncover vs., and, or, like — the comparisons your readers are already making.</p>
            </div>
            <div className="feat">
              <div className="feat-icon">🎡</div>
              <h3>Visual radial wheel</h3>
              <p>Export a shareable SVG or PNG question map — built for content teams and SEO decks.</p>
            </div>
          </section>
        </>
      )}

      <footer className="foot">
        <strong>AskTheCrowd</strong> · Open source · Google Autocomplete + Reddit · no login, no tracking
      </footer>
    </main>
  );
}

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
        <a className="brand" href="/">
          Ask<span>The</span>Crowd
        </a>
        <p className="tagline">See what the internet is asking — for any keyword.</p>
      </header>

      <SearchBox initial={seed} />

      {limited && <p className="notice">Easy there — too many searches. Wait a minute and try again.</p>}
      {data && <Results data={data} />}

      {!seed && (
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
      )}

      <footer className="foot">
        Open source · Google Autocomplete + Reddit · no login, no tracking
      </footer>
    </main>
  );
}

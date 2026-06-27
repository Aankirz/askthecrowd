// Plain GET form -> navigates to /?q=... -> server re-renders. No client JS needed.
export default function SearchBox({ initial }) {
  return (
    <form method="GET" action="/" className="searchbox" role="search">
      <input
        name="q"
        defaultValue={initial}
        placeholder="Enter a keyword or phrase…"
        aria-label="Keyword"
        autoComplete="off"
        autoFocus
        required
      />
      <button type="submit">Reveal</button>
    </form>
  );
}

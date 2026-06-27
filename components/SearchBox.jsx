// Plain GET form -> navigates to /?q=... -> server re-renders. No client JS needed.
// autoFocus only on the empty state, so loading a result page doesn't yank focus
// (and the viewport) to the top, away from the wheel.
export default function SearchBox({ initial, autoFocusInput = true }) {
  return (
    <form method="GET" action="/" className="searchbox" role="search">
      <input
        name="q"
        defaultValue={initial}
        placeholder="Enter a keyword or phrase…"
        aria-label="Search keyword or phrase"
        autoComplete="off"
        autoFocus={autoFocusInput}
        required
      />
      <button type="submit">Reveal</button>
    </form>
  );
}

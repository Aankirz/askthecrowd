"use client";
import { useState } from "react";

// GET form -> server re-renders. Client only for the submit loading state.
// autoFocus only on the empty state so result pages don't yank focus to the top.
export default function SearchBox({ initial, autoFocusInput = true }) {
  const [loading, setLoading] = useState(false);

  return (
    <form
      method="GET"
      action="/"
      className="searchbox"
      role="search"
      onSubmit={(e) => {
        if (e.currentTarget.q.value.trim()) setLoading(true);
      }}
    >
      <input
        name="q"
        defaultValue={initial}
        placeholder="Enter a keyword or phrase…"
        aria-label="Search keyword or phrase"
        autoComplete="off"
        autoFocus={autoFocusInput}
        required
      />
      <button type="submit" aria-label="Reveal questions" disabled={loading}>
        {loading ? (
          <>
            <Spinner />
            <span>Revealing…</span>
          </>
        ) : (
          <>
            <span>Reveal</span>
            <Arrow />
          </>
        )}
      </button>
    </form>
  );
}

function Arrow() {
  return (
    <svg className="arrow" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
      <path
        d="M5 12h13M13 6l6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Spinner() {
  // SMIL so it spins regardless of CSS context.
  return (
    <svg className="spin" viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" focusable="false">
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="38 60"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 12 12"
          to="360 12 12"
          dur="0.8s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}

"use client";

/**
 * The last resort.
 *
 * `error.tsx` cannot catch an error thrown by the root layout itself, because
 * the boundary lives inside it. `global-error.tsx` replaces the whole document,
 * which is why it renders its own `<html>` and `<body>` — and why it cannot use
 * anything from the layout, including fonts and the design system's CSS.
 *
 * So the styling here is inline and deliberately plain. It should almost never
 * be seen; if it is, the thing that failed is the layout, and importing the
 * design system to make this page pretty risks failing for the same reason.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          background: "#fff",
          color: "#1a1a1a",
        }}
      >
        <main style={{ maxWidth: "32rem", padding: "2rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, margin: 0 }}>Something went wrong</h1>
          <p style={{ marginTop: "0.75rem", color: "#666", lineHeight: 1.6 }}>
            The page failed to load. Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              padding: "0.625rem 1.25rem",
              border: "1px solid #1a1a1a",
              borderRadius: "0.375rem",
              background: "#1a1a1a",
              color: "#fff",
              fontSize: "0.9375rem",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          {error.digest ? (
            <p style={{ marginTop: "2rem", fontSize: "0.75rem", color: "#999" }}>
              Reference: <code>{error.digest}</code>
            </p>
          ) : null}
        </main>
      </body>
    </html>
  );
}

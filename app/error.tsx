"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ background: "#05060A", color: "#fff", fontFamily: "monospace", padding: "2rem" }}>
        <h2 style={{ color: "#FF6E6C" }}>Runtime error</h2>
        <pre style={{ whiteSpace: "pre-wrap", color: "#E7C36A", marginTop: "1rem" }}>
          {error?.message ?? "Unknown error"}
        </pre>
        {error?.digest && <p style={{ opacity: 0.5 }}>Digest: {error.digest}</p>}
        <button onClick={reset} style={{ marginTop: "1rem", padding: "0.5rem 1rem", cursor: "pointer" }}>
          Retry
        </button>
      </body>
    </html>
  );
}

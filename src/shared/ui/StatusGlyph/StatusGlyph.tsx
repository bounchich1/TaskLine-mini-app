// Part of Status: styled by Status.scss (the `status__glyph` and `status__check` elements).
/** The glyph of each status: an empty ring, a half, three quarters, a filled check. */
export function StatusGlyph({ status }: { status: string }) {
  return (
    <svg className="status__glyph" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      {status === 'closed' ? (
        <>
          <circle cx="7" cy="7" r="6.5" fill="currentColor" />
          <path
            className="status__check"
            d="m4.2 7.2 1.9 1.9 3.7-3.9"
            fill="none"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <>
          <circle cx="7" cy="7" r="5.75" fill="none" stroke="currentColor" strokeWidth="1.5" />
          {status === 'in_progress' ? (
            <path d="M7 3.5a3.5 3.5 0 0 1 0 7z" fill="currentColor" />
          ) : null}
          {status === 'awaiting_rating' ? (
            <path d="M7 3.5a3.5 3.5 0 1 1-3.5 3.5H7z" fill="currentColor" />
          ) : null}
        </>
      )}
    </svg>
  );
}

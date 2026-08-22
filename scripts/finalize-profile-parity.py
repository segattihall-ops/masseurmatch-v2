from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    file = Path(path)
    text = file.read_text()
    if old not in text:
        raise RuntimeError(f"pattern not found in {path}")
    file.write_text(text.replace(old, new, 1))

# Dynamic comparison pages live under /compare/[slug]. Keep the static /compare
# hub in site navigation; its hero now surfaces the two strongest competitors.
replace_once(
    "apps/web/src/components/site-nav-data.ts",
    '''      { href: "/compare", label: "Compare directories" },\n      { href: "/compare/masseurmatch-vs-masseurfinder", label: "vs MasseurFinder" },\n      { href: "/compare/masseurmatch-vs-rentmasseur", label: "vs RentMasseur" },''',
    '''      { href: "/compare", label: "Compare directories" },''',
)

# Reviews should be compact expandable cards rather than long blocks of text.
replace_once(
    "apps/web/src/components/public-profile-page.tsx",
    '''                <article\n                  key={review.id}\n                  className="rounded-2xl border border-border bg-bg-surface p-5"\n                >\n                  <div className="flex items-center justify-between gap-3">\n                    <p className="font-semibold text-text-primary">\n                      {review.public_label ?? review.reviewer_name ?? "Client review"}\n                    </p>\n                    {review.rating ? (\n                      <span className="text-sm font-semibold text-text-primary">\n                        {Number(review.rating).toFixed(1)} / 5\n                      </span>\n                    ) : null}\n                  </div>\n                  <p className="mt-3 whitespace-pre-line text-sm leading-6 text-text-secondary">\n                    {review.review_text}\n                  </p>\n                  {review.review_date ? (\n                    <p className="mt-3 text-xs text-text-secondary">\n                      {formatDate(review.review_date)}\n                    </p>\n                  ) : null}\n                </article>''',
    '''                <details\n                  key={review.id}\n                  className="group rounded-2xl border border-border bg-bg-surface p-5"\n                >\n                  <summary className="cursor-pointer list-none">\n                    <div className="flex items-center justify-between gap-3">\n                      <div>\n                        <p className="font-semibold text-text-primary">\n                          {review.public_label ?? review.reviewer_name ?? "Client review"}\n                        </p>\n                        {review.review_date ? (\n                          <p className="mt-1 text-xs text-text-secondary">\n                            {formatDate(review.review_date)}\n                          </p>\n                        ) : null}\n                      </div>\n                      <div className="flex items-center gap-3">\n                        {review.rating ? (\n                          <span className="text-sm font-semibold text-text-primary">\n                            {Number(review.rating).toFixed(1)} / 5\n                          </span>\n                        ) : null}\n                        <span\n                          aria-hidden="true"\n                          className="text-lg text-text-secondary transition group-open:rotate-45"\n                        >\n                          +\n                        </span>\n                      </div>\n                    </div>\n                    <p className="mt-2 text-xs font-medium text-brand-secondary group-open:hidden">\n                      Read review\n                    </p>\n                  </summary>\n                  <p className="mt-4 whitespace-pre-line border-t border-border pt-4 text-sm leading-6 text-text-secondary">\n                    {review.review_text}\n                  </p>\n                </details>''',
)

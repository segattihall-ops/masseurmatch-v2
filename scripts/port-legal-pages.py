#!/usr/bin/env python3
"""
Port legal/policy pages from the old repo to the new one.

The prose is legally reviewed, so it is moved verbatim. What is dropped is
presentation the new design system supplies differently: decorative icons,
old-repo className values, and JSON-LD blocks (the new repo emits structured
data from its own metadata layer).

JSX -> HTML transformation:
  <JsonLd ... />            removed
  <Icon ... />              removed (self-closing capitalised components)
  <Link href="x">           -> <a href="x">
  className="..."           removed
  {"..."} / {'...'}         -> the literal string
  &apos; etc                left alone (valid HTML entities)
"""
import os
import re
import sys

OLD = "/workspace/x-rankflow-media-group/masseurmatch"
NEW = "/home/user/masseurmatch-v2/apps/web/src/app"

# Semantic tags to keep. Everything else capitalised is a component.
KEEP = {
    "p", "h1", "h2", "h3", "h4", "ul", "ol", "li", "strong", "em", "b", "i",
    "a", "br", "hr", "table", "thead", "tbody", "tr", "th", "td", "blockquote",
    "code", "pre", "span", "div", "section",
}


def read(path):
    with open(path, encoding="utf-8") as fh:
        return fh.read()


def extract_meta(src, slug):
    """Pull title and description out of createPageMetadata or a metadata object."""
    title = None
    desc = None
    m = re.search(r'title:\s*"((?:[^"\\]|\\.)*)"', src)
    if m:
        title = m.group(1)
    m = re.search(r'description:\s*\n?\s*"((?:[^"\\]|\\.)*)"', src)
    if m:
        desc = m.group(1)
    if not title:
        title = slug.replace("-", " ").title()
    if not desc:
        desc = f"{title} — MasseurMatch."
    # Old titles often carry a " | MasseurMatch" suffix the new layout adds.
    title = re.sub(r"\s*\|\s*MasseurMatch.*$", "", title).strip()
    return title, desc


def extract_last_updated(src):
    m = re.search(r'lastUpdated=\{?"([^"]+)"', src)
    if m:
        return m.group(1)
    m = re.search(r'Last updated:?\s*\{?"?([A-Z][a-z]+ \d{1,2}, \d{4})', src)
    if m:
        return m.group(1)
    return None


def strip_jsx_expressions(body):
    """{"literal"} -> literal.  Drop other single-brace expressions."""
    body = re.sub(r'\{\s*"((?:[^"\\]|\\.)*)"\s*\}', lambda m: m.group(1), body)
    body = re.sub(r"\{\s*'((?:[^'\\]|\\.)*)'\s*\}", lambda m: m.group(1), body)
    return body


def remove_component(body, name):
    """Remove <Name ... /> and <Name ...> ... </Name> (non-nested)."""
    body = re.sub(rf"<{name}\b[^>]*/>", "", body, flags=re.S)
    body = re.sub(rf"<{name}\b[^>]*>.*?</{name}>", "", body, flags=re.S)
    return body


def jsx_to_html(body, arrays=None):
    if arrays:
        body = expand_maps(body, arrays)

    # Inline `{[ ... ].map(link => ...)}` blocks are related-link footers, not
    # policy text. LegalPage renders the legal nav itself, so these are dropped
    # rather than expanded — duplicating them would give every page two navs.
    body = drop_inline_maps(body)

    body = remove_component(body, "JsonLd")
    body = remove_component(body, "Script")

    # <Link href="x" ...>text</Link> -> <a href="x">text</a>.
    # DOTALL: attributes are frequently wrapped across lines, and a single-line
    # pattern silently leaves a <Link> open against an </a> close.
    body = re.sub(r'<Link\s+[^>]*?href=\{?"([^"]+)"\}?[^>]*?>', r'<a href="\1">', body, flags=re.S)
    body = re.sub(r"<Link\b[^>]*?>", "<a>", body, flags=re.S)
    body = body.replace("</Link>", "</a>")

    # Drop remaining capitalised components, self-closing first.
    body = re.sub(r"<[A-Z][A-Za-z0-9]*\b[^>]*/>", "", body, flags=re.S)
    for _ in range(6):
        new = re.sub(
            r"<([A-Z][A-Za-z0-9]*)\b[^>]*>(.*?)</\1>", r"\2", body, flags=re.S
        )
        if new == body:
            break
        body = new

    # Attributes: whitelist `href`, drop everything else.
    #
    # A denylist was tried first and leaked — `key={i}` and
    # `dangerouslySetInnerHTML={...}` survived into the output and became empty
    # JSX expressions. Whitelisting is the only version that cannot leak.
    def clean_attrs(match):
        tag, attrs = match.group(1), match.group(2)
        # `=>` contains a `>`, so an unexpanded arrow function inside a JSX
        # expression makes this regex swallow code as attributes. Leave such a
        # match alone; the unexpanded-map check downstream will catch it.
        if "=>" in attrs:
            return match.group(0)
        href = re.search(r'href=\{?"([^"]+)"\}?', attrs)
        keep = f' href="{href.group(1)}"' if href and tag == "a" else ""
        closing = "/" if attrs.rstrip().endswith("/") else ""
        return f"<{tag}{keep}{closing}>"

    body = re.sub(r"<([a-z][a-z0-9]*)((?:[^<>]|\{[^{}]*\})*?)>", clean_attrs, body, flags=re.S)

    body = strip_jsx_expressions(body)

    # Any brace expression still standing references old-repo scope. Drop it
    # rather than leave a stray token that will not parse.
    body = re.sub(r"\{[^{}<>]*\}", "", body)

    body = escape_text_entities(body)

    # LegalPage renders the title and the "Last updated" line itself. Pages
    # ported from their own layout carry both in the body too, so they appear
    # twice unless removed here.
    body = re.sub(r"<h1>.*?</h1>", "", body, flags=re.S)
    body = re.sub(r"<p>\s*Last updated:?[^<]*</p>", "", body, flags=re.S | re.I)
    # An eyebrow label above the old title ("Intellectual Property", "Legal"),
    # left dangling once the h1 above it is gone.
    body = re.sub(r"^\s*<p>[A-Z][A-Za-z &]{2,40}</p>\s*", "", body.lstrip(), flags=re.S)

    # Collapse now-empty wrappers and blank runs.
    for _ in range(4):
        body = re.sub(r"<(div|section)>\s*</(div|section)>", "", body)
    body = re.sub(r"\n{3,}", "\n\n", body)
    return body.strip()


def parse_object_arrays(src):
    """
    Find `const NAME = [ {...}, ... ];` arrays of string-valued objects.

    Several policy pages hold their content in such an array and render it with
    `.map()`. Dropping the map would silently delete most of the page, so the
    arrays are expanded into static markup instead.
    """
    arrays = {}
    for m in re.finditer(r"const\s+([A-Za-z_$][\w$]*)\s*(?::[^=]+)?=\s*\[", src):
        name = m.group(1)
        i = m.end() - 1
        depth = 0
        for j in range(i, len(src)):
            if src[j] == "[":
                depth += 1
            elif src[j] == "]":
                depth -= 1
                if depth == 0:
                    break
        else:
            continue
        block = src[i : j + 1]
        objects = []
        for obj in re.finditer(r"\{(.*?)\}", block, flags=re.S):
            fields = re.findall(r'(\w+)\s*:\s*"((?:[^"\\]|\\.)*)"', obj.group(1))
            if fields:
                objects.append(fields)
        if objects:
            arrays[name] = objects
            continue
        # An array of plain strings — several policy pages list requirements
        # this way rather than as objects.
        strings = re.findall(r'"((?:[^"\\]|\\.)*)"', block)
        if strings:
            arrays[name] = [[("__item__", value)] for value in strings]
    return arrays


def expand_maps(body, arrays):
    """Replace `{NAME.map(...)}` with static markup built from the array."""
    for name, objects in arrays.items():
        pattern = re.compile(r"\{\s*" + re.escape(name) + r"\.map\s*\(")
        m = pattern.search(body)
        while m:
            depth = 0
            end = None
            for j in range(m.start(), len(body)):
                if body[j] == "{":
                    depth += 1
                elif body[j] == "}":
                    depth -= 1
                    if depth == 0:
                        end = j + 1
                        break
            if end is None:
                break
            parts = []
            if all(len(f) == 1 and f[0][0] == "__item__" for f in objects):
                parts.append("<ul>")
                parts.extend(f"<li>{f[0][1]}</li>" for f in objects)
                parts.append("</ul>")
            else:
                for fields in objects:
                    # First string field reads as the item's heading; the rest
                    # are its prose, in source order.
                    head = fields[0][1]
                    parts.append(f"<h3>{head}</h3>")
                    for _, value in fields[1:]:
                        if value.startswith("/") or value.startswith("http"):
                            continue
                        parts.append(f"<p>{value}</p>")
            body = body[: m.start()] + "\n".join(parts) + body[end:]
            m = pattern.search(body)
    return body


def drop_inline_maps(body):
    """Remove `{[ ... ].map( ... )}` expressions, braces balanced."""
    while True:
        m = re.search(r"\{\s*\[", body)
        if not m:
            return body
        depth = 0
        end = None
        for j in range(m.start(), len(body)):
            if body[j] == "{":
                depth += 1
            elif body[j] == "}":
                depth -= 1
                if depth == 0:
                    end = j + 1
                    break
        if end is None:
            return body
        if ".map(" not in body[m.start() : end]:
            return body
        body = body[: m.start()] + body[end:]


def escape_text_entities(body):
    """
    Escape quotes in TEXT nodes only.

    `react/no-unescaped-entities` fails the build on a bare " or ' in JSX text,
    and this prose is full of both. Attribute values must be left alone, so the
    replacement runs on the spans between tags rather than over the whole
    string.
    """

    def fix(match):
        text = match.group(0)
        return text.replace('"', "&quot;").replace("'", "&rsquo;")

    return re.sub(r"(?<=>)[^<>]+(?=<)", fix, body)


def extract_body(src):
    """Return the inner content of the page's main region."""
    m = re.search(r"<LegalPage\b[^>]*>(.*)</LegalPage>", src, flags=re.S)
    if m:
        return m.group(1)
    # Anchor to the DEFAULT EXPORT, not the first `return (` in the file.
    # Several pages define a local helper component above the page, and an
    # unanchored match captures that helper instead — producing a file that
    # parses as neither.
    m = re.search(r"export default function\s+\w*\s*\([^)]*\)\s*\{", src)
    if m:
        tail = src[m.end():]
        r = re.search(r"return\s*\(\s*(.*)\s*\);\s*\}\s*$", tail, flags=re.S)
        if r:
            return r.group(1)
    return None


TEMPLATE = '''import type {{ Metadata }} from "next";

import {{ LegalPage }} from "@/components/legal-page";
import {{ absoluteUrl, SITE_NAME }} from "@/lib/site";

const TITLE = {title!r};
const DESCRIPTION = {desc!r};
const PATH = "/{slug}";

export const metadata: Metadata = {{
  title: TITLE,
  description: DESCRIPTION,
  alternates: {{ canonical: absoluteUrl(PATH) }},
  openGraph: {{
    type: "website",
    url: absoluteUrl(PATH),
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
  }},
}};

export default function Page() {{
  return (
    <LegalPage title={{TITLE}} path={{PATH}}{last_updated}>
{body}
    </LegalPage>
  );
}}
'''


def indent(body, spaces=6):
    pad = " " * spaces
    return "\n".join(pad + line if line.strip() else "" for line in body.split("\n"))


def main(slugs):
    for slug in slugs:
        src_path = os.path.join(OLD, "src/app", slug, "page.tsx")
        if not os.path.exists(src_path):
            print(f"  SKIP {slug}: no source")
            continue
        src = read(src_path)
        title, desc = extract_meta(src, slug)
        body = extract_body(src)
        if body is None:
            print(f"  FAIL {slug}: could not find body")
            continue
        html = jsx_to_html(body, parse_object_arrays(src))
        if len(html) < 200:
            print(f"  FAIL {slug}: body too short after transform ({len(html)}b)")
            continue

        lu = extract_last_updated(src)
        lu_attr = f' lastUpdated="{lu}"' if lu else ""

        out_dir = os.path.join(NEW, slug)
        os.makedirs(out_dir, exist_ok=True)
        with open(os.path.join(out_dir, "page.tsx"), "w", encoding="utf-8") as fh:
            fh.write(
                TEMPLATE.format(
                    title=title,
                    desc=desc,
                    slug=slug,
                    last_updated=lu_attr,
                    body=indent(html),
                )
            )
        print(f"  ok   {slug:24} {len(html):6}b")


if __name__ == "__main__":
    main(sys.argv[1:])

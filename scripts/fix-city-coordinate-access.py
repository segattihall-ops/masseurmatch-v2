from pathlib import Path

path = Path("packages/db/actions/directory.ts")
text = path.read_text()
text = text.replace(
    'import { createAnonClient, hasSupabaseCredentials } from "../client";',
    'import { createAnonClient, createServiceClient, hasSupabaseCredentials } from "../client";',
    1,
)
text = text.replace(
    ''' * Everything here reads through the **anon** client, so Postgres RLS is the\n * access control: a logged-out visitor and this code see exactly the same\n * rows. The explicit `profile_status`/`visibility_status` filters mirror the\n * live policy rather than replacing it.''',
    ''' * Public profile rows and photos read through the **anon** client, so Postgres\n * RLS remains the visibility boundary. The only service-role lookup in this\n * module reads non-sensitive city centroid metadata because `cities` is not\n * granted to anon; those coordinates are used only for approximate service-area\n * maps and distance ordering, never to reveal a provider address.''',
    1,
)
old = '''  const client = createAnonClient();\n  const { data, error } = await client\n    .from("cities")\n    .select("slug,state,state_code,latitude,longitude");'''
new = '''  const client = createServiceClient();\n  const { data, error } = await client\n    .from("cities")\n    .select("slug,state,state_code,latitude,longitude");'''
if text.count(old) != 1:
    raise RuntimeError(f"expected one hydrate city lookup, found {text.count(old)}")
text = text.replace(old, new, 1)
old = '''  const client = createAnonClient();\n  const { data, error } = await client\n    .from("cities")\n    .select("slug,state,state_code,latitude,longitude")\n    .eq("slug", filters.city);'''
new = '''  const client = createServiceClient();\n  const { data, error } = await client\n    .from("cities")\n    .select("slug,state,state_code,latitude,longitude")\n    .eq("slug", filters.city);'''
if text.count(old) != 1:
    raise RuntimeError(f"expected one search-origin city lookup, found {text.count(old)}")
text = text.replace(old, new, 1)
path.write_text(text)

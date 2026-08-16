import { Button } from "@masseurmatch/ui";

import { signOut } from "./sign-in/actions";

/**
 * Sign out.
 *
 * A form posting to a server action rather than an onClick handler, so it works
 * without JavaScript and needs no client boundary of its own.
 */
export function SignOutButton() {
  return (
    <form action={signOut}>
      <Button type="submit" variant="ghost" size="sm">
        Sign out
      </Button>
    </form>
  );
}

---
title: OAuth — What is the purpose of PKCE?
created: October 29, 2026
# Not a real post. Built only with SHOW_FIXTURES=1, at /post/_fixtures/kitchen-sink.
# Shows the Markdown syntax for every element in design/HANDOFF.md.
subtitle: How does it work? (Fixture — every post element, mirroring design/reference)
icons:
  Resource owner: role
  Client: role
  Authorization server: role
  Resource server: role
  Code verifier: artifact
  Code challenge: artifact
  Code challenge method: artifact
  Authorization code: artifact
  Back channel: channel
  Front channel: channel
related:
  - label: Also on this blog
    title: Git-worktree in my own words
    href: /post/git/worktree
    description: Why are work trees so awesome?
  - label: Spec
    title: "RFC 7636: Proof Key for Code Exchange"
    href: https://www.rfc-editor.org/rfc/rfc7636
    description: The original spec. Section 4 is the whole mechanism in two pages.
  - label: Further reading
    title: An Illustrated Guide to OAuth and OpenID Connect
    href: https://developer.okta.com/blog/2019/10/21/illustrated-guide-to-oauth-and-oidc
    description: Okta's stick-figure tour of the flow PKCE plugs into.
---
## What is it at a very high level?

In its most general terms, it's **challenge-response authentication**. It's how a server knows that two separate requests it receives are from the same entity. When one request kicks off the request for something very valuable, and the other request receives what is requested, the server has to somehow know the requests are from the same entity. In the context of PKCE, this “very valuable” thing is an *access token* which allows the entity to access a set of APIs.

## How it works, with a web server in play †

When a user opts to use a social login — Google, Facebook, Apple, etc. — to log into an app, the back-end creates a random string and a hash of that string.

```js title="pkce.js" {2-3,11} caption="Steps 1–2: make the random string, then hash it."
// The code verifier: a high-entropy random string
const bytes = crypto.getRandomValues(new Uint8Array(32));
const codeVerifier = base64url(bytes);

// The code challenge: SHA-256 of the verifier
const digest = await crypto.subtle.digest(
  "SHA-256",
  new TextEncoder().encode(codeVerifier)
);
const codeChallenge = base64url(new Uint8Array(digest));
```

The browser is then redirected to Google, Facebook, Apple, etc., with the hash and the algorithm used to make it as query parameters.

```js title="server/callback.js" {6-7} caption="The back channel: the code and the original string, together. A long line follows to check wrapping on phones."
const res = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "authorization_code",
    code, // from the redirect
    code_verifier: codeVerifier, // the unhashed string
    redirect_uri: "https://app.example.com/callback",
    client_id: CLIENT_ID,
  }),
});
const { access_token } = await res.json();
```

Once the web server has the access token, it can use it to access API endpoints provided by the social site.

† When an app does not have a web server, the random string is saved in `sessionStorage` and JavaScript will make a `fetch` call to exchange the code and the random string for an access token.

:::note[Another note, written as a directive]{#directive-note}
Notes can also be written with `:::note[Label]{#id}` … `:::`.
:::

### The flow in five steps

1. The client creates a **code verifier** and hashes it into a **code challenge**.
2. The browser is redirected to the authorization server with the challenge and the method in the URL — the *front channel*.
3. The user logs in and consents; the authorization server redirects back with an **authorization code**.
4. The client sends the code *and the original verifier* straight to the authorization server — the *back channel*.
5. The server hashes the verifier, compares it to the challenge and, if they match, returns the **access token**.

::figure{wide="pkce-sequence-wide.svg" narrow="pkce-sequence-narrow.svg" caption="Only the hash crosses the front channel. The original string travels once, server to server, at the very end."}

## Here's what OAuth calls each piece

- **Resource owner:** the user
- **Client:** the app the user is logging into
- **Authorization server:** Google, Facebook, Apple, etc., where the user logs in and consents
- **Resource server:** the API holding the user's data
- **Code verifier:** the random string
- **Code challenge:** the hash of the random string
- **Code challenge method:** the algorithm used to make the hash (e.g. `S256`)
- **Authorization code:** the code sent back in the redirect
- **Back channel:** the direct server-to-server request
- **Front channel:** browser redirects carrying data in the URL

## Why is it called PKCE?

PKCE stands for **Proof Key for Code Exchange**. The client is basically saying:

> Here's a key that is proof that I am the same entity that started the flow.
>
> — The client, to the authorization server

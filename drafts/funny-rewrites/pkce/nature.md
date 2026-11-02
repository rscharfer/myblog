title: OAuth - What is the purpose of PKCE?
subtitle: A natural history of the code exchange
---

## What is it at a very high level?

Here, on the vast plains of the internet, two requests arrive at the same watering hole some seconds apart. To the untrained eye they are strangers. But the authorization server has evolved a remarkable instinct. It can tell whether both requests came from the same creature.

This is challenge-response authentication, one of the oldest survival strategies on the web. The first request sets out in search of something precious. The second returns to collect it. In the world of PKCE, that precious thing is the *access token*, which lets its holder into a set of APIs, and the server will not surrender it to any animal that simply wanders up claiming to be the one who asked.

## How it works (at a high level) in the context of the authorization code flow with a web server in play †

It begins, as so many things do, with a user choosing to log in with Google. Or Facebook, or Apple. The species vary. The behaviour does not.

Deep in its burrow, the back end produces a random string, and from it, a hash. The string it keeps hidden, like a squirrel with its last acorn before winter. The hash it sends out into the open: the browser is redirected to the social site with the hash, and the name of the algorithm that made it, riding along as query parameters, in full view of every predator on the front channel. This is not recklessness. A hash cannot be run backwards, so an onlooker has nothing to take.

The user logs in and consents to the app reading their data. The authorization server then sends the browser home along the redirect, carrying an authorization code in its mouth.

Now comes the moment the whole migration has been building to. The web server returns to the social site directly and presents the authorization code together with the *actual string*. The social site hashes that string with the very algorithm named in the first request, and compares. If the two hashes match, it knows, with the quiet certainty of nature, that both requests came from the same creature. Only the one that made the hash could still be holding the original string. The access token is handed over.

With it, the web server may now feed freely at the social site's API endpoints.

† Some apps are statically built and live entirely on a CDN, with no web server to return to. These hardy creatures adapt. The front end tucks the random string into `sessionStorage`, then uses JavaScript's `fetch` to trade the random string and the authorization code for the access token itself. Many such apps then bury the access token in `localStorage`, and seasoned observers can only watch. The IETF recommends a [backend-for-frontend](https://datatracker.ietf.org/doc/rfc10017/), or at minimum keeping the token in memory.

## Here's what OAuth calls each piece of the flow above

Naturalists, being naturalists, have given every member of the ecosystem a formal name.

- **Resource owner:** the user, whose data this entire food chain exists to reach
- **Client:** the app the user is logging into
- **Authorization server:** Google, Facebook, Apple, etc., where the user logs in and consents
- **Resource server:** the API holding the user's data
- **Code verifier:** the random string, kept in the burrow
- **Code challenge:** the hash of the random string, sent out into the open
- **Code challenge method:** the algorithm used to make the hash (e.g. `S256`)
- **Authorization code:** the code carried home in the redirect
- **Back channel:** the direct server-to-server request, out of sight of the herd
- **Front channel:** browser redirects carrying data in the URL, where anyone can watch

## What problem did it solve?

PKCE evolved in response to two predators.

### Cross-Site Request Forgery attacks

The first is a mimic. The malicious user goes through the whole login themselves, with *their* credentials, gives consent at the authorization server, and intercepts the callback link with the newly minted authorization code attached. They do not use it. They wait.

Somewhere downstream, an innocent person is lured into opening that link. The code is exchanged for a token, the access token is mapped to the bad actor, and the innocent person is now logged in as the bad actor without knowing it. Like a cuckoo's egg laid in another bird's nest, everything the victim does from then on, including the personal information they type, is raised under the bad actor's account until they notice.

With PKCE, the attacker's code is bound to the hash the attacker's own session sent. The victim's client never held the matching string, so the exchange fails.

### Authorization Code Interception Attack

This is the "opposite" problem, found mainly in the mobile habitat. After the victim logs in and provides their consent, the authorization server directs the browser to open a URI, which can use a custom protocol such as `myapp://home-view...`. These protocols do not have to be unique. A malicious app can register the same one, the way some birds have learned to imitate another species' call, and intercept the authorization code. The bad actor could then log on as the victim.

With PKCE, the stolen code is useless on its own. The random string never left the real app.

## Why doesn't the authorization server just give the client the access token to begin with?

It once did. Before CORS, a browser-only app couldn't make the cross-origin POST to the authorization server's token endpoint, so apps without a back end couldn't do the code exchange at all. In that environment, a different species thrived: the "implicit flow." The authorization server skipped the code and put the access token directly in the redirect URL.

That left the token exposed on the front channel, where it could end up in browser history, be read by any script on the page, or be carried off somewhere else through a manipulated redirect. The app also had no way to verify that the token was issued for its own login. When CORS arrived and made the exchange possible from the browser, the environment changed, and the authorization code flow with PKCE replaced it. The IETF's [guidance for browser-based apps](https://datatracker.ietf.org/doc/rfc10017/) now lists the implicit flow as deprecated. It is not quite extinct. But it is no longer seen in healthy populations.

## Why is it called PKCE?

PKCE stands for Proof Key for Code Exchange, and is pronounced, rather charmingly, "pixie." The client presents the unhashed *key* as *proof* that it is the same entity that began the *code* *exchange*. In the language of the plains, it is saying: "Here is a key that proves I am the one who started this."

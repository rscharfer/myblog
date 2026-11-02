title: OAuth - What is the purpose of PKCE?
subtitle: A tall, pale man explains the code exchange
---

## What is it at a very high level?

Folks, at its core this is challenge-response authentication, which is a fancy way of saying a server needs to know that two separate requests came from the same entity. I relate to this deeply. I am six-foot-four with hair like a lit match, and every time I go back to my dry cleaner, the man behind the counter squints at me like I'm a forgery. "Prove it," he says. So I hand him the little pink ticket. One visit starts the transaction, a later visit collects the valuables, and somebody has to prove they're the same guy.

In PKCE, the valuable thing isn't my one good suit. It's an *access token*, which lets whoever holds it into a set of APIs. Frankly, it's worth more than the suit.

## How it works (at a high level) in the context of the authorization code flow with a web server in play †

A user decides to log into an app with Google, Facebook, Apple, or one of the other trillion-dollar companies that would love to know where you are at all times.

Immediately, the back end springs into action. It creates a random string and a hash of that string. Then the browser is redirected to Google, or whoever, with the hash and the name of the hashing algorithm as query parameters. The string itself stays home. You don't bring the string. Nobody brings the string. The string is sacred.

The user logs in and consents to the app using their data ("Yes, Google, take it, take all of it"), and the authorization server redirects the browser back to the app with an authorization code tucked into the URL like a mint on a hotel pillow.

Now the web server contacts the social site directly and hands over the *actual string* along with the authorization code. The social site hashes that string with the algorithm it got in the first request. If the new hash is identical to the old hash, it knows both requests came from the same entity, and it hands over the access token. How can it be sure? Because you cannot reverse-engineer a hash back into its original string. Brilliant mathematicians have tried. I have also tried, in my dressing room, with a pencil, for most of an afternoon. Nothing.

With the access token, the web server can call the social site's API endpoints, and everyone goes home happy. Except me. I'm still in the dressing room with the pencil.

† Now let's say your app is statically built and served from a CDN, like a sandwich from an airport vending machine. There's no web server to do the exchange. No problem! The front end keeps the random string in `sessionStorage` and makes a `fetch` call itself, sending the random string and the authorization code in exchange for the access token. A lot of apps then save the token in `localStorage`, which is roughly as secure as how I store my passwords: on a Post-it, on my forehead. The IETF recommends a [backend-for-frontend](https://datatracker.ietf.org/doc/rfc10017/), or at minimum keeping the token in memory. I keep nothing in memory. That's what the Post-it is for.

## Here's what OAuth calls each piece of the flow above

OAuth was designed by a committee, and committees love to name things. Please imagine me reading these aloud in my most distinguished voice, the one I use for wine I can't afford:

- **Resource owner:** the user
- **Client:** the app the user is logging into
- **Authorization server:** Google, Facebook, Apple, etc., where the user logs in and consents
- **Resource server:** the API holding the user's data
- **Code verifier:** the random string. The sacred one.
- **Code challenge:** the hash of the random string
- **Code challenge method:** the algorithm used to make the hash (e.g. `S256`, which sounds like a droid but is SHA-256)
- **Authorization code:** the code sent back in the redirect. The pillow mint.
- **Back channel:** the direct server-to-server request
- **Front channel:** browser redirects carrying data in the URL, where everyone can see it, like my ankles in any pair of pants

## What problem did it solve?

PKCE solves two security problems, which is two more than I have ever solved.

### Cross-Site Request Forgery attacks

A malicious user logs into the client with *their* credentials at the authorization server, gives consent, and intercepts the callback link with the newly minted authorization code still attached. Then they trick an innocent person into opening that link. The code gets exchanged for the token, the access token is mapped to the bad actor, and the innocent person is now logged in as the bad actor.

This is the digital equivalent of someone slipping you their coat at a party, and suddenly you're the one getting angry voicemails from their ex. Until the victim notices, everything they do, including any personal information they type, goes straight into the bad actor's account.

With PKCE, the victim's client never had the bad actor's random string, so the exchange fails. The coat goes back to its owner, voicemails and all.

### Authorization Code Interception Attack

This is the "opposite" problem, and it was mainly a problem for mobile apps. After the victim logs in and consents, the authorization server directs the browser to open a URI, which can use a custom protocol such as `myapp://home-view...`. And these protocols do not have to be unique. That shocked me. You can't just have two of something! There can only be one Conan. (I'm told there are several. One is a barbarian. He's doing much better than me.)

So a malicious app registers the same protocol, intercepts the authorization code, and logs on as the victim. With PKCE, the impostor app has the code but not the string, and without the string, the code is worthless. Like my autograph.

## Why doesn't the authorization server just give the client the access token to begin with?

Before CORS, a browser-only app couldn't make the cross-origin POST to the authorization server's token endpoint, so apps without a back end couldn't do the code exchange at all. The workaround was the OAuth "implicit flow": the authorization server skipped the code and put the access token directly in the redirect URL. That's like mailing someone cash in a clear envelope with "CASH" written on it in my handwriting, which is very large.

With the token on the front channel, it could end up in browser history, be read by any script on the page, or be sent somewhere else through a manipulated redirect. The app also had no way to verify that the token was issued for its own login. Once CORS made the exchange possible from the browser, the authorization code flow with PKCE replaced it, and the IETF's [guidance for browser-based apps](https://datatracker.ietf.org/doc/rfc10017/) now lists the implicit flow as deprecated. It's been moved to a less prestigious time slot. I know how it feels.

## Why is it called PKCE?

PKCE stands for Proof Key for Code Exchange, and it's pronounced "pixie," which is adorable, and also what my mother called me until I was thirty-one. The client presents the unhashed *key* as *proof* that it's the same entity that started the *code* *exchange*. It's basically saying, "Here's a key that proves I'm the one who started this." Which is exactly what I say to my dry cleaner. He still doesn't believe me.

title: OAuth - What is the purpose of PKCE?
subtitle: The hash always rings twice
---

## What is it at a very high level?

The name's Authorization Server. I work the token desk. All day, every day, I hand out access tokens, and every one of them opens doors to a set of APIs somebody out there would kill to get into.

The job is simple. Keeping it simple is the hard part. A request walks in and says it wants a token. Later, another request walks in to collect. Two requests, two different times, and I'm supposed to know they're the same mug. That's challenge-response authentication, pal. In this town it's the only thing standing between a token and the wrong pair of hands.

## How it works (at a high level) in the context of the authorization code flow with a web server in play †

It was a Tuesday. It's always a Tuesday. A user clicked a social login on some app. I've worked Google, Facebook, Apple. The uniform changes. The job doesn't.

Back at the app, the back end did something smart. It cooked up a random string, ran it through a hash, and kept the string in its breast pocket. The hash it sent to me by way of the browser, stuffed into the query parameters of a redirect along with the name of the algorithm it used. Out on the front channel, where anybody can read a URL over your shoulder. Didn't matter. A hash is a one-way street. Nobody drives it back to the string.

The user logged in at my place and consented to the app using their data. I slipped an authorization code into the redirect and sent the browser home.

Then the web server came to see me. Not through the browser this time. Direct. It laid the authorization code on my desk and laid the *actual string* next to it.

I hashed that string with the same algorithm I'd been told about in the first request and held the result up to the light next to the hash I already had. A match. Only one guy could be carrying that string: the guy who made the hash. I slid the access token across the desk.

What he did with it at my API endpoints was his business.

† Some apps don't have a web server. Built static, served off a CDN, no back office, no back door. Those apps keep the random string in `sessionStorage` and make the trade themselves with a JavaScript `fetch`: random string and authorization code in, access token out. Plenty of them stash the token in `localStorage` afterwards, like leaving the piece in an unlocked glovebox. The IETF says use a [backend-for-frontend](https://datatracker.ietf.org/doc/rfc10017/), or at minimum keep the token in memory. Nobody listens to the IETF until it's too late.

## Here's what OAuth calls each piece of the flow above

Every case has a cast. The paperwork names them like this:

- **Resource owner:** the user. The one whose stuff everybody's after.
- **Client:** the app the user is logging into
- **Authorization server:** Google, Facebook, Apple, etc. Me. Where the user logs in and consents
- **Resource server:** the API holding the user's data
- **Code verifier:** the random string in the breast pocket
- **Code challenge:** the hash of the random string
- **Code challenge method:** the algorithm used to make the hash (e.g. `S256`)
- **Authorization code:** the code sent back in the redirect
- **Back channel:** the direct server-to-server request. The back door.
- **Front channel:** browser redirects carrying data in the URL. The street.

## What problem did it solve?

Before PKCE, two kinds of grifter worked my block.

### Cross-Site Request Forgery attacks

The first was a con man. He'd log into the client with *his* credentials, consent at my desk, then intercept the callback link with his freshly minted authorization code attached. He didn't cash it. He mailed it to a mark.

The mark opens the link. The code gets exchanged for a token, the token belongs to the con man, and now the mark is logged in as the bad actor and doesn't know it. Every address, every personal detail they type gets filed under the con man's name until they notice whose name is on the door.

With PKCE, that code is tied to the hash the con man's own session sent me. The mark's client never had his string, so it can't prove a thing, and I don't hand over a thing.

### Authorization Code Interception Attack

This one's the mirror image, and it ran mostly in the mobile racket. After the victim logs in and consents, I tell the browser to open a URI, and on a phone that can use a custom protocol like `myapp://home-view...`. Thing is, those protocols don't have to be unique. A crooked app registers the same one, waits by the door, and catches the code meant for the real app. Then he logs on as the victim.

With PKCE, the stolen code is worth nothing without the string, and the string never left the real app's pocket.

## Why doesn't the authorization server just give the client the access token to begin with?

I used to. Back before CORS, a browser-only app couldn't make the cross-origin POST to my token endpoint, so apps without a back end couldn't do the code exchange at all. So we ran the "implicit flow." Skip the code. Put the access token right in the redirect URL.

That put the token on the front channel. Bad neighbourhood. It could end up in browser history, get read by any script on the page, or get sent somewhere else through a crooked redirect. And the app had no way to check the token had been issued for its own login. Once CORS made the exchange possible from the browser, the authorization code flow with PKCE took over the beat, and the IETF's [guidance for browser-based apps](https://datatracker.ietf.org/doc/rfc10017/) now lists the implicit flow as deprecated. Some of the old-timers miss it. The old-timers also miss smoking indoors.

## Why is it called PKCE?

Proof Key for Code Exchange. The client shows me the unhashed *key* as *proof* it's the same one that started the *code* *exchange*. "Here's a key," it tells me. "Proof I'm the one who started this." People pronounce it "pixie." Cute name for something that's kept a lot of tokens out of the river.

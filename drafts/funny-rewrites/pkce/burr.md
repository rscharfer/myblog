title: OAuth - What is the purpose of PKCE?
subtitle: Why can't they just give you the token?
---

## What is it at a very high level?

All right, look. Here's the deal. You got a server. Two requests show up. And the server has to figure out if they came from the same guy. That's it. That's the whole thing. That's challenge-response authentication. People act like it's rocket science. It's a coat check.

And why does it care? Because the first request kicks off asking for something really valuable, and the second one picks it up. In PKCE that valuable thing is an *access token*, which gets you into a bunch of APIs. So yeah, you'd want to make sure it's the same guy. You don't just hand that to whoever walks up. "Hi, I'm here for the token." Oh yeah? Says who?

## How it works (at a high level) in the context of the authorization code flow with a web server in play †

So you go to log into some app, and of course it wants you to sign in with Google. Or Facebook. Or Apple. Everybody wants you to sign in with somebody else. Nobody wants your password anymore. And I'm not complaining! I can't remember my passwords. I got one password and it's been in eleven data breaches.

So the back end makes a random string. Then it makes a hash of that string. Then it sends the browser over to Google with the hash and the name of the algorithm it used, right there in the query parameters. Out in the open! And everybody goes, "Oh, isn't that dangerous?" No! It's a hash! You can't turn it back into the string! That's the whole point of a hash! Put it on a billboard, I don't care.

So you log in, you click "Yes, you can share my stuff" without reading a word of it, like you always do, and the authorization server redirects you back to the app with an authorization code.

Now here's the beautiful part. The web server calls Google directly and goes, "Here's the code, and here's the *actual string*." Google hashes that string with the same algorithm from the first request, and if it matches the hash it got earlier, it goes, "Okay. It's you." Because the only guy who could have that string is the guy who made the hash. Done. Here's your access token.

I hate everything, and I love this. It's simple! Nobody had to have a meeting about it!

Then the web server uses the token to hit Google's API endpoints, and you get your little profile picture up in the corner.

† Now, some of you geniuses built your app statically and threw it on a CDN, so there's no web server. Fine. Whatever. The front end keeps the random string in `sessionStorage`, does a `fetch` itself, sends the random string and the code, and gets the access token back. And then what do half of you do? You throw the token in `localStorage`. That's leaving your car keys on the front tire. The IETF says use a [backend-for-frontend](https://datatracker.ietf.org/doc/rfc10017/), or at least keep it in memory. They wrote it down! It's a document! Read the document!

## Here's what OAuth calls each piece of the flow above

And of course they couldn't just call it "the random string." No. Everything's got to have a name, like it's a law firm. Here's what OAuth calls all of it:

- **Resource owner:** the user. You. The guy who didn't read the consent screen.
- **Client:** the app the user is logging into
- **Authorization server:** Google, Facebook, Apple, etc., where the user logs in and consents
- **Resource server:** the API holding the user's data
- **Code verifier:** the random string. They named a string.
- **Code challenge:** the hash of the random string
- **Code challenge method:** the algorithm used to make the hash (e.g. `S256`)
- **Authorization code:** the code sent back in the redirect
- **Back channel:** the direct server-to-server request
- **Front channel:** browser redirects carrying data in the URL, where everybody can see it

## What problem did it solve?

It fixed two things. Two scams.

### Cross-Site Request Forgery attacks

This one's diabolical. Some jerk logs into the app with *his own* credentials, gives consent, and grabs the callback link with his brand-new authorization code on it. Then he tricks some poor innocent person into opening it. The code gets traded for a token, the token belongs to the jerk, and now this person is logged in as the jerk and has no idea. And everything they do goes into the jerk's account. Their address. Their personal info. All of it.

Who thinks of this? Who sits around going, "What if I made somebody else *be* me?"

PKCE shuts it down, because that person's app never had the jerk's random string. No string, no token. Get outta here.

### Authorization Code Interception Attack

This one's the opposite, and it was mostly a phone thing. After you log in and consent, the authorization server tells the browser to open some URI, and on a phone it can be a custom protocol, like `myapp://home-view...`. And these things don't have to be unique! Anybody can register the same one! Who designed that? So some sleazy app grabs the same protocol, catches your authorization code, and logs on as you.

With PKCE, great, you stole the code. Congratulations. You don't have the string. You stole half a key. Enjoy your half a key.

## Why doesn't the authorization server just give the client the access token to begin with?

That's what I said! Just give it to me! And they used to!

Before CORS, a browser-only app couldn't make the cross-origin POST to the authorization server's token endpoint, so apps without a back end couldn't do the code exchange at all. So they came up with the "implicit flow." Skip the code, stick the access token right in the redirect URL. In the URL! Where it can end up in your browser history, where any script on the page can read it, where a manipulated redirect can send it somewhere else. And the app couldn't even check that the token was issued for its own login.

Then CORS showed up, the browser could do the exchange, the authorization code flow with PKCE replaced it, and the IETF's [guidance for browser-based apps](https://datatracker.ietf.org/doc/rfc10017/) now lists the implicit flow as deprecated. Which is a polite word for "we're not doing that anymore, that was stupid."

So I was wrong. I wanted the token right away and that was dumb. I'm big enough to admit it. Barely.

## Why is it called PKCE?

Proof Key for Code Exchange. And they pronounce it "pixie." Pixie! The thing standing between you and some guy reading your email has a name like a Disney fairy.

The client hands over the unhashed *key* as *proof* that it's the same one that started the *code* *exchange*. That's it. "Here's the key. It's me. I started this." Beautiful. Love it. Now call it something tougher.

---
title: OAuth - What is the purpose of PKCE?
published: October 29, 2026
subtitle: How does it work?
---


## What is it at a very high level?

In its most general terms, it's challenge-response authentication. It's how a server knows that two separate requests it receives are from the same entity. When one request kicks off the request for something very valuable, and the other request receives what is requested, the server has to somehow know the requests are from the same entity.  In the context of PKCE, this "very valuable" thing is an *access token* which allows the entity to access a set of APIs.

## How it works (at a high level) in the context of the authorization code flow with a web server in play [^no-server]

When a user opts to use a social login -- Google, Facebook, Apple, etc -- to log into an app, the back-end creates a secret string and a hash of that string. The browser is then redirected to Google, Facebook, Apple, etc, with the hash and the algorithm used to make it as query parameters. Once the user logs in and consents to the app using the social site's data on the user, the authorization server will use the redirect to redirect the user back to the app's site, passing along an authorization code as a parameter. 

At that point the web server will send the _actual string_ along with the authorization code to the social site. The social site will hash the string from the web server with the hashing algorithm it got in the first request, and if the hash it creates is identical to the hash it got in the first request, it knows the two requests came from the same entity. It knows this because you cannot reverse-engineer a hash back into its original string, so an entity that can deliver the original string is very likely the same entity which produced the hash to begin with.

Once the web server has the access token, it can use it to access API endpoints provided by the social site.

[^no-server] When an app does not have a web server, the random string is saved in session storage and JavaScript will make a `fetch` call to exchange the code and the random string for an access token, which is then typically stored in local storage. Alternatively, it could be stored in memory.

## Here's what OAuth calls each piece of the flow above


| Plain language | OAuth term |
| --- | --- |
| The user | **Resource owner** |
| The app the user is logging into | **Client** |
| Google, Facebook, Apple, etc., where the user logs in and consents | **Authorization server** |
| The API holding the user's data | **Resource server** |
| The random string | **Code verifier** |
| The hash of the random string | **Code challenge** |
| The algorithm used to make the hash | **Code challenge method** (e.g. `S256`) |
| The code sent back in the redirect | **Authorization code** |
| The direct server-to-server request | **Back channel** |
| The browser redirects carrying data in the URL | **Front channel** |

## What problem did it solve?

PKCE solves two security problems:

### Cross-Site Request Forgery attacks

In the OAuth authorization code flow, a malicious user could go through the process of logging onto the client with their credentials at the authorization server, provide their consent, and intercept the callback link with the newly minted authorization code attached to it. An innocent person could then be tricked into opening the callback link that has the malicious user's authorization code attached to it. After clicking on the link, the code will be exchanged for the token, the access token will be mapped to the bad actor and the innocent user will be logged in as the bad actor.  From that point on and until they realize they are logged on as the bad actor, everything they can do can be recorded to the actor's account including personal information the user types in.

### Authorization Code Interception Attack

This is the "opposite" problem, and it was primarily a problem for mobile apps. After the victim logs in and provides their consent at the authorization server, the authorization server will direct the browser to open up a URI, which can have a custom protocol such as `myapp://home-view...`, and because these protocols do not have to be unique, a malicious app could be registered with the same protocol and intercept the authorization code. The bad actor could then log on as the victim.


## Why doesn’t the authorization server just give the client the access token to begin with?

This was done in the past, and a client getting an access token to an API this way was said to be using the OAuth "implicit flow".  This method was used by apps which did not have a back end, so the access token had to be passed via the URL, and this is not great because URLs can be exposed in browser history, referrer headers, and logs.

## Why is it called PKCE

Because the client is presenting the unhashed *key* as *proof* that it is the same entity which initiated the *code* *exchange* to begin with.  The client basically is saying "Here's a key that is proof that I am the same entity that started the flow."





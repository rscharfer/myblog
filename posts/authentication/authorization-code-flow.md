---
title: Authorization Code Flow
created: November 5, 2026
updated: November 6, 2026
subtitle: The canonical OAuth flow used for delegated access to data
image: /og/authentication/authorization-code-flow.png
icons:
  User: role
  Client: role
  Authorization server: role
  Resource server: role
  Authorization code: artifact
  Access token: artifact
  ID token: artifact
  Scope: artifact
  PKCE: artifact
  Front channel: channel
  Back channel: channel
related:
  - label: Also on this blog
    title: OAuth - What is the purpose of PKCE?
    href: /post/authentication/PKCE
    description: The trick that keeps OAuth logins from being hijacked.
  - label: Spec
    title: "RFC 6749: The OAuth 2.0 Authorization Framework"
    href: https://www.rfc-editor.org/rfc/rfc6749#section-4.1
    description: Section 4.1 defines the Authorization Code Grant step by step.
  - label: Spec
    title: OpenID Connect Core 1.0
    href: https://openid.net/specs/openid-connect-core-1_0.html
    description: Where the openid scope and the ID token are defined.
---

## OAuth and OpenID Connect in a nutshell

OAuth was created to give apps limited access to a user's data. Before an app receives access to the data, the user has to give their consent. The data is often hosted at a social site like Google. Once the user agrees to let an app access part of their data, the app receives an **access token**, which it can then use to gain entry to the data. "Entry" to the data is typically the social site's API. The access token provides access to only those API end points the user has consented to. Determining what an app may access is called *authorization*, and that's what OAuth is all about. Historically, anyway...

After a while, developers tried to use OAuth to identify users too, which is a process called *authentication*, and it is something OAuth was not designed to do. The developers' idea was that as long as an app had an access token that worked for a social site's API, that was enough to log in the user to _their_ site. They'd use the access token to ask who the user was, issue a session token, and voila... the user was signed into the app.

The problem is that access tokens are *opaque* to the app, i.e. unreadable. It cannot determine what user is represented by the token and they cannot determine for what app it is; it just gives them access to a certain set of API end points. If the token was somehow injected by a bad actor, which the bad actor legitimately got for a different site, the victim could be logged in as the bad actor. With security issues like this and other issues in mind, OpenID Connect was developed as a standard layer on top of OAuth, and social sites started to return a second token as well: one the app can read that says who the user is and which app it's for (an **ID token**).

## Who and what is involved

The flow has four players, passes around three artifacts, and sends them along two channels. Two of the artifacts do most of the work: the authorization code and the access token. Here is what OAuth calls each piece.

- **Resource Owner:** the person logging in, who owns the data
- **Client:** the app that wants the data, YourFavoriteApp in this post
- **Authorization server:** Google's login and permissions server in this post. It logs the user in, asks for their consent and hands out tokens.
- **Resource server:** Google's API in this post, which holds the user's data
- **Scope:** the permissions the app asks for, such as reading the user's contacts. Also the data the app asks for.
- **Authorization code:** a one-time code the app receives once the user consents, which the app trades for tokens
- **Access token:** the key the app sends with its API calls to get the data. It works for whoever holds it (a *bearer* token) and isn't meant for the app to read (*opaque*). The app can't verify it, but Google's API can.
- **:oidc[ID token]:** a signed note that tells the app who the user is. The app verifies it and reads the user's details from it.
- **PKCE:** a one-time proof that the request that starts the flow and the request that finishes it come from the same app
- **Front channel:** through the browser, carried in redirects and URLs
- **Back channel:** directly from the app's server to Google, never through the browser

## Authorization Code Flow

OAuth describes a number of recipes an app can use to get an access token, called :side[flows]{#flows}. The Authorization Code Flow is probably the most widely used, both for authorization and, with OpenID Connect, for authentication.

:::side{#flows}
Flows are also called *grants*. Other flows described in the OAuth documentation include the Client Credentials Flow and the Device Authorization Flow.
:::

OpenID Connect (OIDC) adds only a few things to the OAuth flow. In this overview, each one is labeled :oidc[like this], and the last section lists them.


## The flow at a glance

The access token can't be handed to the app in one step, because that would mean passing secrets through the browser as query parameters: the access token and the client secret. Instead, the flow is roughly split into two parts: one that goes through the browser (the *front channel*) and one that goes directly from the app's server to Google (the *back channel*).

1. The user clicks "Log in with Google". (front channel)
2. The app prepares a one-time proof it will use later. (on the app's server)
3. The browser is sent to Google's `/auth` endpoint. (front channel)
4. The user grants the app access. (front channel)
5. Google redirects the browser back to the app with an **authorization code**. (front channel)
6. The app trades the authorization code for tokens. (back channel)
7. Google responds with an **access token** and an :oidc[ID token]. (back channel)
8. The app checks the :oidc[ID token] to learn who the user is. (on the app's server)
9. The app calls Google's API with the access token. (back channel)

The one-time proof, called [PKCE](/post/authentication/PKCE), makes this flow more secure. It's how Google's authorization server knows that the request in step 3 and the request in step 6 come from the same app.

## Explore the whole flow

Step through the whole flow at your own pace with Next or the arrow keys, or select any step in the diagram. Each step shows the actual request or response and explains why each parameter is there. Its nine steps are the same as the ones above and below.

::flowchart{flow="authorization-code"}

## The flow, step by step

:side[This is how the Authorization Code Flow (with OpenID Connect) implemented by a client could look.]{#could-look}

:::side{#could-look}
All apps can do this differently. For example, some apps open a pop-up to Google rather than forwarding the browser there.
:::

### Before any of this: the app registers

An app registers itself with an authorization server. The app wants data this server holds on its users. It also wants help verifying the user's identity, i.e. authenticating the user. For example, YourFavoriteApp registers with Google so that it can read a user's contact list and send emails on the user's behalf. It also enlists Google's help authenticating the user, so the user doesn't have to create a username and password for the app. In the process, Google gives the app a client ID and client secret, and the client registers the redirect URIs to be used in the flow.

### 1. The user clicks "Log in with Google"

Some time later, the user clicks "Log in with Google". The browser makes a GET request to the app's web server.

### 2. The app prepares a one-time proof

Before the web server responds, it creates a random string (the *code verifier*) and a hash of that string (the *code challenge*), and stores the verifier for later. [Read more about PKCE here.](/post/authentication/PKCE)

### 3. The app sends the browser to Google

The web server responds with a 302 that forwards the browser to :side[the `/auth` endpoint]{#endpoints} of Google's authorization server.

:::side{#endpoints}
The exact endpoints are provided by the authorization server, Google in this case.
:::

```http title="GET to Google's /auth endpoint" mark="openid" caption="One query parameter (and one scope) per line for reading. In the real request this is a single URL with space-separated scopes and URL-encoded values."
GET https://accounts.google.com/o/oauth2/v2/auth
  ?client_id=1234567890-abc123.apps.googleusercontent.com
  &response_type=code
  &scope=openid
         https://www.googleapis.com/auth/contacts.readonly
         https://www.googleapis.com/auth/gmail.send
  &redirect_uri=https://yourfavoriteapp.com/callback
  &code_challenge=E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM
  &code_challenge_method=S256
```

The query parameters are how the app passes information to Google's `/auth` endpoint. These are typically passed:

- **`client_id`:** identifies the client as YourFavoriteApp. Because YourFavoriteApp registered with Google's authorization server, it's allowed to use this flow to get an access token.
- **`response_type`:** tells the authorization server what is being requested. Set to `code`, it says the client wants an authorization code.
- **`scope`:** the permissions the client is asking for, such as reading contacts and sending email. It also includes :oidc[`openid`], because the client is using this flow to authenticate the user as well.
- **`redirect_uri`:** the URL the client wants the authorization code returned to. It also has to be registered with the authorization server.
- **`code_challenge`:** the [PKCE](/post/authentication/PKCE) hash, so the authorization server knows that a later request is part of this same flow. 
- **`code_challenge_method`:** names the algorithm used to make it.

:::note[What the user can grant]
If the user doesn't have access to something themselves, they can't grant the client access to it, so it isn't available to the client. In other words, what the client can access is limited by what the user can access.
:::

### 4. The user grants access

Assuming the user is already logged in, Google shows a page where they delegate to the app the rights requested in the `scope` query parameter: reading their contact list and sending emails.

::figure{wide="consent-screen.svg" caption="A simplified sketch of the consent screen, not Google's actual design."}

### 5. Google redirects back with the authorization code

The user clicks a button to grant access, which sends their answer back to Google. :side[Google stores the user's consent on its servers]{#consent} and responds with a 302 that forwards the browser to the redirect URI provided earlier. The **authorization code** is attached to that redirect URI as a query parameter.

:::side{#consent}
So that you aren't asked again, even when you log in from a different device.
:::

```http title="Response from Google" {2} caption="The authorization code rides back to the app in the redirect URI's query string."
HTTP/1.1 302 Found
Location: https://yourfavoriteapp.com/callback?code=4/0AVG7fiQ8Hn2kX…
```

The browser follows the redirect to the app's `/callback` URL. That request is how the app's web server receives the authorization code.

### 6. The app trades the code for tokens

The app exchanges the authorization code for an access token. It makes a POST to the authorization server's `/token` endpoint, and the payload includes:

- **`client_id` and `client_secret`:** so the client can prove to the authorization server that it is who it says it is
- **`code`:** the authorization code, which is tied to what the client is allowed to access
- **`grant_type`:** set to `authorization_code`, it distinguishes this request from other grants
- **`code_verifier`:** the PKCE verifier, so the authorization server knows the request comes from the same entity that started the flow

```http title="POST to Google's /token endpoint" {6} caption="One body parameter per line for reading. This request goes straight from the app's server to Google, so the client secret never passes through the browser."
POST /token HTTP/1.1
Host: oauth2.googleapis.com
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&code=4/0AVG7fiQ8Hn2kX…
&client_id=1234567890-abc123.apps.googleusercontent.com
&client_secret=GOCSPX-…
&code_verifier=dBjftJeZ4CVP-mJ92K27uhbUJU1p1r_wW1gFWFOEjXk
&redirect_uri=https://yourfavoriteapp.com/callback
```

### 7. Google returns the tokens

If the authorization server is happy with what comes over the wire, it responds with the access token. The response includes:

- **`token_type`:** almost always `Bearer`
- **`access_token`:** the access token itself
- **`expires_in`:** how many seconds the access token is valid for
- **:oidc[`id_token`]:** the ID token, which tells the client who the user is. It's a signed JSON Web Token (JWT) that holds who the user is, who issued the token, which app it's for, and when it expires.

```json title="Response from Google's /token endpoint" mark="id_token,eyJhbGciOiJSUzI1NiIsImtpZCI6…" caption="The access token for API calls, and the ID token that identifies the user."
{
  "access_token": "ya29.a0AfB_byC…",
  "expires_in": 3599,
  "token_type": "Bearer",
  "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6…"
}
```

### 8. The app checks the ID token

Unlike the access token, the client reads the :oidc[ID token] and has to verify it. The client checks the signature and the details inside (who issued the token, which app it's for, and when it expires) before trusting it. Once they check out, the app knows who the user is and can log them in.

### 9. The app calls the API with the access token

The app uses the access token to retrieve the data it's allowed to retrieve from the endpoints of Google's API (the *resource server*). The token is sent in the `Authorization` header.

```http title="GET to Google's People API" {3} caption="Reading the user's contacts. The access token goes in the Authorization header as a Bearer token."
GET /v1/people/me/connections?personFields=names,emailAddresses HTTP/1.1
Host: people.googleapis.com
Authorization: Bearer ya29.a0AfB_byC…
```

## Why not hand over the access token right away?

Why can't the authorization server just give the client the access token once the user consents? Why go through this whole authorization code rigmarole? At one time, the access token was handed over right away, attached as a query parameter in the redirect to the client. This means it could end up in browser history, where malware reading the history could steal it, and in server logs, where it would be exposed in the event of a server breach.

Also, for that to work, the client would need to prove who it is by passing the client secret as a query parameter to the `/auth` endpoint, where it would be unsafe for the same reasons the access token is.

## What OpenID Connect adds

The access token is opaque to the client and can't be verified by the client. The client can't open it up and see which user it pertains to, so it shouldn't be used to identify the user. That's the job of the ID token, and OpenID Connect adds it with three small changes to the OAuth flow:

1. The client asks for the :oidc[`openid` scope] when it sends the browser to Google (step 3).
2. Google's `/token` endpoint returns an :oidc[ID token] alongside the access token (step 7).
3. The client verifies the ID token and reads who the user is from it (step 8).

Everything else in the flow is plain OAuth.

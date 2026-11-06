// The Authorization Code Flow (with PKCE and OpenID Connect) as data for the interactive
// flow chart. Each step says where it happens (lanes), what is sent (message) and why each
// parameter is there (params). Param `line` is the 1-based line of the message it sits on.
//
// Levels: required / recommended / optional for things the app sends;
//         always / sometimes for things it receives.

export const authorizationCode = {
  title: "Authorization Code Flow",
  lanes: [
    { id: "browser", short: "Browser", name: "The user's browser" },
    { id: "app", short: "App server", name: "YourFavoriteApp's server" },
    { id: "auth", short: "Google login", name: "Google's authorization server" },
    { id: "api", short: "Google API", name: "Google's People API" },
  ],
  before:
    "Before any of this, YourFavoriteApp registered with Google and received a client ID and a client secret, and registered its redirect URI.",
  start: "The user wants to log in to YourFavoriteApp with their Google account.",
  end: "The app has the user's contacts and knows who the user is.",
  steps: [
    {
      id: "click",
      short: "Clicks “Log in with Google”",
      title: "The user clicks “Log in with Google”",
      arrows: [{ from: "browser", to: "app", channel: "front" }],
      summary:
        "The browser asks YourFavoriteApp's server to start logging in. Nothing OAuth-specific has happened yet.",
      message: {
        title: "Browser to app",
        lang: "http",
        code: "GET /login HTTP/1.1\nHost: yourfavoriteapp.com",
      },
    },
    {
      id: "prepare",
      short: "App prepares a one-time proof",
      title: "The app prepares a one-time proof",
      tags: ["pkce"],
      at: "app",
      summary:
        "Before sending the user to Google, the app makes a random string for PKCE, the code verifier, and saves it in the user's session. It hashes the verifier into a code challenge. Only the hash will travel through the browser; the verifier stays on the server until step 6.",
      message: {
        title: "On the app's server",
        lang: "js",
        code: [
          "const codeVerifier = base64url(randomBytes(32));",
          "const codeChallenge = base64url(sha256(codeVerifier));",
          "session.oauth = { codeVerifier };",
        ].join("\n"),
      },
      paramsLabel: "What it creates",
      params: [
        {
          name: "code verifier",
          line: 1,
          level: "recommended",
          tags: ["pkce"],
          why: "A secret random string. The app keeps it on the server and reveals it only to Google's token endpoint in step 6, which proves the app finishing the flow is the one that started it.",
        },
        {
          name: "code challenge",
          line: 2,
          level: "recommended",
          tags: ["pkce"],
          why: "The SHA-256 hash of the verifier. It's safe to send through the browser because the verifier can't be worked out from it.",
        },
      ],
    },
    {
      id: "authorize",
      short: "App sends the browser to Google",
      title: "The app sends the browser to Google",
      tags: ["pkce", "oidc"],
      arrows: [
        { from: "app", to: "browser", channel: "front", label: "302" },
        { from: "browser", to: "auth", channel: "front", label: "GET /auth" },
      ],
      summary:
        "The app answers with a redirect (302). The browser follows it to Google's authorization endpoint, carrying the app's request in the URL's query string. Everything here is visible in the browser, so nothing secret is sent.",
      message: {
        title: "App's redirect to Google's /auth endpoint",
        lang: "http",
        mark: "openid",
        caption: "One parameter per line for reading; the real Location is a single URL. Google's scope values are full URLs, shortened here.",
        code: [
          "HTTP/1.1 302 Found",
          "Location: https://accounts.google.com/o/oauth2/v2/auth",
          "  ?client_id=1234567890-abc123.apps.googleusercontent.com",
          "  &redirect_uri=https://yourfavoriteapp.com/callback",
          "  &response_type=code",
          "  &scope=openid email contacts.readonly gmail.send",
          "  &code_challenge=E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
          "  &code_challenge_method=S256",
        ].join("\n"),
      },
      params: [
        {
          name: "client_id",
          line: 3,
          level: "required",
          why: "Says which registered app is asking. Google uses it to show the app's name on the consent screen and to look up the redirect URIs the app registered.",
        },
        {
          name: "redirect_uri",
          line: 4,
          level: "required",
          why: "Where Google should send the browser back with the code. It must exactly match a URI the app registered, so an attacker can't have the code delivered to their own site.",
        },
        {
          name: "response_type",
          line: 5,
          level: "required",
          why: "Set to code: the app wants an authorization code, not a token. This is what makes it the Authorization Code Flow.",
        },
        {
          name: "scope",
          line: 6,
          level: "required",
          tags: ["oidc"],
          why: "The permissions the app asks for, which become the consent screen. Including openid also asks for an ID token, which is what makes this an OpenID Connect login.",
        },
        {
          name: "code_challenge",
          line: 7,
          level: "recommended",
          tags: ["pkce"],
          why: "The hash from step 2. Google stores it with the code it issues, so only the app holding the original verifier can redeem that code. OAuth's security best practice is to always send it.",
        },
        {
          name: "code_challenge_method",
          line: 8,
          level: "recommended",
          tags: ["pkce"],
          why: "How the challenge was made. S256 means SHA-256. Without it, Google assumes the challenge is the verifier itself, which protects nothing.",
        },
      ],
      notShown:
        "optional extras such as state (a random value the app checks when the browser comes back), nonce (OpenID Connect replay protection), prompt (for example, to force the consent screen) and access_type=offline (to get a refresh token).",
    },
    {
      id: "consent",
      short: "User logs in and allows access",
      title: "The user logs in and allows access",
      arrows: [
        { from: "auth", to: "browser", channel: "front", label: "consent screen" },
        { from: "browser", to: "auth", channel: "front", label: "Allow" },
      ],
      summary:
        "Google checks the request, asks the user to log in if they aren't already, and shows a consent screen listing what the app asked for. Google remembers the user's answer on its own servers, so next time it may skip the consent screen.",
      checks: [
        "client_id belongs to a registered app",
        "redirect_uri exactly matches one the app registered",
        "the requested scopes are ones this app may ask for",
      ],
      checksLabel: "What Google checks first",
    },
    {
      id: "callback",
      short: "Google sends the browser back with a code",
      title: "Google sends the browser back with the code",
      arrows: [
        { from: "auth", to: "browser", channel: "front", label: "302" },
        { from: "browser", to: "app", channel: "front", label: "GET /callback" },
      ],
      summary:
        "Google redirects the browser to the app's redirect URI with an authorization code in the query string. The browser follows the redirect, which is how the code reaches the app's server.",
      message: {
        title: "Google's redirect back to the app",
        lang: "http",
        code: [
          "HTTP/1.1 302 Found",
          "Location: https://yourfavoriteapp.com/callback",
          "  ?code=4/0AVG7fiQ8Hn2kX…",
        ].join("\n"),
      },
      params: [
        {
          name: "code",
          line: 3,
          level: "always",
          why: "The authorization code: a short-lived, one-time ticket. It's useless on its own: redeeming it takes the app's client secret and the PKCE verifier, neither of which ever passes through the browser.",
        },
      ],
    },
    {
      id: "token",
      short: "App trades the code for tokens",
      title: "The app trades the code for tokens",
      tags: ["pkce"],
      arrows: [{ from: "app", to: "auth", channel: "back", label: "POST /token" }],
      summary:
        "The app's server calls Google's token endpoint directly, server to server. This is where it proves who it is, which is why the code alone is worthless to anyone who steals it from the browser.",
      message: {
        title: "App to Google's /token endpoint",
        lang: "http",
        caption: "One body parameter per line for reading.",
        code: [
          "POST /token HTTP/1.1",
          "Host: oauth2.googleapis.com",
          "Content-Type: application/x-www-form-urlencoded",
          "",
          "grant_type=authorization_code",
          "&code=4/0AVG7fiQ8Hn2kX…",
          "&redirect_uri=https://yourfavoriteapp.com/callback",
          "&client_id=1234567890-abc123.apps.googleusercontent.com",
          "&client_secret=GOCSPX-…",
          "&code_verifier=dBjftJeZ4CVP-mJ92K27uhbUJU1p1r_wW1gFWFOEjXk",
        ].join("\n"),
      },
      params: [
        {
          name: "grant_type",
          line: 5,
          level: "required",
          why: "Set to authorization_code. The token endpoint serves several flows, and this tells it which one, so it knows to look for a code.",
        },
        {
          name: "code",
          line: 6,
          level: "required",
          why: "The ticket from step 5. Google accepts it once; a second attempt fails.",
        },
        {
          name: "redirect_uri",
          line: 7,
          level: "required",
          why: "Must be identical to the one sent in step 3. Google compares them, which stops a code issued for one redirect URI from being redeemed through another.",
        },
        {
          name: "client_id",
          line: 8,
          level: "required",
          why: "Which app is redeeming the code. It must be the app the code was issued to.",
        },
        {
          name: "client_secret",
          line: 9,
          level: "required",
          why: "The app's password, from registration. It only ever travels server to server, which is the main reason the flow uses a code instead of handing out the token in step 5.",
        },
        {
          name: "code_verifier",
          line: 10,
          level: "required",
          tags: ["pkce"],
          why: "Required because step 3 sent a code_challenge. Google hashes it and compares the result with the challenge it stored; if they differ, it refuses.",
        },
      ],
    },
    {
      id: "tokens",
      short: "Google returns the tokens",
      title: "Google returns the tokens",
      tags: ["oidc"],
      arrows: [{ from: "auth", to: "app", channel: "back", label: "200 OK" }],
      summary:
        "If everything checks out, Google answers with an access token for the API and, because the app asked for openid, an ID token describing the user.",
      message: {
        title: "Google's response",
        lang: "json",
        mark: "id_token,eyJhbGciOiJSUzI1NiIsImtpZCI6…",
        code: [
          "{",
          '  "access_token": "ya29.a0AfB_byC…",',
          '  "token_type": "Bearer",',
          '  "expires_in": 3599,',
          '  "scope": "openid email contacts.readonly gmail.send",',
          '  "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6…"',
          "}",
        ].join("\n"),
      },
      params: [
        {
          name: "access_token",
          line: 2,
          level: "always",
          why: "The key to the API. The app treats it as opaque: it never reads it, it just sends it to the API.",
        },
        {
          name: "token_type",
          line: 3,
          level: "always",
          why: "How to use the token. Bearer means whoever holds it can use it, so the app must keep it secret.",
        },
        {
          name: "expires_in",
          line: 4,
          level: "always",
          why: "Seconds until the access token stops working (about an hour at Google). The app can't read this from the token itself, because the token is opaque.",
        },
        {
          name: "scope",
          line: 5,
          level: "sometimes",
          why: "The permissions actually granted. The user may have allowed less than the app asked for.",
        },
        {
          name: "id_token",
          line: 6,
          level: "sometimes",
          tags: ["oidc"],
          why: "Sent only because scope included openid. A signed JWT saying who the user is; the app checks it in the next step.",
        },
      ],
      notShown: "refresh_token, which Google sends only when the app asked for offline access.",
    },
    {
      id: "verify",
      short: "App checks the ID token",
      title: "The app checks the ID token and logs the user in",
      tags: ["oidc"],
      at: "app",
      summary:
        "The ID token is a signed JWT. The app verifies the signature with Google's published keys, checks the claims below, and then logs the user in with its own session cookie. The access token can't do this job: it's opaque to the app and says nothing it can trust about who the user is.",
      message: {
        title: "The ID token's payload, decoded",
        lang: "json",
        code: [
          "{",
          '  "iss": "https://accounts.google.com",',
          '  "aud": "1234567890-abc123.apps.googleusercontent.com",',
          '  "sub": "110169484474386276334",',
          '  "email": "jane.doe@example.com",',
          '  "exp": 1762303600',
          "}",
        ].join("\n"),
      },
      paramsLabel: "Claims",
      params: [
        {
          name: "iss",
          line: 2,
          level: "always",
          tags: ["oidc"],
          why: "Who issued the token. The app checks that it's Google.",
        },
        {
          name: "aud",
          line: 3,
          level: "always",
          tags: ["oidc"],
          why: "Who the token is for. It must be this app's client_id, so an ID token issued to some other app is rejected.",
        },
        {
          name: "sub",
          line: 4,
          level: "always",
          tags: ["oidc"],
          why: "The user's permanent Google ID. This is what the app should store to recognise the user next time, not the email, which can change.",
        },
        {
          name: "email",
          line: 5,
          level: "sometimes",
          tags: ["oidc"],
          why: "Present because the app asked for the email scope.",
        },
        {
          name: "exp",
          line: 6,
          level: "always",
          tags: ["oidc"],
          why: "When the token expires. The app rejects it after this time.",
        },
      ],
    },
    {
      id: "api",
      short: "App calls the API",
      title: "The app calls the API with the access token",
      arrows: [
        { from: "app", to: "api", channel: "back", label: "GET connections" },
        { from: "api", to: "app", channel: "back", label: "contacts" },
      ],
      summary:
        "The app's server calls Google's People API to read the user's contacts, sending the access token with the request. Google's API checks the token and the granted scopes, then returns the data.",
      message: {
        title: "App to Google's People API",
        lang: "http",
        code: [
          "GET /v1/people/me/connections?personFields=names,emailAddresses HTTP/1.1",
          "Host: people.googleapis.com",
          "Authorization: Bearer ya29.a0AfB_byC…",
        ].join("\n"),
      },
      params: [
        {
          name: "Authorization",
          line: 3,
          level: "required",
          why: "The access token goes in this header with the Bearer scheme. Never in the URL, where it would end up in logs and browser history.",
        },
      ],
    },
  ],
};

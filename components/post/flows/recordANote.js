// Recording a thank-you in Thankful, as data for the interactive flow chart.
// Each step says where it happens (lanes), what is sent (message) and why each
// parameter is there (params). Param `line` is the 1-based line of the message it sits on.
//
// Channels: "front" = sent by the phone (the browser lane in the legend), "back" = server to server.
// Levels: required / recommended / optional for things the app sends. Things it
// receives have no level, so no badge.

export const recordANote = {
  title: "Recording a thank-you",
  lanes: [
    { id: "phone", short: "Phone", name: "My phone (the installed PWA)" },
    { id: "netlify", short: "Netlify", name: "Netlify: the app's API routes" },
    { id: "supabase", short: "Supabase", name: "Supabase: Storage, the process-note Edge Function, Postgres and Realtime" },
    { id: "whisper", short: "Whisper", name: "Whisper large-v3-turbo, hosted on Groq" },
    { id: "claude", short: "Claude", name: "The Claude API (Opus 5.5)" },
    { id: "wife", short: "Wife", name: "My wife's phone" },
  ],
  before:
    "Before any of this, we both signed in to the app with Supabase Auth and allowed notifications on our phones.",
  start: "I tap Record, say what I'm thankful for, and tap Stop.",
  end: "The note is in today's day view on both phones, and my wife's phone shows a notification and an unread badge.",
  steps: [
    {
      id: "upload-url",
      short: "Phone asks for an upload URL",
      title: "Netlify hands the phone a signed upload URL",
      arrows: [
        { from: "phone", to: "netlify", channel: "front", label: "POST" },
        { from: "netlify", to: "phone", channel: "front", label: "upload URL" },
      ],
      summary:
        "The recording stays in the phone's IndexedDB until it's safely uploaded. The phone asks a Netlify route for a place to put it. Netlify checks that the caller is one of the app's two members, creates a recordings row and returns a signed URL that allows one upload into the private bucket.",
      message: {
        title: "Phone to Netlify, and the answer",
        lang: "http",
        code: [
          "POST /api/notes/upload HTTP/1.1",
          "Authorization: Bearer eyJhbGciOiJIUzI1NiIs…",
          "",
          '{"recordedAt": "2026-10-20T07:42:10-07:00"}',
          "",
          "HTTP/1.1 200 OK",
          "{",
          '  "id": "5753d65f-…",',
          '  "uploadUrl": "https://…/upload/sign/audio/app/2026/5753d65f-….m4a?token=…"',
          "}",
        ].join("\n"),
      },
      params: [
        {
          name: "Authorization",
          line: 2,
          level: "required",
          why: "The access token Supabase Auth gave the phone at sign-in. Netlify verifies it and checks that the user is in the app_users table before it does anything else.",
        },
        {
          name: "recordedAt",
          line: 4,
          level: "optional",
          why: "When the note was recorded. It decides which day the note belongs to; the signed-in person decides whose note it is.",
        },
        {
          name: "uploadUrl",
          line: 9,
          why: "A signed, short-lived URL for exactly one file. The phone can upload without holding any storage key, and the audio never passes through Netlify.",
        },
      ],
    },
    {
      id: "upload",
      short: "Phone uploads the audio",
      title: "The phone uploads the audio straight to Supabase Storage",
      arrows: [{ from: "phone", to: "supabase", channel: "front", label: "PUT .m4a" }],
      summary:
        "The phone sends the recording to the signed URL. Both iPhone and Android record AAC in an .m4a file, which both can play back, so nothing is converted. Once the upload succeeds, the phone deletes its own copy: from here on, the server owns the note.",
      message: {
        title: "Phone to Supabase Storage",
        lang: "http",
        code: [
          "PUT /storage/v1/object/upload/sign/audio/app/2026/5753d65f-….m4a",
          "    ?token=… HTTP/1.1",
          "Content-Type: audio/mp4",
          "",
          "<the recording's bytes>",
        ].join("\n"),
      },
      params: [
        {
          name: "token",
          line: 2,
          level: "required",
          why: "Part of the signed URL from step 1. It is the only permission this request has, and it works for this one path only.",
        },
        {
          name: "Content-Type",
          line: 3,
          level: "required",
          why: "audio/mp4: AAC audio in an MP4 container, the format both phones record and play.",
        },
      ],
    },
    {
      id: "start",
      short: "Phone starts the Edge Function",
      title: "The phone starts the process-note Edge Function",
      arrows: [{ from: "phone", to: "supabase", channel: "front", label: "POST {id}" }],
      summary:
        "The phone tells the Edge Function which note to process. The function answers 202 Accepted at once and keeps working in the background (up to 150 seconds), so the app can even be closed. It claims the recordings row in one atomic update, so a note is never processed twice, then downloads the audio from Storage.",
      checks: [
        "If this call never arrives, a pg_cron job calls the same function every 5 minutes for notes that never started or got stuck",
        "A failed note is retried up to 5 times, then I get one push saying it failed",
      ],
      checksLabel: "If something goes wrong",
      message: {
        title: "Phone to the Edge Function",
        lang: "http",
        code: [
          "POST /functions/v1/process-note HTTP/1.1",
          "Authorization: Bearer eyJhbGciOiJIUzI1NiIs…",
          "",
          '{"id": "5753d65f-…"}',
          "",
          "HTTP/1.1 202 Accepted",
          '{"id": "5753d65f-…", "status": "processing"}',
        ].join("\n"),
      },
      params: [
        {
          name: "id",
          line: 4,
          level: "required",
          why: "The recordings row from step 1. The function only accepts the caller's own recordings.",
        },
        {
          name: "202 Accepted",
          line: 6,
          why: "Means 'got it, still working'. The answer comes later through Supabase Realtime (step 6), not in this response.",
        },
      ],
    },
    {
      id: "transcribe",
      short: "Whisper transcribes the audio",
      title: "The function sends the audio to Whisper on Groq",
      arrows: [
        { from: "supabase", to: "whisper", channel: "back", label: "audio" },
        { from: "whisper", to: "supabase", channel: "back", label: "segments" },
      ],
      summary:
        "Whisper turns speech into text, in English, German, or both in one note. It returns the transcript as timed segments. The function drops long, nearly empty segments (the made-up text Whisper writes over silence) and joins the rest into the transcript.",
      message: {
        title: "Function to Groq's transcription endpoint (multipart form)",
        lang: "text",
        code: [
          "POST https://api.groq.com/openai/v1/audio/transcriptions",
          "file:            note.m4a",
          "model:           whisper-large-v3-turbo",
          "response_format: verbose_json",
          "prompt:          Babes, Franzi, Ryan, Maxi, Max, Mia, Ernie, Hal, Bennett,",
          "                 geht so, bis dann, Kinderschokolade.",
          "temperature:     0",
        ].join("\n"),
      },
      params: [
        {
          name: "model",
          line: 3,
          level: "required",
          why: "The same Whisper model the six-year archive was transcribed with on my Mac, so old and new notes read alike.",
        },
        {
          name: "response_format",
          line: 4,
          level: "optional",
          why: "verbose_json returns each segment with its start and end time. The silence filter needs those times.",
        },
        {
          name: "prompt",
          line: 5,
          level: "optional",
          why: "Not instructions: Whisper doesn't follow them. It's a spelling hint, the names and German phrases it kept getting wrong.",
        },
        {
          name: "temperature",
          line: 7,
          level: "optional",
          why: "0 makes Whisper pick its most likely words, the setting least likely to make things up.",
        },
      ],
    },
    {
      id: "write-up",
      short: "Claude writes up the note",
      title: "Claude turns the transcript into items and a teaser",
      arrows: [
        { from: "supabase", to: "claude", channel: "back", label: "transcript" },
        { from: "claude", to: "supabase", channel: "back", label: "JSON" },
      ],
      summary:
        "The function sends Claude the rules, the day's earlier notes as context, and the new transcript. The answer has to match a JSON schema: the things I'm thankful for, a one-line teaser and a milestone flag. Code checks what a schema can't (no 'you' or 'your') and sends it back once if a rule is broken. The result is saved as a draft, with a trace of every step, and the recordings row becomes 'ready'.",
      message: {
        title: "Function to the Claude API (shortened)",
        lang: "json",
        code: [
          "{",
          '  "model": "claude-opus-5-5",',
          '  "max_tokens": 16000,',
          '  "system": [{',
          '    "type": "text", "text": "You write up voice notes for \\"Thankful\\"…",',
          '    "cache_control": { "type": "ephemeral" }',
          "  }],",
          '  "messages": [{',
          '    "role": "user", "content": "Day: 2026-10-20 (Tuesday). … New note: …"',
          "  }],",
          '  "output_config": {',
          '    "format": { "type": "json_schema", "schema": SCHEMA }',
          "  }",
          "}",
        ].join("\n"),
      },
      params: [
        {
          name: "model",
          line: 2,
          level: "required",
          why: "Opus 5.5 won a side-by-side test against Sonnet on 14 deliberately difficult days.",
        },
        {
          name: "system",
          line: 4,
          level: "required",
          why: "The rules, the same for every note. cache_control caches them, so they're paid for in full only once.",
        },
        {
          name: "messages",
          line: 8,
          level: "required",
          why: "Built for each note: the date, the day's earlier notes with their items (context only), then the new transcript.",
        },
        {
          name: "output_config",
          line: 11,
          level: "optional",
          why: "Structured outputs: SCHEMA is the JSON schema for items, a teaser and a milestone, and the API guarantees the answer matches it, so the code never parses free text.",
        },
      ],
    },
    {
      id: "ready",
      short: "Realtime tells the phone it's ready",
      title: "Realtime tells the phone the draft is ready",
      arrows: [{ from: "supabase", to: "phone", channel: "front", label: "ready" }],
      summary:
        "The record screen subscribed to its recordings row when the upload finished. When the function sets the row to 'ready', Supabase Realtime pushes the change to the phone over an open WebSocket, and the screen shows the draft. No polling.",
      message: {
        title: "On the phone",
        lang: "js",
        code: [
          "supabase.channel(`recording-${id}`)",
          '  .on("postgres_changes",',
          '    { event: "UPDATE", schema: "public", table: "recordings",',
          '      filter: `id=eq.${id}` },',
          "    (payload) => finish(payload.new))",
          '  .subscribe((state) => { if (state === "SUBSCRIBED") finish(); });',
        ].join("\n"),
      },
      params: [
        {
          name: "filter",
          line: 4,
          level: "required",
          why: "Only this one row. Row Level Security applies too, so a phone only ever hears about its own recordings.",
        },
        {
          name: "SUBSCRIBED",
          line: 6,
          level: "recommended",
          why: "One read right after subscribing, in case the draft was ready before the subscription was live. Without it, a fast note could be missed.",
        },
      ],
    },
    {
      id: "send",
      short: "I review it and tap Send",
      title: "I review the draft, then Send or Delete",
      arrows: [
        { from: "phone", to: "supabase", channel: "front", label: "send" },
        { from: "supabase", to: "wife", channel: "back", label: "push" },
      ],
      summary:
        "I read the teaser, the items and the transcript. Delete drops the draft, and I can record again. Send writes the note into the day and pushes a notification to my wife's phone, with her unread count for the app icon's badge. A draft nobody reviews is sent on its own after 30 minutes.",
      message: {
        title: "Phone to the Edge Function",
        lang: "http",
        code: [
          "POST /functions/v1/process-note HTTP/1.1",
          "Authorization: Bearer eyJhbGciOiJIUzI1NiIs…",
          "",
          '{"id": "5753d65f-…", "action": "send"}',
        ].join("\n"),
      },
      params: [
        {
          name: "action",
          line: 4,
          level: "required",
          why: "send or delete. Until one of them, nothing is visible to the other person: the note is only a draft on the recordings row.",
        },
      ],
      notShown:
        "the push itself, a Web Push message signed with the app's VAPID keys and delivered by Apple's or Google's push service.",
    },
  ],
};

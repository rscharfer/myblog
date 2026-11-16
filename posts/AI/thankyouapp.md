---
title: Creating a private, two-person app with Whisper and Claude
created: November 15, 2026
subtitle: Using AI to create a “turn back the clock” app
related:
  # TODO(Ryan): add these once the URLs exist.
  # - label: Code
  #   title: rscharfer/thankyou
  #   href: https://github.com/rscharfer/thankyou
  #   description: The app's source, once it's cleaned up.
 
---

::figure{src="01-calendar.png,02-day.png" alt="The app's calendar view and the view of a single day, side by side on a phone" caption="Calendar UI on the left; day UI on the right."}

I had read in many books that expressing gratitude was good for the soul. With that in mind, I started sending my wife daily messages, in audio form on WhatsApp, each expressing three or more things I was thankful for. Each day’s message could include a wide variety of things, from the mundane -- great dinner! -- to the more meaningful, such as reuniting with friends and family at our wedding, or something one of the kids loved about their first day of school.

After doing this for a while, I lamented that there was no easy way to see what I was thankful for on some particular day in the past, and that all of these great moments would be lost to history. Photo apps regularly show you a photo from “3 years ago today”, and it’s easy to scroll through your old photos to reflect on the times past. I wanted something like that for these messages.

I needed something that could grab what I was thankful for each day over the past six years from 2,175 WhatsApp audio files (~45 hours) and make it easy to re-experience those moments in a friendly user interface.

Enter AI.

## Ideation: mapping out the features the app would have

I transferred the audio to my laptop, opened up Claude Desktop and began. I kicked off the whole process by telling Claude about the app I wanted to create and the features I envisioned it having, and :side[asked for its feedback]{#conversational-prompt}. I imagined a calendar-type app where my wife and I could scroll to any date, click on that date, and hear what I was thankful for. I also pictured a horizontal timeline that showed the milestones in our lives. I pictured receiving a notification every morning as well which said something like “On this day X years ago, you were thankful for…”

:::side{#conversational-prompt}
I kept it conversational on purpose. This usually gets you a much fuller answer than you asked for, but in this brainstorming session, that was fine.
:::

Not only did Claude give me some ideas for some new features, but because I purposely didn’t put any constraints on its feedback, it also prototyped the whole idea by extracting the thank-yous out of the audio I had attached. It proposed a flow to use for converting the audio files to itemized thank-yous and a :side[teaser]{#teaser}. It suggested a milestone flag, which I thought was great. I mentioned I wanted funny moments tagged as those that would be especially fun to re-experience. Together, we decided what would be included in a “day” view, and Claude suggested a progressive web app in lieu of a native app. (After all, I just wanted something that the two of us would have on our phones.)

:::side{#teaser}
A summary of what I was thankful for on that particular day, to be used in the notification.
:::


## Deciding on the engine and model

First I needed a speech-to-text model to download onto my laptop. I had Claude benchmark two :side[engines]{#same-model} for the :side[Whisper]{#whisper} model Claude recommended to see which would be faster: `faster-whisper` running on my CPU or `mlx-whisper` running on my GPU. `mlx-whisper` was faster.

After that, I compared models (`Opus 5.5` vs `Sonnet 5.5`) to use with the Claude API to see which would extract meaning the best out of the transcriptions.  I had each model summarize the same 14 deliberately difficult days (German-heavy, sensitive, or very long), and `Opus 5.5` turned in the best results using the same prompt.

When creating the prompt sent to the Claude API, I let it know exactly the structure I wanted the response to have. Otherwise, the response would have been free flowing text.

:::side{#whisper}
Whisper is OpenAI's open-source speech-to-text model.
:::

:::side{#same-model}
Same model either way: Whisper large-v3-turbo.
:::

```json title="Prompt to Claude API" {10,11,16-24} caption="Requesting that Claude respond with the required structured output. Only the items with a *kind* value of *thankful* are shown in the app."
{
  "type": "object",
  "properties": {
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "text": { "type": "string" },
          "kind": { "enum": ["thankful", "stressful", "plan", "note"] },
          "tags": { "type": "array", "items": { "enum": ["funny"] } }
        },
        "required": ["text", "kind", "tags"]
      }
    },
    "teaser": {
      "type": "string",
      "description": "One line, never 'you' or 'your'; a funny item leads."
    },
    "milestone": {
      "type": "object",
      "properties": { "is": { "type": "boolean" }, "label": { "type": "string" } },
      "required": ["is"]
    }
  },
  "required": ["items", "teaser", "milestone"]
}
```

## v1: implementing the model end-to-end with one month

With the engine and model chosen, and our list of features on the side, I had Claude implement a :side[tracer-bullet]{#vertical-slice} using a month of thank-you messages (about 16–20 notes) and about :side[10 done criteria]{#done-criteria}. 

I installed the implemented app on both of our phones as progressive web apps, confirmed the features and the notification worked, gave Claude feedback, and had it make changes I wanted.

:::side{#vertical-slice}
Running every layer on a small slice of real data is called a tracer bullet, or vertical slice. Integration problems show up while they're still cheap to fix.
:::

:::side{#done-criteria}
Claude drafted them; I confirmed them. One example: "You've read every day's items and confirmed nothing is missing or made up by cross-checking with the transcript for that day."
:::


::figure{src="03-timeline-all.png" alt="The timeline with cards in date order, month dividers and year buttons" caption="The timeline after that feedback: cards in date order, month dividers, and a row of year buttons."}

From there I tried a whole month’s worth of audio and made changes where necessary. During this phase, I decided I wanted my wife’s thank-you messages to be styled differently in the UI. It also became clear the transcription model would have to transcribe both English and German, and sometimes in the same message. (My wife is German.) It also had to spell family members’ names correctly. 

This called for another modification to the Whisper prompt.

```js title="The whole Whisper request" {3,4} caption="Whisper uses its prompt as a spelling hint. It includes words it keeps getting wrong. (Kinderschokolade is a German chocolate bar. Remember it.)"
// The glossary isn't an instruction. Whisper reads it as text spoken just before
// the recording, which nudges its spelling toward these words.
const GLOSSARY =
  "Babes, Janne, Ryan, Maxi, Max, Mia, Ernie, Hal, Bennett, geht so, bis dann, Kinderschokolade.";

const form = new FormData();
form.append("file", new Blob([audio], { type: "audio/mp4" }), "note.m4a");
form.append("model", "whisper-large-v3-turbo");
form.append("response_format", "verbose_json"); // timed segments, for the silence filter
form.append("prompt", GLOSSARY);
form.append("temperature", "0");                 // least likely to make things up

const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
  method: "POST",
  headers: { authorization: `Bearer ${GROQ_API_KEY}` },
  body: form,
});
```

After the whole month’s audio was processed and viewable in the app, I first ran an entire year’s worth of audio, and then all six years. After each iteration, I :side[smoke-checked]{#your-rule} the app for obvious issues and made any adjustments needed to the prompts or the UI.

:::side{#your-rule}
I added a rule forbidding the use of "your" in a teaser because my wife and I would not know who "your" referred to.
:::

## Splitting the work into three sessions

The session was getting long (about 200 turns), so I created three new sessions, and gave each of them a role. The sessions would all have their own context specific to their role, which improves the quality of Claude's responses. One of the sessions would be the session for product definition, where we discussed further features of the app, and what version of the app those features would go in. Another session I would use for implementation. The third session would be a “design review” session, where I reviewed Claude’s implementation decisions and improved the infrastructure. Each of these sessions would share a “product spec” as context.

::figure{wide="three-threads-wide.svg" narrow="three-threads-narrow.svg" caption="The flow of information."}

The product spec was what was created by the product session and then shared and modified by all three. This way they all have the same source of truth. 

::figure{wide="product-spec.svg" narrow="product-spec-narrow.svg" caption="The product spec passed between sessions."}

## v2: recording in the app

Processing the audio on my local machine would be very painful if I had to do it that way for future thank-you messages. I needed the ability to record thank-yous in the app itself, and have the processing done in the cloud.

I had Claude add UI for recording a thank-you inside the app and the ability to approve a processed thank-you before sending it. This would not only allow the user to re-record the message if they wanted, but also help me stay on top of how well Whisper was transcribing and Claude was extracting meaning.

::figure{src="06-record-review.png" alt="The review screen shown after recording a thank-you" caption="Review before send: nothing goes out until the user approves it."}

## When the AI got it wrong: Kinderschokolade?

One morning I recorded a thank-you message in the app, and waited for the write-up to appear on my phone for approval. The write-up showed that I was thankful for … Kinderschokolade? This word had appeared in my previous messages, but I most definitely did not say it this time.

I was excited to see where in the pipeline things went wrong. I saw that Whisper had included it in its transcription, and learned via Googling that Whisper tended to fill silence with words from its prompt! That was what happened here. I had Claude start recording :side[traces]{#trace} for each thank-you message here on out, so that the next time the processing goes awry, we can see exactly where.


:::side{#trace}
A trace is a log of everything in the generative AI flow, so that you can see where something goes wrong.
:::

```text title="What Whisper returned" {3,4} caption="The last four segments of a 148-second note. My screen turned off mid-note when I got distracted, and Whisper filled each 30s window of silence with a word from its prompt."
 37.8 –  40.4 s   When we were, I think we were in Puerto Vallarta.
 48.9 –  65.2 s   … And I also
 88.4 – 118.4 s   Kinderschokolade.
118.4 – 148.4 s   Kinderschokolade.
```

The fix for this was a filter in the code that drops the 30s stretches of audio with only a word or two in them.


Now with every recording, the whole process from raw audio to transcription to Claude’s processing of the transcription is saved. If something goes wrong, we can see where it went wrong. We tweak something in the prompt or add context and watch how it affects the result. Even better, we can write a test with that same input that the processing messed up and make sure that after the tweak it does not mess up again.


## Reviewing the code and pushing back

I used a third session to review the decisions Claude made at the infrastructure level. I started by having Claude create a flow diagram for things like authentication and the transformation of the audio. I had it give me alternatives to the decisions it made and their tradeoffs. 

In the end, this is what processing the audio looked like in the cloud after my critique. I moved the transcription to :side[Groq]{#groq}, and the Claude API is called from a :side[Supabase Edge Function]{#edge-function} rather than from my computer. The app itself is hosted on Netlify.

:::side{#groq}
Groq is a service that runs AI models on its own fast hardware. I send it the audio and get the transcript back.
:::

:::side{#edge-function}
A small piece of server code that Supabase hosts and runs on request, so it doesn't need my laptop.
:::

::figure{wide="architecture-v2.svg" narrow="architecture-v2-narrow.svg" caption="The architecture after my review. a and b mark what I changed."}

## The app's outlook

I had created the entire app inside Claude Desktop. I looked at the code a bit, but not much. The discussion I had with Claude in the review session was as deep as I wanted to interrogate the code for this two-person app.

Although I like the result, the anticipation was a bit greater than the result. Like old photos, some old thank-yous are better than others, and not all are worth revisiting. 

Still, at the very least, I can say it was fun being able to whip up an app I had thought about making for a long time, but that was probably never going to be feasible until the advent of LLMs, which are able to extract meaning out of text. 

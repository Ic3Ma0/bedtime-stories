# Context

## Project

**Bedtime Story System** — A web application that generates and displays original bedtime stories for a personalized, intimate reading experience.

## Goal

Originally a personal gift project. Now an **open-source collaborative project** maintained by the author and their partner, with the intention of being usable by a broader audience.

## Target Audience

- **Primary**: The author and their partner (co-developers and first users)
- **Secondary**: Other couples, parents, or individuals who want a personalized bedtime story experience

## Constraints

- No user registration/login required
- Each user manages their own instance or local data
- Deployment strategy deferred — must remain flexible (Vercel, self-hosted, or static export)

## Collaboration

- **Mode**: Loose collaboration — both partners push directly to `main`, no formal PR process
- **Branching**: Feature branches optional, not mandatory
- **Review**: Informal — code review happens via conversation
- **Open source intent**: Portfolio + Real Product — "good enough to share", polish later if traction emerges

## Domain Terms

| Canonical Term | Meaning | Avoid |
|---|---|---|
| **Story** | A complete short narrative generated for bedtime reading | tale, narrative (use only in prose) |
| **Story Generation** | The process of creating a new story, whether via AI or from the local library | story creation, story making |
| **Local Story Library** | The curated collection of pre-written fallback stories stored in the application | fallback stories, preset stories, story database |
| **AI Generation** | Creating a story by calling an external AI API (Gemini) | AI mode, smart generation |
| **Reading View** | The full-screen or focused UI where a story is displayed for reading | story page, content area |
| **Night Mode** | The dark, warm-color theme optimized for pre-sleep reading | dark mode, bedtime theme |
| **Day Mode** | The light theme for daytime reading | light mode |
| **Bookmarking** | Saving a story to a personal collection for later re-reading | favorites, likes, saving |
| **Bookmarked Stories** | The user's personal collection of saved stories | favorites list, saved stories |
| **Narration** | Text-to-speech playback of a story | TTS, voice reading, audio |
| **Suspense Level** | The configurable intensity of mystery/horror elements in a generated story | horror level, scary level |
| **Story Tag** | A category label attached to a story (e.g., "light-mystery", "fantasy") | category, genre (use "genre" only for broad classification) |
| **Story Length** | The reading duration target: **Short** (~3 min) or **Medium** (~8 min) | duration, word count |
| **Reading Progress** | The user's last scroll position within a story | scroll position |
| **Profile** | A local identity within the app (e.g., "我", "女朋友", "访客") | user, account, identity |
| **Active Profile** | The currently selected Profile whose data is being read/written | current user |
| **Profile Switching** | Changing the Active Profile via a dropdown selector | login, switch user |
| **Profile Data** | All data scoped to a Profile: bookmarks, reading progress, preferences | user data |

## Flagged Ambiguities

- "生成" was previously used interchangeably for both AI Generation and random selection from Local Story Library — resolved: AI Generation is AI-only; fetching from Local Story Library is "fallback" or "local retrieval", not "generation".
- "收藏" vs "喜欢" — resolved: Bookmarking is intentional saving; there is no "like" concept in this app.
- "用户" vs "Profile" — resolved: This app has no user accounts. "Profile" is a local browser identity, not a registered user.

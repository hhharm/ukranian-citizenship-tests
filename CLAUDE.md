# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

**Ukrainian History & Constitution Quiz App** — a client-side quiz application to help people prepare for tests on Ukrainian history and the Ukrainian Constitution. Questions are in Ukrainian (Cyrillic). The app presents multiple-choice questions (4 options: а/б/в/г), tracks answers, and shows results.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

No test framework is configured in this project.

## Architecture

This is a **Next.js 16 App Router** project bootstrapped with `create-next-app`. The entire quiz logic runs client-side (no backend needed).

### Key files

**App shell:**
- `app/layout.tsx` — Root layout with Geist font setup and global metadata
- `app/page.tsx` — Home page, renders `<QuizApp />`
- `app/globals.css` — Global styles with Tailwind imports and CSS custom properties for light/dark theming

**Data layer (`data/`):**
- `data/types.ts` — Shared TypeScript types: `Question`, `QuestionOption`, `OptionId`, `Topic`, `QuizState`, `QuizResult`
- `data/history.md` — Raw question source for Ukrainian history (Ukrainian language, multiple-choice)
- `data/constitution.md` — Raw question source for Ukrainian Constitution (Ukrainian language, multiple-choice)
- `data/historyQuestions.ts` — Parsed history questions as `Question[]` (needs to be populated)
- `data/constitutionQuestions.ts` — Parsed constitution questions as `Question[]` (needs to be populated)

**Components (`components/`):**
- `components/QuizApp.tsx` — Root quiz component, owns state and routing between screens
- `components/QuizHome.tsx` — Topic selection screen (history vs. constitution)
- `components/QuizQuestion.tsx` — Single question display with answer options
- `components/QuizResults.tsx` — End-of-quiz results summary

### Data model

Questions follow this shape (see `data/types.ts`):
```ts
interface Question {
  id: number;
  text: string;
  options: QuestionOption[]; // 4 options with ids: "а" | "б" | "в" | "г"
  answer: OptionId;          // correct answer id
}
```

### Status

- [ ] `data/historyQuestions.ts` — questions array is empty, needs to be populated with correct answers
- [ ] `data/constitutionQuestions.ts` — questions array is empty, needs to be populated with correct answers
- [ ] Components exist but may be stubs — verify and implement quiz flow

## Stack

Next.js 16, React 19, TypeScript 5, Tailwind CSS v4, ESLint 9

**Routing:** App Router (not Pages Router). New routes go in `app/` as `page.tsx` files.

**Styling:** Tailwind CSS v4 via PostCSS. Dark mode via CSS custom properties and `prefers-color-scheme` in `globals.css`.

**TypeScript:** Strict mode. Path alias `@/*` maps to project root.

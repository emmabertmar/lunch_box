# LunchBox

A small web app where users post their lunch recipes and compete week by week.
Every recipe is tagged with an ISO week number, and the one with the most likes
that week is shown as the winner.

Built as a school project to practice React together with a real backend.

## Features

- Sign up and log in (Supabase Auth)
- Upload a recipe with a photo, ingredients and instructions
- Browse the weekly feed, like and save recipes
- Get a random recipe if you cannot decide what to cook
- Edit or delete your own recipes

## Tech

React 19, React Router and Vite on the frontend. Supabase handles auth,
the Postgres database and image storage. Access to the tables is controlled
with Row Level Security instead of a backend of our own.

## Running it locally

You need Node.js and a Supabase project.

```bash
npm install
cp .env.example .env   # then fill in your Supabase URL and anon key
npm run dev
```

The app runs on http://localhost:5173.

Run `supabase/schema.sql` in the Supabase SQL editor to create the tables and
policies, and add a public storage bucket for the recipe photos.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Build for production |
| `npm run preview` | Serve the production build |
| `npm run lint` | Run ESLint |

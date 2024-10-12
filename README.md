This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

Here’s the entire markdown in one code block, formatted for easy copying:

````markdown
# Steps to Integrate Supabase with TypeScript

Follow these steps to set up Supabase in your TypeScript project:

---

## Step 1: Install Supabase SDK

To get started with Supabase, install the necessary SDK using the following command:

```bash
npm i supabase --save-dev
```
````

This will install Supabase as a dev dependency in your project.

---

## Step 2: Log in to Supabase

Next, log in to your Supabase account via the terminal using:

```bash
npx supabase login
```

This command will prompt you to authenticate with your Supabase account, allowing you to access your projects and resources.

---

## Step 3: Generate TypeScript Definitions

In your `package.json` file, add the following command under the `scripts` section. This will allow you to generate TypeScript types from your Supabase schema:

```json
"scripts": {
  "generate:types": "supabase gen types typescript --project-id pknbhkxuqdmghngwniok > database.types.ts"
}
```

- This command uses the Supabase CLI to generate types from your Supabase project and save them into a `database.types.ts` file.
- Replace `pknbhkxuqdmghngwniok` with your actual Supabase **project ID**.

For more details, you can visit the official Supabase documentation: [Supabase Documentation](https://supabase.com/docs/reference/javascript/initializing).

---

### Next Steps

- **Run the type generation command** by running:

  ```bash
  npm run generate:types
  ```

- Use the generated `database.types.ts` file in your TypeScript project for type-safe access to your Supabase database.

---

With these steps, you’ll have Supabase integrated with TypeScript, enabling type safety and better development workflows.

```

```

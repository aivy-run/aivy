# Development documentation

## Environment

- docker
- nodejs v16
- pnpm
- supabase cli

### Things necessary

- Twitter api key and secret

*About Cloudflare Images  
Since there is no way to emulate at present, you cannot develop the processing part of image posting.
In the future, we plan to create a simple emulator for CloudflareImages.

## Steps

### Start the development server

1. Clone this repository
2. Enter the directory and run `pnpm i` to install the packages
3. Create `.env` file referring to `.env.template`
4. Run `supabase start` with the two environment variables `TWITTER_API_KEY` and `TWITTER_API_SECRET` set. (Docker required)
5. Check URL and AnonKey and add to `.env`
6. Run `pnpm dev` to start the development server

### Save database changes

1. Run `supabase gen types typescript --local > supabase/database.types.ts` to update TypeScript type definitions
2. Run `supabase db diff --use-migra -f <commit message>` to output changes to a file

## If you don't understand something

Contact us on our official Discord server
[![](/docs/images/discord-invite.png)](https://discord.gg/9NqyGWHHQu)

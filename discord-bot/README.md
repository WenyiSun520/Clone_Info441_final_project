# Steel Division 2 Helper Bot

## Getting started for developers

To use Discord.js library, make sure your **Node.js is 16.6.0 or newer**.

In `.env`, create and save your tokens as environment variables, with the given variable name if you don't want to refactor the javascript.
- DISCORDJS_BOT_TOKEN:
    1. Visit Discord developer page [here](https://discord.com/developers/applications/)
    2. Click "Application" to create a new application
    3. Click "Bot" from "SETTINGS" to create a bot in your application
    4. Click "Copy" under "TOKEN" section
> :warning: ** Before you git commit push, DO NOT commit push your credentials.

Authorize your bot to a server using this format:
> `http://discord.com/api/oauth2/authorize?client_id=<your_client_id>&scope=bot`
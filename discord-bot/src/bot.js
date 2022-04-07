import dotenv from "dotenv";
dotenv.config();
import { Client, Intents, MessageEmbed } from "discord.js";
import fetch from 'node-fetch';

// construct bot with valid intents
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const PREFIX = "$";

const BOT_CHANNEL_ID = "907724955377094707";

// commands
const LOAD_BY_UNIT_NAME = "get"

// online
bot.login(process.env.DISCORDJS_BOT_TOKEN);

bot.on('ready', () => {
    console.log(`${bot.user.tag} has logged in.`);
});

bot.on('messageCreate', async (message) => {
    // listen to bot channel only
    if (message.channel.id != BOT_CHANNEL_ID) return;

    // ignore bot messages
    if (message.author.bot) return;

    if (message.content.startsWith(PREFIX)) {
        /** `...` - spread operator */
        const [CMD_NAME, ...args] = message.content
            .trim()
            .substring(PREFIX.length)
            .split(/\s+/); /** regex: all spaces */

        // check the command
        try {
            if (CMD_NAME === LOAD_BY_UNIT_NAME) {
                loadUnitByName(args, message);
            }
            /** @todo implement `loadUnitsByCountry` */
            else {
                message.reply(`Invalid command: [${CMD_NAME}]`);
            }
        } catch (error) {
            console.log("Error at command verification:", error);
        }
    }
});

async function loadUnitByName(args, message) {
    if (args.length == 0) {
        message.reply(`You need to enter **ONE** argument for "${LOAD_BY_UNIT_NAME}" command.`);
        return;
    }

    args.forEach(async (arg) => {
        let unit_name = arg.toUpperCase();
        await fetch(`https://nameless-plateau-55648.herokuapp.com/api/v1/unit?name=${unit_name}`)
            .then(response => response.json())
            .then(async (array_json) => {
                if (array_json.length == 0) {
                    message.channel.send(`Nothing is found under this command! $${LOAD_BY_UNIT_NAME} only returns unit by its name.`);
                    return;
                }

                let response_amount = array_json.length <= 5 ? array_json.length : 5;
                for (let i = 0; i < response_amount; i++) {
                    const json = array_json[i];
                    const _keys = Object.keys(json);

                    let list = [];
                    for (let i = 1; i < _keys.length; i++) {
                        if (_keys[i] === "name") continue;

                        if (_keys[i] === "weapons") {
                            let _weapons = await loadWeaponsByUnit(json[_keys[i]].toString());
                            list.push({ name: _keys[i], value: _weapons, inline: true });
                        } else {
                            list.push({ name: _keys[i], value: json[_keys[i]].toString(), inline: true });
                        }
                        if (_keys[i] === "tagSet") list.push({ name: '\u200B', value: '\u200B' });
                    }

                    let footer_message = "";
                    if (array_json.length - response_amount > 0) {
                        footer_message = `${response_amount}/${array_json.length} results are displayed. If you want to see all, enter this command: `;
                    } else {
                        footer_message = `All ${array_json.length} results are displayed.`;
                    }

                    const unitEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle(json.name)
                        .setURL(`https://nameless-plateau-55648.herokuapp.com/api/v1/unit?name=${unit_name}`)
                        .setAuthor('Assistant')
                        .addFields(list)
                        .setTimestamp()
                        .setFooter(footer_message);

                    message.channel.send({ embeds: [unitEmbed] });
                }

                /** @todo create continuation token and implement load more/all command */
            }).catch(error => {
                console.log("[Error]:", error);
                message.reply(
                    `Hmm... I can't find anything about [${arg}]! Are you sure the spelling is correct?\nMake sure you follow this pattern: $get <unit_name>\ni.e. $get 203_H17_FIN`
                );
            });
    });
}

async function loadWeaponsByUnit(weapon_name) {
    return await fetch(`https://nameless-plateau-55648.herokuapp.com/api/v1/weapon?name=${weapon_name}`)
        .then(response => response.json())
        .then((array_json) => {
            const json = array_json[0];
            const _keys = Object.keys(json);

            let weapon_res = "";

            for (let i = 1; i < _keys.length; i++) {
                weapon_res += (`${_keys[i]}: ${json[_keys[i]].toString()}\n`);
            }

            return weapon_res;
        }).catch(error => {
            console.log("[Error]: " + error);
        });
}

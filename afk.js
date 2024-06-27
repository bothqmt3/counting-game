// afk.js

const { Client, Intents } = require("discord.js");

const afkUsers = new Map();

module.exports = {
    name: "messageCreate",
    execute(message) {
        if (message.author.bot) return;

        // Handle AFK status removal when the user sends a message
        if (afkUsers.has(message.author.id)) {
            afkUsers.delete(message.author.id);
            message.channel.send(`<a:hc_BirbDa:1254079055389523978> Welcome back, <@${message.author.id}> is no longer AFK.`);
        }

        // Check if message mentions an AFK user
        message.mentions.users.forEach((user) => {
            if (afkUsers.has(user.id)) {
                message.channel.send(`<a:hc_Diamond2:1250764691219681350> <@${user.id}> is currently AFK, the reason: ${afkUsers.get(user.id)}`);
            }
        });

        if (message.content.startsWith("~afk")) {
            const reason = message.content.split(" ").slice(1).join(" ") || "AFK";
            afkUsers.set(message.author.id, reason);
            message.channel.send(`<@${message.author.id}> is now AFK: ${reason}`);
            return;
        }
    }
};

const Discord = require("discord.js");
const http = require("http");
const config = require(`./config.json`);
const { CountingGame } = require("./count.js");
const fs = require('fs');

const client = new Discord.Client({
    shards: "auto",
    allowedMentions: { parse: [], repliedUser: false },
    intents: [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_MEMBERS,
        Discord.Intents.FLAGS.GUILD_MESSAGES,
    ],
});

// Load command files
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.on(command.name, (...args) => command.execute(...args));
}

// Start the Bot
client.login(process.env.TOKEN);

// Create a simple HTTP server to avoid port scan timeout error
const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Discord Bot is running\n");
});

// Choose a port to listen on (process.env.PORT for Heroku, or a default port)
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`HTTP server listening on port ${PORT}`);
});

// Store game instances for each channel
const games = new Map();
const BTC = ["1015763488938938388", "1112683447366991923", "1055695302386012212", "1157629753742856222", "948220309176221707", "1143200917097808044", "1236505346814644326"]; // Add BTC user IDs

// Store AFK statuses
const afkUsers = new Map();

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
    const announcementChannel = client.channels.cache.get('1248298010429882508');
    if (announcementChannel) {
        announcementChannel.send(`<@1015763488938938388> Bot đã sẵn sàng hoạt động!`);
    }
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    // Handle AFK status removal when the user sends a message
    if (afkUsers.has(message.author.id)) {
        afkUsers.delete(message.author.id);
        message.channel.send(`<a:hc_BirbDa:1254079055389523978> Welcome back, <@${message.author.id}> is no longer AFK.`);
    }

    // Check if message mentions an AFK user
    message.mentions.users.forEach((user) => {
        if (afkUsers.has(user.id)) {
            const reason = afkUsers.get(user.id);
            const replyMessage = BTC.includes(user.id)
                ? `<a:hc_Diamond2:1250764691219681350> Sorry for the inconvenience, <@${user.id}> is AFK right now for reason: **${reason}**. They will reply to you immediately after AFK.`
                : `<:hc_vaiz:1255415541770879028> <@${user.id}> is currently AFK, the reason: ${afkUsers.get(user.id)}`;
            message.channel.send(replyMessage);
        }
    });

    if (message.content.startsWith("~afk")) {
        const reason = message.content.split(" ").slice(1).join(" ") || "AFK";
        afkUsers.set(message.author.id, reason);
        message.channel.send(`<@${message.author.id}> is now AFK: ${reason}`);
        return;
    }

    if (message.content.startsWith("~rd")) {
        const args = message.content.split(" ");
        if (args.length === 2) {
            const maxNumber = parseInt(args[1]);
            if (!isNaN(maxNumber)) {
                const randomNumber = Math.floor(Math.random() * maxNumber) + 1;
                const embed = new Discord.MessageEmbed()
                    .setColor("#00ff00")
                    .setDescription(`<@${message.author.id}>, Your Number Is: ${randomNumber}`);
                message.channel.send({ embeds: [embed] });
                return;
            }
        }
    }

    if (message.channel.id !== '1219618661883445249') return;

    if (!games.has(message.channel.id)) {
        games.set(message.channel.id, new CountingGame(message.channel));
    }

    const game = games.get(message.channel.id);

    if (message.content === '!startc') {
        if (BTC.includes(message.author.id)) {
            game.startGame();
        } else {
            message.reply("Chỉ BTC mới có quyền bắt đầu trò chơi.");
        }
        return;
    }

    if (message.content === '!endc') {
        if (BTC.includes(message.author.id)) {
            game.endGame();
            games.delete(message.channel.id);
        } else {
            message.reply("Chỉ BTC mới có quyền kết thúc trò chơi.");
        }
        return;
    }

    if (game.inProgress && !message.author.bot) {
        game.processMessage(message);
    }
});

const Discord = require("discord.js");
const http = require("http");
const config = require(`./config.json`);
const WordChainGame = require("./wordchain.js");

const client = new Discord.Client({
    shards: "auto",
    allowedMentions: { parse: [], repliedUser: false },
    intents: [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_MEMBERS,
        Discord.Intents.FLAGS.GUILD_MESSAGES,
    ],
});

// List các ID của BTC
const BTC = ['1015763488938938388'];

// Start the Bot
client.login(process.env.token);

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

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
    const announcementChannel = client.channels.cache.get('1248298010429882508');
    if (announcementChannel) {
        announcementChannel.send(`<@1015763488938938388> Bot đã sẵn sàng hoạt động!`);
    }
});

client.on("messageCreate", async (message) => {
    if (message.channel.id !== '1248294576184361007') return;

    if (!games.has(message.channel.id)) {
        games.set(message.channel.id, new WordChainGame(message.channel));
    }

    const game = games.get(message.channel.id);

    if (message.content === '!start') {
        if (BTC.includes(message.author.id)) {
            if (!game.players.includes(message.author)) {
                game.addPlayer(message.author);
            }
            game.startGame();
        } else {
            message.channel.send("Chỉ có BTC mới có quyền bắt đầu trò chơi.");
        }
        return;
    }

    if (message.content === '!end') {
        if (BTC.includes(message.author.id)) {
            game.endGame();
            games.delete(message.channel.id);
        } else {
            message.channel.send("Chỉ có BTC mới có quyền kết thúc trò chơi.");
        }
        return;
    }

    if (game.inProgress && !message.author.bot) {
        if (!game.players.includes(message.author)) {
            game.addPlayer(message.author);
        }
        game.processWord(message);
    }
});

const Discord = require("discord.js");

const initialWords = ["con cá", "chim sẻ", "bông hoa", "mặt trời", "biển xanh", "bở ngỡ", "bồi hồi", "mông lung", "mộng mơ", "ao ước", "lung lay", "mệt mỏi", "rã rời", "buông bỏ"];

class WordChainGame {
    constructor(channel) {
        this.channel = channel;
        this.players = new Set();
        this.lastPlayer = null;
        this.currentWord = null;
        this.inProgress = false;
    }

    startGame() {
        this.inProgress = true;
        this.players.clear();
        this.lastPlayer = null;
        this.sendRandomWord();
    }

    endGame() {
        this.inProgress = false;
        this.channel.send("Trò chơi đã kết thúc.");
    }

    sendRandomWord() {
        this.currentWord = initialWords[Math.floor(Math.random() * initialWords.length)];
        this.channel.send(`Bắt đầu trò chơi! Từ đầu tiên là: **${this.currentWord}**`);
    }

    isValidWord(word) {
        const vietnameseRegex = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠ-ỹ0-9\s]+$/;
        return vietnameseRegex.test(word);
    }

    processWord(message) {
        const word = message.content.trim().toLowerCase();
        if (!this.isValidWord(word)) {
            message.react("❌");
            message.reply("Từ không hợp lệ. Tiếp tục trò chơi với một từ ngẫu nhiên.");
            this.sendRandomWord();
            return;
        }

        if (this.players.has(message.author.id)) {
            if (this.lastPlayer === message.author.id) {
                message.react("❌");
                message.reply("Bạn không thể nối hai lần liên tiếp. Trò chơi đã được reset.");
                this.startGame();
                return;
            }
        }

        if (word.includes("http") || word.includes("www")) {
            message.react("❌");
            message.reply("Không được dùng liên kết. Tiếp tục trò chơi với một từ ngẫu nhiên.");
            this.sendRandomWord();
            return;
        }

        if (/\d/.test(word)) {
            message.react("❌");
            message.reply("Không được dùng số. Tiếp tục trò chơi với một từ ngẫu nhiên.");
            this.sendRandomWord();
            return;
        }

        const lastWord = this.currentWord.split(" ").pop();
        const firstWord = word.split(" ")[0];

        if (lastWord !== firstWord) {
            message.react("❌");
            message.reply(`Từ nối không đúng. Tiếp tục trò chơi với một từ ngẫu nhiên.`);
            this.sendRandomWord();
            return;
        }

        this.players.add(message.author.id);
        this.lastPlayer = message.author.id;
        this.currentWord = word;
        message.react("✅");
        this.channel.send(`Từ tiếp theo là: **${word}**`);
    }
}

module.exports = WordChainGame;

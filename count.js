class CountingGame {
    constructor(channel) {
        this.channel = channel;
        this.inProgress = false;
        this.currentNumber = 0;
        this.lastUser = null;
    }

    startGame() {
        this.inProgress = true;
        this.currentNumber = 0;
        this.lastUser = null;
        this.channel.send("Trò chơi đếm số đã bắt đầu! Bắt đầu từ số 1.");
    }

    endGame() {
        this.inProgress = false;
        this.currentNumber = 0;
        this.lastUser = null;
        this.channel.send("Trò chơi đếm số đã kết thúc!");
    }

    async processMessage(message) {
        const content = message.content.trim();

        if (isNaN(content) || parseInt(content) !== this.currentNumber + 1) {
            await message.react("❌");
            await message.reply("Sai rồi! Trò chơi sẽ được reset về 1.");
            this.resetGame();
            return;
        }

        if (message.author.id === this.lastUser) {
            await message.react("❌");
            await message.reply("Bạn không thể đếm hai lần liên tiếp! Trò chơi sẽ được reset về 1.");
            this.resetGame();
            return;
        }

        if (this.containsLink(content)) {
            await message.react("❌");
            await message.reply("Không được gửi link! Trò chơi sẽ được reset về 1.");
            this.resetGame();
            return;
        }

        if (!this.isMathExpression(content)) {
            await message.react("❌");
            await message.reply("Chỉ được phép sử dụng kí tự toán học và tính toán ra số chính xác. Trò chơi sẽ được reset về 1.");
            this.resetGame();
            return;
        }

        this.currentNumber++;
        this.lastUser = message.author.id;
        await message.react("✅");
    }

    resetGame() {
        this.currentNumber = 0;
        this.lastUser = null;
        this.channel.send("Trò chơi sẽ bắt đầu lại từ 1.");
    }

    containsLink(text) {
        const urlPattern = new RegExp('https?://[^\s/$.?#].[^\s]*', 'i');
        return urlPattern.test(text);
    }

    isMathExpression(text) {
        try {
            // Evaluate the expression to see if it results in the expected number
            const result = eval(text);
            return !isNaN(result) && result === this.currentNumber + 1;
        } catch (e) {
            return false;
        }
    }
}

module.exports = { CountingGame };

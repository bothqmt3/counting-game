const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("afk")
        .setDescription("Sets your AFK status with an optional reason")
        .addStringOption(option => 
            option.setName("reason")
                .setDescription("The reason you are AFK")
                .setRequired(false)),
    async execute(interaction) {
        const reason = interaction.options.getString("reason") || "No reason provided";
        const member = interaction.member;
        const prevNickname = member.nickname || member.user.username;

        await interaction.reply(`You are now AFK: ${reason}`);
        await member.setNickname("[AFK] " + prevNickname);
    }
};

const { Client, Intents, MessageEmbed } = require('discord.js');

const deletedMessages = new Map();

// Event listener for message deletions
function handleDeletedMessage(client) {
    client.on('messageDelete', message => {
        if (message.partial) return; // If the message was not cached, it can't be retrieved
        if (message.channel.id === '1219618661883445249') return; // Ignore messages in the specific channel for count.js

        const channelId = message.channel.id;
        if (!deletedMessages.has(channelId)) {
            deletedMessages.set(channelId, []);
        }

        const log = {
            content: message.content,
            author: message.author.tag,
            timestamp: Date.now()
        };

        deletedMessages.get(channelId).unshift(log);

        // Limit stored messages to 100 per channel
        if (deletedMessages.get(channelId).length > 100) {
            deletedMessages.get(channelId).pop();
        }

        // Create and send embed message
        const embed = new MessageEmbed()
            .setColor('RED')
            .setTitle('Tin nhắn vừa bị xóa:')
            .setDescription(`> ${message.content}`)
            .setFooter(`Bởi ${message.author.tag} vào lúc`)
            .setTimestamp(log.timestamp);

        message.channel.send({ embeds: [embed] });
    });
}

// Command handler for !snipe
function handleSnipeCommand(client) {
    client.on('messageCreate', message => {
        if (message.content.startsWith('!snipe')) {
            const args = message.content.split(' ').slice(1);
            const snipeCount = parseInt(args[0]) || 1;

            const channelId = message.channel.id;
            const snipes = deletedMessages.get(channelId) || [];

            if (snipes.length === 0) {
                message.channel.send('Không có tin nhắn nào bị xóa để hiện.');
                return;
            }

            const embed = new MessageEmbed()
                .setColor('RED')
                .setTitle('Tin nhắn đã xóa:');

            snipes.slice(0, snipeCount).forEach((log, index) => {
                embed.addField(`Tin nhắn #${index + 1}`, `> ${log.content}\n- Bởi ${log.author} vào lúc <t:${Math.floor(log.timestamp / 1000)}:R>`);
            });

            message.channel.send({ embeds: [embed] });

            // Delete the command message to keep the channel clean
            message.delete();
        }
    });
}

module.exports = {
    handleDeletedMessage,
    handleSnipeCommand
};

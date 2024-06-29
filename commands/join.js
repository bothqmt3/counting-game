const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'guildCreate',
    async execute(guild) {
        const welcomeChannel = guild.systemChannel || guild.channels.cache.find(channel => 
            channel.type === 'GUILD_TEXT' && channel.permissionsFor(guild.me).has('SEND_MESSAGES')
        );

        if (welcomeChannel) {
            const embed = new MessageEmbed()
                .setColor('#00FF00')
                .setTitle('Thank you for adding me to your server!')
                .setDescription('Enter `/help` or `~help` to get more information about the commands the bot currently has and is working properly.')
                .setFooter('MicroTechie ・Power By HQMT 💎', guild.me.user.displayAvatarURL());

            welcomeChannel.send({ embeds: [embed] });
        }
    },
};

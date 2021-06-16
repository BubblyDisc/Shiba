const { get } = require("axios");
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "trumptweet",
  description: "make trump tweet text!",
  run: async (client, message, args) => {
    if (!args.length) return message.reply("you need some text there!");
    try {
      const { data } = await get(
        `https://nekobot.xyz/api/imagegen?type=trumptweet&text=${args
          .clean}`
      );
      message.reply({ embeds: [new MessageEmbed()

        .setImage(data.message)
        .setColor('RANDOM')]

      });
    } catch (err) {
      return console.error(err.message);
    }
  },
};

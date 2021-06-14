module.exports={
  name: "message",
  run: async(message,client)=>{
  const GuildConfig = require("../database/GuildConfig")
  if (message.author.bot) return;
  const data = await GuildConfig.findOne({ guildId: message.guild.id });
  if (!data)
    return message.reply({
      embed: client.embed(
        {
          description: `If you are seeing this message it is because Shiba has not been able to add your server to the database.\nTo fix this issue kick, then re-add Shiba to your server.\nIf this issue keeps happening contact \`nahan#6480\``,
        },
        message
      ),
    });
  const prefix = data.get("prefix");
  if (!message.content.startsWith(prefix)) return;
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command =
    client.commands.get(commandName) ||
    client.commands.find(
      (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
    );

  if (!command) return;

  if(client.cooldowns.has(`${message.author.id}-${command.name}`)) {
    return message.reply({ embed: client.embed({ description: `Try this command in ${ms(client.cooldowns.get(`${message.author.id}-${command.name}`) - Date.now(), { long: true })}`}, message)})
  }



  if (command.guildOnly && message.channel.type === "dm") {
    return message.channel.send(`This is a guild only command.`);
  }

  if (command.beta) {
    const betaTesters = ["243845797643419658", "520797108257816586", "427181678704984064"]
    if(!betaTesters.includes(message.author.id)) return message.reply({ embed: client.embed({ description: `This is currently a beta feature`}, message)})
  }

  if (command.userPermissions) {
    const authorPerms = message.channel.permissionsFor(message.author);
    if (!authorPerms || !authorPerms.has(command.userPermissions)) {
      return message.channel.send({
        embed: client.embed(
          {
            description: `You require the permission: \`${command.userPermissions}\``,
          },
          message
        ),
      });
    }
  }

  if (command.args && !args.length) {
    let reply = `❌ | Incorrect Usage`;

    if (command.usage) {
      reply += `\nCorrect Usage: \`${command.usage}\``;
    }

    return message.channel.send({
      embed: client.embed({ description: reply }, message),
    });
  }

  if (command.ownerOnly && !["243845797643419658","520797108257816586"].includes(message.author.id)) return;

  try {
    command.run(client, message, args);
    if(command.cooldown) {
      client.cooldowns.set(`${message.author.id}-${command.name}`, Date.now() + command.cooldown)
      setTimeout(() => {
        client.cooldowns.delete(`${message.author.id}-${command.name}`)
      }, command.cooldown)
    }

    if(!command.cooldown) {
      client.cooldowns.set(`${message.author.id}-${command.name}`, Date.now() + 3000)
      setTimeout(() => {
        client.cooldowns.delete(`${message.author.id}-${command.name}`)
      }, 3000)
    }
  } catch (error) {
    console.log(error);
    message.channel.send(`${error}`);
  }
}
}

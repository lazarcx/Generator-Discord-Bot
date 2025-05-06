const { Client, GatewayIntentBits, Partials, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const config = require('./config.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel]
});

client.once('ready', () => {
    console.log(`✅ Bot je prijavljen kao ${client.user.tag}`);
  
    client.user.setActivity('github.com/lazarcx', {
      type: 1 // 1 = Playing
    });
  });
  

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content.startsWith(config.prefix)) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // !gen <servis>
  if (command === 'gen') {
    const service = args[0];

    if (!service) {
      return message.channel.send('⚠️ Koristi: `!gen <servis>`');
    }

    const stockFile = `./stock/${service}.txt`;

    if (!fs.existsSync(stockFile)) {
      return message.channel.send('❌ Servis ne postoji.');
    }

    const lines = fs.readFileSync(stockFile, 'utf-8').split('\n').filter(Boolean);

    if (lines.length === 0) {
      return message.channel.send('❌ Nema više naloga za ovaj servis.');
    }

    const account = lines[0];
    fs.writeFileSync(stockFile, lines.slice(1).join('\n'));

    try {
      await message.author.send(`🎮 Tvoj **${service}** nalog: \`${account}\``);
      await message.channel.send('✅ Poslao sam ti nalog u DM.');
    } catch (err) {
      await message.channel.send('❌ Ne mogu ti poslati DM. Uključi poruke od članova servera.');
    }
  }

  // !add <servis> user:pass
  if (command === 'add') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.channel.send('❌ Samo admini mogu koristiti ovu komandu.');
    }

    const service = args[0];
    const account = args[1];

    if (!service || !account || !account.includes(':')) {
      return message.channel.send('⚠️ Koristi: `!add <servis> user:pass`');
    }

    const stockFile = `./stock/${service}.txt`;
    fs.appendFileSync(stockFile, `\n${account}`);
    return message.channel.send(`✅ Dodat nalog za **${service}**.`);
  }

  // !stock <servis>
  if (command === 'stock') {
    const service = args[0];

    if (!service) {
      return message.channel.send('⚠️ Koristi: `!stock <servis>`');
    }

    const stockFile = `./stock/${service}.txt`;

    if (!fs.existsSync(stockFile)) {
      return message.channel.send('❌ Servis ne postoji.');
    }

    const lines = fs.readFileSync(stockFile, 'utf-8').split('\n').filter(Boolean);
    return message.channel.send(`📦 Preostalo naloga za **${service}**: **${lines.length}**`);
  }
    // !help
    if (command === 'help') {
        const helpText = `
    **🤖 Generator Bot Komande**
    \`\`\`
    !gen <servis>         → Dobijaš nalog iz stocka (u DM)
    !stock <servis>       → Prikazuje koliko naloga ima za servis
    !services             → Lista svih servisa u stock folderu
    !add <servis> user:pass   → (Admin) Dodaje nalog u servis
    !help                 → Prikazuje ovu poruku
    \`\`\`
    📦 Primer: !gen steam
    `;
        return message.channel.send(helpText);
      }    
});

client.login(config.token);

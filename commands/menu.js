export const info = {
  name: 'menu',
  aliases: ['help', 'commands'],
  description: 'Show available commands',
};

export const menuCommand = async (m, sock) => {
  const prefix = '.';

  const text = `
📜 *DEBATEJ-BOTS TESTING* 🤖
╭━━━━━━━━━━━━━━━━━━━
│CREATOR: DEBATEJ 
│PREFIX: ${prefix}
╰━━━━━━━━━━━━━━━━━━━

◆▬▬❴ *bot* ❵▬▬◆
 ♪ွဳ⃟🍀 *menu*
 ♪ွဳ⃟🍀 *ping*
 ♪ွဳ⃟🍀 *alive*
 ♪ွဳ⃟🍀 *uptime*
◆▬▬▬▬▬▬▬▬◆
◆▬▬❴ *Tools* ❵▬▬◆
 ♪ွဳ⃟🍀 *nowa*
◆▬▬▬▬▬▬▬▬◆
━━━━━━━━━━━━━━━━━━━
> © 2025 DEBATEJ BOTS 
`.trim();

  await sock.sendMessage(m.key.remoteJid, { text }, { quoted: m });
};
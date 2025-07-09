export const info = {
  name: 'alive',
  aliases: [],
  description: 'Show bot status',
};

export const aliveCommand = async (m, sock) => {
  const text = `✅ *Bot is alive and running!*\n> 2025 DEBATEJ BOTS`;
  await sock.sendMessage(m.key.remoteJid, { text }, { quoted: m });
};
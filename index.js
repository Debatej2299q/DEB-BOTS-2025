import {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeWASocket,
  DisconnectReason
} from '@whiskeysockets/baileys';
import pino from 'pino';
import { Boom } from '@hapi/boom';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Constants ---
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prefix = '.';
const ownerNumber = '918761888106@s.whatsapp.net';

// --- Auto Import Commands ---
async function loadCommands() {
  const commands = [];
  const files = fs.readdirSync(path.join(__dirname, 'commands'));
  for (const file of files) {
    if (!file.endsWith('.js')) continue;
    const { info, [`${info.name}Command`]: commandFunc } = await import(`./commands/${file}`);
    if (info && typeof commandFunc === 'function') {
      commands.push({ info, execute: commandFunc });
    }
  }
  return commands;
}

// --- Find Command Helper ---
function findCommand(commands, cmd) {
  return commands.find(
    ({ info }) => info.name === cmd || (info.aliases && info.aliases.includes(cmd))
  );
}

// --- Main Bot ---
const startBot = async () => {
  // Load all commands
  const commandsArr = await loadCommands();

  // Baileys setup
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    auth: state,
    printQRInTerminal: false // Don't print QR!
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, pairingCode } = update;

    if (pairingCode) {
      // Show pair code in terminal
      console.log('\n🔗 Pairing code for WhatsApp:');
      console.log(`   👉 ${pairingCode} 👈\n`);
      console.log('Go to WhatsApp > Linked Devices > Link with phone number, and enter this code.');
    }

    if (connection === 'open') {
      console.log('✅ Bot connected successfully!');
      await sock.sendMessage(ownerNumber, {
        text: '🟢 DEBATEJ-BOTZ is now online!'
      });
    }

    if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect?.error instanceof Boom &&
        lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut;
      console.log('❌ Disconnected. Reconnecting:', shouldReconnect);
      if (shouldReconnect) startBot();
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0];
    if (!m?.message) return;

    // Get incoming text (works for text, extended, and captions)
    const msg =
      m.message.conversation ||
      m.message.extendedTextMessage?.text ||
      m.message.imageMessage?.caption ||
      m.message.videoMessage?.caption ||
      '';

    if (!msg.startsWith(prefix)) return;

    const command = msg.slice(prefix.length).split(' ')[0].toLowerCase();
    const body = msg.slice(prefix.length + command.length).trim();

    console.log(`📨 CMD from [${m.key.remoteJid}]: ${msg}`);

    // Find and run the matched command
    const cmdObj = findCommand(commandsArr, command);
    if (cmdObj) {
      try {
        await cmdObj.execute(m, sock, { body });
      } catch (e) {
        console.error('❌ Command error:', e);
        await sock.sendMessage(m.key.remoteJid, { text: '❌ Error executing command.' }, { quoted: m });
      }
    }
  });
};

startBot();
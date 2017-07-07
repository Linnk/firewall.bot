/**
 * I'm a bot that unblocks IP's from whm/csf firewalls. :D
 *
 * The configuration file (config.json) should be something like this:
 *
 *   {
 *     "telegram_bot_token": "You secret token",
 *     "password": "Your favorite password"
 *   }
 *
 * @author Ignacio Benavides
 */
const config = JSON.parse(require('fs').readFileSync('config.json', 'utf8'));

const TelegramBot = require('node-telegram-bot-api');
const exec = require('child_process').exec;
const ipRegex = require('ip-regex');

console.log('STARTING: ' + config.telegram_bot_token);

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, {polling: true});

// Should matche ".unblock [whatever]"
bot.onText(/\.unblock (.+)/, (msg, match) => {

	var ip = match[1];
	if (ipRegex({exact: true}).test(ip))
	{
		var command = 'csf -dr ' + ip;
		command += ' && csf -tr ' + ip;
		command += ' && echo "Searching — Blocks from brute force for IP: ' + ip + '"';
		command += ' && echo "SELECT * FROM brutes WHERE IP = \'' + ip + '\';" | mysql cphulkd';
		command += ' && echo "Searching — Blocks from failed logins for IP: ' + ip + '"';
		command += ' && echo "SELECT * FROM logins WHERE IP = \'' + ip + '\';" | mysql cphulkd';
		command += ' && echo "DELETE FROM brutes WHERE IP = \'' + ip + '\';" | mysql cphulkd';
		command += ' && echo "DELETE FROM logins WHERE IP = \'' + ip + '\';" | mysql cphulkd';

		exec(command, (error, stdout, stderr) => {
			bot.sendMessage(msg.chat.id, stdout);
		});
	}
	else
	{
		bot.sendMessage(msg.chat.id, 'IP inválida.');
	}
});

// Marco polo.
bot.on('message', (msg) => {
	if (msg.text.toLowerCase() === 'marco')
	{
		bot.sendMessage(msg.chat.id, 'Polo!');
	}

	console.log('Message recieved: ' + msg.text);
});

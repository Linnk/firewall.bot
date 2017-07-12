/**
 * I'm a bot that unblocks IP's from whm/csf firewalls. :D
 *
 * The configuration file (config.json) should be something like this:
 *
 *   {
 *     "telegram_bot_token": "You secret token",
 *     "messenger_bot_token": "pending",
 *     "password": "Your favorite password"
 *   }
 *
 * @author Ignacio Benavides
 */
const config = JSON.parse(require('fs').readFileSync('config.json', 'utf8'))

const TelegramBot = require('node-telegram-bot-api')
const exec = require('child_process').exec
const ipRegex = require('ip-regex')

console.log('STARTING: ' + config.telegram_bot_token)

const bot = new TelegramBot(config.telegram_bot_token, {polling: true})

const CHATS_AUTHENTICATED = {}

const COMMANDS_LIST = {
	"uptime": "uptime",
	"ps": "ps aux"
}
const FUN_MESSAGES = {
	"marco": "polo",
	"<3": ":D",
}

Object.assign(COMMANDS_LIST, config.commands)
Object.assign(FUN_MESSAGES, config.fun)

// Should matche ".unblock [whatever]"
bot.onText(/\.unblock (.+)/, (msg, match) => {
	if (CHATS_AUTHENTICATED[msg.chat.id])
	{
		var ip_address = match[1]

		if (ipRegex({exact: true}).test(ip))
		{
			var command = 'csf -dr ' + ip_address
			command += ' && csf -tr ' + ip_address
			command += ' && echo "Searching — Blocks from brute force for IP: ' + ip_address + '"'
			command += ' && echo "SELECT * FROM brutes WHERE IP = \'' + ip_address + '\'" | mysql cphulkd'
			command += ' && echo "Searching — Blocks from failed logins for IP: ' + ip_address + '"'
			command += ' && echo "SELECT * FROM logins WHERE IP = \'' + ip_address + '\'" | mysql cphulkd'
			command += ' && echo "DELETE FROM brutes WHERE IP = \'' + ip_address + '\'" | mysql cphulkd'
			command += ' && echo "DELETE FROM logins WHERE IP = \'' + ip_address + '\'" | mysql cphulkd'

			exec(command, (error, stdout, stderr) => {
				bot.sendMessage(msg.chat.id, stdout)
			})
		}
		else
		{
			bot.sendMessage(msg.chat.id, 'Invalid IP.')
		}
	}
	else
	{
		bot.sendMessage(msg.chat.id, 'First authenticate yourself by typing:\n\n.password ******')
	}
})

// Should matche ".unblock [whatever]"
bot.onText(/\.password (.+)/, (msg, match) => {
	var password = match[1]
	if (password === config.password)
	{
		CHATS_AUTHENTICATED[msg.chat.id] = true
	}
})

// Marco — Polo
bot.onText(/marco/i, (msg, match) => {
	bot.sendMessage(msg.chat.id, 'Polo.')
})

// Logging.
bot.on('message', (msg) => {
	var message = msg.text.toLowerCase();

	if (CHATS_AUTHENTICATED[msg.chat.id] && COMMANDS_LIST[message])
	{
		exec(COMMANDS_LIST[message], (error, stdout, stderr) => {
			bot.sendMessage(msg.chat.id, stdout)
		})
	}
	else if (CHATS_AUTHENTICATED[msg.chat.id] && FUN_MESSAGES[message])
	{
		bot.sendMessage(msg.chat.id, FUN_MESSAGES[message])
	}
	else if (CHATS_AUTHENTICATED[msg.chat.id])
	{
		bot.sendMessage(msg.chat.id, 'The command you\'re looking can\'t be found.')
	}
	else
	{
		bot.sendMessage(msg.chat.id, 'First authenticate yourself by typing:\n\n.password ******')
	}

	console.log('Message: ' + message)
})

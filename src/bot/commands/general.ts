import { TextBasedChannels, MessageEmbed, Client } from 'discord.js';
import msu from 'minecraft-server-util';
import dotenv from 'dotenv'; dotenv.config();
import { mError, mHelp, mPing, mGame, mInfo } from './messages.js';

/**
 * Sends Bot's command info to the given chat.
 * @param chat
 * @returns
 */
export function help(chat: TextBasedChannels): void {
    let embed = new MessageEmbed({ title: 'Comandos' });

    for (let category in mHelp) {
        let text = '';
        for (let term in mHelp[category])
            text += `\n. \`${term}\` : ${mHelp[category][term]}`;
        embed.addField(category, text);
    }

    chat.send({ embeds: [embed] }); return;
}

/**
 * Sends Bot's info to given chat.
 * @param client 
 * @param chat 
 * @returns 
 */
export function info(client: Client, chat: TextBasedChannels): void {
    let embed = new MessageEmbed({
        title: mInfo.title,
        description: mInfo.description(client.application!.id, process.env.npm_package_version!)
    });

    chat.send({ embeds: [embed] }); return;
}

/**
 * Sends Bot's ping to the given chat.
 * @param chat 
 * @param time in seconds, when message was created.
 * @returns
 */
export async function ping(chat: TextBasedChannels, time: number): Promise<void> {
    let msg = await chat.send(mPing.pinging);
    let ping = msg.createdTimestamp - time;

    msg.delete();

    chat.send(mPing.done(ping)); return;
}

/**
 * Sends Minecraft Server status to the given chat.
 * @param chat 
 * @param args User given ip address.
 * @returns 
 */
export async function mc(chat: TextBasedChannels, args: string): Promise<void> {
    let ip = (args.length == 0) ? process.env.MCSERVER! : args;
    let embed = new MessageEmbed({ title: `\`${ip}\`` });

    try {
        let data = await msu.status(ip);
        let description = (data.description!.toRaw().length > 0) ? data.description!.toRaw() : '_ _';
        let playerNames = (data.samplePlayers!.length > 0) ? data.samplePlayers!.map(p => p.name).join(', ') : '_ _';

        embed.setColor('#00FF00')
            .setAuthor('ONLINE', 'https://i.imgur.com/JytGYe6.png')
            .addField('Descrição', description, true)
            .addField(`Jogadores (${data.onlinePlayers}/${data.maxPlayers})`, playerNames, true);
    }
    catch (e) {
        embed.setColor('#FF0000')
            .setAuthor('OFFLINE', 'https://i.imgur.com/JytGYe6.png');
    }

    chat.send({ embeds: [embed] }); return;
}

/**
 * Sends a random game to the given chat.
 * @param chat 
 * @param args separated by commas, User given games to randomize.
 * @returns 
 */
export function game(chat: TextBasedChannels, args: string): void {
    let list = args.split(',').map(g => g.trim()).filter(g => g.length > 0);

    /* Invalid arguments */
    if (args.length != 0 && list.length == 0) { chat.send(mError.invalidArgs); return; }
    /* No arguments */
    if (args.length == 0) list = mGame;

    /* Generate a random index */
    let index = Math.floor(Math.random() * list.length);

    chat.send(list[index]); return;
}

/**
 * Sends unknown command message to the given chat.
 * @param chat 
 * @returns 
 */
export function unknown(chat: TextBasedChannels): void { chat.send(mError.unknownCmd); return; }
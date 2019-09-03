import { Bot } from './bot/bot';
import { Commands } from './bot/command/commands';
const commands = new Commands();
export const BOT = new Bot({ commands });
export * from './bot/command/definitions';
import type {
  ChatInputCommandInteraction,
  Client,
  Collection,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";

export type BotCommandData =
  | SlashCommandBuilder
  | SlashCommandOptionsOnlyBuilder
  | SlashCommandSubcommandsOnlyBuilder;

export interface BotCommand {
  data: BotCommandData;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export interface BotEvent<T extends unknown[] = unknown[]> {
  name: string;
  once: boolean;
  execute: (...args: T) => Promise<void> | void;
}

declare module "discord.js" {
  interface Client {
    commands: Collection<string, BotCommand>;
  }
}

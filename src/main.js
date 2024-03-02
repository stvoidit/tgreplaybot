import CreateApiFunction from "./gapi/index.js";
import { Telegraf } from "telegraf";
import dayjs from "dayjs";
import fs from "node:fs";
import { message } from "telegraf/filters";
import parseArgs from "minimist";
import parserFunc from "./parser/index.js";
import pino from "pino";
import { pre } from "telegraf/format";
import pretty from "pino-pretty";

const prettyJSON = (value) => JSON.stringify(value, null, 2);
const readConfig = (configFilename) => JSON.parse(fs.readFileSync(configFilename));
const jsonFormatMessage = pre("json");
const logger = pino(pretty({ colorize: true }));
logger.level = "debug";

async function main() {
    const { config } = parseArgs(process.argv.splice(2));
    logger.debug(`configFilename: ${config}`);
    const { botToken, keyFilename, range, spreadsheetId } = readConfig(config);
    logger.debug(`config params:\n${prettyJSON({ botToken, keyFilename, range, spreadsheetId })}`);
    const AppendData = await CreateApiFunction(
        keyFilename,
        spreadsheetId,
        range
    );
    const bot = new Telegraf(botToken);
    bot.on(message("text"), async (ctx) => {
        logger.info(`new message: ${JSON.stringify(ctx.message)}`);
        const report = parserFunc(ctx.message.text);
        report.date = dayjs(ctx.message.date * 1000).format("DD.MM.YYYY HH:mm:ss");
        let response;
        try {
            response = await AppendData(report);
            logger.info(`response: ${JSON.stringify(response)}`);
        } catch (err) {
            response = err;
            logger.error(`response: ${JSON.stringify(response)}`);
        }
        try {
            await ctx.reply(jsonFormatMessage(prettyJSON(response)));
        } catch (err) {
            logger.error(err);
        }
    });
    bot.launch(() => logger.info("bot started"));

    // Enable graceful stop
    process.once("SIGINT", () => bot.stop("SIGINT"));
    process.once("SIGTERM", () => bot.stop("SIGTERM"));
}


main();

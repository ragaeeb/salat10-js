const TelegramBot = require('node-telegram-bot-api');
const hat = require('hat');
const sdk = require('@ilmtest/salat10-sdk');
const { pause } = require('../../src/utils/testing');
const location = require('../../src/handlers/location');

jest.mock('@ilmtest/salat10-sdk');

describe('location', () => {
    let bot;
    let sendChatActionSpy;
    let sendMessageSpy;

    beforeEach(() => {
        bot = new TelegramBot(hat());
        sendChatActionSpy = jest.spyOn(bot, 'sendChatAction');
        sendMessageSpy = jest.spyOn(bot, 'sendMessage');

        sdk.calculate.mockRestore();
        sdk.formatAsText.mockRestore();
    });

    it('should not reply to foreign commands', async () => {
        location(bot);

        const message = {
            message_id: hat(),
            text: '/start',
            chat: {
                id: hat(),
            },
        };

        await bot.processUpdate({
            update_id: hat(),
            message,
        });

        await pause();

        expect(sendMessageSpy).not.toHaveBeenCalled();
    });

    it('should reply to location command', async () => {
        const calculationResult = hat();
        sdk.calculate.mockImplementation(() => calculationResult);

        const formattedText = hat();
        sdk.formatAsText.mockResolvedValue(formattedText);

        location(bot);

        const latitude = hat();
        const longitude = hat();

        const message = {
            message_id: hat(),
            chat: {
                id: hat(),
            },
            location: {
                latitude,
                longitude,
            },
        };

        await bot.processUpdate({
            update_id: hat(),
            message,
        });

        await pause();

        expect(sendChatActionSpy).toHaveBeenCalledTimes(1);
        expect(sendChatActionSpy).toHaveBeenCalledWith(message.chat.id, 'typing');

        expect(sdk.calculate).toHaveBeenCalledTimes(1);
        expect(sdk.calculate).toHaveBeenCalledWith(latitude, longitude);

        expect(sdk.formatAsText).toHaveBeenCalledTimes(1);
        expect(sdk.formatAsText).toHaveBeenCalledWith(calculationResult, latitude, longitude);

        expect(sendMessageSpy).toHaveBeenCalledTimes(1);
        expect(sendMessageSpy).toHaveBeenCalledWith(message.chat.id, formattedText, {
            chat_id: message.chat.id,
            reply_to_message_id: message.message_id,
            text: formattedText,
        });
    });
});
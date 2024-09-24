import { Markup, Scenes } from 'telegraf';
import { callbackQuery } from 'telegraf/filters';
import { MyContext } from '..';

export const mainScene = new Scenes.BaseScene<MyContext>('mainScene');

mainScene.enter(async (ctx): Promise<void> => {
    const { message_id } = await ctx.reply(
        'Выбор действия:',
        Markup.inlineKeyboard(
            [
                Markup.button.callback('Добавить компанию', 'addCompany'),
                Markup.button.callback('Добавить контрагента', 'addPartner'),
                Markup.button.callback('Добавить платеж', 'addPayment'),
                Markup.button.callback('Аналитика', 'analytics'),
            ],
            { columns: 2 },
        ),
    );
    ctx.session.msgId = message_id;
});

mainScene.on(callbackQuery('data'), async (ctx): Promise<boolean> => {
    ctx.deleteMessage();
    switch (ctx.callbackQuery.data) {
        case 'addCompany':
            await ctx.scene.enter('addCompanyName');
            break;
        case 'addPartner':
            await ctx.scene.enter('addPartnerName');
            break;
        case 'addPayment':
            await ctx.scene.enter('addPayment');
            break;
        case 'analytics':
            await ctx.scene.enter('analytics');
            break;
        default:
            await ctx.scene.reenter();
    }
    return await ctx.answerCbQuery();
});

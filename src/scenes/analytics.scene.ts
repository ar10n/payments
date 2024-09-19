import { Markup, Scenes } from "telegraf";
import { MyContext } from "../index";
import { callbackQuery } from "telegraf/filters";

export const analyticsScene = new Scenes.BaseScene<MyContext>('analytics');

analyticsScene.enter(async (ctx): Promise<void> => {
    const { message_id } = await ctx.reply(
        'Выберите шаблон для показа аналитики:',
        Markup.inlineKeyboard([
            Markup.button.callback('Общая сумма', 'sum-all'),
            Markup.button.callback('5 последних', 'five-all'),
            Markup.button.callback('Общая по компании', 'sum-company'),
            Markup.button.callback('5 последних по компании', 'five-company'),
            Markup.button.callback('Общая по контрагенту', 'sum-partner'),
            Markup.button.callback('5 последних по контрагенту', 'five-partner'),
            Markup.button.callback('Выход', 'exit')
        ], { columns: 2 })
    );
    ctx.session.msgId = message_id;
});

analyticsScene.on(callbackQuery('data'), async (ctx): Promise<boolean> => {
    await ctx.deleteMessage();
    switch (ctx.callbackQuery.data) {
        case 'sum-all':
            await ctx.scene.enter('sum-all');
            break;
        case 'five-all':
            await ctx.scene.enter('five-all');
            break;
        case 'sum-company':
            await ctx.scene.enter('sum-company');
            break;
        case 'five-company':
            await ctx.scene.enter('five-company');
            break;
        case 'sum-partner':
            await ctx.scene.enter('sum-partner');
            break;
        case 'five-partner':
            await ctx.scene.enter('five-partner');
            break;
        case 'exit':
            await ctx.scene.enter('mainScene');
            break;
    }
    return await ctx.answerCbQuery();
});
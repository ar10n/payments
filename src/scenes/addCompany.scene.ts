import { Markup, Scenes } from 'telegraf';
import { MyContext, prisma } from '..';
import { message, callbackQuery } from 'telegraf/filters';

export const addCompanyNameScene = new Scenes.BaseScene<MyContext>('addCompanyName');

addCompanyNameScene.enter(async (ctx): Promise<void> => {
    const { message_id } = await ctx.reply(
        'Чтобы добавить новую компанию, введите название и отправьте сообщение, или нажмите "Выход" для возврата в меню.',
        Markup.inlineKeyboard([
            Markup.button.callback('Выход', 'exit')
        ])
    );
    ctx.session.msgId = message_id;
});

addCompanyNameScene.on(callbackQuery(), async (ctx): Promise<boolean> => {
    await ctx.deleteMessage();
    await ctx.scene.enter('mainScene');
    return await ctx.answerCbQuery();
});

addCompanyNameScene.on(message('text'), async (ctx): Promise<void> => {
    const userPrompt = (ctx.message.text).trim();
    await ctx.deleteMessage(ctx.session.msgId);
    await ctx.deleteMessage(ctx.message.message_id);
    const company = await prisma.company.create({ data: { name: userPrompt } });
    if (company) {
        await ctx.reply(`Создана компания ${company.name}.`);
        await ctx.scene.enter('mainScene');
    } else {
        await ctx.reply(`Произошла ошибка, попробуйте еще раз.`);
        await ctx.scene.reenter();
    }
});

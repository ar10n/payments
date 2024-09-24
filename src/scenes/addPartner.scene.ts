import { Markup, Scenes } from 'telegraf';
import { MyContext, prisma } from '..';
import { message, callbackQuery } from 'telegraf/filters';

export const addPartnerNameScene = new Scenes.BaseScene<MyContext>(
    'addPartnerName',
);
export const addPartnerInnScene = new Scenes.BaseScene<MyContext>(
    'addPartnerInn',
);

addPartnerNameScene.enter(async (ctx): Promise<void> => {
    const { message_id } = await ctx.reply(
        'Чтобы добавить нового контрагента, введите название и отправьте сообщение, или нажмите "Выход" для возврата в меню.',
        Markup.inlineKeyboard([Markup.button.callback('Выход', 'exit')]),
    );
    ctx.session.msgId = message_id;
});

addPartnerNameScene.on(callbackQuery(), async (ctx): Promise<boolean> => {
    await ctx.deleteMessage();
    await ctx.scene.enter('mainScene');
    return await ctx.answerCbQuery();
});

addPartnerNameScene.on(message('text'), async (ctx): Promise<void> => {
    await ctx.deleteMessage(ctx.session.msgId);
    ctx.session.partnerName = ctx.message.text.trim();
    await ctx.scene.enter('addPartnerInn');
});

addPartnerInnScene.enter(async (ctx): Promise<void> => {
    const { message_id } = await ctx.reply(
        'Введите ИНН нового контрагента и отправьте сообщение, или нажмите "Выход" для возврата в меню.',
        Markup.inlineKeyboard([Markup.button.callback('Выход', 'exit')]),
    );
    ctx.session.msgId = message_id;
});

addPartnerInnScene.action('exit', async (ctx): Promise<boolean> => {
    ctx.session.partnerName = undefined;
    await ctx.scene.enter('mainScene');
    return await ctx.answerCbQuery();
});

addPartnerInnScene.on(message('text'), async (ctx): Promise<void> => {
    await ctx.deleteMessage(ctx.session.msgId);
    ctx.session.partnerInn = ctx.message.text.trim();
    await prisma.partner.create({
        data: {
            name: ctx.session.partnerName!,
            inn: ctx.session.partnerInn,
        },
    });
    ctx.session.partnerName = undefined;
    ctx.session.partnerInn = undefined;
    await ctx.scene.enter('mainScene');
});

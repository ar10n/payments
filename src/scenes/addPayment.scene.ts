import { Markup, Scenes } from 'telegraf';
import { MyContext, prisma } from '..';
import { callbackQuery, message } from 'telegraf/filters';
import { Partner } from '@prisma/client';

export const addPaymentCompanyScene = new Scenes.BaseScene<MyContext>(
    'addPaymentCompany',
);
export const addPaymentPartnerScene = new Scenes.BaseScene<MyContext>(
    'addPaymentPartner',
);
export const addPaymentAmountScene = new Scenes.BaseScene<MyContext>(
    'addPaymentAmount',
);
export const addPaymentIncomeScene = new Scenes.BaseScene<MyContext>(
    'addPaymentIncome',
);
export const addPaymentDateScene = new Scenes.BaseScene<MyContext>(
    'addPaymentDate',
);
export const addPaymentCommentScene = new Scenes.BaseScene<MyContext>(
    'addPaymentComment',
);

addPaymentCompanyScene.enter(async (ctx): Promise<void> => {
    const companies = await prisma.company.findMany();
    const buttons = companies.map((company) =>
        Markup.button.callback(`${company.name}`, `${company.id}`),
    );
    const { message_id } = await ctx.reply(
        'Для добавления нового платежа необходимо выбрать Компанию или нажмите "Выход" для возврата в меню.',
        Markup.inlineKeyboard([
            ...buttons,
            Markup.button.callback('Выход', 'exit'),
        ]),
    );
    ctx.session.msgId = message_id;
});

addPaymentCompanyScene.on(
    callbackQuery('data'),
    async (ctx): Promise<boolean> => {
        await ctx.deleteMessage();
        if (ctx.callbackQuery.data === 'exit') {
            await ctx.scene.enter('mainScene');
        } else {
            ctx.session.companyId = Number(ctx.callbackQuery.data);
            await ctx.scene.enter('addPaymentPartner');
        }
        return await ctx.answerCbQuery();
    },
);

addPaymentPartnerScene.enter(async (ctx): Promise<void> => {
    const { message_id } = await ctx.reply(
        'Введите ИНН партнера для поиска или нажмите "Выход" для возврата в меню.',
        Markup.inlineKeyboard([Markup.button.callback('Выход', 'exit')]),
    );
    ctx.session.msgId = message_id;
});

addPaymentPartnerScene.action('exit', async (ctx): Promise<boolean> => {
    ctx.session.companyId = undefined;
    await ctx.scene.enter('mainScene');
    return await ctx.answerCbQuery();
});

addPaymentPartnerScene.on(message('text'), async (ctx): Promise<void> => {
    ctx.deleteMessage(ctx.session.msgId);
    const userPrompt = ctx.message.text.trim();
    await ctx.deleteMessage(ctx.message.message_id);
    const partner: Partner = await prisma.partner.findUniqueOrThrow({
        where: { inn: userPrompt },
    });
    if (partner) {
        ctx.session.partnerId = partner.id;
        await ctx.scene.enter('addPaymentAmount');
    } else {
        const { message_id } = await ctx.reply(
            'Партнер с таким ИНН не найден, попробуйте ещё раз.',
        );
        ctx.session.msgId = message_id;
        await ctx.scene.reenter();
    }
});

addPaymentAmountScene.enter(async (ctx): Promise<void> => {
    const { message_id } = await ctx.reply(
        'Введите сумму платежа, копейки необходимо вводить через точку (например, 100.95). Для возврата в меню нажмите "Выход".',
        Markup.inlineKeyboard([Markup.button.callback('Выход', 'exit')]),
    );
    ctx.session.msgId = message_id;
});

addPaymentAmountScene.action('exit', async (ctx): Promise<boolean> => {
    ctx.session.companyId = undefined;
    ctx.session.partnerId = undefined;
    await ctx.scene.enter('mainScene');
    return await ctx.answerCbQuery();
});

addPaymentAmountScene.on(message('text'), async (ctx): Promise<void> => {
    await ctx.deleteMessage(ctx.session.msgId);
    const userPrompt = ctx.message.text.trim();
    ctx.session.amount = Number(userPrompt);
    await ctx.deleteMessage(ctx.message.message_id);
    await ctx.scene.enter('mainScene');
});

addPaymentIncomeScene.enter(async (ctx): Promise<void> => {
    const { message_id } = await ctx.reply(
        'Выберите тип платежа: входящий или исходящий. Для возврата в меню нажмите "Выход".',
        Markup.inlineKeyboard([
            Markup.button.callback('Входящий', 'income'),
            Markup.button.callback('Исходящий', 'outcome'),
            Markup.button.callback('Выход', 'exit'),
        ]),
    );
    ctx.session.msgId = message_id;
});

addPaymentIncomeScene.on(
    callbackQuery('data'),
    async (ctx): Promise<boolean> => {
        await ctx.deleteMessage();
        switch (ctx.callbackQuery.data) {
            case 'income':
                ctx.session.income = true;
                await ctx.scene.enter('addPaymentDate');
                break;
            case 'outcome':
                ctx.session.income = false;
                await ctx.scene.enter('addPaymentDate');
                break;
            case 'exit':
                ctx.session.companyId = undefined;
                ctx.session.partnerId = undefined;
                ctx.session.amount = undefined;
                await ctx.scene.enter('mainScene');
                break;
            default:
                await ctx.scene.reenter();
        }
        return await ctx.answerCbQuery();
    },
);

addPaymentDateScene.enter(async (ctx): Promise<void> => {
    const { message_id } = await ctx.reply(
        'Введите дату платежа в формате yyyy-mm-dd (например, 2024-01-01) или нажмите "Пропустить", если дата платежа - сегодняшний день. Для возврата в меню нажмите "Выход".',
        Markup.inlineKeyboard([
            Markup.button.callback('Пропустить', 'skip'),
            Markup.button.callback('Выход', 'exit'),
        ]),
    );
    ctx.session.msgId = message_id;
});

addPaymentDateScene.on(callbackQuery('data'), async (ctx): Promise<boolean> => {
    await ctx.deleteMessage();
    switch (ctx.callbackQuery.data) {
        case 'skip':
            await ctx.scene.enter('addPaymentComment');
            break;
        case 'exit':
            ctx.session.companyId = undefined;
            ctx.session.partnerId = undefined;
            ctx.session.amount = undefined;
            ctx.session.income = true;
            await ctx.scene.enter('mainScene');
            break;
        default:
            await ctx.scene.reenter();
    }
    return await ctx.answerCbQuery();
});

addPaymentDateScene.on(message('text'), async (ctx): Promise<void> => {
    await ctx.deleteMessage(ctx.session.msgId);
    const userPrompt = ctx.message.text.trim();
    await ctx.deleteMessage(ctx.message.message_id);
    ctx.session.date = new Date(userPrompt);
    await ctx.scene.enter('addPaymentComment');
});

addPaymentCommentScene.enter(async (ctx): Promise<void> => {
    const { message_id } = await ctx.reply(
        'Введите и отправьте комментарий в произвольной форме или нажмите "Пропустить". Для возврата в меню нажмите "Выход".',
        Markup.inlineKeyboard([
            Markup.button.callback('Пропустить', 'skip'),
            Markup.button.callback('Выход', 'exit'),
        ]),
    );
    ctx.session.msgId = message_id;
});

addPaymentCommentScene.on(
    callbackQuery('data'),
    async (ctx): Promise<boolean> => {
        await ctx.deleteMessage();
        switch (ctx.callbackQuery.data) {
            case 'skip':
                await prisma.transaction.create({
                    data: {
                        companyId: ctx.session.companyId,
                        partnerId: ctx.session.partnerId,
                        amount: ctx.session.amount!,
                        income: ctx.session.income,
                        date: ctx.session.date,
                    },
                });
                ctx.session.companyId = undefined;
                ctx.session.partnerId = undefined;
                ctx.session.amount = undefined;
                ctx.session.income = true;
                ctx.session.date = undefined;
                await ctx.scene.enter('mainScene');
                break;
            case 'exit':
                ctx.session.companyId = undefined;
                ctx.session.partnerId = undefined;
                ctx.session.amount = undefined;
                ctx.session.income = true;
                ctx.session.date = undefined;
                await ctx.scene.enter('mainScene');
                break;
            default:
                await ctx.scene.reenter();
        }
        return await ctx.answerCbQuery();
    },
);

addPaymentCommentScene.on(message('text'), async (ctx): Promise<void> => {
    await ctx.deleteMessage(ctx.session.msgId);
    ctx.session.comment = ctx.message.text.trim();
    await ctx.deleteMessage(ctx.message.message_id);
    await prisma.transaction.create({
        data: {
            companyId: ctx.session.companyId,
            partnerId: ctx.session.partnerId,
            amount: ctx.session.amount!,
            income: ctx.session.income,
            date: ctx.session.date,
            comment: ctx.session.comment,
        },
    });
    ctx.session.companyId = undefined;
    ctx.session.partnerId = undefined;
    ctx.session.amount = undefined;
    ctx.session.income = true;
    ctx.session.date = undefined;
    await ctx.scene.enter('mainScene');
});


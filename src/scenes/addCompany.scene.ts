import { Markup, Scenes } from 'telegraf';
import { MyContext, prisma } from '..';
import { message } from 'telegraf/filters';

export const addCompanyNameScene = new Scenes.BaseScene<MyContext>('addCompanyName');

addCompanyNameScene.enter(async (ctx): Promise<void> => {
    await ctx.reply(
        'Чтобы добавить новую компанию, введите название и отправьте сообщение, или нажмите "Выход" для возврата в меню.',
        Markup.inlineKeyboard([
            Markup.button.callback('Выход', 'exit')
        ])
    );
});

addCompanyNameScene.action(('exit'), async (ctx): Promise<void> => {
    await ctx.answerCbQuery();
    await ctx.scene.enter('mainScene');
});

addCompanyNameScene.on(message('text'), async (ctx): Promise<void> => {
    const userPrompt = (ctx.message.text).trim();
    const company = await prisma.company.create({ data: { name: userPrompt } });
    if (company) {
        await ctx.reply(`Создана компания ${company.name}.`);
        await ctx.scene.enter('mainScene');
    } else {
        await ctx.reply(`Произошла ошибка, попробуйте еще раз.`);
        await ctx.scene.reenter();
    }
});

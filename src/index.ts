import 'dotenv/config';
import { Context, Scenes, session, Telegraf } from 'telegraf';
import { PrismaClient, User } from '@prisma/client';
import { allScenes } from './scenes/sceneIndex';

export const prisma = new PrismaClient();

const token: string | undefined = process.env.TOKEN;
if (!token) {
    throw new Error('Не задан telegram-токен');
}

export interface MySession extends Scenes.SceneSession {
    partnerName?: string;
    partnerInn?: string;
    companyId?: number;
    partnerId?: number;
    amount?: number;
    income?: boolean;
    date?: Date;
    comment?: string;
    msgId?: number;
}

export interface MyContext extends Context {
    scene: Scenes.SceneContextScene<MyContext>;
    session: MySession;
}

const bot = new Telegraf<MyContext>(token);
const scenesStage = new Scenes.Stage<MyContext>(allScenes);

bot.use(session());
bot.use(scenesStage.middleware());

bot.command('start', async (ctx): Promise<void> => {
    if (ctx.session.msgId) {
        await ctx.deleteMessage(ctx.session.msgId);
    }
    const user: User | null = await prisma.user.findUnique({
        where: {tgId: ctx.message.from.id},
    });
    if (user && user.isActive) {
        await ctx.scene.enter('mainScene');
    } else {
        await prisma.user.create({data: {tgId: ctx.message.from.id}});
        await ctx.reply(
            'Вы не являетесь действующим пользователем, свяжитесь с @sar10n.',
        );
    }
});

bot.launch();

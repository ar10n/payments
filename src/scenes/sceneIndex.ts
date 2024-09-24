import { mainScene } from './main.scene';
import { addCompanyNameScene } from './addCompany.scene';
import { addPartnerNameScene, addPartnerInnScene } from './addPartner.scene';
import {
    addPaymentCompanyScene,
    addPaymentPartnerScene,
    addPaymentAmountScene,
    addPaymentIncomeScene,
    addPaymentDateScene,
    addPaymentCommentScene,
} from './addPayment.scene';
import { analyticsScene } from './analytics.scene';

export const allScenes = [
    mainScene,
    addCompanyNameScene,
    addPartnerNameScene,
    addPartnerInnScene,
    addPaymentCompanyScene,
    addPaymentPartnerScene,
    addPaymentAmountScene,
    addPaymentIncomeScene,
    addPaymentDateScene,
    addPaymentCommentScene,
    analyticsScene,
];

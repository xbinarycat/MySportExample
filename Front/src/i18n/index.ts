import config, { getCurrentLanguage } from '../containers/LanguageSwitcher/config';
import moment from 'moment';

import En from './entries/en_US';
import Ru from './entries/ru_RU';

import 'moment/locale/ru';

export interface LocaleInterface
{
    messages: {
        [key: string]: string
    },
    antd: any,
    locale: string,
    momentLocale: string,
    data: any
}

if (!Intl.PluralRules) {
    require('@formatjs/intl-pluralrules/polyfill');
}


export const AppLocale: LocaleInterface = ({
    en: En,
    ru: Ru
})[getCurrentLanguage(config.defaultLanguage || 'russian').locale];

export default AppLocale;
moment.locale(AppLocale.momentLocale);
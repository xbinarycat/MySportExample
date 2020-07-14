import antdLocale from 'antd/lib/locale-provider/ru_RU';
import messages from '../locales/ru_RU.json';
import { LocaleInterface } from '../'

const data = !Intl.PluralRules ?
    require('@formatjs/intl-pluralrules/dist/locale-data/ru') :
    {};

const Ru: LocaleInterface = {
  messages: {
    ...messages,
  },
  antd: antdLocale,
  locale: 'ru_RU',
  data: data,
  momentLocale: 'ru'
};

export default Ru;

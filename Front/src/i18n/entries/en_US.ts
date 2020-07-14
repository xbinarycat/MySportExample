import antdLocale from 'antd/lib/locale-provider/en_US';
import messages from '../locales/en_US.json';
import { LocaleInterface } from '../'

const data = !Intl.PluralRules ?
    require('@formatjs/intl-pluralrules/dist/locale-data/en') :
    {};

const En: LocaleInterface = {
  messages: {
    ...messages,
  },
  antd: antdLocale,
  locale: 'en_US',
  data: data,
  momentLocale: 'en'
};

export default En;

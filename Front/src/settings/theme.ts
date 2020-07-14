import themes from './themes'
import { themeConfig } from './'

export const getCurrentTheme = () => {
    return themes[themeConfig.theme];
}

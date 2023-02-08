// @flow

import React from 'react';
import LanguageProvider from '../../components/LanguageProvider/';
import Gw2Skill from './gw2protrain'
import Gw2Stats from './gw2legstats'

const makeLangApp = (lang) => (
    <LanguageProvider lang={lang} key={lang}>
        <div>切换语言 {lang}</div>
    </LanguageProvider>
);

storiesOf('Guild War 2', module)
    .add('激战2技能查询', () => <App><Gw2Skill /></App>)
    .add('激战2配装计算', () => <App><Gw2Stats /></App>)
    .add('切换语言en', () => makeLangApp('en'))
    .add('切换语言zh', () => makeLangApp('zh'))
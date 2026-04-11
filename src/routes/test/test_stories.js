import React from 'react';

const testApp = () => (
    <div><ul><li>git add -f dist</li><li>git commit -m 'first commit'</li><li>git subtree push --prefix dist origin gh-pages</li></ul></div>
);

const testApp2 = () => (
    <div><ul><li>export NODE_OPTIONS=--openssl-legacy-provider</li></ul></div>
);

storiesOf('study', module)
    .add('版本不兼容', () => testApp2())
    .add('部署', () => testApp())
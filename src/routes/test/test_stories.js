import React from 'react';

const testApp = () => (
    <div><ul><li>git add -f dist</li><li>git commit -m 'first commit'</li><li>git subtree push --prefix dist origin gh-pages</li></ul></div>
);

storiesOf('study', module)
    .add('部署', () => testApp())
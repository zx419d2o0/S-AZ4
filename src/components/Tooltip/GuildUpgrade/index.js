// @flow

import React from 'react';
import { markup } from '../../../lib/gw2/parse';

import Background from '../Background';
import styles from '../Skill/styles.less';

const GuildUpgradeTooltip = (data: any) => {
  return (
    <Background>
      <div className={styles.title}>{data.name}</div>

      {data.description && (
        <span>
          <br />
          {markup(data.description)}
        </span>
      )}
    </Background>
  );
};

export default GuildUpgradeTooltip;

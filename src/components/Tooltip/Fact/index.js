// @flow

import React from 'react';
import cx from 'classnames';
import round from 'lodash/round';

import Icon from '../../Icon';
import Gw2Icon from '../../Gw2Icon';
import { markup, attributeToName } from '../../../lib/gw2/parse';

import styles from './styles.less';

const BASE_DAMAGE = 266.0;

function extractSubText (data) {
  return String(
    data.hit_count ||
    data.field_type ||
    data.value ||
    data.distance ||
    data.finisher_type ||
    `${data.percent}%`
  );
}

function extractDamage (data) {
  const multiplier: number = data.dmg_multiplier || 1;

  return round(BASE_DAMAGE * multiplier * data.hit_count);
}

type FactProps = {
  data: {
    type: string,
    value: string,
    icon: string,
    percent: string,
    text: string,
    target: string,
    source: string,
    duration: string,
    status: string,
    description: string,
    apply_count: number,
    hit_count: number,
    dmg_multiplier: number,
    prefix: {
      status: string,
      icon: string,
    },
  },
};

const Fact = ({ data }: FactProps) => {
  let content;

  switch (data.type) {
    case 'Recharge':
      content = (
        <div className={cx(styles.recharge, styles.center)}>
          {data.value} <Icon src={data.icon} size="micro" />
        </div>
      );
      break;

    case 'AttributeAdjust':
      content = (
        <div className={styles.center}>
          <Icon src={data.icon} size="mini" />
          {data.text || attributeToName(data.target)}: +{data.value}
        </div>
      );
      break;

    case 'Damage':
      content = (
        <div className={styles.center}>
          <Icon src={data.icon} size="mini" />
          {markup(data.text)}: {extractDamage(data)}
        </div>
      );
      break;

    case 'Number':
    case 'Distance':
    case 'Radius':
    case 'Percent':
    case 'Range':
    case 'ComboFinisher':
    case 'ComboField':
      content = (
        <div className={styles.center}>
          <Icon src={data.icon} size="mini" />
          {markup(data.text)}: {extractSubText(data)}
        </div>
      );
      break;

    case 'PrefixedBuff':
      content = (
        <div className={styles.center}>
          <Icon src={data.icon} size="mini" />
          <Icon src={data.prefix.icon} size="mini" />
          {data.prefix.status}
        </div>
      );
      break;

    case 'BuffConversion':
      // XXX: String itself should be translated.
      content = (
        <div className={styles.center}>
          <Icon src={data.icon} size="mini" />
          {`Gain ${attributeToName(data.target)} based on a Percentage of ${data.source}: ${data.percent}%`}
        </div>
      );
      break;

    case 'NoData':
    case 'Unblockable':
    case 'StunBreak':
      content = (
        <div className={styles.center}>
          <Icon src={data.icon} size="mini" />
          {markup(data.text)}
        </div>
      );
      break;

    case 'Time':
    case 'Duration':
      content = (
        <div className={styles.center}>
          <Icon src={data.icon} size="mini" />
          {markup(data.text)}: {`${data.duration}s`}
        </div>
      );
      break;

    case 'Buff':
    case 'Type':
      content = (
        <div className={styles.center}>
          <Gw2Icon src={data.icon} size="mini" applyCount={data.apply_count} />
          <div>{`${data.status} (${data.duration}s)`}: {markup(data.description)}</div>
        </div>
      );
      break;

    default:
      // eslint-disable-next-line
      console.error('Missing fact! Report this error to @itsmadou on twitter.', data);
      content = <span />;
      break;
  }

  return <span className={styles.fact}>{content}</span>;
};

export default Fact;

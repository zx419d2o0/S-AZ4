// @flow

import React from 'react';
import startCase from 'lodash/startCase';
import includes from 'lodash/includes';
import get from 'lodash/get';
import T from 'i18n-react';

import styles from './styles.less';
import SimpleTooltip from '../Simple';
import colours from '../../../styles/colours.less';
import { markup, attributeToName } from '../../../lib/gw2/parse';

import Icon from '../../Icon';
import ItemHeader from '../ItemHeader';
// import Gold from '../../Gold';
// import Gw2Upgrade from '../../Gw2Upgrade';
// import Gw2Infusion from '../../Gw2Infusion';
import Background from '../Background';

const addCount = (str, count) => (count > 1 ? `${count} ${str}` : str);

const minutes = (ms) => `${Math.floor(ms / 60000)} m`;

function buildName (item, skin, upgrades, count) {
  let name;

  if (!skin.name) {
    name = item.name;
  } else {
    const regex = /[\w'-]+/;
    const prefix = regex.exec(item.name);
    const prefixedName = `${prefix} ${skin.name}`;

    // const [firstUpgradeId] = upgrades;

    // TODO: Need to dip into the redux store and get the firstUpgrade
    // from the firstUpgradeId.
    // if (upgradeOne && prefixedName.indexOf(upgradeOne.details.suffix)) {
    //   name = `${prefixedName} ${upgradeOne.details.suffix}`;
    // }

    name = prefixedName;
  }

  return addCount(name, count);
}

type Props = {
  name?: string,
  count: number,
  item: Object,
  skin: Object,
  upgrades: Array<number>,
  upgradeCounts: Object,
  infusions: Array<number>,
  stats: Object,
  equipped?: boolean,
};

const ItemsTooltip = ({
  count,
  item,
  skin,
  name,
  upgrades,
  upgradeCounts,
  infusions,
  stats,
  equipped,
}: Props) => {
  if (Object.keys(item).length === 0) {
    return <Background><SimpleTooltip data={name} /></Background>;
  }

  const isTransmuted = !!skin.name;

  return (
    <Background>
      {equipped && <SimpleTooltip data={T.translate('items.currentlyEquipped')} />}

      <ItemHeader
        name={buildName(item, skin, upgrades, count)}
        icon={skin.icon || item.icon}
        rarity={item.rarity}
      />

      <div>
        {item.details && !!item.details.defense && (
          <div>
            {T.translate('items.defense')}:
            <span className={colours.green}> {item.details.defense}</span>
          </div>)}

        {item.type === 'Weapon' && <div>
          <span>{T.translate('items.weaponStrength')}: </span>
          <span className={colours.green}>
            {`${item.details.min_power} - ${item.details.max_power}`}
          </span>
        </div>}

        {get(item, 'details.infix_upgrade.attributes', []).map(({ modifier, attribute }) => (
          <div key={attribute} className={colours.green}>
            {`+${modifier} ${attributeToName(attribute)}`}
          </div>
        ))}

        {item.type === 'UpgradeComponent' && !includes(item.name, 'Infusion') && get(item, 'details.infix_upgrade.buff.description', []).map((buff) => (
          <div key={buff}>
            {markup(buff)}
          </div>
        ))}

        {stats && stats.attributes && Object.keys(stats.attributes).map((attribute) => {
          const modifier = stats.attributes[attribute];

          return (
            <div key={attribute} className={colours.green}>
              {`+${modifier} ${attributeToName(attribute)}`}
            </div>
          );
        })}

        {item.details && (
          <span className={styles.description}>
            {item.details.icon && <Icon src={item.details.icon} className={styles.detailsIcon} />}
            <span className={colours.green}>
              {item.details.name && <div>{`${item.details.name} (${minutes(item.details.duration_ms)}): `}</div>}
              {markup(item.details.description)}
            </span>
          </span>
      )}

        {get(item, 'details.bonuses', []).map((bonusName, bonusId) => (
          <div className={colours.blue}>
            {markup(`(${bonusId + 1}): ${bonusName}`)}
          </div>
        ))}

        <br />

        {upgrades.map((id, index) =>
          // eslint-disable-next-line react/no-array-index-key
          <span key={index}>
            <Gw2Upgrade id={id} count={upgradeCounts[id]} /><br />
          </span>
        )}

        {infusions.map((id, index) =>
          // eslint-disable-next-line react/no-array-index-key
          <span key={index}>
            <Gw2Infusion id={id} /><br />
          </span>
        )}

        {equipped && (
          <div>
            {isTransmuted
              ? T.translate('items.transmuted')
              : T.translate('items.skinLocked')}
          </div>
        )}

        <div>{item.rarity}</div>

        {item.details && <div>{item.details.weight_class}</div>}

        {item.details && <div>{startCase(item.type)}</div>}

        <div>{markup(item.description)}</div>

        {!!item.level && <div>{T.translate('items.requiredLevel')}: {item.level}</div>}

        <div>{startCase(item.boundStatus)}</div>

        {item.rarity !== 'Legendary' &&
          <Gold coins={item.vendor_value} />}
      </div>
    </Background>
  );
};

ItemsTooltip.defaultProps = {
  count: 0,
  skin: {},
  upgrades: [],
  upgradeCounts: {},
  infusions: [],
};

export default ItemsTooltip;

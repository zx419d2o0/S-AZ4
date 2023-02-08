// @flow

import React from 'react';
import cx from 'classnames';
import get from 'lodash/get';
import T from 'i18n-react';

import TooltipTrigger from '../TooltipTrigger';
import Icon from '../Icon';
import ResourceLink, { buildLink } from '../ResourceLink';

import EmptySkill from './Empty';
import styles from './styles.less';
import { Gw2ProfessionMechanic } from "../../lib/gw2/gwdhelper"

type Props = {
  data?: {
    name: string,
  },
  className?: string,
  tooltipTextOverride?: string,
  size?: number,
  inlineText?: string,
};

const Skill = ({ data, className, tooltipTextOverride, size, inlineText, id, onClick }: Props) => {
  var error = get(data, 'error');
  var tooltipData = tooltipTextOverride || data || T.translate('characters.noSkill');
  if (error) {
    let local_info = Gw2ProfessionMechanic.filter(info => info.id == id);
    tooltipData = local_info && local_info[0];
    if (local_info) {
      error = false
    }
  }
  const iconSrc = data && get(data, 'icon') || get(tooltipData, 'icon')

  return (
    <TooltipTrigger type="skill" data={tooltipData}>
      <ResourceLink text={data && data.name} href={buildLink(inlineText, data && data.name)} onClick={() => { onClick(tooltipData.chat_link) }}>
        {(error || !iconSrc)
          ? <EmptySkill size={size} />
          : (
            <Icon
              src={iconSrc}
              size="mediumSmall"
              className={cx(styles.skill, className)}
              sizePx={size}
            />
          )}
      </ResourceLink>
    </TooltipTrigger>
  );
};

export default Skill;

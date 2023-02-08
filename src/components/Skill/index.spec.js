import proxyquire from 'proxyquire';
import React from 'react';
import { shallow } from 'enzyme';
import { stubComponent, stubStyles, stubI18n } from '../../../test/utils';

const styles = stubStyles([
  'skill',
]);

const translate = sinon.stub();
const TooltipTrigger = stubComponent('TooltipTrigger');
const Icon = stubComponent('Icon');
const EmptySkill = stubComponent('EmptySkill');

const Skill = proxyquire.noCallThru()('./', {
  ...stubI18n(translate),
  '../TooltipTrigger': TooltipTrigger,
  '../Icon': Icon,
  './Empty': EmptySkill,
  './styles.less': styles,
  '../ResourceLink': {
    default: (props) => <div {...props} />,
    buildLink: () => '',
  },
}).default;

describe('<Skill />', () => {
  describe('tooltip trigger', () => {
    context('when item is not loaded', () => {
      it('should set trigger with default text', () => {
        const defaultText = 'default-text';
        translate.withArgs('characters.noSkill').returns(defaultText);

        const wrapper = shallow(<Skill />);
        const trigger = wrapper.find(TooltipTrigger);

        expect(trigger).to.have.props({
          type: 'skill',
          data: defaultText,
        });
      });
    });

    context('when data is loaded', () => {
      it('should set trigger with data', () => {
        const data = { neat: 'data' };

        const wrapper = shallow(<Skill data={data} />);
        const trigger = wrapper.find(TooltipTrigger);

        expect(trigger).to.have.props({
          type: 'skill',
          data,
        });
      });
    });

    context('when tooltip override is used', () => {
      it('should set trigger with override text', () => {
        const tooltipTextOverride = 'text-override';

        const wrapper = shallow(<Skill tooltipTextOverride={tooltipTextOverride} />);
        const trigger = wrapper.find(TooltipTrigger);

        expect(trigger).to.have.props({
          type: 'skill',
          data: tooltipTextOverride,
        });
      });
    });
  });

  describe('rendering', () => {
    context('when there is no data', () => {
      it('should render empty skill', () => {
        const wrapper = shallow(<Skill />);

        expect(wrapper.find(EmptySkill)).to.exist;
      });
    });

    context('when there is an error', () => {
      it('should render empty skill', () => {
        const data = { error: true };

        const wrapper = shallow(<Skill data={data} />);

        expect(wrapper.find(EmptySkill)).to.exist;
      });
    });

    context('when there is data', () => {
      it('should render skill', () => {
        const className = 'cool-class';
        const data = { icon: 'https://gw2.com' };

        const wrapper = shallow(<Skill data={data} className={className} />);

        const skill = wrapper.find(Icon);
        expect(skill).to.have.props({
          src: data.icon,
          size: 'mediumSmall',
          className: `${styles.skill} ${className}`,
        });
      });
    });
  });
});

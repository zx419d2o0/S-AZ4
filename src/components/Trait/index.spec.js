import proxyquire from 'proxyquire';
import React from 'react';
import { shallow } from 'enzyme';
import { stubComponent, stubStyles } from '../../../test/utils';

const styles = stubStyles([
  'root',
  'active',
]);

const colours = stubStyles([
  '_black',
]);

const TooltipTrigger = stubComponent('TooltipTrigger');
const Icon = stubComponent('Icon');

const Trait = proxyquire.noCallThru()('./', {
  './styles.less': styles,
  '../TooltipTrigger': TooltipTrigger,
  '../Icon': Icon,
  '../../styles/colours': colours,
  '../ResourceLink': {
    default: (props) => <div {...props} />,
    buildLink: () => '',
  },
}).default;

describe('<Trait />', () => {
  describe('<Icon />', () => {
    it('should set classes', () => {
      const props = {
        className: 'neat',
      };

      const wrapper = shallow(<Trait {...props} />);

      expect(wrapper.find(Icon)).to.have.className(styles.root);
      expect(wrapper.find(Icon)).to.have.className(props.className);
    });

    it('should set active class', () => {
      const props = {
        active: true,
      };

      const wrapper = shallow(<Trait {...props} />);

      expect(wrapper.find(Icon)).to.have.className(styles.active);
    });

    it('should set icon with data', () => {
      const props = {
        active: true,
        data: {
          icon: 'www.cool.com',
        },
      };

      const wrapper = shallow(<Trait {...props} />);

      expect(wrapper.find(Icon)).to.have.prop('src').equal(props.data.icon);
      expect(wrapper.find(Icon)).to.have.prop('style').eql({
        backgroundColor: colours._black,
      });
    });
  });

  describe('<TooltipTrigger />', () => {
    it('should setup tooltip trigger', () => {
      const props = {
        data: 'some-cool-data',
      };

      const wrapper = shallow(<Trait {...props} />);

      expect(wrapper.find(TooltipTrigger).props()).to.contain({
        type: 'trait',
        data: props.data,
      });
    });

    it('should override tooltip trigger data with text', () => {
      const props = {
        data: 'some-cool-data',
        tooltipTextOverride: 'some-other-data',
      };

      const wrapper = shallow(<Trait {...props} />);

      expect(wrapper.find(TooltipTrigger).props()).to.contain({
        type: 'trait',
        data: props.tooltipTextOverride,
      });
    });
  });
});

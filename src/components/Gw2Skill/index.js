// @flow

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import Skill from '../Skill';
import actions from '../../actions/gw2';
import { action } from '@storybook/addon-actions';

export const selector = createSelector(
  (state, props) => state.skills[props.id],
  (data) => ({
    data,
  })
);

export default connect(selector, {
  fetch: actions.fetchSkills,
})(
  class Gw2Skill extends Component<*> {
    props: {
      id: number,
      fetch: ([number]) => void,
    };

    componentDidMount() {
      this.props.fetch([this.props.id]);
    }

    getId = () => { return this.props.data && this.props.data.name || this.props.id + "" }

    render() {
      return <Skill {...this.props} onClick={action(this.getId())} />;
    }
  }
);

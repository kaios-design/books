import React from 'react';
import { mount, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import toJson from 'enzyme-to-json';

import App from '..';

configure({ adapter: new Adapter() });

describe('App', function() {
  it('renders correctly', () => {
    const wrapper = mount(<App/>);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
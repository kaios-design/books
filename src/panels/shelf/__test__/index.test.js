import React from 'react';
import { mount, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import toJson from 'enzyme-to-json';

import Shelf from '..';

configure({ adapter: new Adapter() });

describe('Shelf', function() {
  it('renders correctly', () => {
    const wrapper = mount(<Shelf/>);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('show list when book.length not 0', () => {
    const wrapper = mount(<Shelf/>);
    wrapper.setState({ books: [ {'tile' : 'book1'} ]});
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should respond to keydown', () => {
    window.MozActivity = function () {};
    const spy = jest.spyOn(Shelf.prototype, 'onKeyDown');
    const wrapper = mount(<Shelf/>);
    wrapper.simulate('keydown', { key: 'SoftLeft' });
    wrapper.simulate('keydown', { key: '5' });
    expect(spy).toHaveBeenCalledTimes(2);
  });
});

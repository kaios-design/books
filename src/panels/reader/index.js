import React from 'react';
import { Menu, Dialog } from 'kaid';

import { PAGE_WIDTH } from '../../provider/page';

import './index.scss';

export default class Reader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
      page: 1,
      pageNum: null
    };
  }

  static getDerivedStateFromProps(props, state) {
    const { file } = props;
    if (file) {
      const { metadata: { page, pages } } = file;
      if (file !== state.file) {
        return { file, page, pageNum: pages[pages.length - 1] };
      } else {
        return { pageNum: pages[pages.length - 1] };
      }
    }
    return {};
  }

  menuOptions = [
    {
      id: 'goto-page',
      onSelect: () => {
        Dialog.prompt({
          content: 'goto-page',
          inputOptions: { type: 'tel' },  // should use 'number' after 57612 fixed
          onOK: (page) => { this.goToPage(+page) },
          onClose: () => { this.element.requestFullscreen(); }
        });
      }
    }
  ];

  componentDidUpdate() {
    const { page } = this.state;
    const { file } = this.props;
    let offset = page;
    if (file) {
      const { pages } = file.metadata;
      offset = page - (pages[pages.findIndex(element => element >= page) - 1] || 0);
    }
    this.transform(PAGE_WIDTH * (1 - offset));
  }

  show() {
    this.element.requestFullscreen();
    this.element.classList.remove('hidden');
    this.element.focus();
  }

  hide() {
    this.element.classList.add('hidden');
    document.exitFullscreen();
  }

  goToPage = (page) => {
    const { pageNum } = this.state;
    if (Number.isNaN(page) || page < 1 || page > pageNum) {
      return;
    }
    const file = this.props.file;
    const metadata = file.metadata;
    const { pages, chunk } = this.props.file.metadata;
    const { get } = this.props;

    if (page <= pages[chunk - 1] && page > (pages[chunk - 2] || 0)) {
      this.setState({ page });
    } else {
      metadata.chunk = pages.findIndex(element => element >= page) + 1;
      get(file.name, metadata.chunk, () => { this.setState({ page }) });
    }
  }

  transform = (offset) => {
    this.article.setAttribute('style',
      'transform: translateX(' + offset + 'px);'
    );
  }

  onKeyDown = (e) => {
    const { key } = e;
    const { page } = this.state;
    const { onBack } = this.props;
    switch (key) {
      case 'ArrowLeft':
        this.goToPage(page - 1);
        break;
      case 'ArrowRight':
        this.goToPage(page + 1);
        break;
      case 'Enter':
        Menu.open({
          options: this.menuOptions,
          onOpen: () => { document.exitFullscreen(); },
          onCancel: () => { this.element.requestFullscreen(); }
        });
        break;
      case 'Backspace':
        const { file } = this.props;
        const { metadata } = file;
        if (metadata.parse === 'start') {
          metadata.parse = 'pause';
        }
        metadata.page = page;
        metadata.read = Date.now();
        onBack(file);
        e.preventDefault();
        break;
      default:
        break;
    }
  }

  render() {
    const { page, pageNum } = this.state;
    const { bookContent } = this.props;

    return (
      <div
        className="reader hidden"
        ref={(node) => { this.element = node; }}
        tabIndex="-1"
        role="textbox"
        onKeyDown={this.onKeyDown}
      >
        <div className="reader-page">
          <div
            ref={(node) => { this.article = node; }}
            className="reader-article"
            dangerouslySetInnerHTML={{ __html: (bookContent || '').replace(/\n/g, '<br>') }}
          />
        </div>
        <div className="reader-footer">
          {
            //{!parse == 'parsing' ? 'parsing...' : `${page}/${pageNum}`}
          }
          {pageNum ? `${page}/${pageNum}` : null}

        </div>
      </div>
    );
  }
}

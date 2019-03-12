import React from 'react';

import './index.scss';

const PAGE_WIDTH = 230;

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
    if (props.file !== state.file) {
      return ({
        file: props.file,
        page: 1,
        pageNum: null
      });
    }
  }

  componentDidUpdate() {
    const { page } = this.state;
    this.transform(PAGE_WIDTH * (1 - page));
    this.calcPageNum();
  }

  calcPageNum = () => {
    const { bookContent } = this.props;
    const { pageNum } = this.state;
    if (!bookContent) return;
    if (!pageNum) {
      this.setState({ pageNum: Math.ceil(this.article.offsetWidth / PAGE_WIDTH) || 1 });
    }
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
    if (page < 1 || page > pageNum) {
      return;
    }
    this.setState({ page });
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
      case 'Backspace':
        onBack();
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
          {pageNum === null ? null : `${page}/${pageNum}`}
        </div>
      </div>
    );
  }
}

import React, { Component } from 'react';

export default class JinjierArtCard extends Component {
  render() {
    const { item } = this.props;

    if (!item) return null;

    const cardStyle = {
      // width: '48%',
      height: '460px',
      marginBottom: '12px',
      borderRadius: '10px',
      overflow: 'hidden',
      position: 'relative',
      backgroundImage: `url(${item.icon_url})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
    };

    const maskStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '8px',
      color: '#fff',
    };

    const bottomTagStyle = {
      fontSize: '11px',
      opacity: 0.85,
      marginBottom: '4px',
    };

    const nameStyle = {
      fontSize: '13px',
      fontWeight: 'bold',
      lineHeight: '1.3',
      maxHeight: '60px',
      overflow: 'hidden',
    };

    return (
      <div style={cardStyle}>
        <div style={maskStyle}>

          {/* 顶部：date + buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', opacity: 0.9 }}>
            <span>{item.note} #{item.number}</span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
              <button
                style={{ fontSize: '14px', padding: '2px 4px', lineHeight: '14px' }}
                onClick={(e) => {
                  e.stopPropagation();
                  const url = `https://www.javlibrary.com/cn/vl_searchbyid.php?keyword=${item.name.split(' ')[0]}`;
                  window.open(url, '_blank');
                }}
              >
                📚
              </button>

              <button
                style={{ fontSize: '14px', padding: '2px 4px', lineHeight: '14px' }}
                onClick={(e) => {
                  e.stopPropagation();
                  const url = `https://javdb.com/search?f=all&q=${item.name.split(' ')[0]}`;
                  window.open(url, '_blank');
                }}
              >
                🗄️
              </button>

              <button
                style={{ fontSize: '14px', padding: '2px 4px', lineHeight: '14px' }}
                onClick={(e) => {
                  e.stopPropagation();
                  const url = `https://avwikidb.com/work/${item.name.split(' ')[0]}/`;
                  window.open(url, '_blank');
                }}
              >
                📖
              </button>

              <button
                style={{ fontSize: '14px', padding: '2px 4px', lineHeight: '14px' }}
                onClick={(e) => {
                  e.stopPropagation();
                  const url = `https://sukebei.nyaa.si/?q=${item.name.split(' ')[0]}`;
                  window.open(url, '_blank');
                }}
              >
                ⬇️
              </button>
            </div>
          </div>

          {/* 中间留白 */}
          <div />

          {/* 底部信息 */}
          <div>
            <div style={bottomTagStyle}>
              {item.date}
            </div>

            <div style={nameStyle}>
              {item.name}
            </div>
          </div>

        </div>
      </div>
    );
  }
}
import React, { Component } from 'react';
import Album from '../../components/HrAlbum';

class QobuzAlbum extends Component {
  state = {
    albums: [],
    filterText: '',
    exactMatch: false,
    currentPage: 1,
    itemsPerPage: 2,
  };

  componentDidMount() {
    fetch('https://raw.gitmirror.com/zx419d2o0/TasIkE/main/music/qobuz_data.json')
      .then(response => response.json())
      .then(data => {
        this.setState({ albums: data.slice(0,5) });
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }

  handleFilterChange = (event) => {
    this.setState({ filterText: event.target.value, currentPage: 1 }); // Reset currentPage to 1 when filterText changes
  };

  handleExactMatchChange = (event) => {
    this.setState({ exactMatch: event.target.checked });
  };

  handlePageChange = (pageNumber) => {
    this.setState({ currentPage: pageNumber });
  };

  render() {
    const { albums, filterText, exactMatch, currentPage, itemsPerPage } = this.state;

    const filteredAlbums = albums.filter(album => {
      const { album:name, artist, desc } = album;
      const searchText = filterText.toLowerCase();
      if (exactMatch) {
        return (
          name && name.toLowerCase() === searchText || 
          artist && artist.toLowerCase() === searchText || 
          desc && desc.toLowerCase() === searchText
        );
      } else {
        return (
          name && name.toLowerCase().includes(searchText) || 
          artist && artist.toLowerCase().includes(searchText) || 
          desc && desc.toLowerCase().includes(searchText)
        );
      }
    });

    const totalPages = Math.ceil(filteredAlbums.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredAlbums.length);
    const currentAlbums = filteredAlbums.slice(startIndex, endIndex);

    // 计算要显示的页码
    let pageNumbers = [];
    if (totalPages <= 5) {
      pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);
    } else if (currentPage <= 3) {
      pageNumbers = Array.from({ length: 5 }, (_, index) => index + 1);
    } else if (currentPage >= totalPages - 2) {
      pageNumbers = Array.from({ length: 5 }, (_, index) => totalPages - 4 + index);
    } else {
      pageNumbers = Array.from({ length: 5 }, (_, index) => currentPage - 2 + index);
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {/* 顶部固定区域 */}
        <div style={{ flexShrink: 0, padding: '10px', backgroundColor: '#f0f0f0', display: 'flex', justifyContent: 'space-between' }}>
          <input
            type="text"
            placeholder="Search by name, artist, or description"
            value={filterText}
            onChange={this.handleFilterChange}
            style={{ width: 'calc(100% - 150px)' }} // 设置输入框宽度为剩余空间的90%
          />
          <label style={{ marginLeft: '10px', flexGrow: 1 }}>
            <input
              type="checkbox"
              checked={exactMatch}
              onChange={this.handleExactMatchChange}
              style={{ marginRight: '5px' }}
            /> Exact Match
          </label>
        </div>

        {/* 中间可滚动区域 */}
        <div style={{ overflowY: 'auto', flexGrow: 1 }}>
          {currentAlbums.map((album, index) => (
            <Album key={index} album={album} />
          ))}
        </div>

        {/* 底部固定区域 */}
        <div style={{ flexShrink: 0, padding: '10px', borderTop: '1px solid #ccc', textAlign: 'center' }}>
          {/* 首页 */}
          <button
            style={{ marginRight: '5px', cursor: 'pointer', fontWeight: currentPage === 1 ? 'bold' : 'normal' }}
            onClick={() => this.handlePageChange(1)}
          >
            {'<<'}
          </button>
          {/* 显示页码 */}
          {pageNumbers.map(pageNumber => (
            <button
              key={pageNumber}
              style={{ marginRight: '5px', cursor: 'pointer', fontWeight: pageNumber === currentPage ? 'bold' : 'normal' }}
              onClick={() => this.handlePageChange(pageNumber)}
            >
              {pageNumber}
            </button>
          ))}
          {/* 尾页 */}
          <button
            style={{ marginRight: '5px', cursor: 'pointer', fontWeight: currentPage === totalPages ? 'bold' : 'normal' }}
            onClick={() => this.handlePageChange(totalPages)}
          >
            {'>>'}
          </button>
        </div>
      </div>
    );
  }
}

export default QobuzAlbum;

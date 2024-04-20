import React, { Component } from 'react';
import TrackList from '../HrTrack'; // 引入 TrackList 组件

type AlbumProps = {
  album: {
    id: string,
    name: string,
    artist: string,
    url: string,
    cover: string,
    desc: string,
  },
};

type AlbumState = {
  showCover: boolean,
  tracks: string[], // 添加用于存储歌曲列表数据的状态
  isTrackListLoaded: boolean; // 添加用于表示歌曲列表数据是否已加载的状态
};

class Album extends Component<AlbumProps, AlbumState> {
  constructor(props: AlbumProps) {
    super(props);
    this.state = {
      showCover: false,
      tracks: [], // 初始化歌曲列表为空数组
      isTrackListLoaded: false, // 初始化歌曲列表数据加载状态为 false
    };
  }

  componentDidMount() {
    // 在组件挂载后自动获取歌曲列表数据
    this.fetchTrackListData();
  }

  fetchTrackListData = () => {
    return
    const { album } = this.props;
    const url = new URL(album.url);
    console.log('songs info:', album, url) 
    // 发送请求获取专辑信息中的 URL 数据
    fetch(url.href)
      .then(response => {
        console.log(response)
        // 假设请求返回的数据是一个包含歌曲名称的数组
        const tracksData = data.tracks; // 假设 tracksData 是包含歌曲名称的数组
        this.setState({ tracks: tracksData, isTrackListLoaded: true });
      })
      .catch(error => {
        console.error('Error fetching track list:', error);
      });
  };

  render() {
    const { album } = this.props;
    const { id, album:name, artist, url, cover, desc } = album;
    const { showCover, tracks, isTrackListLoaded } = this.state;

    return (
      <div key={id} style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <img
            src={cover}
            alt="Album Cover"
            style={{ width: '100px', marginRight: '20px', cursor: 'pointer' }}
            onClick={() => this.setState(prevState => ({ showCover: !prevState.showCover }))}
          />
          <div style={{ flex: 1 }}>
            <p><strong>Album:</strong> {name}</p>
            <p><strong>Artist:</strong> {artist}</p>
            <p><strong>URL:</strong> <a href={url} target="_blank" rel="noopener noreferrer">{url}</a></p>
            <p><strong>Description:</strong> {desc}</p>
          </div>
        </div>
        {isTrackListLoaded && <TrackList tracks={tracks} />} {/* 显示歌曲列表，仅当歌曲列表数据已加载 */}
        {showCover && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onClick={() => this.setState({ showCover: false })}
          >
            <img src={cover} alt="Album Cover" style={{ maxWidth: '100%', maxHeight: '100%' }} />
          </div>
        )}
      </div>
    );
  }
}

export default Album;

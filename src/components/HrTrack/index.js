import React, { Component } from 'react';

type TrackListProps = {
  tracks: string[]; // 假设每首歌曲都是字符串类型
};

class TrackList extends Component<TrackListProps> {
  render() {
    const { tracks } = this.props;

    return (
      <div>
        <h2>Track List</h2>
        <ul>
          {tracks.map((track, index) => (
            <li key={index}>{track}</li>
          ))}
        </ul>
      </div>
    );
  }
}

export default TrackList;

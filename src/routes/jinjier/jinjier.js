import React, { Component } from 'react';
import JSZip from 'jszip';
import JinjierArtCard from './jinjierArtcard'
import { action } from '@storybook/addon-actions';

// Source type enum: controls dataset switching and SQL generation
const SOURCE = {
  FANZA: 1,
  LIBRARY: 2,
  JAVDB_TOP250: 3,
  JAVDB_FC2: 4,
  JAVDB_YEAR: 5,
};

const loadSqlJs = () => {
  return new Promise((resolve, reject) => {
    if (window.initSqlJs) {
      resolve(window.initSqlJs);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/sql.js@1.8.0/dist/sql-wasm.js';
    script.onload = () => resolve(window.initSqlJs);
    script.onerror = () => reject(new Error('sql.js CDN 加载失败'));
    document.body.appendChild(script);
  });
};

class Jdb extends Component {
  state = {
    loading: false,
    rows: [],

    source: '',
    sub: '',

    sources: [
      { value: SOURCE.FANZA, label: '影片榜' },
      { value: SOURCE.LIBRARY, label: 'Library TOP500' },
      { value: SOURCE.JAVDB_TOP250, label: 'DB TOP250' },
      { value: SOURCE.JAVDB_FC2, label: 'DB FC2 TOP250' },
      { value: SOURCE.JAVDB_YEAR, label: 'DB 年榜' },
    ],

    subOptions: [],
    currentSql: '',
    width: window.innerWidth,
  };

  db = null;
  initPromise = null;

  handleResize = () => {
    this.setState({ width: window.innerWidth });
  };

  componentDidMount() {
    this.initPromise = this.initDatabase();

    this.initPromise
      .then(() => {
        this.loadMeta();
      })
      .catch((err) => {
        console.error('initDatabase failed:', err);
      });

    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  // Initialize sql.js database from remote zip file
  initDatabase = async () => {
    const initSqlJs = await loadSqlJs();

    const res = await fetch('https://jinjier.art/sql');
    const content = await res.text();
    const match = content.match(/:dbFile=["']([^"']+)["']/);

    if (!match || !match[1]) {
      throw new Error('数据库地址解析失败');
    }

    const databaseUrl = `https://jinjier.art/${match[1]}`;
    action('初始化')('数据地址解析成功', match[1].split('.')[0]);

    const SQL = await initSqlJs({
      locateFile: () =>
        'https://cdn.jsdelivr.net/npm/sql.js@1.8.0/dist/sql-wasm.wasm',
    });
    action('初始化')('sql.js运行时初始化完成');

    const buffer = await fetch(databaseUrl).then(r => r.arrayBuffer());
    action('初始化')('数据包下载完成');

    const zip = await JSZip.loadAsync(buffer);

    const sqliteBuffer = await zip
      .file('jinjier.sqlite3')
      .async('arraybuffer');

    this.db = new SQL.Database(new Uint8Array(sqliteBuffer));
    action('初始化')('数据库加载完成');
  };

  // Load filter metadata (years / categories) for dropdown menus
  loadMeta = async () => {
    try {
      const fanza = await this.execSql(`
        SELECT DISTINCT note
        FROM ranks
        WHERE note LIKE '影片榜%'
      `);

      const fanzaOptions = (fanza && fanza[0] && fanza[0].values)
        ? fanza[0].values.map(v => v[0]).sort().reverse()
        : [];

      const lib = await this.execSql(`
        SELECT DISTINCT SUBSTR(date,1,4) as year
        FROM ranks
        WHERE note = 'JavLibray TOP500'
        ORDER BY year DESC;
      `);

      const libOptions = (lib && lib[0] && lib[0].values)
        ? lib[0].values.map(v => v[0]).sort().reverse()
        : [];

      const javdb = await this.execSql(`
        SELECT DISTINCT SUBSTR(date,1,4) as year
        FROM ranks
        WHERE note = 'JavDB TOP250'
        ORDER BY year DESC;
      `);

      const javdbOptions = (javdb && javdb[0] && javdb[0].values)
        ? javdb[0].values.map(v => v[0]).sort().reverse()
        : [];

      const fc2 = await this.execSql(`
        SELECT DISTINCT SUBSTR(date,1,4) as year
        FROM ranks
        WHERE note = 'JavDB FC2 TOP250'
        ORDER BY year DESC;
      `);

      const fc2Options = (fc2 && fc2[0] && fc2[0].values)
        ? fc2[0].values.map(v => v[0]).sort().reverse()
        : [];

      const yearRank = await this.execSql(`
        SELECT DISTINCT note
        FROM ranks
        WHERE note LIKE 'JavDB % TOP250'
      `);

      const yearRankOptions = (yearRank && yearRank[0] && yearRank[0].values)
        ? yearRank[0].values.map(v => v[0]).sort().reverse()
        : [];

      this.meta = {
        fanza: fanzaOptions,
        lib: libOptions,
        javdb: javdbOptions,
        fc2: fc2Options,
        yearRank: yearRankOptions,
      };

      const defaultSource = this.state.sources[0].value;
      if (defaultSource) {
        this.handleSourceChange({ target: { value: defaultSource } });
      }

    } catch (e) {
      console.error('loadMeta error:', e);
    }
  };

  // Execute SQL against in-memory sqlite database
  execSql = async (sql) => {
    await Promise.race([
      this.initPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('DB init timeout')), 15000)
      )
    ]);

    if (!this.db) {
      throw new Error('DB 未初始化');
    }

    const result = this.db.exec(sql);
    return result
  };
  
  // Execute generated SQL and transform results into UI rows
  handleRunSql = async () => {
    this.setState({ loading: true });

    if (!this.db) {
      this.setState({
        loading: false,
      });
      return;
    }

    try {
      const sql = this.state.currentSql;
      action('run')('sql', sql);

      if (!sql) {
        this.setState({
          loading: false,
          rows: [],
        });
        return;
      }

      const result = await this.execSql(sql);

      let rows = [];

      if (result && result[0]) {
        const { columns, values } = result[0];

        rows = values.map(v => {
          const obj = {};
          columns.forEach((c, i) => {
            obj[c] = v[i];
          });
          return obj;
        });
      }

      this.setState({
        loading: false,
        rows,
      });
    } catch (error) {
      this.setState({
        loading: false,
        rows: [],
      });
    }
  };

  handleSourceChange = (e) => {
    const source = Number(e.target.value);
    const meta = this.meta;

    let subOptions = [];

    switch (source) {
      case SOURCE.FANZA:
        subOptions = (meta && meta.fanza) || [];
        break;
      case SOURCE.LIBRARY:
        subOptions = (meta && meta.lib) || [];
        break;
      case SOURCE.JAVDB_TOP250:
        subOptions = (meta && meta.javdb) || [];
        break;
      case SOURCE.JAVDB_FC2:
        subOptions = (meta && meta.fc2) || [];
        break;
      case SOURCE.JAVDB_YEAR:
        subOptions = (meta && meta.yearRank) || [];
        break;
      default:
        subOptions = [];
    }

    this.setState({
      source,
      sub: '',
      subOptions,
      currentSql: '',
    });

    setTimeout(() => {
      if (subOptions && subOptions.length > 0) {
        const firstSub = subOptions[0];
        this.setState({
          sub: firstSub,
          currentSql: this.buildSQL(source, firstSub),
        });
      }
    }, 0);
  };

  handleSubChange = (e) => {
    const sub = e.target.value;
    const source = this.state.source;

    this.setState({
      sub: sub,
      currentSql: this.buildSQL(source, sub),
    });
  };

  // Build SQL query based on selected source and sub filter
  buildSQL = (source, sub) => {
    if (!source || !sub) return '';

    switch (source) {
      case SOURCE.FANZA:
        return `SELECT * FROM ranks WHERE note = '${sub}'`;

      case SOURCE.LIBRARY:
        return `SELECT * FROM ranks WHERE note = 'JavLibray TOP500' AND SUBSTR(date,1,4) = '${sub}'`;

      case SOURCE.JAVDB_TOP250:
        return `SELECT * FROM ranks WHERE note = 'JavDB TOP250' AND SUBSTR(date,1,4) = '${sub}'`;

      case SOURCE.JAVDB_FC2:
        return `SELECT * FROM ranks WHERE note = 'JavDB FC2 TOP250' AND SUBSTR(date,1,4) = '${sub}'`;

      case SOURCE.JAVDB_YEAR:
        return `SELECT * FROM ranks WHERE note = '${sub}'`;

      default:
        return '';
    }
  };

  // Responsive column calculation for waterfall layout
  getColumnCount = () => {
    const width = this.state.width;
    if (width < 600) return 1;
    if (width < 1000) return 2;
    if (width < 1400) return 3;
    return 4;
  };

  render() {
    const { loading } = this.state;

    return (
      <div style={{ padding: '24px' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>

          <select value={this.state.source} onChange={this.handleSourceChange}>
            {this.state.sources.map(s => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <select value={this.state.sub} onChange={this.handleSubChange}>
            {this.state.subOptions.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <button onClick={this.handleRunSql} disabled={loading}>
            {loading ? '执行中...' : '查看'}
          </button>

        </div>

        <div
          style={{
            display: 'flex',
            gap: '6px',
            alignItems: 'flex-start',
          }}
        >
          {(() => {
            const colCount = this.getColumnCount();
            const columns = Array.from({ length: colCount }, () => []);

            (this.state.rows || []).forEach((item, index) => {
              columns[index % colCount].push(item);
            });

            return columns.map((col, colIndex) => (
              <div key={colIndex} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {col.map((item, index) => (
                  <JinjierArtCard key={index} item={item} />
                ))}
              </div>
            ));
          })()}
        </div>

      </div>
    );
  }
}

export default Jdb;

// @flow
import React, { Component } from 'react';

type State = {
  x: number,
  y: number,
  dragging: boolean,
  menuOpen: boolean,
  offsetX: number,
  offsetY: number,
  moved: boolean,
  visible: boolean,
};

type Action = {
  id: string,
  label: string,
  onClick: () => void,
};

const SIZE = 44;

export default class FloatingButton extends Component<{}, State> {
  containerRef = React.createRef();

  state: State = {
    x: window.innerWidth - SIZE - 10,
    y: window.innerHeight - SIZE - 10,
    dragging: false,
    menuOpen: false,
    offsetX: 0,
    offsetY: 0,
    moved: false,
    visible: true,
  };

  get actions(): Array<Action> {
    return [
      {
        id: 'scrollTop',
        label: '↑',
        onClick: this.onScrollTop,
      },
      {
        id: 'fullscreen',
        label: '全屏',
        onClick: this.onFullscreen,
      },
      {
        id: 'hide',
        label: '隐藏',
        onClick: this.onHide,
      },
    ];
  }

  componentDidMount() {
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('resize', this.onResize);

    window.addEventListener('touchmove', this.onTouchMove, { passive: false });
    window.addEventListener('touchend', this.onTouchEnd);

    document.addEventListener('mousedown', this.onGlobalDown);
    document.addEventListener('touchstart', this.onGlobalDown);
  }

  componentWillUnmount() {
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('resize', this.onResize);

    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('touchend', this.onTouchEnd);

    document.removeEventListener('mousedown', this.onGlobalDown);
    document.removeEventListener('touchstart', this.onGlobalDown);
  }

  getVW = () =>
    window.innerWidth ||
    document.documentElement.clientWidth ||
    0;

  getVH = () =>
    window.innerHeight ||
    document.documentElement.clientHeight ||
    0;

  clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(value, max));

  onResize = () => {
    const vw = this.getVW();
    const vh = this.getVH();

    this.setState({
      x: this.clamp(this.state.x, 0, vw - SIZE),
      y: this.clamp(this.state.y, 0, vh - SIZE),
    });
  };

  onMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    this.setState({
      dragging: true,
      moved: false,
      offsetX: e.clientX - this.state.x,
      offsetY: e.clientY - this.state.y,
    });
  };

  onMouseMove = (e: MouseEvent) => {
    if (!this.state.dragging) return;

    const vw = this.getVW();
    const vh = this.getVH();

    const newX = this.clamp(e.clientX - this.state.offsetX, 0, vw - SIZE);
    const newY = this.clamp(e.clientY - this.state.offsetY, 0, vh - SIZE);

    const dx = Math.abs(newX - this.state.x);
    const dy = Math.abs(newY - this.state.y);

    if (dx > 3 || dy > 3) {
      this.setState({ moved: true });
    }

    this.setState({ x: newX, y: newY });
  };

  onMouseUp = () => {
    if (this.state.dragging) {
      this.setState({ dragging: false });
    }
  };

  onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0];

    this.setState({
      dragging: true,
      moved: false,
      offsetX: t.clientX - this.state.x,
      offsetY: t.clientY - this.state.y,
    });
  };

  onTouchMove = (e: TouchEvent) => {
    if (!this.state.dragging) return;

    e.preventDefault();

    const t = e.touches[0];

    const vw = this.getVW();
    const vh = this.getVH();

    const newX = this.clamp(t.clientX - this.state.offsetX, 0, vw - SIZE);
    const newY = this.clamp(t.clientY - this.state.offsetY, 0, vh - SIZE);

    const dx = Math.abs(newX - this.state.x);
    const dy = Math.abs(newY - this.state.y);

    if (dx > 3 || dy > 3) {
      this.setState({ moved: true });
    }

    this.setState({ x: newX, y: newY });
  };

  onTouchEnd = () => {
    if (this.state.dragging) {
      this.setState({ dragging: false });
    }
  };

  onClick = () => {
    if (this.state.moved) return;

    this.setState((prev) => ({
      menuOpen: !prev.menuOpen,
    }));
  };

  onGlobalDown = (e: any) => {
    if (!this.state.menuOpen) return;

    const root = this.containerRef && this.containerRef.current;
    if (root && root.contains(e.target)) return;

    this.setState({ menuOpen: false });
  };

  onFullscreen = () => {
    const doc = window.parent && window.parent.document;

    const pane2 = doc && doc.querySelector('.Pane.horizontal.Pane2');
    const pane1 = doc && doc.querySelector('.Pane.vertical.Pane1');

    const isHidden =
      pane2 &&
      window.getComputedStyle(pane2).display === 'none';

    const nextDisplay = isHidden ? '' : 'none';

    if (pane2) pane2.style.display = nextDisplay;
    if (pane1) pane1.style.display = nextDisplay;

    this.setState({ menuOpen: false });
  };

  onHide = () => {
    this.setState({
      visible: false,
      menuOpen: false,
    });
  };

  onScrollTop = () => {
    try {
      const doc = window.parent && window.parent.document;

      const el =
        (doc && doc.querySelector('.sb-main-padded')) ||
        (doc && doc.querySelector('.sb-show-main')) ||
        (doc && doc.documentElement) ||
        (doc && doc.body);

      if (el) {
        if (el.scrollTo) {
          el.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          el.scrollTop = 0;
        }
      }

      if (window.parent && window.parent.scrollTo) {
        window.parent.scrollTo(0, 0);
      }

      if (window && window.scrollTo) {
        window.scrollTo(0, 0);
      }
    } catch (e) {
      window.scrollTo(0, 0);
    }

    this.setState({ menuOpen: false });
  };

  render() {
    if (!this.state.visible) return null;

    const { x, y, menuOpen } = this.state;
    const vw = this.getVW();

    return (
      <div ref={this.containerRef}>
        <div
          onMouseDown={this.onMouseDown}
          onMouseMove={this.onMouseMove}
          onMouseUp={this.onMouseUp}
          onTouchStart={this.onTouchStart}
          onClick={this.onClick}
          style={{
            position: 'fixed',
            left: x,
            top: y,
            width: SIZE,
            height: SIZE,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1677ff, #4f8cff)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 9999,
            userSelect: 'none',
            boxShadow: '0 8px 22px rgba(0,0,0,0.25)',
            fontSize: 18,
            fontWeight: 600,
          }}
        >
          +
        </div>

        {menuOpen && (
          <div
            style={{
              position: 'fixed',
              right: vw - (x + SIZE),
              top: y - (this.actions.length * 42 + 12),
              width: 'auto',
              minWidth: 140,
              background: 'rgba(255,255,255,0.98)',
              padding: 8,
              borderRadius: 12,
              boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
              zIndex: 10000,
              cursor: 'pointer',
              fontSize: 12,
              whiteSpace: 'nowrap',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              backdropFilter: 'blur(8px)',
            }}
          >
            {this.actions.map((item) => (
              <div
                key={item.id}
                onClick={() => item.onClick()}
                style={{
                  padding: '8px 10px',
                  cursor: 'pointer',
                  borderRadius: 8,
                  background: '#ffffff',
                  border: '1px solid #eaeaea',
                  textAlign: 'center',
                }}
              >
                {item.label}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}

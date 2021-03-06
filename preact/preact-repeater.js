import {Component, h, render} from '../node_modules/preact/dist/preact.mjs';
import {VirtualRepeater} from '../src/VirtualRepeater.js';

export class Repeat extends Component {
  componentDidMount() {
    this._repeater = new PreactRepeater({
      container: this._wrapper.base,
      component: this.props.component,
    });
    this._updateRepeater(this.props);
  }

  _updateRepeater(props) {
    const {first, num, totalItems} = props;
    Object.assign(this._repeater, {first, num, totalItems});
  }

  componentWillReceiveProps(nextProps) {
    this._updateRepeater(nextProps);
  }

  shouldComponentUpdate() {
    return false;
  }

  render({wrapper, style}) {
    return h(() => h(wrapper || 'div', {style}), {ref: c => this._wrapper = c});
  }
}

export const PreactMixin = Superclass => class extends Superclass {
  constructor(config) {
    const offscreen = document.createElement('div');
    const component = config.component;
    const pool = [];
    Object.assign(config, {
      createElement: () => {
        let child = pool.pop();
        if (!child) {
          child = {vNode: h(component, {ref: n => child.instance = n})};
          render(child.vNode, offscreen);
        }
        return child;
      },
      updateElement: (child, idx) => {
        child.vNode.attributes = {idx};
        render(child.vNode, this.container, child.instance.base);
      },
      recycleElement: (child) => pool.push(child),
    });
    super(config);
  }

  get _kids() {
    return this._ordered.map(c => c.instance.base);
  }

  _node(child) {
    return child.instance.base;
  }

  _nextSibling(child) {
    return super._nextSibling(child.instance.base);
  }

  _insertBefore(child, referenceNode) {
    super._insertBefore(child.instance.base, referenceNode);
  }

  _hideChild(child) {
    super._hideChild(child.instance.base);
  }

  _showChild(child) {
    if (this._childIsAttached(child)) {
      super._showChild(child.instance.base);
    }
  }

  _measureChild(child) {
    return super._measureChild(child.instance.base);
  }
}

export const PreactRepeater = PreactMixin(VirtualRepeater);

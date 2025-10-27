class MyCustomCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  // 当卡片配置更新时调用
  setConfig(config) {
    if (!config.entity) {
      throw new Error('请配置 entity 实体');
    }
    
    this.config = config;
    this.render();
  }

  // 当 Home Assistant 状态更新时调用
  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  // 渲染卡片界面
  render() {
    if (!this.config || !this._hass) {
      return;
    }

    const entityId = this.config.entity;
    const state = this._hass.states[entityId];
    
    if (!state) {
      this.shadowRoot.innerHTML = `
        <ha-card>
          <div style="padding: 16px; color: red;">
            找不到实体: ${entityId}
          </div>
        </ha-card>
      `;
      return;
    }

    const stateValue = state.state;
    const name = this.config.name || state.attributes.friendly_name || entityId;
    const unit = state.attributes.unit_of_measurement || '';
    const icon = this.config.icon || state.attributes.icon || 'mdi:information';

    this.shadowRoot.innerHTML = `
      <style>
        ha-card {
          padding: 16px;
          cursor: pointer;
        }
        .card-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .left-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .icon {
          width: 40px;
          height: 40px;
          color: var(--primary-color);
        }
        .info {
          display: flex;
          flex-direction: column;
        }
        .name {
          font-size: 14px;
          color: var(--secondary-text-color);
          margin-bottom: 4px;
        }
        .state {
          font-size: 24px;
          font-weight: 500;
          color: var(--primary-text-color);
        }
        .unit {
          font-size: 16px;
          margin-left: 4px;
          color: var(--secondary-text-color);
        }
      </style>
      
      <ha-card>
        <div class="card-content">
          <div class="left-section">
            <ha-icon class="icon" icon="${icon}"></ha-icon>
            <div class="info">
              <div class="name">${name}</div>
              <div class="state">
                ${stateValue}
                <span class="unit">${unit}</span>
              </div>
            </div>
          </div>
        </div>
      </ha-card>
    `;

    // 点击卡片显示更多信息
    this.shadowRoot.querySelector('ha-card').addEventListener('click', () => {
      this.fireEvent('hass-more-info', { entityId: entityId });
    });
  }

  // 触发 Home Assistant 事件
  fireEvent(type, detail) {
    const event = new Event(type, {
      bubbles: true,
      composed: true,
    });
    event.detail = detail;
    this.dispatchEvent(event);
  }

  // 返回卡片的高度（用于网格布局）
  getCardSize() {
    return 1;
  }

  // 可视化编辑器配置（可选）
  static getConfigElement() {
    return document.createElement("my-custom-card-editor");
  }

  // 存根配置
  static getStubConfig() {
    return {
      entity: "sensor.temperature"
    };
  }
}

// 注册自定义卡片
customElements.define('my-custom-card', MyCustomCard);

// 向 Home Assistant 注册卡片
window.customCards = window.customCards || [];
window.customCards.push({
  type: "my-custom-card",
  name: "My Custom Card",
  description: "一个展示实体状态的自定义卡片",
  preview: true,
  documentationURL: "https://github.com/yourusername/my-custom-card"
});

console.info(
  '%c MY-CUSTOM-CARD %c 1.0.0 ',
  'color: white; background: #039be5; font-weight: 700;',
  'color: #039be5; background: white; font-weight: 700;'
);
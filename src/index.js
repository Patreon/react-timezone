import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import './styles.styl';

export default class TimezonePicker extends React.Component {
  constructor(props) {
    super(props);
    this.timezones = Object.keys(props.timezones);

    this.state = {
      open: false,
      timezones: this.timezones,
      focused: 0,
      value: this.getTimezone(props.defaultValue || props.value),
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value) {
      const newValue = this.getTimezone(nextProps.value);
      this.field.value = newValue || '';
      this.setState({ value: newValue });
    }
  }
  getTimezone(query) {
    if (!query) return null;
    return this.timezones.find(zone => query === this.props.timezones[zone] || query === zone);
  }
  filterItems(filter) {
    if (!filter.trim() === '') return () => true;
    return zone => zone.toLowerCase().includes(filter.toLowerCase().replace(/\s/g, ''));
  }
  handleFocus(e) {
    this.field.value = '';
    this.setState({ open: true });

    if (typeof this.props.inputProps.onFocus === 'function') {
      this.props.inputProps.onFocus(e);
    }
  }
  handleBlur(e) {
    this.field.value = this.state.value || '';
    this.setState({ open: false });

    if (typeof this.props.inputProps.onBlur === 'function') {
      this.props.inputProps.onBlur(e);
    }
  }
  handleFilterChange(e) {
    const filter = this.field.value.trim();
    this.setState({
      timezones: this.timezones.filter(this.filterItems(filter)),
      focused: 0,
    });

    if (typeof this.props.inputProps.onChange === 'function') {
      this.props.inputProps.onChange(e);
    }
  }
  handleKeyPress(e) {
    if (e.which === 38 || e.which === 40) {
      e.preventDefault();
      let focused = this.state.focused;
      if (e.which === 38) {
        focused -= 1;
        if (focused < 1) focused = this.state.timezones.length;
      } else {
        focused += 1;
        if (focused > this.state.timezones.length) focused = 1;
      }
      this.setState({ focused });
      this.options.children[focused - 1].scrollIntoView();
    } else if (this.state.focused !== 0) {
      if (e.which === 13) {
        this.handleSelect(this.state.focused - 1);
        e.target.blur();
      } else {
        this.setState({ focused: 0 });
      }
    }
  }
  handleSelect(index) {
    this.setState({
      timezones: this.timezones,
      focused: 0,
      open: false,
    });

    if (this.props.onChange) {
      this.props.onChange(this.props.timezones[this.state.timezones[index]]);
    } else {
      this.field.value = this.state.timezones[index];
      this.setState({ value: this.state.timezones[index] });
    }
  }
  value() {
    const currentValue = this.state.value;
    if (!currentValue) return null;

    return this.props.timezones[currentValue];
  }
  render() {
    const { inputProps } = this.props;
    const value = this.state.value;

    const isSelected = !this.state.open && value;
    const isOpen = this.state.open;

    return (
      <div
        className={
          classNames('timezone-picker',
            {
              'timezone-picker-open': isOpen,
              'timezone-picker-selected': isSelected,
            },
            this.props.className
          )
        }
        style={this.props.style}
      >
        <div className="timezone-picker-textfield">
          <input
            disabled={this.props.disabled}
            type="text"
            onFocus={e => this.handleFocus(e)}
            onBlur={e => this.handleBlur(e)}
            onChange={e => this.handleFilterChange(e)}
            onKeyDown={e => this.handleKeyPress(e)}
            defaultValue={value}
            ref={(field) => { this.field = field; }}
            {...inputProps}
          />
        </div>
        <ul className="timezone-picker-list" ref={(options) => { this.options = options; }}>
          {this.state.timezones
            .map((zone, index) => {
              const focused = this.state.focused === index + 1;
              return (
                <li
                  key={index}
                  title={zone}
                  onMouseDown={() => this.handleSelect(index)}
                  className={
                    classNames('timezone-picker-list-item',
                      { 'timezone-picker-list-item-active': focused }
                    )
                  }
                >
                  {zone}
                </li>
              );
            })}
        </ul>
      </div>
    );
  }
}

TimezonePicker.propTypes = {
  defaultValue: PropTypes.string,
  disabled: PropTypes.bool,
  value: PropTypes.string,
  onChange: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object, // eslint-disable-line
  inputProps: PropTypes.object, // eslint-disable-line
  timezones: PropTypes.object, // eslint-disable-line
};

TimezonePicker.defaultProps = {
  disabled: false,
  inputProps: {},
  timezones: require('./timezones.json'), // eslint-disable-line
};

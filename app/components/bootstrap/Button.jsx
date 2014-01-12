/** @jsx React.DOM */

var React          = require('react');
var merge          = require('react/lib/merge');
var ClassNameMixin = require('../../mixins/bootstrap/ClassNameMixin');

var Button = React.createClass({
  mixins: [ClassNameMixin],

  getDefaultProps: function () {
    return {
      bsClass: 'btn'
    };
  },

  renderAnchor: function (className) {
    return (
      <a
        href={this.props.href}
        className={className}
        onClick={this.props.onClick}
        disabled={this.props.disabled}>
        {this.props.children}
      </a>
    );
  },

  renderButton: function (className) {
    return (
      <button
        type={this.props.type || "button"}
        className={className}
        onClick={this.props.onClick}
        disabled={this.props.disabled}>
        {this.props.children}
      </button>
    );
  },

  render: function () {
    var className = this.extendClassName();

    return (this.props.href) ?
      this.renderAnchor(className) : this.renderButton(className);
  }
});

module.exports = Button;
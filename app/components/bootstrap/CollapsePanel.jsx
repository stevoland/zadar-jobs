/** @jsx React.DOM */

var React          = require('react/addons');
var ClassNameMixin = require('../../mixins/bootstrap/ClassNameMixin');
var classSet       = React.addons.classSet;

var CollapsePanel  = React.createClass({
  mixins: [ClassNameMixin],

  getDefaultProps: function () {
    return {
      bsClass: 'panel',
      headingClass: React.DOM.h4,
      isStateful: true
    }
  },

  getInitialState: function () {
    return {
      isOpen: this.props.isOpen
    }
  },

  handleClick: function (e) {
    e.preventDefault();

    if (this.props.isStateful) {
      this.setState({
        isOpen: !this.state.isOpen
      });
    }

    if (typeof this.props.onClick === 'function') {
      this.props.onClick(e);
    }
  },

  render: function () {
    var HeadingClass = this.props.headingClass;

    var isOpen = (this.props.isStateful) ?
      this.state.isOpen : this.props.isOpen;

    var panelClassName = this.extendClassName();

    var anchorClassName = classSet({
      "collapsed": !isOpen
    });

    var collapseClassName = classSet({
      "panel-collapse": true,
      "in": isOpen,
      "collapse": !isOpen
    });

    return (
      <div className={panelClassName}>
        <div className="panel-heading">
          <HeadingClass
            className="panel-title">
            <a
              href={this.props.id ? '#' + this.props.id : '#'}
              className={anchorClassName}
              onClick={this.handleClick}>
              {this.props.headingChildren}
            </a>
          </HeadingClass>
        </div>
        <div className={collapseClassName} id={this.props.id}>
          <div className="panel-body">
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
});

module.exports = CollapsePanel;
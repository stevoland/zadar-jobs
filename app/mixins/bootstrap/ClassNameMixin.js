var React = require('react/addons');

var ClassNameHelper = {
  extendClassName: function () {
    var prefix = this.props.bsClass + '-',
        classes = {};

    if (this.props.bsClass) {
      classes[this.props.bsClass] = true;
    }
    if (this.props.bsSize) {
      classes[prefix + this.props.bsSize] = true;
    }
    if (this.props.bsStyle) {
      classes[prefix + this.props.bsStyle] = true;
    }
    // Merge with previous classes
    if (this.props.className) {
      this.props.className.split(' ').map(
        function (klass) {
          classes[klass] = true;
        }
      );
    }

    return React.addons.classSet(classes);
  }
};

module.exports = ClassNameHelper;
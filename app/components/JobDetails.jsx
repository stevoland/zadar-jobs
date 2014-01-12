var React                = require('react/addons');
var Button               = require('./bootstrap/Button.jsx');

var JobDetails = React.createClass({
  render: function () {
    return (
      <div className="JobDetails">
        <Button href="/jobs" bsStyle="default" className="pull-right">Close</Button>
        <h2>{this.props.model ? this.props.model.get('name') : ''}</h2>
      </div>
    );
  }
});

module.exports = JobDetails;
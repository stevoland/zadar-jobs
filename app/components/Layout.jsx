var React = require('react/addons');
var TopNav = require('./TopNav.jsx');
var ProjectHeader = require('./ProjectHeader.jsx');
var SideNav = require('./SideNav.jsx');

var Layout = React.createClass({

  getDefaultProps: function () {
    return {
      pages: [
        {
          id: 'project',
          text: 'Project',
          url: '/'
        },
        {
          id: 'jobs',
          text: 'Jobs',
          url: '/jobs'
        }
      ]
    };
  },

  render: function () {
    return (
      <div>
        <TopNav />
        <ProjectHeader />
        <div className="flex-container">
          <div className="flex-leftbar">
            <SideNav pages={this.props.pages} selected={this.props.selected} />
          </div>
          <div className="flex-content">
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Layout;
var React = require('react/addons');

var ProjctHeader = React.createClass({
  render: function () {
    return (
      <nav className="navbar navbar-default navbar-static-top z-toolbar">
        <div className="navbar-header">
          <a className="navbar-brand" href="#">Revlon Nearly Naked Press Campaign Q4 FY13</a>
        </div>
        <ul className="nav navbar-nav navbar-right">
          <div className="btn-group">
            <button className="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown">Options <span className="caret"></span></button>
            <ul className="dropdown-menu" role="menu">
              <li role="presentation"><a role="menuitem" tabIndex="-1" href="#">Copy as new project</a></li>
              <li role="presentation" className="divider"></li>
              <li role="presentation"><a role="menuitem" tabIndex="-1" href="#">Suspend project</a></li>
              <li role="presentation"><a role="menuitem" tabIndex="-1" href="#">Cancel project</a></li>
            </ul>
          </div>
        </ul>
      </nav>
    );
  }
});

module.exports = ProjctHeader;
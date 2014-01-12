var React = require('react/addons');

var TopNav = React.createClass({
  render: function () {
    return (
      <nav className="navbar navbar-default navbar-static-top z-navbar" role="navigation">
      <div className="navbar-header">
        <button type="button" className="navbar-toggle" data-toggle="collapse" data-target=".navbar-ex1-collapse">
          <span className="sr-only">Toggle navigation</span>
          <span className="icon-bar"></span>
          <span className="icon-bar"></span>
          <span className="icon-bar"></span>
        </button>
        <a className="navbar-brand z-logo" href="#"><img src="/static/images/hogarth-logo.png" alt="Hogarth" /></a>
      </div>

      <div className="collapse navbar-collapse navbar-ex1-collapse">
        <ul className="nav navbar-nav">
          <li className="active"><a href="#">Projects</a></li>
          <li><a href="#">Approvals</a></li>
          <li><a href="#">Assets</a></li>
          <li><a href="#">Delivery</a></li>
          <li><a href="#">Reports</a></li>
        </ul>
        <ul className="nav nav-pills navbar-right z-usernav">
          <li><a href="#">Admin</a></li>
          <li className="dropdown">
            <a href="#" className="dropdown-toggle" data-toggle="dropdown">
              <img className="z-user-profile-picture z-person img-circle" src="/static/images/avatar-damir.jpg" alt="Damir's profile picture" /> Damir Grandich <span className="caret"></span></a>
            <ul className="dropdown-menu" role="menu">
              <li role="presentation"><a role="menuitem" tabIndex="-1" href="#">Profile</a></li>
              <li role="presentation"><a role="menuitem" tabIndex="-1" href="#">Settings</a></li>
              <li role="presentation" className="divider"></li>
              <li role="presentation"><a role="menuitem" tabIndex="-1" href="#">Sign out</a></li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
    );
  }
});

module.exports = TopNav;
;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var createController = require('react-app-page');
var JobsPage = require('./pages/JobsPage.jsx');
var HomePage = require('./pages/HomePage.jsx');
var JobPage = require('./pages/JobPage.jsx');
var NewJobPage = require('./pages/NewJobPage.jsx');

// Only required to get react-devtools to work:
// https://github.com/facebook/react-devtools#the-react-tab-doesnt-show-up
window.React = require('react/addons');

var controller = createController({
  routes: {
    '/': HomePage,
    '/jobs': JobsPage,
    '/jobs/:id': JobPage,
    '/jobs/new/:newJobDiscipline': NewJobPage
  },

  onClick: function (e) {
    var current = e.target,
        href;

    while (current) {
      if (current.tagName === 'A') {
        href = current.attributes.href && current.attributes.href.value;
        if (href && href.indexOf('#') !== 0) {
          e.preventDefault();
          this.navigate(href);
        }
      }

      current = current.parentNode;
    }
  },

  componentDidMount: function () {
    window.addEventListener('click', this.onClick);
  },

  componentWillUnmount: function () {
    window.removeEventListener('click', this.onClick);
  }
});

document.addEventListener('DOMContentLoaded', function () {
  controller.render(document.body, window.location.pathname);
});
},{"./pages/HomePage.jsx":20,"./pages/JobPage.jsx":21,"./pages/JobsPage.jsx":22,"./pages/NewJobPage.jsx":23,"react-app-page":36,"react/addons":47}],2:[function(require,module,exports){
var Backbone = require('backfire');
var JobModel = require('../models/JobModel');

module.exports = Backbone.Firebase.Collection.extend({
  model: JobModel,
  firebase: 'https://stevoland.firebaseio.com/jobs',

  cloneModelById: function (id) {
    var newModel = this.findWhere({id: id}).clone();
    newModel.set('name', newModel.get('name') + ' 2');
    newModel.unset('id');

    this.add(newModel);
  },

  removeModelById: function (id) {
    this.remove(this.findWhere({id: id}));
  }
});
},{"../models/JobModel":19,"backfire":26}],3:[function(require,module,exports){
/** @jsx React.DOM */var React                = require('react/addons');
var Button               = require('./bootstrap/Button.jsx');

var JobDetails = React.createClass({displayName: 'JobDetails',
  render: function () {
    return (
      React.DOM.div( {className:"JobDetails"}, 
        Button( {href:"/jobs", bsStyle:"default", className:"pull-right"}, "Close"),
        React.DOM.h2(null, this.props.model ? this.props.model.get('name') : '')
      )
    );
  }
});

module.exports = JobDetails;
},{"./bootstrap/Button.jsx":12,"react/addons":47}],4:[function(require,module,exports){
/** @jsx React.DOM */var React                 = require('react/addons');
var ReactTransitionGroup  = React.addons.TransitionGroup;

var JobListItem           = require('./JobListItem.jsx');
var JobListItemEditing    = require('./JobListItemEditing.jsx');

var JobList = React.createClass({displayName: 'JobList',
  renderItem: function (model) {
    var id = model.get('id');

    return JobListItem({
      id: id,
      key: id,
      name: model.get('name'),
      url: '/jobs/' + model.get('id'),
      checked: (this.props.checkedIds.indexOf(id) > -1),
      onChecked: this.props.onChecked,
      selected: (this.props.selectedJob && model.get('id') === this.props.selectedJob.get('id'))
    });
  },

  render: function () {
    var items = [],
        newJob = '';

    if (this.props.jobs) {
      items = this.props.jobs.map(this.renderItem);
    }

    if (this.props.addNewJob) {
      newJob = (
        JobListItemEditing(
          {name:this.props.selectedJob.get('name'),
          onSave:this.props.onNewJobSave,
          onCancel:this.props.onNewJobCancel,
          onChange:this.props.onJobNameChange}
        )
      );
    }

    return (
      ReactTransitionGroup(
        {transitionName:"job",
        component:React.DOM.ul,
        className:"JobList nav nav-pills nav-stacked z-job-list"}, 
        items,
        newJob
      )
    );
  }
});

module.exports = JobList;
},{"./JobListItem.jsx":5,"./JobListItemEditing.jsx":6,"react/addons":47}],5:[function(require,module,exports){
/** @jsx React.DOM */var React          = require('react/addons');

var JobListItem = React.createClass({displayName: 'JobListItem',
  onClick: function (e) {
    this.props.onChecked(this.props.id);
  },

  render: function () {
    var className = React.addons.classSet({
      "JobListItem": true,
      "selected": this.props.selected
    });

    return (
      React.DOM.li( {key:this.props.key, className:className}, 
        React.DOM.input( {type:"checkbox", onClick:this.onClick, checked:this.props.checked} ),
        ' ',
        React.DOM.a( {href:this.props.url}, 
          this.props.name
        )
      )
    );
  }
});

module.exports = JobListItem;
},{"react/addons":47}],6:[function(require,module,exports){
/** @jsx React.DOM */var React          = require('react/addons');

var JobListItemEditing = React.createClass({displayName: 'JobListItemEditing',
  handleBlur: function (e) {
    if (event.target.value) {
      if (!this.state.saved) {
        this.props.onSave();
      }
    } else {
      this.props.onCancel();
    }

    this.setState({
      saved: true
    });
  },

  getInitialState: function () {
    return {
      saved: false
    };
  },

  handleChange: function (e) {
    this.props.onChange(event.target.value);
  },

  handleKeyDown: function (e) {
    switch (e.keyCode) {
      case 13: // Enter
        this.handleBlur(e);
        break;
      case 27: // Escape
        e.target.value = '';
        this.handleBlur(e);
        break;
    }
  },

  componentDidMount: function () {
    this.select();
  },

  componentWillReceiveProps: function (nextProps) {
    this.refs.name.getDOMNode().value = nextProps.name;
    this.setState({
      saved: false
    });
    this.select();
  },

  select: function () {
    this.refs.name.getDOMNode().select();
  },

  render: function () {
    return (
      React.DOM.li( {key:"new", className:"selected editing"}, 
        React.DOM.input( {type:"checkbox", checked:true} ),
        ' ',
        React.DOM.input(
          {ref:"name",
          type:"text",
          defaultValue:this.props.name,
          placeholder:"Enter job name",
          onBlur:this.handleBlur,
          onChange:this.handleChange,
          onKeyDown:this.handleKeyDown}
        )
      )
    );
  }
});

module.exports = JobListItemEditing;
},{"react/addons":47}],7:[function(require,module,exports){
/** @jsx React.DOM */var React          = require('react/addons');

var CollapsePanel  = require('./bootstrap/CollapsePanel.jsx');
var JobList        = require('./JobList.jsx');


var JobsAccordion = React.createClass({displayName: 'JobsAccordion',
  getInitialState: function () {
    return {
      trees: {}
    };
  },

  renderBundleAccordion: function (disciplineId) {
    var headingChildren = (
          //<span><input type="checkbox" onClick={this.handleCheckboxClick} />{' '}{bundleName}</span>
          this.props.disciplines[disciplineId]
        ),
        hasNewJob = (this.props.newJobDiscipline === disciplineId);

    return (
      CollapsePanel(
        {headingChildren:headingChildren,
        key:disciplineId,
        bsStyle:"default",
        className:"z-job-panel",
        isStateful:true,
        isOpen:true}, 
          JobList(
            {jobs:this.state.trees[disciplineId],
            checkedIds:this.props.checkedIds,
            onChecked:this.props.onChecked,
            selectedJob:this.props.selectedJob,
            addNewJob:hasNewJob,
            onJobNameChange:this.props.onJobNameChange,
            onNewJobSave:this.props.onNewJobSave,
            onNewJobCancel:this.props.onNewJobCancel}
          )
      )
    );
  },

  handleCheckboxClick: function (e) {
    e.stopPropagation();
  },

  componentWillMount: function () {
    this.configureState(this.props);
  },

  componentWillReceiveProps: function (nextProps) {
    this.configureState(nextProps);
  },

  configureState: function (props) {
    var trees = {};

    if (props.collection) {
      props.collection.forEach(function (model) {
        var discipline = model.get('discipline');

        if (!trees[discipline]) {
          trees[discipline] = [];
        }

        trees[discipline].push(model);
      }.bind(this));
    }

    if (this.props.newJobDiscipline && !trees[this.props.newJobDiscipline]) {
      trees[this.props.newJobDiscipline] = [];
    }

    this.setState({
      trees: trees
    });
  },

  render: function () {
    var accordions = Object.keys(this.state.trees).map(
      this.renderBundleAccordion
    );

    return (
      React.DOM.div( {className:"panel-group"}, 
        accordions
      )
    );
  }
});

module.exports = JobsAccordion;
},{"./JobList.jsx":4,"./bootstrap/CollapsePanel.jsx":14,"react/addons":47}],8:[function(require,module,exports){
/** @jsx React.DOM */var React          = require('react/addons');
var Button         = require('./bootstrap/Button.jsx');
var ButtonDropdown = require('./bootstrap/ButtonDropdown.jsx');
var JobsAccordion  = require('./JobsAccordion.jsx');
var Disciplines    = require('../const/Disciplines');

var JobsSection = React.createClass({displayName: 'JobsSection',
  handleCreateClick: function (key) {
    this.props.controller.navigate('/jobs/new/' + key);
  },

  getInitialState: function () {
    return {
      checkedIds: []
    };
  },

  handleChecked: function (ids) {
    var checkedIds = this.state.checkedIds;

    if (typeof ids !== 'object') {
      ids = [ids];
    }

    checkedIds = checkedIds.filter(function (id) {
      var index = ids.indexOf(id);

      if (index > -1) {
        ids.splice(index, 1);
        return false;
      }

      return true;
    });

    checkedIds = checkedIds.concat(ids);

    this.setState({
      checkedIds: checkedIds
    });
  },

  componentWillReceiveProps: function (nextProps) {
    if (nextProps.selectedJob) {
      this.setState({
        checkedIds: [nextProps.selectedJob.get('id')]
      });
    }
  },

  handleCloneClick: function () {
    this.props.onClone(this.state.checkedIds);
    this.setState({
      checkedIds: []
    });
    this.props.controller.navigate('/jobs');
  },

  handleMoreClick: function (operation) {
    switch (operation) {
      case 'delete':
        this.props.onDelete(this.state.checkedIds);
        this.setState({
          checkedIds: []
        });
    }

    this.props.controller.navigate('/jobs');
  },

  render: function () {
    var moreOptions = {'delete': 'Delete'},
        contextButons = this.state.checkedIds.length ?
        (
          React.DOM.span(null, 
            ' ',Button( {onClick:this.handleCloneClick}, "Clone"),
            ' ',ButtonDropdown(
                  {title:"More",
                  options:moreOptions,
                  onClick:this.handleMoreClick}
                )
          )
        ) : '';

    return (
      React.DOM.section( {className:"JobsSection"}, 
        React.DOM.h1(null, "Jobs"),
        React.DOM.div( {className:"buttons"}, 
          ButtonDropdown(
            {title:"Create",
            bsStyle:"primary",
            options:Disciplines,
            onClick:this.handleCreateClick}
          ),
          contextButons
        ),
        JobsAccordion(
          {collection:this.props.collection,
          disciplines:Disciplines,
          checkedIds:this.state.checkedIds,
          selectedJob:this.props.selectedJob,
          onChecked:this.handleChecked,
          onJobNameChange:this.props.onJobNameChange,
          onNewJobSave:this.props.onNewJobSave,
          onNewJobCancel:this.props.onNewJobCancel,
          newJobDiscipline:this.props.newJobDiscipline}
        )
      )
    );
  }
});

module.exports = JobsSection;
},{"../const/Disciplines":15,"./JobsAccordion.jsx":7,"./bootstrap/Button.jsx":12,"./bootstrap/ButtonDropdown.jsx":13,"react/addons":47}],9:[function(require,module,exports){
/** @jsx React.DOM */var React = require('react/addons');
var SideNav = require('./SideNav.jsx');

var Layout = React.createClass({displayName: 'Layout',

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
      React.DOM.div( {className:"flex-container"}, 
        React.DOM.div( {className:"flex-leftbar"}, 
          SideNav( {pages:this.props.pages, selected:this.props.selected} )
        ),
        React.DOM.div( {className:"flex-content"}, 
          this.props.children
        )
      )
    );
  }
});

module.exports = Layout;
},{"./SideNav.jsx":10,"react/addons":47}],10:[function(require,module,exports){
/** @jsx React.DOM */var React = require('react/addons');
var SideNavItem = require('./SideNavItem.jsx');

var SideNav = React.createClass({displayName: 'SideNav',

  render: function () {
    var selected = this.props.selected;
    var items = this.props.pages.map(function (page, i) {
      var isSelected = (page.id === selected);

      return SideNavItem({
        selected: isSelected,
        url: page.url,
        text: page.text,
        key: i
      });
    });

    return (
      React.DOM.nav(null, 
        React.DOM.ul( {className:"nav nav-pills nav-stacked"}, 
          items
        )
      )
    );
  }
});


module.exports = SideNav;
},{"./SideNavItem.jsx":11,"react/addons":47}],11:[function(require,module,exports){
/** @jsx React.DOM */var React = require('react/addons');

var SideNavItem = React.createClass({displayName: 'SideNavItem',
  getDefaultProps: function () {
    return {
      url: '#'
    };
  },

  render: function () {
    var className = this.props.selected ? 'active' : null;

    return (
      React.DOM.li( {className:className, key:this.props.key}, 
        React.DOM.a( {href:this.props.url}, 
          this.props.text
        )
      )
    );
  }
});

module.exports = SideNavItem;
},{"react/addons":47}],12:[function(require,module,exports){
/** @jsx React.DOM */

var React          = require('react');
var merge          = require('react/lib/merge');
var ClassNameMixin = require('../../mixins/bootstrap/ClassNameMixin');

var Button = React.createClass({displayName: 'Button',
  mixins: [ClassNameMixin],

  getDefaultProps: function () {
    return {
      bsClass: 'btn'
    };
  },

  renderAnchor: function (className) {
    return (
      React.DOM.a(
        {href:this.props.href,
        className:className,
        onClick:this.props.onClick,
        disabled:this.props.disabled}, 
        this.props.children
      )
    );
  },

  renderButton: function (className) {
    return (
      React.DOM.button(
        {type:this.props.type || "button",
        className:className,
        onClick:this.props.onClick,
        disabled:this.props.disabled}, 
        this.props.children
      )
    );
  },

  render: function () {
    var className = this.extendClassName();

    return (this.props.href) ?
      this.renderAnchor(className) : this.renderButton(className);
  }
});

module.exports = Button;
},{"../../mixins/bootstrap/ClassNameMixin":18,"react":175,"react/lib/merge":165}],13:[function(require,module,exports){
/** @jsx React.DOM */

var React          = require('react/addons');
var Button         = require('./Button.jsx');
var ClassNameMixin = require('../../mixins/bootstrap/ClassNameMixin');

var Option = React.createClass({displayName: 'Option',
  handleClick: function (e) {
    this.props.onClick(this.props.key);

    return false;
  },

  render: function () {
    return (
      React.DOM.li( {key:this.props.key}, 
        React.DOM.a( {onClick:this.handleClick, href:"#"}, 
          this.props.title
        )
      )
    );
  }
});

var ButtonDropdown = React.createClass({displayName: 'ButtonDropdown',
  mixins: [ClassNameMixin],

  getInitialState: function () {
    return {
      open: false
    };
  },

  getDefaultProps: function () {
    return {
      options: [],
      bsClass: 'btn',
      className: 'dropdown-toggle'
    }
  },

  toggle: function (open) {
    var newState = (open === undefined) ?
          !this.state.open : open;

    if (newState) {
      this.bindCloseHandlers();
    } else {
      this.unbindCloseHandlers();
    }

    this.setState({
      open: newState
    });
  },

  handleClick: function (e) {
    this.toggle();
  },

  handleOptionClick: function (key) {
    this.toggle();
    this.props.onClick(key);
  },

  handleKeyUp: function (e) {
    if (e.keyCode === 27) {
      this.toggle(false);
    }
  },

  handleClickOutside: function (e) {
    this.toggle(false);
  },

  bindCloseHandlers: function () {
    document.addEventListener('click', this.handleClickOutside);
    document.addEventListener('keyup', this.handleKeyUp);
  },

  unbindCloseHandlers: function () {
    document.removeEventListener('click', this.handleClickOutside);
    document.removeEventListener('keyup', this.handleKeyUp);
  },

  componentWillUnmount: function () {
    this.unbindCloseHandlers();
  },

  render: function () {
    var groupClassName = React.addons.classSet({
      "btn-group": true,
      "open": this.state.open
    });

    var className = this.extendClassName();

    var options = Object.keys(this.props.options).map(function (key) {
      return Option({
        onClick: this.handleOptionClick,
        key: key,
        title: this.props.options[key]
      });
    }.bind(this));

    return (
      React.DOM.div( {className:groupClassName}, 
          Button(
            {className:className,
            onClick:this.handleClick}, 
            this.props.title,' ',React.DOM.span( {className:"caret"} )
          ),
          React.DOM.ul( {className:"dropdown-menu", role:"menu"}, 
            options
          )
      )
    );
  }
});

module.exports = ButtonDropdown;
},{"../../mixins/bootstrap/ClassNameMixin":18,"./Button.jsx":12,"react/addons":47}],14:[function(require,module,exports){
/** @jsx React.DOM */

var React          = require('react/addons');
var ClassNameMixin = require('../../mixins/bootstrap/ClassNameMixin');
var classSet       = React.addons.classSet;

var CollapsePanel  = React.createClass({displayName: 'CollapsePanel',
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
      React.DOM.div( {className:panelClassName}, 
        React.DOM.div( {className:"panel-heading"}, 
          HeadingClass(
            {className:"panel-title"}, 
            React.DOM.a(
              {href:this.props.id ? '#' + this.props.id : '#',
              className:anchorClassName,
              onClick:this.handleClick}, 
              this.props.headingChildren
            )
          )
        ),
        React.DOM.div( {className:collapseClassName, id:this.props.id}, 
          React.DOM.div( {className:"panel-body"}, 
            this.props.children
          )
        )
      )
    );
  }
});

module.exports = CollapsePanel;
},{"../../mixins/bootstrap/ClassNameMixin":18,"react/addons":47}],15:[function(require,module,exports){
module.exports = {
    broadcast: 'Broadcast',
    digital: 'Digital',
    print: 'Print',
    transcreation: 'Transcreation'
};
},{}],16:[function(require,module,exports){
var Backbone = require('backfire');

// An example generic Mixin that you can add to any component that should react
// to changes in a Backbone component. The use cases we've identified thus far
// are for Collections -- since they trigger a change event whenever any of
// their constituent items are changed there's no need to reconcile for regular
// models. One caveat: this relies on getModel() to always return the
// same model instances throughout the lifecycle of the component. If you're
// using this mixin correctly (it should be near the top of your component
// hierarchy) this should not be an issue.

var BackboneMixin = {
  componentDidMount: function () {
    var model = this.getModel();

    if (model instanceof Backbone.Collection) {
      model.on('add remove reset sort', function () {
        this.forceUpdate();
      }, this);
    } else if (model) {
      var changeOptions = this.changeOptions || 'change';
      model.on(changeOptions, (this.onModelChange || function () {
        this.forceUpdate();
      }), this);
    }
  },

  componentWillUnmount: function () {
    // Ensure that we clean up any dangling references when the component is destroyed.
    var model = this.getModel();
    if (!!model) {
      model.off(null, null, this);
    }
  }
};

module.exports = BackboneMixin;
},{"backfire":26}],17:[function(require,module,exports){
var JobsCollection       = require('../collections/JobsCollection');

module.exports = {
  getModel: function () {
    // Store instance so it persists between page changes
    if (!this.controller.jobs) {
      this.controller.jobs = new JobsCollection();
    }

    return this.controller.jobs;
  },

  handleClone: function (ids) {
    if (Object.prototype.toString.call(ids) === '[object Array]' ) {
      ids.forEach(function (id) {
        this.handleClone(id);
      }.bind(this));

      return;
    }

    this.getModel().cloneModelById(ids);
  },

  handleDelete: function (ids) {
    if (Object.prototype.toString.call(ids) === '[object Array]' ) {
      ids.forEach(function (id) {
        this.handleDelete(id);
      }.bind(this));

      return;
    }
    this.getModel().removeModelById(ids);
  }
};
},{"../collections/JobsCollection":2}],18:[function(require,module,exports){
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
},{"react/addons":47}],19:[function(require,module,exports){
var Backbone = require('backfire');

module.exports = Backbone.Model.extend({
  defaults: {
    bundle: 'Unbundled'
  }
});
},{"backfire":26}],20:[function(require,module,exports){
/** @jsx React.DOM */var React          = require('react/addons');
var ReactApp       = require('react-app-page');
var Layout         = require('../components/Layout.jsx');

var HomePage = ReactApp.createPage({
  componentDidMount: function () {
    this.setTitle('Project');
  },

  render: function () {
    return (
      Layout( {selected:"project"}, 
        React.DOM.section( {className:"HomePage"}, 
            React.DOM.h1(null, "Project"),
            React.DOM.a( {href:"/jobs"}, "Jobs")
        )
      )
    );
  }
});

module.exports = HomePage;
},{"../components/Layout.jsx":9,"react-app-page":36,"react/addons":47}],21:[function(require,module,exports){
/** @jsx React.DOM */var React                = require('react/addons');
var ReactApp             = require('react-app-page');
var Layout               = require('../components/Layout.jsx');
var JobsSection          = require('../components/JobsSection.jsx');
var JobDetails           = require('../components/JobDetails.jsx');
var BackboneMixin        = require('../mixins/BackboneMixin');
var JobsCollectionMixin  = require('../mixins/JobsCollectionMixin');

var JobPage = ReactApp.createPage({
  mixins: [JobsCollectionMixin, BackboneMixin],

  render: function () {
    var collection = this.getModel(),
        model = collection.findWhere({id: this.props.id}),
        title = model ? 'Job: ' + model.get('name') : 'Job';

    this.setTitle(title);

    return (
      Layout( {selected:"jobs"}, 
        React.DOM.div( {className:"page JobPage"}, 
          JobsSection(
            {collection:collection,
            selectedJob:model,
            controller:this.controller,
            onClone:this.handleClone.bind(this),
            onDelete:this.handleDelete.bind(this)}
          ),
          JobDetails( {model:model} )
        )
      )
    );
  }
});

module.exports = JobPage;
},{"../components/JobDetails.jsx":3,"../components/JobsSection.jsx":8,"../components/Layout.jsx":9,"../mixins/BackboneMixin":16,"../mixins/JobsCollectionMixin":17,"react-app-page":36,"react/addons":47}],22:[function(require,module,exports){
/** @jsx React.DOM */var React                = require('react/addons');
var ReactApp             = require('react-app-page');
var Layout               = require('../components/Layout.jsx');
var JobsSection          = require('../components/JobsSection.jsx');
var BackboneMixin        = require('../mixins/BackboneMixin');
var JobsCollectionMixin  = require('../mixins/JobsCollectionMixin');

var JobsPage = ReactApp.createPage({
  mixins: [JobsCollectionMixin, BackboneMixin],

  componentDidMount: function () {
    this.setTitle('Jobs');
  },

  render: function () {
    return (
      Layout( {selected:"jobs"}, 
        React.DOM.div( {className:"page JobsPage"}, 
          JobsSection(
            {collection:this.getModel(),
            controller:this.controller,
            onClone:this.handleClone.bind(this),
            onDelete:this.handleDelete.bind(this)}
          )
        )
      )
    );
  }
});

module.exports = JobsPage;
},{"../components/JobsSection.jsx":8,"../components/Layout.jsx":9,"../mixins/BackboneMixin":16,"../mixins/JobsCollectionMixin":17,"react-app-page":36,"react/addons":47}],23:[function(require,module,exports){
/** @jsx React.DOM */var React                = require('react/addons');
var ReactApp             = require('react-app-page');
var Layout               = require('../components/Layout.jsx');
var JobsSection          = require('../components/JobsSection.jsx');
var JobDetails           = require('../components/JobDetails.jsx');
var JobModel             = require('../models/JobModel');
var BackboneMixin        = require('../mixins/BackboneMixin');
var JobsCollectionMixin  = require('../mixins/JobsCollectionMixin');

var newJobPage = ReactApp.createPage({
  mixins: [JobsCollectionMixin, BackboneMixin],

  handleNewJobSave: function () {
    this.getModel().add(this.newJobModel);
    this.createNewJobModel();
    this.forceUpdate();
  },

  handleNewJobCancel: function () {
    this.controller.navigate('/jobs');
  },

  handleJobNameChange: function (newName) {
    this.getNewJobModel().set('name', newName);
    this.controller.refs.details.forceUpdate();
  },

  createNewJobModel: function () {
      this.newJobModel = new JobModel({
        name: 'New Job',
        discipline: this.props.newJobDiscipline,
        created: Date.now()
      });
  },

  getNewJobModel: function () {
    if (!this.newJobModel) {
      this.createNewJobModel();
    }

    return this.newJobModel;
  },

  render: function () {
    var title = 'New job: ' + this.getNewJobModel().get('name');

    this.setTitle(title);

    return (
      Layout( {selected:"jobs"}, 
        React.DOM.div( {className:"page JobPage"}, 
          JobsSection(
            {collection:this.getModel(),
            selectedJob:this.getNewJobModel(),
            controller:this.controller,
            onClone:this.handleClone.bind(this),
            onDelete:this.handleDelete.bind(this),
            onJobNameChange:this.handleJobNameChange.bind(this),
            onNewJobSave:this.handleNewJobSave.bind(this),
            onNewJobCancel:this.handleNewJobCancel.bind(this),
            newJobDiscipline:this.props.newJobDiscipline}
          ),
          JobDetails( {ref:"details", model:this.getNewJobModel()} )
        )
      )
    );
  }
});

module.exports = newJobPage;
},{"../components/JobDetails.jsx":3,"../components/JobsSection.jsx":8,"../components/Layout.jsx":9,"../mixins/BackboneMixin":16,"../mixins/JobsCollectionMixin":17,"../models/JobModel":19,"react-app-page":36,"react/addons":47}],24:[function(require,module,exports){
//     Backbone.js 1.1.0

//     (c) 2010-2011 Jeremy Ashkenas, DocumentCloud Inc.
//     (c) 2011-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://backbonejs.org

(function(){

  // Initial Setup
  // -------------

  // Save a reference to the global object (`window` in the browser, `exports`
  // on the server).
  var root = this;

  // Save the previous value of the `Backbone` variable, so that it can be
  // restored later on, if `noConflict` is used.
  var previousBackbone = root.Backbone;

  // Create local references to array methods we'll want to use later.
  var array = [];
  var push = array.push;
  var slice = array.slice;
  var splice = array.splice;

  // The top-level namespace. All public Backbone classes and modules will
  // be attached to this. Exported for both the browser and the server.
  var Backbone;
  if (typeof exports !== 'undefined') {
    Backbone = exports;
  } else {
    Backbone = root.Backbone = {};
  }

  // Current version of the library. Keep in sync with `package.json`.
  Backbone.VERSION = '1.1.0';

  // Require Underscore, if we're on the server, and it's not already present.
  var _ = root._;
  if (!_ && (typeof require !== 'undefined')) _ = require('underscore');

  // For Backbone's purposes, jQuery, Zepto, Ender, or My Library (kidding) owns
  // the `$` variable.
  Backbone.$ = root.jQuery || root.Zepto || root.ender || root.$;

  // Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
  // to its previous owner. Returns a reference to this Backbone object.
  Backbone.noConflict = function() {
    root.Backbone = previousBackbone;
    return this;
  };

  // Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option
  // will fake `"PATCH"`, `"PUT"` and `"DELETE"` requests via the `_method` parameter and
  // set a `X-Http-Method-Override` header.
  Backbone.emulateHTTP = false;

  // Turn on `emulateJSON` to support legacy servers that can't deal with direct
  // `application/json` requests ... will encode the body as
  // `application/x-www-form-urlencoded` instead and will send the model in a
  // form param named `model`.
  Backbone.emulateJSON = false;

  // Backbone.Events
  // ---------------

  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may bind with `on` or remove with `off` callback
  // functions to an event; `trigger`-ing an event fires all callbacks in
  // succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  var Events = Backbone.Events = {

    // Bind an event to a `callback` function. Passing `"all"` will bind
    // the callback to all events fired.
    on: function(name, callback, context) {
      if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
      this._events || (this._events = {});
      var events = this._events[name] || (this._events[name] = []);
      events.push({callback: callback, context: context, ctx: context || this});
      return this;
    },

    // Bind an event to only be triggered a single time. After the first time
    // the callback is invoked, it will be removed.
    once: function(name, callback, context) {
      if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
      var self = this;
      var once = _.once(function() {
        self.off(name, once);
        callback.apply(this, arguments);
      });
      once._callback = callback;
      return this.on(name, once, context);
    },

    // Remove one or many callbacks. If `context` is null, removes all
    // callbacks with that function. If `callback` is null, removes all
    // callbacks for the event. If `name` is null, removes all bound
    // callbacks for all events.
    off: function(name, callback, context) {
      var retain, ev, events, names, i, l, j, k;
      if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
      if (!name && !callback && !context) {
        this._events = {};
        return this;
      }
      names = name ? [name] : _.keys(this._events);
      for (i = 0, l = names.length; i < l; i++) {
        name = names[i];
        if (events = this._events[name]) {
          this._events[name] = retain = [];
          if (callback || context) {
            for (j = 0, k = events.length; j < k; j++) {
              ev = events[j];
              if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                  (context && context !== ev.context)) {
                retain.push(ev);
              }
            }
          }
          if (!retain.length) delete this._events[name];
        }
      }

      return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function(name) {
      if (!this._events) return this;
      var args = slice.call(arguments, 1);
      if (!eventsApi(this, 'trigger', name, args)) return this;
      var events = this._events[name];
      var allEvents = this._events.all;
      if (events) triggerEvents(events, args);
      if (allEvents) triggerEvents(allEvents, arguments);
      return this;
    },

    // Tell this object to stop listening to either specific events ... or
    // to every object it's currently listening to.
    stopListening: function(obj, name, callback) {
      var listeningTo = this._listeningTo;
      if (!listeningTo) return this;
      var remove = !name && !callback;
      if (!callback && typeof name === 'object') callback = this;
      if (obj) (listeningTo = {})[obj._listenId] = obj;
      for (var id in listeningTo) {
        obj = listeningTo[id];
        obj.off(name, callback, this);
        if (remove || _.isEmpty(obj._events)) delete this._listeningTo[id];
      }
      return this;
    }

  };

  // Regular expression used to split event strings.
  var eventSplitter = /\s+/;

  // Implement fancy features of the Events API such as multiple event
  // names `"change blur"` and jQuery-style event maps `{change: action}`
  // in terms of the existing API.
  var eventsApi = function(obj, action, name, rest) {
    if (!name) return true;

    // Handle event maps.
    if (typeof name === 'object') {
      for (var key in name) {
        obj[action].apply(obj, [key, name[key]].concat(rest));
      }
      return false;
    }

    // Handle space separated event names.
    if (eventSplitter.test(name)) {
      var names = name.split(eventSplitter);
      for (var i = 0, l = names.length; i < l; i++) {
        obj[action].apply(obj, [names[i]].concat(rest));
      }
      return false;
    }

    return true;
  };

  // A difficult-to-believe, but optimized internal dispatch function for
  // triggering events. Tries to keep the usual cases speedy (most internal
  // Backbone events have 3 arguments).
  var triggerEvents = function(events, args) {
    var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
    switch (args.length) {
      case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
      case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
      case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
      case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
      default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
    }
  };

  var listenMethods = {listenTo: 'on', listenToOnce: 'once'};

  // Inversion-of-control versions of `on` and `once`. Tell *this* object to
  // listen to an event in another object ... keeping track of what it's
  // listening to.
  _.each(listenMethods, function(implementation, method) {
    Events[method] = function(obj, name, callback) {
      var listeningTo = this._listeningTo || (this._listeningTo = {});
      var id = obj._listenId || (obj._listenId = _.uniqueId('l'));
      listeningTo[id] = obj;
      if (!callback && typeof name === 'object') callback = this;
      obj[implementation](name, callback, this);
      return this;
    };
  });

  // Aliases for backwards compatibility.
  Events.bind   = Events.on;
  Events.unbind = Events.off;

  // Allow the `Backbone` object to serve as a global event bus, for folks who
  // want global "pubsub" in a convenient place.
  _.extend(Backbone, Events);

  // Backbone.Model
  // --------------

  // Backbone **Models** are the basic data object in the framework --
  // frequently representing a row in a table in a database on your server.
  // A discrete chunk of data and a bunch of useful, related methods for
  // performing computations and transformations on that data.

  // Create a new model with the specified attributes. A client id (`cid`)
  // is automatically generated and assigned for you.
  var Model = Backbone.Model = function(attributes, options) {
    var attrs = attributes || {};
    options || (options = {});
    this.cid = _.uniqueId('c');
    this.attributes = {};
    if (options.collection) this.collection = options.collection;
    if (options.parse) attrs = this.parse(attrs, options) || {};
    attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
    this.set(attrs, options);
    this.changed = {};
    this.initialize.apply(this, arguments);
  };

  // Attach all inheritable methods to the Model prototype.
  _.extend(Model.prototype, Events, {

    // A hash of attributes whose current and previous value differ.
    changed: null,

    // The value returned during the last failed validation.
    validationError: null,

    // The default name for the JSON `id` attribute is `"id"`. MongoDB and
    // CouchDB users may want to set this to `"_id"`.
    idAttribute: 'id',

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Return a copy of the model's `attributes` object.
    toJSON: function(options) {
      return _.clone(this.attributes);
    },

    // Proxy `Backbone.sync` by default -- but override this if you need
    // custom syncing semantics for *this* particular model.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Get the value of an attribute.
    get: function(attr) {
      return this.attributes[attr];
    },

    // Get the HTML-escaped value of an attribute.
    escape: function(attr) {
      return _.escape(this.get(attr));
    },

    // Returns `true` if the attribute contains a value that is not null
    // or undefined.
    has: function(attr) {
      return this.get(attr) != null;
    },

    // Set a hash of model attributes on the object, firing `"change"`. This is
    // the core primitive operation of a model, updating the data and notifying
    // anyone who needs to know about the change in state. The heart of the beast.
    set: function(key, val, options) {
      var attr, attrs, unset, changes, silent, changing, prev, current;
      if (key == null) return this;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options || (options = {});

      // Run validation.
      if (!this._validate(attrs, options)) return false;

      // Extract attributes and options.
      unset           = options.unset;
      silent          = options.silent;
      changes         = [];
      changing        = this._changing;
      this._changing  = true;

      if (!changing) {
        this._previousAttributes = _.clone(this.attributes);
        this.changed = {};
      }
      current = this.attributes, prev = this._previousAttributes;

      // Check for changes of `id`.
      if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

      // For each `set` attribute, update or delete the current value.
      for (attr in attrs) {
        val = attrs[attr];
        if (!_.isEqual(current[attr], val)) changes.push(attr);
        if (!_.isEqual(prev[attr], val)) {
          this.changed[attr] = val;
        } else {
          delete this.changed[attr];
        }
        unset ? delete current[attr] : current[attr] = val;
      }

      // Trigger all relevant attribute changes.
      if (!silent) {
        if (changes.length) this._pending = true;
        for (var i = 0, l = changes.length; i < l; i++) {
          this.trigger('change:' + changes[i], this, current[changes[i]], options);
        }
      }

      // You might be wondering why there's a `while` loop here. Changes can
      // be recursively nested within `"change"` events.
      if (changing) return this;
      if (!silent) {
        while (this._pending) {
          this._pending = false;
          this.trigger('change', this, options);
        }
      }
      this._pending = false;
      this._changing = false;
      return this;
    },

    // Remove an attribute from the model, firing `"change"`. `unset` is a noop
    // if the attribute doesn't exist.
    unset: function(attr, options) {
      return this.set(attr, void 0, _.extend({}, options, {unset: true}));
    },

    // Clear all attributes on the model, firing `"change"`.
    clear: function(options) {
      var attrs = {};
      for (var key in this.attributes) attrs[key] = void 0;
      return this.set(attrs, _.extend({}, options, {unset: true}));
    },

    // Determine if the model has changed since the last `"change"` event.
    // If you specify an attribute name, determine if that attribute has changed.
    hasChanged: function(attr) {
      if (attr == null) return !_.isEmpty(this.changed);
      return _.has(this.changed, attr);
    },

    // Return an object containing all the attributes that have changed, or
    // false if there are no changed attributes. Useful for determining what
    // parts of a view need to be updated and/or what attributes need to be
    // persisted to the server. Unset attributes will be set to undefined.
    // You can also pass an attributes object to diff against the model,
    // determining if there *would be* a change.
    changedAttributes: function(diff) {
      if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
      var val, changed = false;
      var old = this._changing ? this._previousAttributes : this.attributes;
      for (var attr in diff) {
        if (_.isEqual(old[attr], (val = diff[attr]))) continue;
        (changed || (changed = {}))[attr] = val;
      }
      return changed;
    },

    // Get the previous value of an attribute, recorded at the time the last
    // `"change"` event was fired.
    previous: function(attr) {
      if (attr == null || !this._previousAttributes) return null;
      return this._previousAttributes[attr];
    },

    // Get all of the attributes of the model at the time of the previous
    // `"change"` event.
    previousAttributes: function() {
      return _.clone(this._previousAttributes);
    },

    // Fetch the model from the server. If the server's representation of the
    // model differs from its current attributes, they will be overridden,
    // triggering a `"change"` event.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === void 0) options.parse = true;
      var model = this;
      var success = options.success;
      options.success = function(resp) {
        if (!model.set(model.parse(resp, options), options)) return false;
        if (success) success(model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Set a hash of model attributes, and sync the model to the server.
    // If the server returns an attributes hash that differs, the model's
    // state will be `set` again.
    save: function(key, val, options) {
      var attrs, method, xhr, attributes = this.attributes;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (key == null || typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options = _.extend({validate: true}, options);

      // If we're not waiting and attributes exist, save acts as
      // `set(attr).save(null, opts)` with validation. Otherwise, check if
      // the model will be valid when the attributes, if any, are set.
      if (attrs && !options.wait) {
        if (!this.set(attrs, options)) return false;
      } else {
        if (!this._validate(attrs, options)) return false;
      }

      // Set temporary attributes if `{wait: true}`.
      if (attrs && options.wait) {
        this.attributes = _.extend({}, attributes, attrs);
      }

      // After a successful server-side save, the client is (optionally)
      // updated with the server-side state.
      if (options.parse === void 0) options.parse = true;
      var model = this;
      var success = options.success;
      options.success = function(resp) {
        // Ensure attributes are restored during synchronous saves.
        model.attributes = attributes;
        var serverAttrs = model.parse(resp, options);
        if (options.wait) serverAttrs = _.extend(attrs || {}, serverAttrs);
        if (_.isObject(serverAttrs) && !model.set(serverAttrs, options)) {
          return false;
        }
        if (success) success(model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);

      method = this.isNew() ? 'create' : (options.patch ? 'patch' : 'update');
      if (method === 'patch') options.attrs = attrs;
      xhr = this.sync(method, this, options);

      // Restore attributes.
      if (attrs && options.wait) this.attributes = attributes;

      return xhr;
    },

    // Destroy this model on the server if it was already persisted.
    // Optimistically removes the model from its collection, if it has one.
    // If `wait: true` is passed, waits for the server to respond before removal.
    destroy: function(options) {
      options = options ? _.clone(options) : {};
      var model = this;
      var success = options.success;

      var destroy = function() {
        model.trigger('destroy', model, model.collection, options);
      };

      options.success = function(resp) {
        if (options.wait || model.isNew()) destroy();
        if (success) success(model, resp, options);
        if (!model.isNew()) model.trigger('sync', model, resp, options);
      };

      if (this.isNew()) {
        options.success();
        return false;
      }
      wrapError(this, options);

      var xhr = this.sync('delete', this, options);
      if (!options.wait) destroy();
      return xhr;
    },

    // Default URL for the model's representation on the server -- if you're
    // using Backbone's restful methods, override this to change the endpoint
    // that will be called.
    url: function() {
      var base = _.result(this, 'urlRoot') || _.result(this.collection, 'url') || urlError();
      if (this.isNew()) return base;
      return base + (base.charAt(base.length - 1) === '/' ? '' : '/') + encodeURIComponent(this.id);
    },

    // **parse** converts a response into the hash of attributes to be `set` on
    // the model. The default implementation is just to pass the response along.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new model with identical attributes to this one.
    clone: function() {
      return new this.constructor(this.attributes);
    },

    // A model is new if it has never been saved to the server, and lacks an id.
    isNew: function() {
      return this.id == null;
    },

    // Check if the model is currently in a valid state.
    isValid: function(options) {
      return this._validate({}, _.extend(options || {}, { validate: true }));
    },

    // Run validation against the next complete set of model attributes,
    // returning `true` if all is well. Otherwise, fire an `"invalid"` event.
    _validate: function(attrs, options) {
      if (!options.validate || !this.validate) return true;
      attrs = _.extend({}, this.attributes, attrs);
      var error = this.validationError = this.validate(attrs, options) || null;
      if (!error) return true;
      this.trigger('invalid', this, error, _.extend(options, {validationError: error}));
      return false;
    }

  });

  // Underscore methods that we want to implement on the Model.
  var modelMethods = ['keys', 'values', 'pairs', 'invert', 'pick', 'omit'];

  // Mix in each Underscore method as a proxy to `Model#attributes`.
  _.each(modelMethods, function(method) {
    Model.prototype[method] = function() {
      var args = slice.call(arguments);
      args.unshift(this.attributes);
      return _[method].apply(_, args);
    };
  });

  // Backbone.Collection
  // -------------------

  // If models tend to represent a single row of data, a Backbone Collection is
  // more analagous to a table full of data ... or a small slice or page of that
  // table, or a collection of rows that belong together for a particular reason
  // -- all of the messages in this particular folder, all of the documents
  // belonging to this particular author, and so on. Collections maintain
  // indexes of their models, both in order, and for lookup by `id`.

  // Create a new **Collection**, perhaps to contain a specific type of `model`.
  // If a `comparator` is specified, the Collection will maintain
  // its models in sort order, as they're added and removed.
  var Collection = Backbone.Collection = function(models, options) {
    options || (options = {});
    if (options.model) this.model = options.model;
    if (options.comparator !== void 0) this.comparator = options.comparator;
    this._reset();
    this.initialize.apply(this, arguments);
    if (models) this.reset(models, _.extend({silent: true}, options));
  };

  // Default options for `Collection#set`.
  var setOptions = {add: true, remove: true, merge: true};
  var addOptions = {add: true, remove: false};

  // Define the Collection's inheritable methods.
  _.extend(Collection.prototype, Events, {

    // The default model for a collection is just a **Backbone.Model**.
    // This should be overridden in most cases.
    model: Model,

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // The JSON representation of a Collection is an array of the
    // models' attributes.
    toJSON: function(options) {
      return this.map(function(model){ return model.toJSON(options); });
    },

    // Proxy `Backbone.sync` by default.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Add a model, or list of models to the set.
    add: function(models, options) {
      return this.set(models, _.extend({merge: false}, options, addOptions));
    },

    // Remove a model, or a list of models from the set.
    remove: function(models, options) {
      var singular = !_.isArray(models);
      models = singular ? [models] : _.clone(models);
      options || (options = {});
      var i, l, index, model;
      for (i = 0, l = models.length; i < l; i++) {
        model = models[i] = this.get(models[i]);
        if (!model) continue;
        delete this._byId[model.id];
        delete this._byId[model.cid];
        index = this.indexOf(model);
        this.models.splice(index, 1);
        this.length--;
        if (!options.silent) {
          options.index = index;
          model.trigger('remove', model, this, options);
        }
        this._removeReference(model);
      }
      return singular ? models[0] : models;
    },

    // Update a collection by `set`-ing a new list of models, adding new ones,
    // removing models that are no longer present, and merging models that
    // already exist in the collection, as necessary. Similar to **Model#set**,
    // the core operation for updating the data contained by the collection.
    set: function(models, options) {
      options = _.defaults({}, options, setOptions);
      if (options.parse) models = this.parse(models, options);
      var singular = !_.isArray(models);
      models = singular ? (models ? [models] : []) : _.clone(models);
      var i, l, id, model, attrs, existing, sort;
      var at = options.at;
      var targetModel = this.model;
      var sortable = this.comparator && (at == null) && options.sort !== false;
      var sortAttr = _.isString(this.comparator) ? this.comparator : null;
      var toAdd = [], toRemove = [], modelMap = {};
      var add = options.add, merge = options.merge, remove = options.remove;
      var order = !sortable && add && remove ? [] : false;

      // Turn bare objects into model references, and prevent invalid models
      // from being added.
      for (i = 0, l = models.length; i < l; i++) {
        attrs = models[i];
        if (attrs instanceof Model) {
          id = model = attrs;
        } else {
          id = attrs[targetModel.prototype.idAttribute];
        }

        // If a duplicate is found, prevent it from being added and
        // optionally merge it into the existing model.
        if (existing = this.get(id)) {
          if (remove) modelMap[existing.cid] = true;
          if (merge) {
            attrs = attrs === model ? model.attributes : attrs;
            if (options.parse) attrs = existing.parse(attrs, options);
            existing.set(attrs, options);
            if (sortable && !sort && existing.hasChanged(sortAttr)) sort = true;
          }
          models[i] = existing;

        // If this is a new, valid model, push it to the `toAdd` list.
        } else if (add) {
          model = models[i] = this._prepareModel(attrs, options);
          if (!model) continue;
          toAdd.push(model);

          // Listen to added models' events, and index models for lookup by
          // `id` and by `cid`.
          model.on('all', this._onModelEvent, this);
          this._byId[model.cid] = model;
          if (model.id != null) this._byId[model.id] = model;
        }
        if (order) order.push(existing || model);
      }

      // Remove nonexistent models if appropriate.
      if (remove) {
        for (i = 0, l = this.length; i < l; ++i) {
          if (!modelMap[(model = this.models[i]).cid]) toRemove.push(model);
        }
        if (toRemove.length) this.remove(toRemove, options);
      }

      // See if sorting is needed, update `length` and splice in new models.
      if (toAdd.length || (order && order.length)) {
        if (sortable) sort = true;
        this.length += toAdd.length;
        if (at != null) {
          for (i = 0, l = toAdd.length; i < l; i++) {
            this.models.splice(at + i, 0, toAdd[i]);
          }
        } else {
          if (order) this.models.length = 0;
          var orderedModels = order || toAdd;
          for (i = 0, l = orderedModels.length; i < l; i++) {
            this.models.push(orderedModels[i]);
          }
        }
      }

      // Silently sort the collection if appropriate.
      if (sort) this.sort({silent: true});

      // Unless silenced, it's time to fire all appropriate add/sort events.
      if (!options.silent) {
        for (i = 0, l = toAdd.length; i < l; i++) {
          (model = toAdd[i]).trigger('add', model, this, options);
        }
        if (sort || (order && order.length)) this.trigger('sort', this, options);
      }
      
      // Return the added (or merged) model (or models).
      return singular ? models[0] : models;
    },

    // When you have more items than you want to add or remove individually,
    // you can reset the entire set with a new list of models, without firing
    // any granular `add` or `remove` events. Fires `reset` when finished.
    // Useful for bulk operations and optimizations.
    reset: function(models, options) {
      options || (options = {});
      for (var i = 0, l = this.models.length; i < l; i++) {
        this._removeReference(this.models[i]);
      }
      options.previousModels = this.models;
      this._reset();
      models = this.add(models, _.extend({silent: true}, options));
      if (!options.silent) this.trigger('reset', this, options);
      return models;
    },

    // Add a model to the end of the collection.
    push: function(model, options) {
      return this.add(model, _.extend({at: this.length}, options));
    },

    // Remove a model from the end of the collection.
    pop: function(options) {
      var model = this.at(this.length - 1);
      this.remove(model, options);
      return model;
    },

    // Add a model to the beginning of the collection.
    unshift: function(model, options) {
      return this.add(model, _.extend({at: 0}, options));
    },

    // Remove a model from the beginning of the collection.
    shift: function(options) {
      var model = this.at(0);
      this.remove(model, options);
      return model;
    },

    // Slice out a sub-array of models from the collection.
    slice: function() {
      return slice.apply(this.models, arguments);
    },

    // Get a model from the set by id.
    get: function(obj) {
      if (obj == null) return void 0;
      return this._byId[obj.id] || this._byId[obj.cid] || this._byId[obj];
    },

    // Get the model at the given index.
    at: function(index) {
      return this.models[index];
    },

    // Return models with matching attributes. Useful for simple cases of
    // `filter`.
    where: function(attrs, first) {
      if (_.isEmpty(attrs)) return first ? void 0 : [];
      return this[first ? 'find' : 'filter'](function(model) {
        for (var key in attrs) {
          if (attrs[key] !== model.get(key)) return false;
        }
        return true;
      });
    },

    // Return the first model with matching attributes. Useful for simple cases
    // of `find`.
    findWhere: function(attrs) {
      return this.where(attrs, true);
    },

    // Force the collection to re-sort itself. You don't need to call this under
    // normal circumstances, as the set will maintain sort order as each item
    // is added.
    sort: function(options) {
      if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
      options || (options = {});

      // Run sort based on type of `comparator`.
      if (_.isString(this.comparator) || this.comparator.length === 1) {
        this.models = this.sortBy(this.comparator, this);
      } else {
        this.models.sort(_.bind(this.comparator, this));
      }

      if (!options.silent) this.trigger('sort', this, options);
      return this;
    },

    // Pluck an attribute from each model in the collection.
    pluck: function(attr) {
      return _.invoke(this.models, 'get', attr);
    },

    // Fetch the default set of models for this collection, resetting the
    // collection when they arrive. If `reset: true` is passed, the response
    // data will be passed through the `reset` method instead of `set`.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === void 0) options.parse = true;
      var success = options.success;
      var collection = this;
      options.success = function(resp) {
        var method = options.reset ? 'reset' : 'set';
        collection[method](resp, options);
        if (success) success(collection, resp, options);
        collection.trigger('sync', collection, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Create a new instance of a model in this collection. Add the model to the
    // collection immediately, unless `wait: true` is passed, in which case we
    // wait for the server to agree.
    create: function(model, options) {
      options = options ? _.clone(options) : {};
      if (!(model = this._prepareModel(model, options))) return false;
      if (!options.wait) this.add(model, options);
      var collection = this;
      var success = options.success;
      options.success = function(model, resp, options) {
        if (options.wait) collection.add(model, options);
        if (success) success(model, resp, options);
      };
      model.save(null, options);
      return model;
    },

    // **parse** converts a response into a list of models to be added to the
    // collection. The default implementation is just to pass it through.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new collection with an identical list of models as this one.
    clone: function() {
      return new this.constructor(this.models);
    },

    // Private method to reset all internal state. Called when the collection
    // is first initialized or reset.
    _reset: function() {
      this.length = 0;
      this.models = [];
      this._byId  = {};
    },

    // Prepare a hash of attributes (or other model) to be added to this
    // collection.
    _prepareModel: function(attrs, options) {
      if (attrs instanceof Model) {
        if (!attrs.collection) attrs.collection = this;
        return attrs;
      }
      options = options ? _.clone(options) : {};
      options.collection = this;
      var model = new this.model(attrs, options);
      if (!model.validationError) return model;
      this.trigger('invalid', this, model.validationError, options);
      return false;
    },

    // Internal method to sever a model's ties to a collection.
    _removeReference: function(model) {
      if (this === model.collection) delete model.collection;
      model.off('all', this._onModelEvent, this);
    },

    // Internal method called every time a model in the set fires an event.
    // Sets need to update their indexes when models change ids. All other
    // events simply proxy through. "add" and "remove" events that originate
    // in other collections are ignored.
    _onModelEvent: function(event, model, collection, options) {
      if ((event === 'add' || event === 'remove') && collection !== this) return;
      if (event === 'destroy') this.remove(model, options);
      if (model && event === 'change:' + model.idAttribute) {
        delete this._byId[model.previous(model.idAttribute)];
        if (model.id != null) this._byId[model.id] = model;
      }
      this.trigger.apply(this, arguments);
    }

  });

  // Underscore methods that we want to implement on the Collection.
  // 90% of the core usefulness of Backbone Collections is actually implemented
  // right here:
  var methods = ['forEach', 'each', 'map', 'collect', 'reduce', 'foldl',
    'inject', 'reduceRight', 'foldr', 'find', 'detect', 'filter', 'select',
    'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke',
    'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
    'tail', 'drop', 'last', 'without', 'difference', 'indexOf', 'shuffle',
    'lastIndexOf', 'isEmpty', 'chain'];

  // Mix in each Underscore method as a proxy to `Collection#models`.
  _.each(methods, function(method) {
    Collection.prototype[method] = function() {
      var args = slice.call(arguments);
      args.unshift(this.models);
      return _[method].apply(_, args);
    };
  });

  // Underscore methods that take a property name as an argument.
  var attributeMethods = ['groupBy', 'countBy', 'sortBy'];

  // Use attributes instead of properties.
  _.each(attributeMethods, function(method) {
    Collection.prototype[method] = function(value, context) {
      var iterator = _.isFunction(value) ? value : function(model) {
        return model.get(value);
      };
      return _[method](this.models, iterator, context);
    };
  });

  // Backbone.View
  // -------------

  // Backbone Views are almost more convention than they are actual code. A View
  // is simply a JavaScript object that represents a logical chunk of UI in the
  // DOM. This might be a single item, an entire list, a sidebar or panel, or
  // even the surrounding frame which wraps your whole app. Defining a chunk of
  // UI as a **View** allows you to define your DOM events declaratively, without
  // having to worry about render order ... and makes it easy for the view to
  // react to specific changes in the state of your models.

  // Creating a Backbone.View creates its initial element outside of the DOM,
  // if an existing element is not provided...
  var View = Backbone.View = function(options) {
    this.cid = _.uniqueId('view');
    options || (options = {});
    _.extend(this, _.pick(options, viewOptions));
    this._ensureElement();
    this.initialize.apply(this, arguments);
    this.delegateEvents();
  };

  // Cached regex to split keys for `delegate`.
  var delegateEventSplitter = /^(\S+)\s*(.*)$/;

  // List of view options to be merged as properties.
  var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];

  // Set up all inheritable **Backbone.View** properties and methods.
  _.extend(View.prototype, Events, {

    // The default `tagName` of a View's element is `"div"`.
    tagName: 'div',

    // jQuery delegate for element lookup, scoped to DOM elements within the
    // current view. This should be preferred to global lookups where possible.
    $: function(selector) {
      return this.$el.find(selector);
    },

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // **render** is the core function that your view should override, in order
    // to populate its element (`this.el`), with the appropriate HTML. The
    // convention is for **render** to always return `this`.
    render: function() {
      return this;
    },

    // Remove this view by taking the element out of the DOM, and removing any
    // applicable Backbone.Events listeners.
    remove: function() {
      this.$el.remove();
      this.stopListening();
      return this;
    },

    // Change the view's element (`this.el` property), including event
    // re-delegation.
    setElement: function(element, delegate) {
      if (this.$el) this.undelegateEvents();
      this.$el = element instanceof Backbone.$ ? element : Backbone.$(element);
      this.el = this.$el[0];
      if (delegate !== false) this.delegateEvents();
      return this;
    },

    // Set callbacks, where `this.events` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       'mousedown .title':  'edit',
    //       'click .button':     'save',
    //       'click .open':       function(e) { ... }
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    // This only works for delegate-able events: not `focus`, `blur`, and
    // not `change`, `submit`, and `reset` in Internet Explorer.
    delegateEvents: function(events) {
      if (!(events || (events = _.result(this, 'events')))) return this;
      this.undelegateEvents();
      for (var key in events) {
        var method = events[key];
        if (!_.isFunction(method)) method = this[events[key]];
        if (!method) continue;

        var match = key.match(delegateEventSplitter);
        var eventName = match[1], selector = match[2];
        method = _.bind(method, this);
        eventName += '.delegateEvents' + this.cid;
        if (selector === '') {
          this.$el.on(eventName, method);
        } else {
          this.$el.on(eventName, selector, method);
        }
      }
      return this;
    },

    // Clears all callbacks previously bound to the view with `delegateEvents`.
    // You usually don't need to use this, but may wish to if you have multiple
    // Backbone views attached to the same DOM element.
    undelegateEvents: function() {
      this.$el.off('.delegateEvents' + this.cid);
      return this;
    },

    // Ensure that the View has a DOM element to render into.
    // If `this.el` is a string, pass it through `$()`, take the first
    // matching element, and re-assign it to `el`. Otherwise, create
    // an element from the `id`, `className` and `tagName` properties.
    _ensureElement: function() {
      if (!this.el) {
        var attrs = _.extend({}, _.result(this, 'attributes'));
        if (this.id) attrs.id = _.result(this, 'id');
        if (this.className) attrs['class'] = _.result(this, 'className');
        var $el = Backbone.$('<' + _.result(this, 'tagName') + '>').attr(attrs);
        this.setElement($el, false);
      } else {
        this.setElement(_.result(this, 'el'), false);
      }
    }

  });

  // Backbone.sync
  // -------------

  // Override this function to change the manner in which Backbone persists
  // models to the server. You will be passed the type of request, and the
  // model in question. By default, makes a RESTful Ajax request
  // to the model's `url()`. Some possible customizations could be:
  //
  // * Use `setTimeout` to batch rapid-fire updates into a single request.
  // * Send up the models as XML instead of JSON.
  // * Persist models via WebSockets instead of Ajax.
  //
  // Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
  // as `POST`, with a `_method` parameter containing the true HTTP method,
  // as well as all requests with the body as `application/x-www-form-urlencoded`
  // instead of `application/json` with the model in a param named `model`.
  // Useful when interfacing with server-side languages like **PHP** that make
  // it difficult to read the body of `PUT` requests.
  Backbone.sync = function(method, model, options) {
    var type = methodMap[method];

    // Default options, unless specified.
    _.defaults(options || (options = {}), {
      emulateHTTP: Backbone.emulateHTTP,
      emulateJSON: Backbone.emulateJSON
    });

    // Default JSON-request options.
    var params = {type: type, dataType: 'json'};

    // Ensure that we have a URL.
    if (!options.url) {
      params.url = _.result(model, 'url') || urlError();
    }

    // Ensure that we have the appropriate request data.
    if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
      params.contentType = 'application/json';
      params.data = JSON.stringify(options.attrs || model.toJSON(options));
    }

    // For older servers, emulate JSON by encoding the request into an HTML-form.
    if (options.emulateJSON) {
      params.contentType = 'application/x-www-form-urlencoded';
      params.data = params.data ? {model: params.data} : {};
    }

    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
      params.type = 'POST';
      if (options.emulateJSON) params.data._method = type;
      var beforeSend = options.beforeSend;
      options.beforeSend = function(xhr) {
        xhr.setRequestHeader('X-HTTP-Method-Override', type);
        if (beforeSend) return beforeSend.apply(this, arguments);
      };
    }

    // Don't process data on a non-GET request.
    if (params.type !== 'GET' && !options.emulateJSON) {
      params.processData = false;
    }

    // If we're sending a `PATCH` request, and we're in an old Internet Explorer
    // that still has ActiveX enabled by default, override jQuery to use that
    // for XHR instead. Remove this line when jQuery supports `PATCH` on IE8.
    if (params.type === 'PATCH' && noXhrPatch) {
      params.xhr = function() {
        return new ActiveXObject("Microsoft.XMLHTTP");
      };
    }

    // Make the request, allowing the user to override any Ajax options.
    var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
    model.trigger('request', model, xhr, options);
    return xhr;
  };

  var noXhrPatch = typeof window !== 'undefined' && !!window.ActiveXObject && !(window.XMLHttpRequest && (new XMLHttpRequest).dispatchEvent);

  // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
  var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'patch':  'PATCH',
    'delete': 'DELETE',
    'read':   'GET'
  };

  // Set the default implementation of `Backbone.ajax` to proxy through to `$`.
  // Override this if you'd like to use a different library.
  Backbone.ajax = function() {
    return Backbone.$.ajax.apply(Backbone.$, arguments);
  };

  // Backbone.Router
  // ---------------

  // Routers map faux-URLs to actions, and fire events when routes are
  // matched. Creating a new one sets its `routes` hash, if not set statically.
  var Router = Backbone.Router = function(options) {
    options || (options = {});
    if (options.routes) this.routes = options.routes;
    this._bindRoutes();
    this.initialize.apply(this, arguments);
  };

  // Cached regular expressions for matching named param parts and splatted
  // parts of route strings.
  var optionalParam = /\((.*?)\)/g;
  var namedParam    = /(\(\?)?:\w+/g;
  var splatParam    = /\*\w+/g;
  var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

  // Set up all inheritable **Backbone.Router** properties and methods.
  _.extend(Router.prototype, Events, {

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Manually bind a single named route to a callback. For example:
    //
    //     this.route('search/:query/p:num', 'search', function(query, num) {
    //       ...
    //     });
    //
    route: function(route, name, callback) {
      if (!_.isRegExp(route)) route = this._routeToRegExp(route);
      if (_.isFunction(name)) {
        callback = name;
        name = '';
      }
      if (!callback) callback = this[name];
      var router = this;
      Backbone.history.route(route, function(fragment) {
        var args = router._extractParameters(route, fragment);
        callback && callback.apply(router, args);
        router.trigger.apply(router, ['route:' + name].concat(args));
        router.trigger('route', name, args);
        Backbone.history.trigger('route', router, name, args);
      });
      return this;
    },

    // Simple proxy to `Backbone.history` to save a fragment into the history.
    navigate: function(fragment, options) {
      Backbone.history.navigate(fragment, options);
      return this;
    },

    // Bind all defined routes to `Backbone.history`. We have to reverse the
    // order of the routes here to support behavior where the most general
    // routes can be defined at the bottom of the route map.
    _bindRoutes: function() {
      if (!this.routes) return;
      this.routes = _.result(this, 'routes');
      var route, routes = _.keys(this.routes);
      while ((route = routes.pop()) != null) {
        this.route(route, this.routes[route]);
      }
    },

    // Convert a route string into a regular expression, suitable for matching
    // against the current location hash.
    _routeToRegExp: function(route) {
      route = route.replace(escapeRegExp, '\\$&')
                   .replace(optionalParam, '(?:$1)?')
                   .replace(namedParam, function(match, optional) {
                     return optional ? match : '([^\/]+)';
                   })
                   .replace(splatParam, '(.*?)');
      return new RegExp('^' + route + '$');
    },

    // Given a route, and a URL fragment that it matches, return the array of
    // extracted decoded parameters. Empty or unmatched parameters will be
    // treated as `null` to normalize cross-browser behavior.
    _extractParameters: function(route, fragment) {
      var params = route.exec(fragment).slice(1);
      return _.map(params, function(param) {
        return param ? decodeURIComponent(param) : null;
      });
    }

  });

  // Backbone.History
  // ----------------

  // Handles cross-browser history management, based on either
  // [pushState](http://diveintohtml5.info/history.html) and real URLs, or
  // [onhashchange](https://developer.mozilla.org/en-US/docs/DOM/window.onhashchange)
  // and URL fragments. If the browser supports neither (old IE, natch),
  // falls back to polling.
  var History = Backbone.History = function() {
    this.handlers = [];
    _.bindAll(this, 'checkUrl');

    // Ensure that `History` can be used outside of the browser.
    if (typeof window !== 'undefined') {
      this.location = window.location;
      this.history = window.history;
    }
  };

  // Cached regex for stripping a leading hash/slash and trailing space.
  var routeStripper = /^[#\/]|\s+$/g;

  // Cached regex for stripping leading and trailing slashes.
  var rootStripper = /^\/+|\/+$/g;

  // Cached regex for detecting MSIE.
  var isExplorer = /msie [\w.]+/;

  // Cached regex for removing a trailing slash.
  var trailingSlash = /\/$/;

  // Cached regex for stripping urls of hash and query.
  var pathStripper = /[?#].*$/;

  // Has the history handling already been started?
  History.started = false;

  // Set up all inheritable **Backbone.History** properties and methods.
  _.extend(History.prototype, Events, {

    // The default interval to poll for hash changes, if necessary, is
    // twenty times a second.
    interval: 50,

    // Gets the true hash value. Cannot use location.hash directly due to bug
    // in Firefox where location.hash will always be decoded.
    getHash: function(window) {
      var match = (window || this).location.href.match(/#(.*)$/);
      return match ? match[1] : '';
    },

    // Get the cross-browser normalized URL fragment, either from the URL,
    // the hash, or the override.
    getFragment: function(fragment, forcePushState) {
      if (fragment == null) {
        if (this._hasPushState || !this._wantsHashChange || forcePushState) {
          fragment = this.location.pathname;
          var root = this.root.replace(trailingSlash, '');
          if (!fragment.indexOf(root)) fragment = fragment.slice(root.length);
        } else {
          fragment = this.getHash();
        }
      }
      return fragment.replace(routeStripper, '');
    },

    // Start the hash change handling, returning `true` if the current URL matches
    // an existing route, and `false` otherwise.
    start: function(options) {
      if (History.started) throw new Error("Backbone.history has already been started");
      History.started = true;

      // Figure out the initial configuration. Do we need an iframe?
      // Is pushState desired ... is it available?
      this.options          = _.extend({root: '/'}, this.options, options);
      this.root             = this.options.root;
      this._wantsHashChange = this.options.hashChange !== false;
      this._wantsPushState  = !!this.options.pushState;
      this._hasPushState    = !!(this.options.pushState && this.history && this.history.pushState);
      var fragment          = this.getFragment();
      var docMode           = document.documentMode;
      var oldIE             = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));

      // Normalize root to always include a leading and trailing slash.
      this.root = ('/' + this.root + '/').replace(rootStripper, '/');

      if (oldIE && this._wantsHashChange) {
        this.iframe = Backbone.$('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo('body')[0].contentWindow;
        this.navigate(fragment);
      }

      // Depending on whether we're using pushState or hashes, and whether
      // 'onhashchange' is supported, determine how we check the URL state.
      if (this._hasPushState) {
        Backbone.$(window).on('popstate', this.checkUrl);
      } else if (this._wantsHashChange && ('onhashchange' in window) && !oldIE) {
        Backbone.$(window).on('hashchange', this.checkUrl);
      } else if (this._wantsHashChange) {
        this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
      }

      // Determine if we need to change the base url, for a pushState link
      // opened by a non-pushState browser.
      this.fragment = fragment;
      var loc = this.location;
      var atRoot = loc.pathname.replace(/[^\/]$/, '$&/') === this.root;

      // Transition from hashChange to pushState or vice versa if both are
      // requested.
      if (this._wantsHashChange && this._wantsPushState) {

        // If we've started off with a route from a `pushState`-enabled
        // browser, but we're currently in a browser that doesn't support it...
        if (!this._hasPushState && !atRoot) {
          this.fragment = this.getFragment(null, true);
          this.location.replace(this.root + this.location.search + '#' + this.fragment);
          // Return immediately as browser will do redirect to new url
          return true;

        // Or if we've started out with a hash-based route, but we're currently
        // in a browser where it could be `pushState`-based instead...
        } else if (this._hasPushState && atRoot && loc.hash) {
          this.fragment = this.getHash().replace(routeStripper, '');
          this.history.replaceState({}, document.title, this.root + this.fragment + loc.search);
        }

      }

      if (!this.options.silent) return this.loadUrl();
    },

    // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
    // but possibly useful for unit testing Routers.
    stop: function() {
      Backbone.$(window).off('popstate', this.checkUrl).off('hashchange', this.checkUrl);
      clearInterval(this._checkUrlInterval);
      History.started = false;
    },

    // Add a route to be tested when the fragment changes. Routes added later
    // may override previous routes.
    route: function(route, callback) {
      this.handlers.unshift({route: route, callback: callback});
    },

    // Checks the current URL to see if it has changed, and if it has,
    // calls `loadUrl`, normalizing across the hidden iframe.
    checkUrl: function(e) {
      var current = this.getFragment();
      if (current === this.fragment && this.iframe) {
        current = this.getFragment(this.getHash(this.iframe));
      }
      if (current === this.fragment) return false;
      if (this.iframe) this.navigate(current);
      this.loadUrl();
    },

    // Attempt to load the current URL fragment. If a route succeeds with a
    // match, returns `true`. If no defined routes matches the fragment,
    // returns `false`.
    loadUrl: function(fragment) {
      fragment = this.fragment = this.getFragment(fragment);
      return _.any(this.handlers, function(handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment);
          return true;
        }
      });
    },

    // Save a fragment into the hash history, or replace the URL state if the
    // 'replace' option is passed. You are responsible for properly URL-encoding
    // the fragment in advance.
    //
    // The options object can contain `trigger: true` if you wish to have the
    // route callback be fired (not usually desirable), or `replace: true`, if
    // you wish to modify the current URL without adding an entry to the history.
    navigate: function(fragment, options) {
      if (!History.started) return false;
      if (!options || options === true) options = {trigger: !!options};

      var url = this.root + (fragment = this.getFragment(fragment || ''));

      // Strip the fragment of the query and hash for matching.
      fragment = fragment.replace(pathStripper, '');

      if (this.fragment === fragment) return;
      this.fragment = fragment;

      // Don't include a trailing slash on the root.
      if (fragment === '' && url !== '/') url = url.slice(0, -1);

      // If pushState is available, we use it to set the fragment as a real URL.
      if (this._hasPushState) {
        this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);

      // If hash changes haven't been explicitly disabled, update the hash
      // fragment to store history.
      } else if (this._wantsHashChange) {
        this._updateHash(this.location, fragment, options.replace);
        if (this.iframe && (fragment !== this.getFragment(this.getHash(this.iframe)))) {
          // Opening and closing the iframe tricks IE7 and earlier to push a
          // history entry on hash-tag change.  When replace is true, we don't
          // want this.
          if(!options.replace) this.iframe.document.open().close();
          this._updateHash(this.iframe.location, fragment, options.replace);
        }

      // If you've told us that you explicitly don't want fallback hashchange-
      // based history, then `navigate` becomes a page refresh.
      } else {
        return this.location.assign(url);
      }
      if (options.trigger) return this.loadUrl(fragment);
    },

    // Update the hash location, either replacing the current entry, or adding
    // a new one to the browser history.
    _updateHash: function(location, fragment, replace) {
      if (replace) {
        var href = location.href.replace(/(javascript:|#).*$/, '');
        location.replace(href + '#' + fragment);
      } else {
        // Some browsers require that `hash` contains a leading #.
        location.hash = '#' + fragment;
      }
    }

  });

  // Create the default Backbone.history.
  Backbone.history = new History;

  // Helpers
  // -------

  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var extend = function(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }

    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
  };

  // Set up inheritance for the model, collection, router, view and history.
  Model.extend = Collection.extend = Router.extend = View.extend = History.extend = extend;

  // Throw an error when a URL is needed, and none is supplied.
  var urlError = function() {
    throw new Error('A "url" property or function must be specified');
  };

  // Wrap an optional error callback with a fallback error event.
  var wrapError = function(model, options) {
    var error = options.error;
    options.error = function(resp) {
      if (error) error(model, resp, options);
      model.trigger('error', model, resp, options);
    };
  };

}).call(this);

},{"underscore":176}],25:[function(require,module,exports){
/**
 * Backbone Firebase Adapter.
 */

"use strict";

(function() {

  var _ = window._;
  var Backbone = window.Backbone;

  Backbone.Firebase = function(ref) {
    this._fbref = ref;
    this._children = [];
    if (typeof ref == "string") {
      this._fbref = new Firebase(ref);
    }

    this._fbref.on("child_added", this._childAdded, this);
    this._fbref.on("child_moved", this._childMoved, this);
    this._fbref.on("child_changed", this._childChanged, this);
    this._fbref.on("child_removed", this._childRemoved, this);
  };

  _.extend(Backbone.Firebase.prototype, {
    _childAdded: function(childSnap, prevChild) {
      var model = childSnap.val();
      model.id = childSnap.name();
      if (prevChild) {
        var item = _.find(this._children, function(child) {
          return child.id == prevChild;
        });
        this._children.splice(this._children.indexOf(item) + 1, 0, model);
      } else {
        this._children.unshift(model);
      }
    },

    _childMoved: function(childSnap, prevChild) {
      var model = childSnap.val();
      this._children = _.reject(this._children, function(child) {
        return child.id == model.id;
      });
      this._childAdded(childSnap, prevChild);
    },

    _childChanged: function(childSnap) {
      var model = childSnap.val();
      model.id = childSnap.name();
      var item = _.find(this._children, function(child) {
        return child.id == model.id;
      });
      this._children[this._children.indexOf(item)] = model;
    },

    _childRemoved: function(oldChildSnap) {
      var model = oldChildSnap.val();
      this._children = _.reject(this._children, function(child) {
        return child.id == model.id;
      });
    },

    create: function(model, cb) {
      if (!model.id) {
        model.id = this._fbref.ref().push().name();
      }

      var val = model.toJSON();
      this._fbref.ref().child(model.id).set(val, _.bind(function(err) {
        if (!err) {
          cb(null, val);
        } else {
          cb("Could not create model " + model.id);
        }
      }, this));
    },

    read: function(model, cb) {
      if (!model.id) {
        _.defer(cb, "Invalid model ID provided to read");
        return;
      }

      var index = _.find(this._children, function(child) {
        return child.id == model.id;
      });

      _.defer(cb, null, this._children[index]);
    },

    readAll: function(model, cb) {
      _.defer(cb, null, this._children);
    },

    update: function(model, cb) {
      var val = model.toJSON();
      this._fbref.ref().child(model.id).update(val, function(err) {
        if (!err) {
          cb(null, val);
        } else {
          cb("Could not update model " + model.id, null);
        }
      });
    },

    "delete": function(model, cb) {
      this._fbref.ref().child(model.id).remove(function(err) {
        if (!err) {
          cb(null, model);
        } else {
          cb("Could not delete model " + model.id);
        }
      });
    },

    ref: function() {
      return this._fbref;
    }
  });


  Backbone.Firebase.sync = function(method, model, options, error) {
    var store = model.firebase || model.collection.firebase;

    // Backwards compatibility with Backbone <= 0.3.3
    if (typeof options == "function") {
      options = {
        success: options,
        error: error
      };
    }

    if (method == "read" && model.id === undefined) {
      method = "readAll";
    }

    store[method].apply(store, [model, function(err, val) {
      if (err) {
        model.trigger("error", model, err, options);
        if (Backbone.VERSION === "0.9.10") {
          options.error(model, err, options);
        } else {
          options.error(err);
        }
      } else {
        model.trigger("sync", model, val, options);
        if (Backbone.VERSION === "0.9.10") {
          options.success(model, val, options);
        } else {
          options.success(val);
        }
      }
    }]);
  };

  Backbone.oldSync = Backbone.sync;

  // Override "Backbone.sync" to default to Firebase sync.
  // the original "Backbone.sync" is still available in "Backbone.oldSync"
  Backbone.sync = function(method, model, options, error) {
    var syncMethod = Backbone.oldSync;
    if (model.firebase || (model.collection && model.collection.firebase)) {
      syncMethod = Backbone.Firebase.sync;
    }
    return syncMethod.apply(this, [method, model, options, error]);
  };

  // Custom Firebase Collection.
  Backbone.Firebase.Collection = Backbone.Collection.extend({
    sync: function() {
      this._log("Sync called on a Firebase collection, ignoring.");
    },

    fetch: function() {
      this._log("Fetch called on a Firebase collection, ignoring.");
    },

    constructor: function(models, options) {
      // Apply parent constructor (this will also call initialize).
      Backbone.Collection.apply(this, arguments);

      if (options && options.firebase) {
        this.firebase = options.firebase;
      }
      switch (typeof this.firebase) {
      case "object":
        break;
      case "string":
        this.firebase = new Firebase(this.firebase);
        break;
      case "function":
        this.firebase = this.firebase();
        break;
      default:
        throw new Error("Invalid firebase reference created");
      }

      // Add handlers for remote events.
      this.firebase.on("child_added", _.bind(this._childAdded, this));
      this.firebase.on("child_moved", _.bind(this._childMoved, this));
      this.firebase.on("child_changed", _.bind(this._childChanged, this));
      this.firebase.on("child_removed", _.bind(this._childRemoved, this));

      // Once handler to emit "sync" event.
      this.firebase.once("value", _.bind(function() {
        this.trigger("sync", this, null, null);
      }, this));

      // Handle changes in any local models.
      this.listenTo(this, "change", this._updateModel, this);
      // Listen for destroy event to remove models.
      this.listenTo(this, "destroy", this._removeModel, this);

      // Don't suppress local events by default.
      this._suppressEvent = false;
    },

    comparator: function(model) {
      return model.id;
    },

    add: function(models, options) {
      var parsed = this._parseModels(models);
      options = options ? _.clone(options) : {};
      options.success =
        _.isFunction(options.success) ? options.success : function() {};

      for (var i = 0; i < parsed.length; i++) {
        var model = parsed[i];
        var childRef = this.firebase.ref().child(model.id);
        if (options.silent === true) {
          this._suppressEvent = true;
        }
        childRef.set(model, _.bind(options.success, model));
      }

      return parsed;
    },

    remove: function(models, options) {
      var parsed = this._parseModels(models);
      options = options ? _.clone(options) : {};
      options.success =
        _.isFunction(options.success) ? options.success : function() {};

      for (var i = 0; i < parsed.length; i++) {
        var model = parsed[i];
        var childRef = this.firebase.ref().child(model.id);
        if (options.silent === true) {
          this._suppressEvent = true;
        }
        childRef.set(null, _.bind(options.success, model));
      }

      return parsed;
    },

    create: function(model, options) {
      options = options ? _.clone(options) : {};
      if (options.wait) {
        this._log("Wait option provided to create, ignoring.");
      }
      model = Backbone.Collection.prototype._prepareModel.apply(
        this, [model, options]
      );
      if (!model) {
        return false;
      }
      var set = this.add([model], options);
      return set[0];
    },

    reset: function(models, options) {
      options = options ? _.clone(options) : {};
      // Remove all models remotely.
      this.remove(this.models, {silent: true});
      // Add new models.
      var ret = this.add(models, {silent: true});
      // Trigger "reset" event.
      if (!options.silent) {
        this.trigger("reset", this, options);
      }
      return ret;
    },

    _log: function(msg) {
      if (console && console.log) {
        console.log(msg);
      }
    },

    // TODO: Options will be ignored for add & remove, document this!
    _parseModels: function(models) {
      var ret = [];
      models = _.isArray(models) ? models.slice() : [models];
      for (var i = 0; i < models.length; i++) {
        var model = models[i];
        if (model.toJSON && typeof model.toJSON == "function") {
          model = model.toJSON();
        }
        if (!model.id) {
          model.id = this.firebase.ref().push().name();
        }
        ret.push(model);
      }
      return ret;
    },

    _childAdded: function(snap) {
      var model = snap.val();
      if (!model.id) {
        if (!_.isObject(model)) {
          model = {};
        }
        model.id = snap.name();
      }
      if (this._suppressEvent === true) {
        this._suppressEvent = false;
        Backbone.Collection.prototype.add.apply(this, [model], {silent: true});
      } else {
        Backbone.Collection.prototype.add.apply(this, [model]);
      }
      this.get(model.id)._remoteAttributes = model;
    },

    _childMoved: function(snap) {
      // TODO: Investigate: can this occur without the ID changing?
      this._log("_childMoved called with " + snap.val());
    },

    _childChanged: function(snap) {
      var model = snap.val();
      if (!model.id) {
        model.id = snap.name();
      }

      var item = _.find(this.models, function(child) {
        return child.id == model.id;
      });

      if (!item) {
        // TODO: Investigate: what is the right way to handle this case?
        throw new Error("Could not find model with ID " + model.id);
      }

      this._preventSync(item, true);
      item._remoteAttributes = model;

      var diff = _.difference(_.keys(item.attributes), _.keys(model));
      _.each(diff, function(key) {
        item.unset(key);
      });

      item.set(model);
      this._preventSync(item, false);
    },

    _childRemoved: function(snap) {
      var model = snap.val();
      if (!model.id) {
        model.id = snap.name();
      }
      if (this._suppressEvent === true) {
        this._suppressEvent = false;
        Backbone.Collection.prototype.remove.apply(
          this, [model], {silent: true}
        );
      } else {
        Backbone.Collection.prototype.remove.apply(this, [model]);
      }
    },

    // Add handlers for all models in this collection, and any future ones
    // that may be added.
    _updateModel: function(model) {
      if (model._remoteChanging) {
        return;
      }

      var remoteAttributes = model._remoteAttributes || {};
      var localAttributes = model.toJSON();
      var updateAttributes = {};

      var union = _.union(_.keys(remoteAttributes), _.keys(localAttributes));
      _.each(union, function(key) {
        if (!_.has(localAttributes, key)) {
          updateAttributes[key] = null;
        } else if (localAttributes[key] != remoteAttributes[key]) {
          updateAttributes[key] = localAttributes[key];
        }
      });

      if (_.size(updateAttributes)) {
        this.firebase.ref().child(model.id).update(updateAttributes);
      }
    },

    // Triggered when model.destroy() is called on one of the children.
    _removeModel: function(model, collection, options) {
      options = options ? _.clone(options) : {};
      options.success =
        _.isFunction(options.success) ? options.success : function() {};
      var childRef = this.firebase.ref().child(model.id);
      childRef.set(null, _.bind(options.success, model));
    },

    _preventSync: function(model, state) {
      model._remoteChanging = state;
    }
  });

  // Custom Firebase Model.
  Backbone.Firebase.Model = Backbone.Model.extend({
    save: function() {
      this._log("Save called on a Firebase model, ignoring.");
    },

    destroy: function(options) {
      // TODO: Fix naive success callback. Add error callback.
      this.firebase.ref().set(null, this._log);
      this.trigger("destroy", this, this.collection, options);
      if (options.success) {
        options.success(this, null, options);
      }
    },

    constructor: function(model, options) {
      // Store defaults so they don't get applied immediately.
      var defaults = _.result(this, "defaults");

      // Apply defaults only after first sync.
      this.once("sync", function() {
        this.set(_.defaults(this.toJSON(), defaults));
      });

      // Apply parent constructor (this will also call initialize).
      Backbone.Model.apply(this, arguments);

      if (options && options.firebase) {
        this.firebase = options.firebase;
      }
      switch (typeof this.firebase) {
      case "object":
        break;
      case "string":
        this.firebase = new Firebase(this.firebase);
        break;
      case "function":
        this.firebase = this.firebase();
        break;
      default:
        throw new Error("Invalid firebase reference created");
      }

      // Add handlers for remote events.
      this.firebase.on("value", _.bind(this._modelChanged, this));

      this._listenLocalChange(true);
    },

    _listenLocalChange: function(state) {
      if (state) {
        this.on("change", this._updateModel, this);
      } else {
        this.off("change", this._updateModel, this);
      }
    },

    _updateModel: function(model) {
      // Find the deleted keys and set their values to null
      // so Firebase properly deletes them.
      var modelObj = model.changedAttributes();
      _.each(model.changed, function(value, key) {
        if (typeof value === "undefined" || value === null) {
          if (key == "id") {
            delete modelObj[key];
          } else {
            modelObj[key] = null;
          }
        }
      });
      if (_.size(modelObj)) {
        this.firebase.ref().update(modelObj, this._log);
      }
    },

    _modelChanged: function(snap) {
      // Unset attributes that have been deleted from the server
      // by comparing the keys that have been removed.
      var newModel = snap.val();
      if (typeof newModel === "object" && newModel !== null) {
        var diff = _.difference(_.keys(this.attributes), _.keys(newModel));
        var self = this;
        _.each(diff, function(key) {
          self.unset(key);
        });
      }
      this._listenLocalChange(false);
      this.set(newModel);
      this.trigger("sync", this, null, null);
      this._listenLocalChange(true);
    },

    _log: function(msg) {
      if (typeof msg === "undefined" || msg === null) {
        return;
      }
      if (console && console.log) {
        console.log(msg);
      }
    }

  });

})();

},{}],26:[function(require,module,exports){
require('./vendor/firebase');
var Backbone = require('./bower_components/backbone/backbone');
window.Backbone = Backbone;
window._ = require('underscore');
require('./bower_components/backfire/backbone-firebase');

module.exports = window.Backbone;
},{"./bower_components/backbone/backbone":24,"./bower_components/backfire/backbone-firebase":25,"./vendor/firebase":27,"underscore":176}],27:[function(require,module,exports){
(function() {function g(a){throw a;}var j=void 0,k=!0,l=null,o=!1;function aa(a){return function(){return this[a]}}function r(a){return function(){return a}}var s,ba=this;function ca(){}function da(a){a.mb=function(){return a.bd?a.bd:a.bd=new a}}
function ea(a){var b=typeof a;if("object"==b)if(a){if(a instanceof Array)return"array";if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);if("[object Window]"==c)return"object";if("[object Array]"==c||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return"array";if("[object Function]"==c||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call"))return"function"}else return"null";
else if("function"==b&&"undefined"==typeof a.call)return"object";return b}function u(a){return a!==j}function fa(a){var b=ea(a);return"array"==b||"object"==b&&"number"==typeof a.length}function v(a){return"string"==typeof a}function ga(a){return"number"==typeof a}function ha(a){var b=typeof a;return"object"==b&&a!=l||"function"==b}Math.floor(2147483648*Math.random()).toString(36);function ia(a,b,c){return a.call.apply(a.bind,arguments)}
function ja(a,b,c){a||g(Error());if(2<arguments.length){var d=Array.prototype.slice.call(arguments,2);return function(){var c=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(c,d);return a.apply(b,c)}}return function(){return a.apply(b,arguments)}}function w(a,b,c){w=Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?ia:ja;return w.apply(l,arguments)}function ka(a,b){function c(){}c.prototype=b.prototype;a.Vd=b.prototype;a.prototype=new c};function la(a){a=String(a);if(/^\s*$/.test(a)?0:/^[\],:{}\s\u2028\u2029]*$/.test(a.replace(/\\["\\\/bfnrtu]/g,"@").replace(/"[^"\\\n\r\u2028\u2029\x00-\x08\x10-\x1f\x80-\x9f]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:[\s\u2028\u2029]*\[)+/g,"")))try{return eval("("+a+")")}catch(b){}g(Error("Invalid JSON string: "+a))}function ma(){this.dc=j}
function na(a,b,c){switch(typeof b){case "string":oa(b,c);break;case "number":c.push(isFinite(b)&&!isNaN(b)?b:"null");break;case "boolean":c.push(b);break;case "undefined":c.push("null");break;case "object":if(b==l){c.push("null");break}if("array"==ea(b)){var d=b.length;c.push("[");for(var e="",f=0;f<d;f++)c.push(e),e=b[f],na(a,a.dc?a.dc.call(b,String(f),e):e,c),e=",";c.push("]");break}c.push("{");d="";for(f in b)Object.prototype.hasOwnProperty.call(b,f)&&(e=b[f],"function"!=typeof e&&(c.push(d),
oa(f,c),c.push(":"),na(a,a.dc?a.dc.call(b,f,e):e,c),d=","));c.push("}");break;case "function":break;default:g(Error("Unknown type: "+typeof b))}}var pa={'"':'\\"',"\\":"\\\\","/":"\\/","\b":"\\b","\f":"\\f","\n":"\\n","\r":"\\r","\t":"\\t","\x0B":"\\u000b"},qa=/\uffff/.test("\uffff")?/[\\\"\x00-\x1f\x7f-\uffff]/g:/[\\\"\x00-\x1f\x7f-\xff]/g;
function oa(a,b){b.push('"',a.replace(qa,function(a){if(a in pa)return pa[a];var b=a.charCodeAt(0),e="\\u";16>b?e+="000":256>b?e+="00":4096>b&&(e+="0");return pa[a]=e+b.toString(16)}),'"')};function y(a){if("undefined"!==typeof JSON&&u(JSON.stringify))a=JSON.stringify(a);else{var b=[];na(new ma,a,b);a=b.join("")}return a};function ra(a){for(var b=[],c=0,d=0;d<a.length;d++){var e=a.charCodeAt(d);55296<=e&&56319>=e&&(e-=55296,d++,z(d<a.length,"Surrogate pair missing trail surrogate."),e=65536+(e<<10)+(a.charCodeAt(d)-56320));128>e?b[c++]=e:(2048>e?b[c++]=e>>6|192:(65536>e?b[c++]=e>>12|224:(b[c++]=e>>18|240,b[c++]=e>>12&63|128),b[c++]=e>>6&63|128),b[c++]=e&63|128)}return b};function A(a,b,c,d){var e;d<b?e="at least "+b:d>c&&(e=0===c?"none":"no more than "+c);e&&g(Error(a+" failed: Was called with "+d+(1===d?" argument.":" arguments.")+" Expects "+e+"."))}function B(a,b,c){var d="";switch(b){case 1:d=c?"first":"First";break;case 2:d=c?"second":"Second";break;case 3:d=c?"third":"Third";break;case 4:d=c?"fourth":"Fourth";break;default:sa.assert(o,"errorPrefix_ called with argumentNumber > 4.  Need to update it?")}return a+" failed: "+(d+" argument ")}
function C(a,b,c,d){(!d||u(c))&&"function"!=ea(c)&&g(Error(B(a,b,d)+"must be a valid function."))}function ta(a,b,c){u(c)&&(!ha(c)||c===l)&&g(Error(B(a,b,k)+"must be a valid context object."))};function D(a,b){return Object.prototype.hasOwnProperty.call(a,b)}function ua(a,b){if(Object.prototype.hasOwnProperty.call(a,b))return a[b]};var sa={},va=/[\[\].#$\/]/,wa=/[\[\].#$]/;function xa(a){return v(a)&&0!==a.length&&!va.test(a)}function ya(a,b,c){(!c||u(b))&&za(B(a,1,c),b)}
function za(a,b,c,d){c||(c=0);d||(d=[]);u(b)||g(Error(a+"contains undefined"+Aa(d)));"function"==ea(b)&&g(Error(a+"contains a function"+Aa(d)+" with contents: "+b.toString()));Ba(b)&&g(Error(a+"contains "+b.toString()+Aa(d)));1E3<c&&g(new TypeError(a+"contains a cyclic object value ("+d.slice(0,100).join(".")+"...)"));v(b)&&(b.length>10485760/3&&10485760<ra(b).length)&&g(Error(a+"contains a string greater than 10485760 utf8 bytes"+Aa(d)+" ('"+b.substring(0,50)+"...')"));if(ha(b))for(var e in b)D(b,
e)&&(".priority"!==e&&(".value"!==e&&".sv"!==e&&!xa(e))&&g(Error(a+"contains an invalid key ("+e+")"+Aa(d)+'.  Keys must be non-empty strings and can\'t contain ".", "#", "$", "/", "[", or "]"')),d.push(e),za(a,b[e],c+1,d),d.pop())}function Aa(a){return 0==a.length?"":" in property '"+a.join(".")+"'"}function Ca(a,b){ha(b)||g(Error(B(a,1,o)+" must be an object containing the children to replace."));ya(a,b,o)}
function Da(a,b,c,d){if(!d||u(c))c!==l&&(!ga(c)&&!v(c)&&(!ha(c)||!D(c,".sv")))&&g(Error(B(a,b,d)+"must be a valid firebase priority (a string, number, or null)."))}function Ea(a,b,c){if(!c||u(b))switch(b){case "value":case "child_added":case "child_removed":case "child_changed":case "child_moved":break;default:g(Error(B(a,1,c)+'must be a valid event type: "value", "child_added", "child_removed", "child_changed", or "child_moved".'))}}
function Fa(a,b){u(b)&&!xa(b)&&g(Error(B(a,2,k)+'was an invalid key: "'+b+'".  Firebase keys must be non-empty strings and can\'t contain ".", "#", "$", "/", "[", or "]").'))}function Ga(a,b){(!v(b)||0===b.length||wa.test(b))&&g(Error(B(a,1,o)+'was an invalid path: "'+b+'". Paths must be non-empty strings and can\'t contain ".", "#", "$", "[", or "]"'))}function E(a,b){".info"===F(b)&&g(Error(a+" failed: Can't modify data under /.info/"))};function H(a,b,c,d,e,f,h){this.n=a;this.path=b;this.Ba=c;this.ca=d;this.ua=e;this.za=f;this.Sa=h;u(this.ca)&&(u(this.za)&&u(this.Ba))&&g("Query: Can't combine startAt(), endAt(), and limit().")}H.prototype.Kc=function(){A("Query.ref",0,0,arguments.length);return new J(this.n,this.path)};H.prototype.ref=H.prototype.Kc;
H.prototype.Ya=function(a,b){A("Query.on",2,4,arguments.length);Ea("Query.on",a,o);C("Query.on",2,b,o);var c=Ha("Query.on",arguments[2],arguments[3]);this.n.Nb(this,a,b,c.cancel,c.T);return b};H.prototype.on=H.prototype.Ya;H.prototype.vb=function(a,b,c){A("Query.off",0,3,arguments.length);Ea("Query.off",a,k);C("Query.off",2,b,k);ta("Query.off",3,c);this.n.cc(this,a,b,c)};H.prototype.off=H.prototype.vb;
H.prototype.Id=function(a,b){function c(h){f&&(f=o,e.vb(a,c),b.call(d.T,h))}A("Query.once",2,4,arguments.length);Ea("Query.once",a,o);C("Query.once",2,b,o);var d=Ha("Query.once",arguments[2],arguments[3]),e=this,f=k;this.Ya(a,c,function(b){e.vb(a,c);d.cancel&&d.cancel.call(d.T,b)})};H.prototype.once=H.prototype.Id;
H.prototype.Bd=function(a){A("Query.limit",1,1,arguments.length);(!ga(a)||Math.floor(a)!==a||0>=a)&&g("Query.limit: First argument must be a positive integer.");return new H(this.n,this.path,a,this.ca,this.ua,this.za,this.Sa)};H.prototype.limit=H.prototype.Bd;H.prototype.Rd=function(a,b){A("Query.startAt",0,2,arguments.length);Da("Query.startAt",1,a,k);Fa("Query.startAt",b);u(a)||(b=a=l);return new H(this.n,this.path,this.Ba,a,b,this.za,this.Sa)};H.prototype.startAt=H.prototype.Rd;
H.prototype.wd=function(a,b){A("Query.endAt",0,2,arguments.length);Da("Query.endAt",1,a,k);Fa("Query.endAt",b);return new H(this.n,this.path,this.Ba,this.ca,this.ua,a,b)};H.prototype.endAt=H.prototype.wd;function Ia(a){var b={};u(a.ca)&&(b.sp=a.ca);u(a.ua)&&(b.sn=a.ua);u(a.za)&&(b.ep=a.za);u(a.Sa)&&(b.en=a.Sa);u(a.Ba)&&(b.l=a.Ba);u(a.ca)&&(u(a.ua)&&a.ca===l&&a.ua===l)&&(b.vf="l");return b}H.prototype.La=function(){var a=Ja(Ia(this));return"{}"===a?"default":a};
function Ha(a,b,c){var d={};b&&c?(d.cancel=b,C(a,3,d.cancel,k),d.T=c,ta(a,4,d.T)):b&&("object"===typeof b&&b!==l?d.T=b:"function"===typeof b?d.cancel=b:g(Error(B(a,3,k)+"must either be a cancel callback or a context object.")));return d};function K(a){if(a instanceof K)return a;if(1==arguments.length){this.m=a.split("/");for(var b=0,c=0;c<this.m.length;c++)0<this.m[c].length&&(this.m[b]=this.m[c],b++);this.m.length=b;this.Z=0}else this.m=arguments[0],this.Z=arguments[1]}function F(a){return a.Z>=a.m.length?l:a.m[a.Z]}function Ka(a){var b=a.Z;b<a.m.length&&b++;return new K(a.m,b)}s=K.prototype;s.toString=function(){for(var a="",b=this.Z;b<this.m.length;b++)""!==this.m[b]&&(a+="/"+this.m[b]);return a||"/"};
s.parent=function(){if(this.Z>=this.m.length)return l;for(var a=[],b=this.Z;b<this.m.length-1;b++)a.push(this.m[b]);return new K(a,0)};s.F=function(a){for(var b=[],c=this.Z;c<this.m.length;c++)b.push(this.m[c]);if(a instanceof K)for(c=a.Z;c<a.m.length;c++)b.push(a.m[c]);else{a=a.split("/");for(c=0;c<a.length;c++)0<a[c].length&&b.push(a[c])}return new K(b,0)};s.f=function(){return this.Z>=this.m.length};
function La(a,b){var c=F(a);if(c===l)return b;if(c===F(b))return La(Ka(a),Ka(b));g("INTERNAL ERROR: innerPath ("+b+") is not within outerPath ("+a+")")}s.contains=function(a){var b=0;if(this.m.length>a.m.length)return o;for(;b<this.m.length;){if(this.m[b]!==a.m[b])return o;++b}return k};function Ma(){this.children={};this.pc=0;this.value=l}function Na(a,b,c){this.Ca=a?a:"";this.Bb=b?b:l;this.z=c?c:new Ma}function L(a,b){for(var c=b instanceof K?b:new K(b),d=a,e;(e=F(c))!==l;)d=new Na(e,d,ua(d.z.children,e)||new Ma),c=Ka(c);return d}s=Na.prototype;s.k=function(){return this.z.value};function M(a,b){z("undefined"!==typeof b);a.z.value=b;Oa(a)}s.nb=function(){return 0<this.z.pc};s.f=function(){return this.k()===l&&!this.nb()};
s.w=function(a){for(var b in this.z.children)a(new Na(b,this,this.z.children[b]))};function Pa(a,b,c,d){c&&!d&&b(a);a.w(function(a){Pa(a,b,k,d)});c&&d&&b(a)}function Qa(a,b,c){for(a=c?a:a.parent();a!==l;){if(b(a))return k;a=a.parent()}return o}s.path=function(){return new K(this.Bb===l?this.Ca:this.Bb.path()+"/"+this.Ca)};s.name=aa("Ca");s.parent=aa("Bb");
function Oa(a){if(a.Bb!==l){var b=a.Bb,c=a.Ca,d=a.f(),e=D(b.z.children,c);d&&e?(delete b.z.children[c],b.z.pc--,Oa(b)):!d&&!e&&(b.z.children[c]=a.z,b.z.pc++,Oa(b))}};function Ra(a,b){this.Pa=a?a:Sa;this.ba=b?b:Ta}function Sa(a,b){return a<b?-1:a>b?1:0}s=Ra.prototype;s.na=function(a,b){return new Ra(this.Pa,this.ba.na(a,b,this.Pa).copy(l,l,o,l,l))};s.remove=function(a){return new Ra(this.Pa,this.ba.remove(a,this.Pa).copy(l,l,o,l,l))};s.get=function(a){for(var b,c=this.ba;!c.f();){b=this.Pa(a,c.key);if(0===b)return c.value;0>b?c=c.left:0<b&&(c=c.right)}return l};
function Ua(a,b){for(var c,d=a.ba,e=l;!d.f();){c=a.Pa(b,d.key);if(0===c){if(d.left.f())return e?e.key:l;for(d=d.left;!d.right.f();)d=d.right;return d.key}0>c?d=d.left:0<c&&(e=d,d=d.right)}g(Error("Attempted to find predecessor key for a nonexistent key.  What gives?"))}s.f=function(){return this.ba.f()};s.count=function(){return this.ba.count()};s.tb=function(){return this.ba.tb()};s.Wa=function(){return this.ba.Wa()};s.Aa=function(a){return this.ba.Aa(a)};s.Ma=function(a){return this.ba.Ma(a)};
s.Va=function(a){return new Va(this.ba,a)};function Va(a,b){this.jd=b;for(this.Rb=[];!a.f();)this.Rb.push(a),a=a.left}function Wa(a){if(0===a.Rb.length)return l;var b=a.Rb.pop(),c;c=a.jd?a.jd(b.key,b.value):{key:b.key,value:b.value};for(b=b.right;!b.f();)a.Rb.push(b),b=b.left;return c}function Xa(a,b,c,d,e){this.key=a;this.value=b;this.color=c!=l?c:k;this.left=d!=l?d:Ta;this.right=e!=l?e:Ta}s=Xa.prototype;
s.copy=function(a,b,c,d,e){return new Xa(a!=l?a:this.key,b!=l?b:this.value,c!=l?c:this.color,d!=l?d:this.left,e!=l?e:this.right)};s.count=function(){return this.left.count()+1+this.right.count()};s.f=r(o);s.Aa=function(a){return this.left.Aa(a)||a(this.key,this.value)||this.right.Aa(a)};s.Ma=function(a){return this.right.Ma(a)||a(this.key,this.value)||this.left.Ma(a)};function Ya(a){return a.left.f()?a:Ya(a.left)}s.tb=function(){return Ya(this).key};
s.Wa=function(){return this.right.f()?this.key:this.right.Wa()};s.na=function(a,b,c){var d,e;e=this;d=c(a,e.key);e=0>d?e.copy(l,l,l,e.left.na(a,b,c),l):0===d?e.copy(l,b,l,l,l):e.copy(l,l,l,l,e.right.na(a,b,c));return Za(e)};function bb(a){if(a.left.f())return Ta;!a.left.O()&&!a.left.left.O()&&(a=cb(a));a=a.copy(l,l,l,bb(a.left),l);return Za(a)}
s.remove=function(a,b){var c,d;c=this;if(0>b(a,c.key))!c.left.f()&&(!c.left.O()&&!c.left.left.O())&&(c=cb(c)),c=c.copy(l,l,l,c.left.remove(a,b),l);else{c.left.O()&&(c=db(c));!c.right.f()&&(!c.right.O()&&!c.right.left.O())&&(c=eb(c),c.left.left.O()&&(c=db(c),c=eb(c)));if(0===b(a,c.key)){if(c.right.f())return Ta;d=Ya(c.right);c=c.copy(d.key,d.value,l,l,bb(c.right))}c=c.copy(l,l,l,l,c.right.remove(a,b))}return Za(c)};s.O=aa("color");
function Za(a){a.right.O()&&!a.left.O()&&(a=fb(a));a.left.O()&&a.left.left.O()&&(a=db(a));a.left.O()&&a.right.O()&&(a=eb(a));return a}function cb(a){a=eb(a);a.right.left.O()&&(a=a.copy(l,l,l,l,db(a.right)),a=fb(a),a=eb(a));return a}function fb(a){var b;b=a.copy(l,l,k,l,a.right.left);return a.right.copy(l,l,a.color,b,l)}function db(a){var b;b=a.copy(l,l,k,a.left.right,l);return a.left.copy(l,l,a.color,l,b)}
function eb(a){var b,c;b=a.left.copy(l,l,!a.left.color,l,l);c=a.right.copy(l,l,!a.right.color,l,l);return a.copy(l,l,!a.color,b,c)}function gb(){}s=gb.prototype;s.copy=function(){return this};s.na=function(a,b){return new Xa(a,b,j,j,j)};s.remove=function(){return this};s.count=r(0);s.f=r(k);s.Aa=r(o);s.Ma=r(o);s.tb=r(l);s.Wa=r(l);s.O=r(o);var Ta=new gb;var hb=Array.prototype,ib=hb.forEach?function(a,b,c){hb.forEach.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=v(a)?a.split(""):a,f=0;f<d;f++)f in e&&b.call(c,e[f],f,a)},jb=hb.map?function(a,b,c){return hb.map.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=Array(d),f=v(a)?a.split(""):a,h=0;h<d;h++)h in f&&(e[h]=b.call(c,f[h],h,a));return e};function kb(){};function lb(){this.B=[];this.oc=[];this.rd=[];this.Xb=[];this.Xb[0]=128;for(var a=1;64>a;++a)this.Xb[a]=0;this.reset()}ka(lb,kb);lb.prototype.reset=function(){this.B[0]=1732584193;this.B[1]=4023233417;this.B[2]=2562383102;this.B[3]=271733878;this.B[4]=3285377520;this.Sc=this.ob=0};
function mb(a,b){var c;c||(c=0);for(var d=a.rd,e=c;e<c+64;e+=4)d[e/4]=b[e]<<24|b[e+1]<<16|b[e+2]<<8|b[e+3];for(e=16;80>e;e++){var f=d[e-3]^d[e-8]^d[e-14]^d[e-16];d[e]=(f<<1|f>>>31)&4294967295}c=a.B[0];for(var h=a.B[1],i=a.B[2],m=a.B[3],n=a.B[4],p,e=0;80>e;e++)40>e?20>e?(f=m^h&(i^m),p=1518500249):(f=h^i^m,p=1859775393):60>e?(f=h&i|m&(h|i),p=2400959708):(f=h^i^m,p=3395469782),f=(c<<5|c>>>27)+f+n+p+d[e]&4294967295,n=m,m=i,i=(h<<30|h>>>2)&4294967295,h=c,c=f;a.B[0]=a.B[0]+c&4294967295;a.B[1]=a.B[1]+h&
4294967295;a.B[2]=a.B[2]+i&4294967295;a.B[3]=a.B[3]+m&4294967295;a.B[4]=a.B[4]+n&4294967295}lb.prototype.update=function(a,b){u(b)||(b=a.length);var c=this.oc,d=this.ob,e=0;if(v(a))for(;e<b;)c[d++]=a.charCodeAt(e++),64==d&&(mb(this,c),d=0);else for(;e<b;)c[d++]=a[e++],64==d&&(mb(this,c),d=0);this.ob=d;this.Sc+=b};function nb(){this.Oa={};this.length=0}nb.prototype.setItem=function(a,b){D(this.Oa,a)||(this.length+=1);this.Oa[a]=b};nb.prototype.getItem=function(a){return D(this.Oa,a)?this.Oa[a]:l};nb.prototype.removeItem=function(a){D(this.Oa,a)&&(this.length-=1,delete this.Oa[a])};var ob=l;try{"undefined"!==typeof sessionStorage&&(sessionStorage.setItem("firebase-sentinel","cache"),sessionStorage.removeItem("firebase-sentinel"),ob=sessionStorage)}catch(pb){}ob=ob||new nb;function qb(a,b,c,d){this.host=a.toLowerCase();this.domain=this.host.substr(this.host.indexOf(".")+1);this.ec=b;this.ub=c;this.ea=d||ob.getItem(a)||this.host}function rb(a,b){b!==a.ea&&(a.ea=b,"s-"===a.ea.substr(0,2)&&ob.setItem(a.host,a.ea))}qb.prototype.toString=function(){return(this.ec?"https://":"http://")+this.host};var sb,tb,ub,vb;function wb(){return ba.navigator?ba.navigator.userAgent:l}vb=ub=tb=sb=o;var xb;if(xb=wb()){var yb=ba.navigator;sb=0==xb.indexOf("Opera");tb=!sb&&-1!=xb.indexOf("MSIE");ub=!sb&&-1!=xb.indexOf("WebKit");vb=!sb&&!ub&&"Gecko"==yb.product}var zb=tb,Ab=vb,Bb=ub;var Cb;if(sb&&ba.opera){var Db=ba.opera.version;"function"==typeof Db&&Db()}else Ab?Cb=/rv\:([^\);]+)(\)|;)/:zb?Cb=/MSIE\s+([^\);]+)(\)|;)/:Bb&&(Cb=/WebKit\/(\S+)/),Cb&&Cb.exec(wb());var Eb=l,Fb=l;
function Gb(a,b){fa(a)||g(Error("encodeByteArray takes an array as a parameter"));if(!Eb){Eb={};Fb={};for(var c=0;65>c;c++)Eb[c]="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(c),Fb[c]="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.".charAt(c)}for(var c=b?Fb:Eb,d=[],e=0;e<a.length;e+=3){var f=a[e],h=e+1<a.length,i=h?a[e+1]:0,m=e+2<a.length,n=m?a[e+2]:0,p=f>>2,f=(f&3)<<4|i>>4,i=(i&15)<<2|n>>6,n=n&63;m||(n=64,h||(i=64));d.push(c[p],c[f],c[i],c[n])}return d.join("")}
;var Hb,Ib=1;Hb=function(){return Ib++};function z(a,b){a||g(Error("Firebase INTERNAL ASSERT FAILED:"+b))}function Jb(a){var b=ra(a),a=new lb;a.update(b);var b=[],c=8*a.Sc;56>a.ob?a.update(a.Xb,56-a.ob):a.update(a.Xb,64-(a.ob-56));for(var d=63;56<=d;d--)a.oc[d]=c&255,c/=256;mb(a,a.oc);for(d=c=0;5>d;d++)for(var e=24;0<=e;e-=8)b[c++]=a.B[d]>>e&255;return Gb(b)}
function Kb(){for(var a="",b=0;b<arguments.length;b++)a=fa(arguments[b])?a+Kb.apply(l,arguments[b]):"object"===typeof arguments[b]?a+y(arguments[b]):a+arguments[b],a+=" ";return a}var Lb=l,Mb=k;function Nb(){Mb===k&&(Mb=o,Lb===l&&"true"===ob.getItem("logging_enabled")&&Ob(k));if(Lb){var a=Kb.apply(l,arguments);Lb(a)}}function Pb(a){return function(){Nb(a,arguments)}}
function Qb(){if("undefined"!==typeof console){var a="FIREBASE INTERNAL ERROR: "+Kb.apply(l,arguments);"undefined"!==typeof console.error?console.error(a):console.log(a)}}function Rb(){var a=Kb.apply(l,arguments);g(Error("FIREBASE FATAL ERROR: "+a))}function N(){if("undefined"!==typeof console){var a="FIREBASE WARNING: "+Kb.apply(l,arguments);"undefined"!==typeof console.warn?console.warn(a):console.log(a)}}
function Ba(a){return ga(a)&&(a!=a||a==Number.POSITIVE_INFINITY||a==Number.NEGATIVE_INFINITY)}function Sb(a,b){return a!==b?a===l?-1:b===l?1:typeof a!==typeof b?"number"===typeof a?-1:1:a>b?1:-1:0}function Tb(a,b){if(a===b)return 0;var c=Ub(a),d=Ub(b);return c!==l?d!==l?c-d:-1:d!==l?1:a<b?-1:1}function Vb(a,b){if(b&&a in b)return b[a];g(Error("Missing required key ("+a+") in object: "+y(b)))}
function Ja(a){if("object"!==typeof a||a===l)return y(a);var b=[],c;for(c in a)b.push(c);b.sort();c="{";for(var d=0;d<b.length;d++)0!==d&&(c+=","),c+=y(b[d]),c+=":",c+=Ja(a[b[d]]);return c+"}"}function Wb(a,b){if(a.length<=b)return[a];for(var c=[],d=0;d<a.length;d+=b)d+b>a?c.push(a.substring(d,a.length)):c.push(a.substring(d,d+b));return c}function Xb(a,b){if("array"==ea(a))for(var c=0;c<a.length;++c)b(c,a[c]);else Yb(a,b)}
function Zb(a){z(!Ba(a));var b,c,d,e;0===a?(d=c=0,b=-Infinity===1/a?1:0):(b=0>a,a=Math.abs(a),a>=Math.pow(2,-1022)?(d=Math.min(Math.floor(Math.log(a)/Math.LN2),1023),c=d+1023,d=Math.round(a*Math.pow(2,52-d)-Math.pow(2,52))):(c=0,d=Math.round(a/Math.pow(2,-1074))));e=[];for(a=52;a;a-=1)e.push(d%2?1:0),d=Math.floor(d/2);for(a=11;a;a-=1)e.push(c%2?1:0),c=Math.floor(c/2);e.push(b?1:0);e.reverse();b=e.join("");c="";for(a=0;64>a;a+=8)d=parseInt(b.substr(a,8),2).toString(16),1===d.length&&(d="0"+d),c+=d;
return c.toLowerCase()}var $b=/^-?\d{1,10}$/;function Ub(a){return $b.test(a)&&(a=Number(a),-2147483648<=a&&2147483647>=a)?a:l}function ac(a){try{a()}catch(b){setTimeout(function(){g(b)})}};function bc(a,b){this.D=a;z(this.D!==l,"LeafNode shouldn't be created with null value.");this.Za="undefined"!==typeof b?b:l}s=bc.prototype;s.N=r(k);s.j=aa("Za");s.Ea=function(a){return new bc(this.D,a)};s.M=function(){return P};s.Q=function(a){return F(a)===l?this:P};s.da=r(l);s.G=function(a,b){return(new Q).G(a,b).Ea(this.Za)};s.xa=function(a,b){var c=F(a);return c===l?b:this.G(c,P.xa(Ka(a),b))};s.f=r(o);s.Sb=r(0);s.V=function(a){return a&&this.j()!==l?{".value":this.k(),".priority":this.j()}:this.k()};
s.hash=function(){var a="";this.j()!==l&&(a+="priority:"+cc(this.j())+":");var b=typeof this.D,a=a+(b+":"),a="number"===b?a+Zb(this.D):a+this.D;return Jb(a)};s.k=aa("D");s.toString=function(){return"string"===typeof this.D?'"'+this.D+'"':this.D};function dc(a,b){return Sb(a.ha,b.ha)||Tb(a.name,b.name)}function ec(a,b){return Tb(a.name,b.name)}function fc(a,b){return Tb(a,b)};function Q(a,b){this.o=a||new Ra(fc);this.Za="undefined"!==typeof b?b:l}s=Q.prototype;s.N=r(o);s.j=aa("Za");s.Ea=function(a){return new Q(this.o,a)};s.G=function(a,b){var c=this.o.remove(a);b&&b.f()&&(b=l);b!==l&&(c=c.na(a,b));return b&&b.j()!==l?new gc(c,l,this.Za):new Q(c,this.Za)};s.xa=function(a,b){var c=F(a);if(c===l)return b;var d=this.M(c).xa(Ka(a),b);return this.G(c,d)};s.f=function(){return this.o.f()};s.Sb=function(){return this.o.count()};var hc=/^\d+$/;s=Q.prototype;
s.V=function(a){if(this.f())return l;var b={},c=0,d=0,e=k;this.w(function(f,h){b[f]=h.V(a);c++;e&&hc.test(f)?d=Math.max(d,Number(f)):e=o});if(!a&&e&&d<2*c){var f=[],h;for(h in b)f[h]=b[h];return f}a&&this.j()!==l&&(b[".priority"]=this.j());return b};s.hash=function(){var a="";this.j()!==l&&(a+="priority:"+cc(this.j())+":");this.w(function(b,c){var d=c.hash();""!==d&&(a+=":"+b+":"+d)});return""===a?"":Jb(a)};s.M=function(a){a=this.o.get(a);return a===l?P:a};
s.Q=function(a){var b=F(a);return b===l?this:this.M(b).Q(Ka(a))};s.da=function(a){return Ua(this.o,a)};s.$c=function(){return this.o.tb()};s.ad=function(){return this.o.Wa()};s.w=function(a){return this.o.Aa(a)};s.vc=function(a){return this.o.Ma(a)};s.Va=function(){return this.o.Va()};s.toString=function(){var a="{",b=k;this.w(function(c,d){b?b=o:a+=", ";a+='"'+c+'" : '+d.toString()});return a+="}"};var P=new Q;function gc(a,b,c){Q.call(this,a,c);b===l&&(b=new Ra(dc),a.Aa(function(a,c){b=b.na({name:a,ha:c.j()},c)}));this.ta=b}ka(gc,Q);s=gc.prototype;s.G=function(a,b){var c=this.M(a),d=this.o,e=this.ta;c!==l&&(d=d.remove(a),e=e.remove({name:a,ha:c.j()}));b&&b.f()&&(b=l);b!==l&&(d=d.na(a,b),e=e.na({name:a,ha:b.j()},b));return new gc(d,e,this.j())};s.da=function(a,b){var c=Ua(this.ta,{name:a,ha:b.j()});return c?c.name:l};s.w=function(a){return this.ta.Aa(function(b,c){return a(b.name,c)})};
s.vc=function(a){return this.ta.Ma(function(b,c){return a(b.name,c)})};s.Va=function(){return this.ta.Va(function(a,b){return{key:a.name,value:b}})};s.$c=function(){return this.ta.f()?l:this.ta.tb().name};s.ad=function(){return this.ta.f()?l:this.ta.Wa().name};function R(a,b){if(a===l)return P;var c=l;"object"===typeof a&&".priority"in a?c=a[".priority"]:"undefined"!==typeof b&&(c=b);z(c===l||"string"===typeof c||"number"===typeof c||"object"===typeof c&&".sv"in c);"object"===typeof a&&(".value"in a&&a[".value"]!==l)&&(a=a[".value"]);if("object"!==typeof a||".sv"in a)return new bc(a,c);if(a instanceof Array){var d=P;Yb(a,function(b,c){if(D(a,c)&&"."!==c.substring(0,1)){var e=R(b);if(e.N()||!e.f())d=d.G(c,e)}});return d.Ea(c)}var e=[],f={},h=o;Xb(a,function(b,
c){if("string"!==typeof c||"."!==c.substring(0,1)){var d=R(a[c]);d.f()||(h=h||d.j()!==l,e.push({name:c,ha:d.j()}),f[c]=d)}});var i=ic(e,f,o);if(h){var m=ic(e,f,k);return new gc(i,m,c)}return new Q(i,c)}var jc=Math.log(2);function kc(a){this.count=parseInt(Math.log(a+1)/jc);this.Xc=this.count-1;this.td=a+1&parseInt(Array(this.count+1).join("1"),2)}
function ic(a,b,c){function d(d,f){var h=n-d,p=n;n-=d;var q=a[h].name,h=new Xa(c?a[h]:q,b[q],f,l,e(h+1,p));i?i.left=h:m=h;i=h}function e(d,f){var h=f-d;if(0==h)return l;if(1==h){var h=a[d].name,i=c?a[d]:h;return new Xa(i,b[h],o,l,l)}var i=parseInt(h/2)+d,m=e(d,i),n=e(i+1,f),h=a[i].name,i=c?a[i]:h;return new Xa(i,b[h],o,m,n)}var f=c?dc:ec;a.sort(f);var h,f=new kc(a.length),i=l,m=l,n=a.length;for(h=0;h<f.count;++h){var p=!(f.td&1<<f.Xc);f.Xc--;var q=Math.pow(2,f.count-(h+1));p?d(q,o):(d(q,o),d(q,k))}h=
m;f=c?dc:fc;return h!==l?new Ra(f,h):new Ra(f)}function cc(a){return"number"===typeof a?"number:"+Zb(a):"string:"+a};function S(a,b){this.z=a;this.bc=b}S.prototype.V=function(){A("Firebase.DataSnapshot.val",0,0,arguments.length);return this.z.V()};S.prototype.val=S.prototype.V;S.prototype.xd=function(){A("Firebase.DataSnapshot.exportVal",0,0,arguments.length);return this.z.V(k)};S.prototype.exportVal=S.prototype.xd;S.prototype.F=function(a){A("Firebase.DataSnapshot.child",0,1,arguments.length);ga(a)&&(a=String(a));Ga("Firebase.DataSnapshot.child",a);var b=new K(a),c=this.bc.F(b);return new S(this.z.Q(b),c)};
S.prototype.child=S.prototype.F;S.prototype.zc=function(a){A("Firebase.DataSnapshot.hasChild",1,1,arguments.length);Ga("Firebase.DataSnapshot.hasChild",a);var b=new K(a);return!this.z.Q(b).f()};S.prototype.hasChild=S.prototype.zc;S.prototype.j=function(){A("Firebase.DataSnapshot.getPriority",0,0,arguments.length);return this.z.j()};S.prototype.getPriority=S.prototype.j;
S.prototype.forEach=function(a){A("Firebase.DataSnapshot.forEach",1,1,arguments.length);C("Firebase.DataSnapshot.forEach",1,a,o);if(this.z.N())return o;var b=this;return this.z.w(function(c,d){return a(new S(d,b.bc.F(c)))})};S.prototype.forEach=S.prototype.forEach;S.prototype.nb=function(){A("Firebase.DataSnapshot.hasChildren",0,0,arguments.length);return this.z.N()?o:!this.z.f()};S.prototype.hasChildren=S.prototype.nb;
S.prototype.name=function(){A("Firebase.DataSnapshot.name",0,0,arguments.length);return this.bc.name()};S.prototype.name=S.prototype.name;S.prototype.Sb=function(){A("Firebase.DataSnapshot.numChildren",0,0,arguments.length);return this.z.Sb()};S.prototype.numChildren=S.prototype.Sb;S.prototype.Kc=function(){A("Firebase.DataSnapshot.ref",0,0,arguments.length);return this.bc};S.prototype.ref=S.prototype.Kc;function mc(a){z("array"==ea(a)&&0<a.length);this.sd=a;this.sb={}}mc.prototype.xc=function(){};mc.prototype.Uc=function(a){for(var b=this.sb[a]||[],c=0;c<b.length;c++)b[c].W.apply(b[c].T,Array.prototype.slice.call(arguments,1))};mc.prototype.Ya=function(a,b,c){nc(this,a);this.sb[a]=this.sb[a]||[];this.sb[a].push({W:b,T:c});(a=this.xc(a))&&b.apply(c,a)};mc.prototype.vb=function(a,b,c){nc(this,a);for(var a=this.sb[a]||[],d=0;d<a.length;d++)if(a[d].W===b&&(!c||c===a[d].T)){a.splice(d,1);break}};
function nc(a,b){var c=a.sd,d;a:{d=function(a){return a===b};for(var e=c.length,f=v(c)?c.split(""):c,h=0;h<e;h++)if(h in f&&d.call(j,f[h])){d=h;break a}d=-1}z(0>d?l:v(c)?c.charAt(d):c[d],"Unknown event: "+b)};function oc(){mc.call(this,["visible"]);var a,b;"undefined"!==typeof document&&"undefined"!==typeof document.addEventListener&&("undefined"!==typeof document.hidden?(b="visibilitychange",a="hidden"):"undefined"!==typeof document.mozHidden?(b="mozvisibilitychange",a="mozHidden"):"undefined"!==typeof document.msHidden?(b="msvisibilitychange",a="msHidden"):"undefined"!==typeof document.webkitHidden&&(b="webkitvisibilitychange",a="webkitHidden"));this.hb=k;if(b){var c=this;document.addEventListener(b,
function(){var b=!document[a];if(b!==c.hb){c.hb=b;c.Uc("visible",b)}},o)}}ka(oc,mc);da(oc);oc.prototype.xc=function(a){z("visible"===a);return[this.hb]};function pc(a){this.Gc=a;this.Zb=[];this.Ra=0;this.qc=-1;this.Ja=l};function Yb(a,b){for(var c in a)b.call(j,a[c],c,a)}function qc(a){var b={},c;for(c in a)b[c]=a[c];return b};function rc(){this.jb={}}function sc(a,b,c){u(c)||(c=1);D(a.jb,b)||(a.jb[b]=0);a.jb[b]+=c}rc.prototype.get=function(){return qc(this.jb)};function tc(a){this.ud=a;this.Qb=l}tc.prototype.get=function(){var a=this.ud.get(),b=qc(a);if(this.Qb)for(var c in this.Qb)b[c]-=this.Qb[c];this.Qb=a;return b};function uc(a,b){this.Pc={};this.hc=new tc(a);this.u=b;setTimeout(w(this.gd,this),10+6E4*Math.random())}uc.prototype.gd=function(){var a=this.hc.get(),b={},c=o,d;for(d in a)0<a[d]&&D(this.Pc,d)&&(b[d]=a[d],c=k);c&&(a=this.u,a.P&&(b={c:b},a.e("reportStats",b),a.Da("s",b)));setTimeout(w(this.gd,this),6E5*Math.random())};var vc={},wc={};function xc(a){a=a.toString();vc[a]||(vc[a]=new rc);return vc[a]};var yc=l;"undefined"!==typeof MozWebSocket?yc=MozWebSocket:"undefined"!==typeof WebSocket&&(yc=WebSocket);function T(a,b,c){this.rc=a;this.e=Pb(this.rc);this.frames=this.qb=l;this.Rc=0;this.$=xc(b);this.Qa=(b.ec?"wss://":"ws://")+b.ea+"/.ws?v=5";b.host!==b.ea&&(this.Qa=this.Qa+"&ns="+b.ub);c&&(this.Qa=this.Qa+"&s="+c)}var zc;
T.prototype.open=function(a,b){this.ga=b;this.Fd=a;this.e("websocket connecting to "+this.Qa);this.Y=new yc(this.Qa);this.kb=o;var c=this;this.Y.onopen=function(){c.e("Websocket connected.");c.kb=k};this.Y.onclose=function(){c.e("Websocket connection was disconnected.");c.Y=l;c.Ka()};this.Y.onmessage=function(a){if(c.Y!==l)if(a=a.data,sc(c.$,"bytes_received",a.length),Ac(c),c.frames!==l)Bc(c,a);else{a:{z(c.frames===l,"We already have a frame buffer");if(6>=a.length){var b=Number(a);if(!isNaN(b)){c.Rc=
b;c.frames=[];a=l;break a}}c.Rc=1;c.frames=[]}a!==l&&Bc(c,a)}};this.Y.onerror=function(a){c.e("WebSocket error.  Closing connection.");a.data&&c.e(a.data);c.Ka()}};T.prototype.start=function(){};T.isAvailable=function(){var a=o;if("undefined"!==typeof navigator&&navigator.userAgent){var b=navigator.userAgent.match(/Android ([0-9]{0,}\.[0-9]{0,})/);b&&1<b.length&&4.4>parseFloat(b[1])&&(a=k)}return!a&&yc!==l&&!zc};
function Bc(a,b){a.frames.push(b);if(a.frames.length==a.Rc){var c=a.frames.join("");a.frames=l;c="undefined"!==typeof JSON&&u(JSON.parse)?JSON.parse(c):la(c);a.Fd(c)}}T.prototype.send=function(a){Ac(this);a=y(a);sc(this.$,"bytes_sent",a.length);a=Wb(a,16384);1<a.length&&this.Y.send(String(a.length));for(var b=0;b<a.length;b++)this.Y.send(a[b])};T.prototype.Jb=function(){this.Ia=k;this.qb&&(clearInterval(this.qb),this.qb=l);this.Y&&(this.Y.close(),this.Y=l)};
T.prototype.Ka=function(){this.Ia||(this.e("WebSocket is closing itself"),this.Jb(),this.ga&&(this.ga(this.kb),this.ga=l))};T.prototype.close=function(){this.Ia||(this.e("WebSocket is being closed"),this.Jb())};function Ac(a){clearInterval(a.qb);a.qb=setInterval(function(){a.Y.send("0");Ac(a)},45E3)};function Cc(){this.set={}}s=Cc.prototype;s.add=function(a,b){this.set[a]=b!==l?b:k};s.contains=function(a){return D(this.set,a)};s.get=function(a){return this.contains(a)?this.set[a]:j};s.remove=function(a){delete this.set[a]};s.f=function(){var a;a:{for(a in this.set){a=o;break a}a=k}return a};s.count=function(){var a=0,b;for(b in this.set)a++;return a};function Dc(a,b){for(var c in a.set)D(a.set,c)&&b(c,a.set[c])}s.keys=function(){var a=[],b;for(b in this.set)D(this.set,b)&&a.push(b);return a};var Ec="pLPCommand",Fc="pRTLPCB";function Gc(a,b,c){this.rc=a;this.e=Pb(a);this.Ud=b;this.$=xc(b);this.gc=c;this.kb=o;this.Mb=function(a){b.host!==b.ea&&(a.ns=b.ub);var c=[],f;for(f in a)a.hasOwnProperty(f)&&c.push(f+"="+a[f]);return(b.ec?"https://":"http://")+b.ea+"/.lp?"+c.join("&")}}var Hc,Ic;
Gc.prototype.open=function(a,b){function c(){if(!d.Ia){d.ja=new Jc(function(a,b,c,e,f){sc(d.$,"bytes_received",y(arguments).length);if(d.ja)if(d.Fa&&(clearTimeout(d.Fa),d.Fa=l),d.kb=k,"start"==a)d.id=b,d.fd=c;else if("close"===a)if(b){d.ja.fc=o;var h=d.cd;h.qc=b;h.Ja=function(){d.Ka()};h.qc<h.Ra&&(h.Ja(),h.Ja=l)}else d.Ka();else g(Error("Unrecognized command received: "+a))},function(a,b){sc(d.$,"bytes_received",y(arguments).length);var c=d.cd;for(c.Zb[a]=b;c.Zb[c.Ra];){var e=c.Zb[c.Ra];delete c.Zb[c.Ra];
for(var f=0;f<e.length;++f)if(e[f]){var h=c;ac(function(){h.Gc(e[f])})}if(c.Ra===c.qc){c.Ja&&(clearTimeout(c.Ja),c.Ja(),c.Ja=l);break}c.Ra++}},function(){d.Ka()},d.Mb);var a={start:"t"};a.ser=Math.floor(1E8*Math.random());d.ja.jc&&(a.cb=d.ja.jc);a.v="5";d.gc&&(a.s=d.gc);a=d.Mb(a);d.e("Connecting via long-poll to "+a);Kc(d.ja,a,function(){})}}this.Wc=0;this.R=b;this.cd=new pc(a);this.Ia=o;var d=this;this.Fa=setTimeout(function(){d.e("Timed out trying to connect.");d.Ka();d.Fa=l},3E4);if("complete"===
document.readyState)c();else{var e=o,f=function(){document.body?e||(e=k,c()):setTimeout(f,10)};document.addEventListener?(document.addEventListener("DOMContentLoaded",f,o),window.addEventListener("load",f,o)):document.attachEvent&&(document.attachEvent("onreadystatechange",function(){"complete"===document.readyState&&f()},o),window.attachEvent("onload",f,o))}};
Gc.prototype.start=function(){var a=this.ja,b=this.fd;a.Dd=this.id;a.Ed=b;for(a.mc=k;Lc(a););a=this.id;b=this.fd;this.Xa=document.createElement("iframe");var c={dframe:"t"};c.id=a;c.pw=b;a=this.Mb(c);this.Xa.src=a;this.Xa.style.display="none";document.body.appendChild(this.Xa)};Gc.isAvailable=function(){return!Ic&&!("object"===typeof window&&window.chrome&&window.chrome.extension&&!/^chrome/.test(window.location.href))&&!("object"===typeof Windows&&"object"===typeof Windows.Td)&&(Hc||k)};
Gc.prototype.Jb=function(){this.Ia=k;this.ja&&(this.ja.close(),this.ja=l);this.Xa&&(document.body.removeChild(this.Xa),this.Xa=l);this.Fa&&(clearTimeout(this.Fa),this.Fa=l)};Gc.prototype.Ka=function(){this.Ia||(this.e("Longpoll is closing itself"),this.Jb(),this.R&&(this.R(this.kb),this.R=l))};Gc.prototype.close=function(){this.Ia||(this.e("Longpoll is being closed."),this.Jb())};
Gc.prototype.send=function(a){a=y(a);sc(this.$,"bytes_sent",a.length);for(var a=ra(a),a=Gb(a,k),a=Wb(a,1840),b=0;b<a.length;b++){var c=this.ja;c.Db.push({Nd:this.Wc,Sd:a.length,Yc:a[b]});c.mc&&Lc(c);this.Wc++}};
function Jc(a,b,c,d){this.Mb=d;this.ga=c;this.Ic=new Cc;this.Db=[];this.sc=Math.floor(1E8*Math.random());this.fc=k;this.jc=Hb();window[Ec+this.jc]=a;window[Fc+this.jc]=b;a=document.createElement("iframe");a.style.display="none";if(document.body){document.body.appendChild(a);try{a.contentWindow.document||Nb("No IE domain setting required")}catch(e){a.src="javascript:void((function(){document.open();document.domain='"+document.domain+"';document.close();})())"}}else g("Document body has not initialized. Wait to initialize Firebase until after the document is ready.");
a.contentDocument?a.ya=a.contentDocument:a.contentWindow?a.ya=a.contentWindow.document:a.document&&(a.ya=a.document);this.X=a;a="";this.X.src&&"javascript:"===this.X.src.substr(0,11)&&(a='<script>document.domain="'+document.domain+'";<\/script>');a="<html><body>"+a+"</body></html>";try{this.X.ya.open(),this.X.ya.write(a),this.X.ya.close()}catch(f){Nb("frame writing exception"),f.stack&&Nb(f.stack),Nb(f)}}
Jc.prototype.close=function(){this.mc=o;if(this.X){this.X.ya.body.innerHTML="";var a=this;setTimeout(function(){a.X!==l&&(document.body.removeChild(a.X),a.X=l)},0)}var b=this.ga;b&&(this.ga=l,b())};
function Lc(a){if(a.mc&&a.fc&&a.Ic.count()<(0<a.Db.length?2:1)){a.sc++;var b={};b.id=a.Dd;b.pw=a.Ed;b.ser=a.sc;for(var b=a.Mb(b),c="",d=0;0<a.Db.length;)if(1870>=a.Db[0].Yc.length+30+c.length){var e=a.Db.shift(),c=c+"&seg"+d+"="+e.Nd+"&ts"+d+"="+e.Sd+"&d"+d+"="+e.Yc;d++}else break;var b=b+c,f=a.sc;a.Ic.add(f);var h=function(){a.Ic.remove(f);Lc(a)},i=setTimeout(h,25E3);Kc(a,b,function(){clearTimeout(i);h()});return k}return o}
function Kc(a,b,c){setTimeout(function(){try{if(a.fc){var d=a.X.ya.createElement("script");d.type="text/javascript";d.async=k;d.src=b;d.onload=d.onreadystatechange=function(){var a=d.readyState;if(!a||"loaded"===a||"complete"===a)d.onload=d.onreadystatechange=l,d.parentNode&&d.parentNode.removeChild(d),c()};d.onerror=function(){Nb("Long-poll script failed to load: "+b);a.fc=o;a.close()};a.X.ya.body.appendChild(d)}}catch(e){}},1)};function Mc(){var a=[];T&&T.isAvailable()?a.push(T):Xb(Nc,function(b,c){c&&c.isAvailable()&&a.push(c)});this.ic=a}var Nc=[Gc,{isAvailable:r(o)},T];function Oc(a,b,c,d,e,f){this.id=a;this.e=Pb("c:"+this.id+":");this.Gc=c;this.yb=d;this.R=e;this.Fc=f;this.K=b;this.Yb=[];this.Vc=0;this.Tc=new Mc;this.va=0;this.e("Connection created");Pc(this)}function Pc(a){var b;var c=a.Tc;0<c.ic.length?b=c.ic[0]:g(Error("No transports available"));a.L=new b("c:"+a.id+":"+a.Vc++,a.K);var d=Qc(a,a.L),e=Rc(a,a.L);a.Kb=a.L;a.Ib=a.L;a.A=l;setTimeout(function(){a.L&&a.L.open(d,e)},0)}
function Rc(a,b){return function(c){b===a.L?(a.L=l,!c&&0===a.va?(a.e("Realtime connection failed."),"s-"===a.K.ea.substr(0,2)&&(ob.removeItem(a.K.ub),a.K.ea=a.K.host)):1===a.va&&a.e("Realtime connection lost."),a.close()):b===a.A?(c=a.A,a.A=l,(a.Kb===c||a.Ib===c)&&a.close()):a.e("closing an old connection")}}
function Qc(a,b){return function(c){if(2!=a.va)if(b===a.Ib){var d=Vb("t",c),c=Vb("d",c);if("c"==d){if(d=Vb("t",c),"d"in c)if(c=c.d,"h"===d){var d=c.ts,e=c.v,f=c.h;a.gc=c.s;rb(a.K,f);if(0==a.va&&(a.L.start(),c=a.L,a.e("Realtime connection established."),a.L=c,a.va=1,a.yb&&(a.yb(d),a.yb=l),"5"!==e&&N("Protocol version mismatch detected"),c=1<a.Tc.ic.length?a.Tc.ic[1]:l))a.A=new c("c:"+a.id+":"+a.Vc++,a.K,a.gc),a.A.open(Qc(a,a.A),Rc(a,a.A))}else if("n"===d){a.e("recvd end transmission on primary");a.Ib=
a.A;for(c=0;c<a.Yb.length;++c)a.Vb(a.Yb[c]);a.Yb=[];Sc(a)}else"s"===d?(a.e("Connection shutdown command received. Shutting down..."),a.Fc&&(a.Fc(c),a.Fc=l),a.R=l,a.close()):"r"===d?(a.e("Reset packet received.  New host: "+c),rb(a.K,c),1===a.va?a.close():(Tc(a),Pc(a))):"e"===d?Qb("Server Error: "+c):Qb("Unknown control packet command: "+d)}else"d"==d&&a.Vb(c)}else b===a.A?(d=Vb("t",c),c=Vb("d",c),"c"==d?"t"in c&&(c=c.t,"a"===c?(a.A.start(),a.e("sending client ack on secondary"),a.A.send({t:"c",d:{t:"a",
d:{}}}),a.e("Ending transmission on primary"),a.L.send({t:"c",d:{t:"n",d:{}}}),a.Kb=a.A,Sc(a)):"r"===c&&(a.e("Got a reset on secondary, closing it"),a.A.close(),(a.Kb===a.A||a.Ib===a.A)&&a.close())):"d"==d?a.Yb.push(c):g(Error("Unknown protocol layer: "+d))):a.e("message on old connection")}}Oc.prototype.ld=function(a){a={t:"d",d:a};1!==this.va&&g("Connection is not connected");this.Kb.send(a)};
function Sc(a){a.Kb===a.A&&a.Ib===a.A&&(a.e("cleaning up and promoting a connection: "+a.A.rc),a.L=a.A,a.A=l)}Oc.prototype.Vb=function(a){this.Gc(a)};Oc.prototype.close=function(){2!==this.va&&(this.e("Closing realtime connection."),this.va=2,Tc(this),this.R&&(this.R(),this.R=l))};function Tc(a){a.e("Shutting down all connections");a.L&&(a.L.close(),a.L=l);a.A&&(a.A.close(),a.A=l)};function Vc(){mc.call(this,["online"]);this.zb=k;if("undefined"!==typeof window&&"undefined"!==typeof window.addEventListener){var a=this;window.addEventListener("online",function(){a.zb||a.Uc("online",k);a.zb=k},o);window.addEventListener("offline",function(){a.zb&&a.Uc("online",o);a.zb=o},o)}}ka(Vc,mc);da(Vc);Vc.prototype.xc=function(a){z("online"===a);return[this.zb]};function Wc(a,b,c,d,e,f){this.id=Xc++;this.e=Pb("p:"+this.id+":");this.Na=k;this.fa={};this.U=[];this.Ab=0;this.xb=[];this.P=o;this.pa=1E3;this.Wb=b||ca;this.Ub=c||ca;this.wb=d||ca;this.Hc=e||ca;this.yc=f||ca;this.K=a;this.Lc=l;this.Hb={};this.Md=0;this.rb=this.Cc=l;Yc(this,0);oc.mb().Ya("visible",this.Hd,this);-1===a.host.indexOf("fblocal")&&Vc.mb().Ya("online",this.Gd,this)}var Xc=0,Zc=0;s=Wc.prototype;
s.Da=function(a,b,c){var d=++this.Md,a={r:d,a:a,b:b};this.e(y(a));z(this.P,"sendRequest_ call when we're not connected not allowed.");this.ia.ld(a);c&&(this.Hb[d]=c)};function $c(a,b,c,d,e){a.e("Listen on "+b+" for "+c);var f={p:b},d=jb(d,function(a){return Ia(a)});"{}"!==c&&(f.q=d);f.h=a.yc(b);a.Da("l",f,function(d){a.e("listen response",d);d=d.s;"ok"!==d&&ad(a,b,c);e&&e(d)})}s.ib=function(a,b,c){this.Ga={vd:a,Zc:o,W:b,Ob:c};this.e("Authenticating using credential: "+this.Ga);bd(this)};
s.Lb=function(a){delete this.Ga;this.wb(o);this.P&&this.Da("unauth",{},function(b){a(b.s)})};function bd(a){var b=a.Ga;a.P&&b&&a.Da("auth",{cred:b.vd},function(c){var d=c.s,c=c.d||"error";"ok"!==d&&a.Ga===b&&delete a.Ga;a.wb("ok"===d);b.Zc?"ok"!==d&&b.Ob&&b.Ob(d,c):(b.Zc=k,b.W&&b.W(d,c))})}function cd(a,b,c,d){b=b.toString();ad(a,b,c)&&a.P&&(a.e("Unlisten on "+b+" for "+c),b={p:b},d=jb(d,function(a){return Ia(a)}),"{}"!==c&&(b.q=d),a.Da("u",b))}
function dd(a,b,c,d){a.P?ed(a,"o",b,c,d):a.xb.push({Jc:b,action:"o",data:c,C:d})}s.Ec=function(a,b){this.P?ed(this,"oc",a,l,b):this.xb.push({Jc:a,action:"oc",data:l,C:b})};function ed(a,b,c,d,e){c={p:c,d:d};a.e("onDisconnect "+b,c);a.Da(b,c,function(a){e&&setTimeout(function(){e(a.s)},0)})}s.put=function(a,b,c,d){fd(this,"p",a,b,c,d)};function fd(a,b,c,d,e,f){c={p:c,d:d};u(f)&&(c.h=f);a.U.push({action:b,hd:c,C:e});a.Ab++;b=a.U.length-1;a.P&&gd(a,b)}
function gd(a,b){var c=a.U[b].action,d=a.U[b].hd,e=a.U[b].C;a.U[b].Jd=a.P;a.Da(c,d,function(d){a.e(c+" response",d);delete a.U[b];a.Ab--;0===a.Ab&&(a.U=[]);e&&e(d.s)})}
s.Vb=function(a){if("r"in a){this.e("from server: "+y(a));var b=a.r,c=this.Hb[b];c&&(delete this.Hb[b],c(a.b))}else"error"in a&&g("A server-side error has occurred: "+a.error),"a"in a&&(b=a.a,a=a.b,this.e("handleServerMessage",b,a),"d"===b?this.Wb(a.p,a.d):"m"===b?this.Wb(a.p,a.d,k):"c"===b?(b=a.p,a=(a=a.q)?jb(a,function(a){return Ja(a)}).join("$"):"{}",(a=ad(this,b,a))&&a.C&&a.C("permission_denied")):"ac"===b?(b=a.s,a=a.d,c=this.Ga,delete this.Ga,c&&c.Ob&&c.Ob(b,a),this.wb(o)):"sd"===b?this.Lc?this.Lc(a):
"msg"in a&&"undefined"!==typeof console&&console.log("FIREBASE: "+a.msg.replace("\n","\nFIREBASE: ")):Qb("Unrecognized action received from server: "+y(b)+"\nAre you using the latest client?"))};
s.yb=function(a){this.e("connection ready");this.P=k;this.rb=(new Date).getTime();this.Hc({serverTimeOffset:a-(new Date).getTime()});bd(this);for(var b in this.fa)for(var c in this.fa[b])a=this.fa[b][c],$c(this,b,c,a.$a,a.C);for(b=0;b<this.U.length;b++)this.U[b]&&gd(this,b);for(;this.xb.length;)b=this.xb.shift(),ed(this,b.action,b.Jc,b.data,b.C);this.Ub(k)};
function Yc(a,b){z(!a.ia,"Scheduling a connect when we're already connected/ing?");a.Ta&&clearTimeout(a.Ta);a.Ta=setTimeout(function(){a.Ta=l;if(a.Na){a.e("Making a connection attempt");a.Cc=(new Date).getTime();a.rb=l;var b=w(a.Vb,a),d=w(a.yb,a),e=w(a.dd,a),f=a.id+":"+Zc++;a.ia=new Oc(f,a.K,b,d,e,function(b){N(b+" ("+a.K.toString()+")");a.Na=o})}},b)}s.Hd=function(a){a&&(!this.hb&&3E5===this.pa)&&(this.e("Window became visible.  Reducing delay."),this.pa=1E3,this.ia||Yc(this,0));this.hb=a};
s.Gd=function(a){a?(this.e("Browser went online.  Reconnecting."),this.pa=1E3,this.Na=k,this.ia||Yc(this,0)):(this.e("Browser went offline.  Killing connection; don't reconnect."),this.Na=o,this.ia&&this.ia.close())};
s.dd=function(){this.e("data client disconnected");this.P=o;this.ia=l;for(var a=0;a<this.U.length;a++){var b=this.U[a];b&&("h"in b.hd&&b.Jd)&&(b.C&&b.C("disconnect"),delete this.U[a],this.Ab--)}0===this.Ab&&(this.U=[]);if(this.Na)this.hb?this.rb&&(3E4<(new Date).getTime()-this.rb&&(this.pa=1E3),this.rb=l):(this.e("Window isn't visible.  Delaying reconnect."),this.pa=3E5,this.Cc=(new Date).getTime()),a=Math.max(0,this.pa-((new Date).getTime()-this.Cc)),a*=Math.random(),this.e("Trying to reconnect in "+
a+"ms"),Yc(this,a),this.pa=Math.min(3E5,1.3*this.pa);else for(var c in this.Hb)delete this.Hb[c];this.Ub(o)};s.Ha=function(){this.Na=o;this.ia?this.ia.close():(this.Ta&&(clearTimeout(this.Ta),this.Ta=l),this.P&&this.dd())};s.bb=function(){this.Na=k;this.pa=1E3;this.P||Yc(this,0)};function ad(a,b,c){b=(new K(b)).toString();c||(c="{}");var d=a.fa[b][c];delete a.fa[b][c];return d};function hd(){this.o=this.D=l}function id(a,b,c){if(b.f())a.D=c,a.o=l;else if(a.D!==l)a.D=a.D.xa(b,c);else{a.o==l&&(a.o=new Cc);var d=F(b);a.o.contains(d)||a.o.add(d,new hd);a=a.o.get(d);b=Ka(b);id(a,b,c)}}function jd(a,b){if(b.f())return a.D=l,a.o=l,k;if(a.D!==l){if(a.D.N())return o;var c=a.D;a.D=l;c.w(function(b,c){id(a,new K(b),c)});return jd(a,b)}return a.o!==l?(c=F(b),b=Ka(b),a.o.contains(c)&&jd(a.o.get(c),b)&&a.o.remove(c),a.o.f()?(a.o=l,k):o):k}
function kd(a,b,c){a.D!==l?c(b,a.D):a.w(function(a,e){var f=new K(b.toString()+"/"+a);kd(e,f,c)})}hd.prototype.w=function(a){this.o!==l&&Dc(this.o,function(b,c){a(b,c)})};function ld(){this.qa=P}function U(a,b){return a.qa.Q(b)}function V(a,b,c){a.qa=a.qa.xa(b,c)}ld.prototype.toString=function(){return this.qa.toString()};function md(){this.ra=new ld;this.I=new ld;this.la=new ld;this.Cb=new Na}function nd(a,b){for(var c=U(a.ra,b),d=U(a.I,b),e=L(a.Cb,b),f=o,h=e;h!==l;){if(h.k()!==l){f=k;break}h=h.parent()}if(f)return o;c=od(c,d,e);return c!==d?(V(a.I,b,c),k):o}function od(a,b,c){if(c.f())return a;if(c.k()!==l)return b;a=a||P;c.w(function(d){var d=d.name(),e=a.M(d),f=b.M(d),h=L(c,d),e=od(e,f,h);a=a.G(d,e)});return a}
md.prototype.set=function(a,b){var c=this,d=[];ib(b,function(a){var b=a.path,a=a.oa,h=Hb();M(L(c.Cb,b),h);V(c.I,b,a);d.push({path:b,Od:h})});return d};function pd(a,b){ib(b,function(b){var d=b.Od,b=L(a.Cb,b.path),e=b.k();z(e!==l,"pendingPut should not be null.");e===d&&M(b,l)})};function qd(){this.Ua=[]}function rd(a,b){if(0!==b.length)for(var c=0;c<b.length;c++)a.Ua.push(b[c])}qd.prototype.Fb=function(){for(var a=0;a<this.Ua.length;a++)if(this.Ua[a]){var b=this.Ua[a];this.Ua[a]=l;sd(b)}this.Ua=[]};function sd(a){var b=a.W,c=a.md,d=a.Eb;ac(function(){b(c,d)})};function W(a,b,c,d){this.type=a;this.sa=b;this.aa=c;this.Eb=d};function td(a){this.J=a;this.ma=[];this.uc=new qd}function ud(a,b,c,d,e){a.ma.push({type:b,W:c,cancel:d,T:e});var d=[],f=vd(a.i);a.pb&&f.push(new W("value",a.i));for(var h=0;h<f.length;h++)if(f[h].type===b){var i=new J(a.J.n,a.J.path);f[h].aa&&(i=i.F(f[h].aa));d.push({W:e?w(c,e):c,md:new S(f[h].sa,i),Eb:f[h].Eb})}rd(a.uc,d)}td.prototype.$b=function(a,b){b=this.ac(a,b);b!=l&&wd(this,b)};
function wd(a,b){for(var c=[],d=0;d<b.length;d++){var e=b[d],f=e.type,h=new J(a.J.n,a.J.path);b[d].aa&&(h=h.F(b[d].aa));h=new S(b[d].sa,h);"value"===e.type&&!h.nb()?f+="("+h.V()+")":"value"!==e.type&&(f+=" "+h.name());Nb(a.J.n.u.id+": event:"+a.J.path+":"+a.J.La()+":"+f);for(f=0;f<a.ma.length;f++){var i=a.ma[f];b[d].type===i.type&&c.push({W:i.T?w(i.W,i.T):i.W,md:h,Eb:e.Eb})}}rd(a.uc,c)}td.prototype.Fb=function(){this.uc.Fb()};
function vd(a){var b=[];if(!a.N()){var c=l;a.w(function(a,e){b.push(new W("child_added",e,a,c));c=a})}return b}function xd(a){a.pb||(a.pb=k,wd(a,[new W("value",a.i)]))};function zd(a,b){td.call(this,a);this.i=b}ka(zd,td);zd.prototype.ac=function(a,b){this.i=a;this.pb&&b!=l&&b.push(new W("value",this.i));return b};zd.prototype.lb=function(){return{}};function Ad(a,b){this.Pb=a;this.Dc=b}
function Bd(a,b,c,d,e){var f=a.Q(c),h=b.Q(c),d=new Ad(d,e),e=Cd(d,c,f,h),h=!f.f()&&!h.f()&&f.j()!==h.j();if(e||h){f=c;for(c=e;f.parent()!==l;){var i=a.Q(f),e=b.Q(f),m=f.parent();if(!d.Pb||L(d.Pb,m).k()){var n=b.Q(m),p=[],f=f.Z<f.m.length?f.m[f.m.length-1]:l;i.f()?(i=n.da(f,e),p.push(new W("child_added",e,f,i))):e.f()?p.push(new W("child_removed",i,f)):(i=n.da(f,e),h&&p.push(new W("child_moved",e,f,i)),c&&p.push(new W("child_changed",e,f,i)));d.Dc(m,n,p)}h&&(h=o,c=k);f=m}}}
function Cd(a,b,c,d){var e,f=[];c===d?e=o:c.N()&&d.N()?e=c.k()!==d.k():c.N()?(Dd(a,b,P,d,f),e=k):d.N()?(Dd(a,b,c,P,f),e=k):e=Dd(a,b,c,d,f);e?a.Dc(b,d,f):c.j()!==d.j()&&a.Dc(b,d,l);return e}
function Dd(a,b,c,d,e){var f=o,h=!a.Pb||!L(a.Pb,b).f(),i=[],m=[],n=[],p=[],q={},t={},x,O,I,G;x=c.Va();I=Wa(x);O=d.Va();for(G=Wa(O);I!==l||G!==l;){c=I===l?1:G===l?-1:I.key===G.key?0:dc({name:I.key,ha:I.value.j()},{name:G.key,ha:G.value.j()});if(0>c)f=ua(q,I.key),u(f)?(n.push({wc:I,Qc:i[f]}),i[f]=l):(t[I.key]=m.length,m.push(I)),f=k,I=Wa(x);else{if(0<c)f=ua(t,G.key),u(f)?(n.push({wc:m[f],Qc:G}),m[f]=l):(q[G.key]=i.length,i.push(G)),f=k;else{c=b.F(G.key);if(c=Cd(a,c,I.value,G.value))p.push(G),f=k;I.value.j()!==
G.value.j()&&(n.push({wc:I,Qc:G}),f=k);I=Wa(x)}G=Wa(O)}if(!h&&f)return k}for(h=0;h<m.length;h++)if(q=m[h])c=b.F(q.key),Cd(a,c,q.value,P),e.push(new W("child_removed",q.value,q.key));for(h=0;h<i.length;h++)if(q=i[h])c=b.F(q.key),m=d.da(q.key,q.value),Cd(a,c,P,q.value),e.push(new W("child_added",q.value,q.key,m));for(h=0;h<n.length;h++)q=n[h].wc,i=n[h].Qc,c=b.F(i.key),m=d.da(i.key,i.value),e.push(new W("child_moved",i.value,i.key,m)),(c=Cd(a,c,q.value,i.value))&&p.push(i);for(h=0;h<p.length;h++)a=p[h],
m=d.da(a.key,a.value),e.push(new W("child_changed",a.value,a.key,m));return f};function Ed(){this.S=this.wa=l;this.set={}}ka(Ed,Cc);s=Ed.prototype;s.setActive=function(a){this.wa=a};function Fd(a){return a.contains("default")}function Gd(a){return a.wa!=l&&Fd(a)}s.defaultView=function(){return Fd(this)?this.get("default"):l};s.path=aa("S");s.toString=function(){return jb(this.keys(),function(a){return"default"===a?"{}":a}).join("$")};s.$a=function(){var a=[];Dc(this,function(b,c){a.push(c.J)});return a};function Hd(a,b){td.call(this,a);this.i=P;this.ac(b,vd(b))}ka(Hd,td);
Hd.prototype.ac=function(a,b){if(b===l)return b;var c=[],d=this.J;u(d.ca)&&(u(d.ua)&&d.ua!=l?c.push(function(a,b){var c=Sb(b,d.ca);return 0<c||0===c&&0<=Tb(a,d.ua)}):c.push(function(a,b){return 0<=Sb(b,d.ca)}));u(d.za)&&(u(d.Sa)?c.push(function(a,b){var c=Sb(b,d.za);return 0>c||0===c&&0>=Tb(a,d.Sa)}):c.push(function(a,b){return 0>=Sb(b,d.za)}));var e=l,f=l;if(u(this.J.Ba))if(u(this.J.ca)){if(e=Id(a,c,this.J.Ba,o)){var h=a.M(e).j();c.push(function(a,b){var c=Sb(b,h);return 0>c||0===c&&0>=Tb(a,e)})}}else if(f=
Id(a,c,this.J.Ba,k)){var i=a.M(f).j();c.push(function(a,b){var c=Sb(b,i);return 0<c||0===c&&0<=Tb(a,f)})}for(var m=[],n=[],p=[],q=[],t=0;t<b.length;t++){var x=b[t].aa,O=b[t].sa;switch(b[t].type){case "child_added":Jd(c,x,O)&&(this.i=this.i.G(x,O),n.push(b[t]));break;case "child_removed":this.i.M(x).f()||(this.i=this.i.G(x,l),m.push(b[t]));break;case "child_changed":!this.i.M(x).f()&&Jd(c,x,O)&&(this.i=this.i.G(x,O),q.push(b[t]));break;case "child_moved":var I=!this.i.M(x).f(),G=Jd(c,x,O);I?G?(this.i=
this.i.G(x,O),p.push(b[t])):(m.push(new W("child_removed",this.i.M(x),x)),this.i=this.i.G(x,l)):G&&(this.i=this.i.G(x,O),n.push(b[t]))}}var Uc=e||f;if(Uc){var yd=(t=f!==l)?this.i.$c():this.i.ad(),lc=o,$a=o,ab=this;(t?a.vc:a.w).call(a,function(a,b){!$a&&yd===l&&($a=k);if($a&&lc)return k;lc?(m.push(new W("child_removed",ab.i.M(a),a)),ab.i=ab.i.G(a,l)):$a&&(n.push(new W("child_added",b,a)),ab.i=ab.i.G(a,b));yd===a&&($a=k);a===Uc&&(lc=k)})}for(t=0;t<n.length;t++)c=n[t],x=this.i.da(c.aa,c.sa),m.push(new W("child_added",
c.sa,c.aa,x));for(t=0;t<p.length;t++)c=p[t],x=this.i.da(c.aa,c.sa),m.push(new W("child_moved",c.sa,c.aa,x));for(t=0;t<q.length;t++)c=q[t],x=this.i.da(c.aa,c.sa),m.push(new W("child_changed",c.sa,c.aa,x));this.pb&&0<m.length&&m.push(new W("value",this.i));return m};function Id(a,b,c,d){if(a.N())return l;var e=l;(d?a.vc:a.w).call(a,function(a,d){if(Jd(b,a,d)&&(e=a,c--,0===c))return k});return e}function Jd(a,b,c){for(var d=0;d<a.length;d++)if(!a[d](b,c.j()))return o;return k}
Hd.prototype.zc=function(a){return this.i.M(a)!==P};Hd.prototype.lb=function(a,b,c){var d={};this.i.N()||this.i.w(function(a){d[a]=3});var e=this.i,c=U(c,new K("")),f=new Na;M(L(f,this.J.path),k);var b=P.xa(a,b),h=this;Bd(c,b,a,f,function(a,b,c){c!==l&&a.toString()===h.J.path.toString()&&h.ac(b,c)});this.i.N()?Yb(d,function(a,b){d[b]=2}):(this.i.w(function(a){D(d,a)||(d[a]=1)}),Yb(d,function(a,b){h.i.M(b).f()&&(d[b]=2)}));this.i=e;return d};function Kd(a,b){this.u=a;this.g=b;this.Tb=b.qa;this.ka=new Na}
Kd.prototype.Nb=function(a,b,c,d,e){var f=a.path,h=L(this.ka,f),i=h.k();i===l?(i=new Ed,M(h,i)):z(!i.f(),"We shouldn't be storing empty QueryMaps");var m=a.La();if(i.contains(m))a=i.get(m),ud(a,b,c,d,e);else{var n=this.g.qa.Q(f),n=a="default"===a.La()?new zd(a,n):new Hd(a,n);if(Gd(i)||Ld(h))i.add(m,n),i.S||(i.S=n.J.path);else{var p,q;i.f()||(p=i.toString(),q=i.$a());i.add(m,n);i.S||(i.S=n.J.path);i.setActive(Md(this,i));p&&q&&cd(this.u,i.path(),p,q)}Gd(i)&&Pa(h,function(a){if(a=a.k()){a.wa&&a.wa();
a.wa=l}});ud(a,b,c,d,e);(b=(b=Qa(L(this.ka,f),function(a){var b;if(b=a.k())if(b=a.k().defaultView())b=a.k().defaultView().pb;if(b)return k},k))||this.u===l&&!U(this.g,f).f())&&xd(a)}a.Fb()};function Nd(a,b,c,d,e){var f=a.get(b),h;if(h=f){h=o;for(var i=f.ma.length-1;0<=i;i--){var m=f.ma[i];if((!c||m.type===c)&&(!d||m.W===d)&&(!e||m.T===e))if(f.ma.splice(i,1),h=k,c&&d)break}h=h&&!(0<f.ma.length)}(c=h)&&a.remove(b);return c}
Kd.prototype.cc=function(a,b,c,d){var e=L(this.ka,a.path).k();return e===l?l:Od(this,e,a,b,c,d)};
function Od(a,b,c,d,e,f){var h=b.path(),h=L(a.ka,h),c=c?c.La():l,i=[];c&&"default"!==c?Nd(b,c,d,e,f)&&i.push(c):ib(b.keys(),function(a){Nd(b,a,d,e,f)&&i.push(a)});b.f()&&M(h,l);c=Ld(h);if(0<i.length&&!c){for(var m=h,n=h.parent(),c=o;!c&&n;){var p=n.k();if(p){z(!Gd(p));var q=m.name(),t=o;Dc(p,function(a,b){t=b.zc(q)||t});t&&(c=k)}m=n;n=n.parent()}m=l;if(!Gd(b)){n=b.wa;b.wa=l;var x=[],O=function(b){var c=b.k();if(c&&Fd(c))x.push(c.path()),c.wa==l&&c.setActive(Md(a,c));else{if(c){c.wa!=l||c.setActive(Md(a,
c));var d={};Dc(c,function(a,b){b.i.w(function(a){D(d,a)||(d[a]=k,a=c.path().F(a),x.push(a))})})}b.w(O)}};O(h);m=x;n&&n()}return c?l:m}return l}function Pd(a,b,c){Pa(L(a.ka,b),function(a){(a=a.k())&&Dc(a,function(a,b){xd(b)})},c,k)}
function Qd(a,b,c){function d(a){do{if(h[a.toString()])return k;a=a.parent()}while(a!==l);return o}var e=a.Tb,f=a.g.qa;a.Tb=f;for(var h={},i=0;i<c.length;i++)h[c[i].toString()]=k;Bd(e,f,b,a.ka,function(c,e,f){if(b.contains(c)){var h=d(c);h&&Pd(a,c,o);a.$b(c,e,f);h&&Pd(a,c,k)}else a.$b(c,e,f)});d(b)&&Pd(a,b,k);Rd(a,b)}function Rd(a,b){var c=L(a.ka,b);Pa(c,function(a){(a=a.k())&&Dc(a,function(a,b){b.Fb()})},k,k);Qa(c,function(a){(a=a.k())&&Dc(a,function(a,b){b.Fb()})},o)}
Kd.prototype.$b=function(a,b,c){a=L(this.ka,a).k();a!==l&&Dc(a,function(a,e){e.$b(b,c)})};function Ld(a){return Qa(a,function(a){return a.k()&&Gd(a.k())})}
function Md(a,b){if(a.u){var c=a.u,d=b.path(),e=b.toString(),f=b.$a(),h,i=b.keys(),m=Fd(b),n=a.u,p=function(c){if("ok"!==c){var d="Unknown Error";"too_big"===c?d="The data requested exceeds the maximum size that can be accessed with a single request.":"permission_denied"==c?d="Client doesn't have permission to access the desired data.":"unavailable"==c&&(d="The service is unavailable");var e=Error(c+": "+d);e.code=c.toUpperCase();N("on() or once() for "+b.path().toString()+" failed: "+e.toString());
b&&(Dc(b,function(a,b){for(var c=0;c<b.ma.length;c++){var d=b.ma[c];d.cancel&&(d.T?w(d.cancel,d.T):d.cancel)(e)}}),Od(a,b))}else h||(m?Pd(a,b.path(),k):ib(i,function(a){(a=b.get(a))&&xd(a)}),Rd(a,b.path()))},q=b.toString(),t=b.path().toString();n.fa[t]=n.fa[t]||{};z(!n.fa[t][q],"listen() called twice for same path/queryId.");n.fa[t][q]={$a:b.$a(),C:p};n.P&&$c(n,t,q,b.$a(),p);return function(){h=k;cd(c,d,e,f)}}return ca}
Kd.prototype.lb=function(a,b,c,d){var e={};Dc(b,function(b,h){var i=h.lb(a,c,d);Yb(i,function(a,b){e[b]=3===a?3:(ua(e,b)||a)===a?a:3})});c.N()||c.w(function(a){D(e,a)||(e[a]=4)});return e};function Sd(a,b,c,d,e){var f=b.path(),b=a.lb(f,b,d,e),h=P,i=[];Yb(b,function(b,n){var p=new K(n);3===b||1===b?h=h.G(n,d.Q(p)):(2===b&&i.push({path:f.F(n),oa:P}),i=i.concat(Td(a,d.Q(p),L(c,p),e)))});return[{path:f,oa:h}].concat(i)}
function Ud(a,b,c,d){var e;a:{var f=L(a.ka,b);e=f.parent();for(var h=[];e!==l;){var i=e.k();if(i!==l){if(Fd(i)){e=[{path:b,oa:c}];break a}i=a.lb(b,i,c,d);f=ua(i,f.name());if(3===f||1===f){e=[{path:b,oa:c}];break a}2===f&&h.push({path:b,oa:P})}f=e;e=e.parent()}e=h}if(1==e.length&&(!e[0].oa.f()||c.f()))return e;h=L(a.ka,b);f=h.k();f!==l?Fd(f)?e.push({path:b,oa:c}):e=e.concat(Sd(a,f,h,c,d)):e=e.concat(Td(a,c,h,d));return e}
function Td(a,b,c,d){var e=c.k();if(e!==l)return Fd(e)?[{path:c.path(),oa:b}]:Sd(a,e,c,b,d);var f=[];c.w(function(c){var e=b.N()?P:b.M(c.name()),c=Td(a,e,c,d);f=f.concat(c)});return f};function Vd(a,b){if(!a||"object"!==typeof a)return a;z(".sv"in a,"Unexpected leaf node or priority contents");return b[a[".sv"]]}function Wd(a,b){var c=Vd(a.j(),b),d;if(a.N()){var e=Vd(a.k(),b);return e!==a.k()||c!==a.j()?new bc(e,c):a}d=a;c!==a.j()&&(d=d.Ea(c));a.w(function(a,c){var e=Wd(c,b);e!==c&&(d=d.G(a,e))});return d};function Xd(a){this.K=a;this.$=xc(a);this.u=new Wc(this.K,w(this.Wb,this),w(this.Ub,this),w(this.wb,this),w(this.Hc,this),w(this.yc,this));var b=w(function(){return new uc(this.$,this.u)},this),a=a.toString();wc[a]||(wc[a]=b());this.nd=wc[a];this.fb=new Na;this.gb=new ld;this.g=new md;this.H=new Kd(this.u,this.g.la);this.Ac=new ld;this.Bc=new Kd(l,this.Ac);Yd(this,"connected",o);Yd(this,"authenticated",o);this.R=new hd;this.tc=0}s=Xd.prototype;
s.toString=function(){return(this.K.ec?"https://":"http://")+this.K.host};s.name=function(){return this.K.ub};function Zd(a){a=U(a.Ac,new K(".info/serverTimeOffset")).V()||0;return(new Date).getTime()+a}function $d(a){a=a={timestamp:Zd(a)};a.timestamp=a.timestamp||(new Date).getTime();return a}
s.Wb=function(a,b,c){this.tc++;var d,e,f=[];9<=a.length&&a.lastIndexOf(".priority")===a.length-9?(d=new K(a.substring(0,a.length-9)),e=U(this.g.ra,d).Ea(b),f.push(d)):c?(d=new K(a),e=U(this.g.ra,d),Yb(b,function(a,b){var c=new K(b);e=e.xa(c,R(a));f.push(d.F(b))})):(d=new K(a),e=R(b),f.push(d));a=Ud(this.H,d,e,this.g.I);b=o;for(c=0;c<a.length;++c){var h=a[c],i=this.g,m=h.path;V(i.ra,m,h.oa);b=nd(i,m)||b}b&&(d=ae(this,d));Qd(this.H,d,f)};
s.Ub=function(a){Yd(this,"connected",a);if(a===o){this.e("onDisconnectEvents");var b=this,c=[],d=$d(this),a=kd,e=new hd;kd(this.R,new K(""),function(a,b){id(e,a,Wd(b,d))});a(e,new K(""),function(a,d){var e=Ud(b.H,a,d,b.g.I);c.push.apply(c,b.g.set(a,e));e=be(b,a);ae(b,e);Qd(b.H,e,[a])});pd(this.g,c);this.R=new hd}};s.Hc=function(a){var b=this;Xb(a,function(a,d){Yd(b,d,a)})};s.yc=function(a){a=new K(a);return U(this.g.ra,a).hash()};s.wb=function(a){Yd(this,"authenticated",a)};
function Yd(a,b,c){b=new K("/.info/"+b);V(a.Ac,b,R(c));Qd(a.Bc,b,[b])}s.ib=function(a,b,c){"firebaseio-demo.com"===this.K.domain&&N("FirebaseRef.auth() not supported on demo (*.firebaseio-demo.com) Firebases. Please use on production (*.firebaseio.com) Firebases only.");this.u.ib(a,function(a,c){X(b,a,c)},function(a,b){N("auth() was canceled: "+b);if(c){var f=Error(b);f.code=a.toUpperCase();c(f)}})};s.Lb=function(a){this.u.Lb(function(b){X(a,b)})};
s.eb=function(a,b,c,d){this.e("set",{path:a.toString(),value:b,ha:c});var e=$d(this),b=R(b,c),e=Wd(b,e),e=Ud(this.H,a,e,this.g.I),f=this.g.set(a,e),h=this;this.u.put(a.toString(),b.V(k),function(b){"ok"!==b&&N("set at "+a+" failed: "+b);pd(h.g,f);nd(h.g,a);var c=ae(h,a);Qd(h.H,c,[]);X(d,b)});e=be(this,a);ae(this,e);Qd(this.H,e,[a])};
s.update=function(a,b,c){this.e("update",{path:a.toString(),value:b});var d=U(this.g.la,a),e=k,f=[],h=$d(this),i=[],m;for(m in b){var e=o,n=R(b[m]),n=Wd(n,h),d=d.G(m,n),p=a.F(m);f.push(p);n=Ud(this.H,p,n,this.g.I);i=i.concat(this.g.set(a,n))}if(e)Nb("update() called with empty data.  Don't do anything."),X(c,"ok");else{var q=this;fd(this.u,"m",a.toString(),b,function(b){z("ok"===b||"permission_denied"===b,"merge at "+a+" failed.");"ok"!==b&&N("update at "+a+" failed: "+b);pd(q.g,i);nd(q.g,a);var d=
ae(q,a);Qd(q.H,d,[]);X(c,b)},j);b=be(this,a);ae(this,b);Qd(q.H,b,f)}};s.Mc=function(a,b,c){this.e("setPriority",{path:a.toString(),ha:b});var d=$d(this),d=Vd(b,d),d=U(this.g.I,a).Ea(d),d=Ud(this.H,a,d,this.g.I),e=this.g.set(a,d),f=this;this.u.put(a.toString()+"/.priority",b,function(a){pd(f.g,e);X(c,a)});a=ae(this,a);Qd(f.H,a,[])};s.Ec=function(a,b){var c=this;this.u.Ec(a.toString(),function(d){"ok"===d&&jd(c.R,a);X(b,d)})};
function ce(a,b,c,d){var e=R(c);dd(a.u,b.toString(),e.V(k),function(c){"ok"===c&&id(a.R,b,e);X(d,c)})}function de(a){sc(a.$,"deprecated_on_disconnect");a.nd.Pc.deprecated_on_disconnect=k}s.Nb=function(a,b,c,d,e){".info"===F(a.path)?this.Bc.Nb(a,b,c,d,e):this.H.Nb(a,b,c,d,e)};
s.cc=function(a,b,c,d){if(".info"===F(a.path))this.Bc.cc(a,b,c,d);else{b=this.H.cc(a,b,c,d);if(c=b!==l){for(var c=this.g,d=a.path,e=[],f=0;f<b.length;++f)e[f]=U(c.ra,b[f]);V(c.ra,d,P);for(f=0;f<b.length;++f)V(c.ra,b[f],e[f]);c=nd(c,d)}c&&(z(this.g.la.qa===this.H.Tb,"We should have raised any outstanding events by now.  Else, we'll blow them away."),V(this.g.la,a.path,U(this.g.I,a.path)),this.H.Tb=this.g.la.qa)}};s.Ha=function(){this.u.Ha()};s.bb=function(){this.u.bb()};
s.Nc=function(a){if("undefined"!==typeof console){a?(this.hc||(this.hc=new tc(this.$)),a=this.hc.get()):a=this.$.get();var b=a,c=[],d=0,e;for(e in b)c[d++]=e;var f=function(a,b){return Math.max(b.length,a)};if(c.reduce)e=c.reduce(f,0);else{var h=0;ib(c,function(a){h=f.call(j,h,a)});e=h}for(var i in a){b=a[i];for(c=i.length;c<e+2;c++)i+=" ";console.log(i+b)}}};s.Oc=function(a){sc(this.$,a);this.nd.Pc[a]=k};s.e=function(){Nb("r:"+this.u.id+":",arguments)};
function X(a,b,c){a&&ac(function(){if("ok"==b)a(l,c);else{var d=(b||"error").toUpperCase(),e=d;c&&(e+=": "+c);e=Error(e);e.code=d;a(e)}})};function ee(a,b){var c=b||a.fb;b||fe(a,c);if(c.k()!==l){var d=ge(a,c);z(0<d.length);if(2!==d[0].status&&4!==d[0].status){for(var e=c.path(),f=0;f<d.length;f++)z(1===d[f].status,"tryToSendTransactionQueue_: items in queue should all be run."),d[f].status=2,d[f].kd++;c=U(a.g.I,e).hash();V(a.g.I,e,U(a.g.la,e));for(var h=U(a.gb,e).V(k),i=Hb(),m={},n=0;n<d.length;n++)d[n].nc&&(m[d[n].path.toString()]=d[n].path);var p=[],q;for(q in m)p.push(m[q]);for(f=0;f<p.length;f++)M(L(a.g.Cb,p[f]),i);a.u.put(e.toString(),
h,function(b){a.e("transaction put response",{path:e.toString(),status:b});for(f=0;f<p.length;f++){var c=L(a.g.Cb,p[f]),h=c.k();z(h!==l,"sendTransactionQueue_: pendingPut should not be null.");h===i&&(M(c,l),V(a.g.I,p[f],U(a.g.ra,p[f])))}if("ok"===b){b=[];for(f=0;f<d.length;f++)d[f].status=3,d[f].C&&(c=he(a,d[f].path),b.push(w(d[f].C,l,l,k,c))),d[f].kc();fe(a,L(a.fb,e));ee(a);for(f=0;f<b.length;f++)ac(b[f])}else{if("datastale"===b)for(f=0;f<d.length;f++)d[f].status=4===d[f].status?5:1;else{N("transaction at "+
e+" failed: "+b);for(f=0;f<d.length;f++)d[f].status=5,d[f].lc=b}b=ae(a,e);Qd(a.H,b,[e])}},c)}}else c.nb()&&c.w(function(b){ee(a,b)})}
function ae(a,b){var c=ie(a,b),d=c.path(),e=ge(a,c);V(a.g.la,d,U(a.g.I,d));V(a.gb,d,U(a.g.I,d));if(0!==e.length){for(var f=c=U(a.g.la,d),h=[],i=0;i<e.length;i++){var m=La(d,e[i].path),n=o,p;z(m!==l,"rerunTransactionsUnderNode_: relativePath should not be null.");if(5===e[i].status)n=k,p=e[i].lc;else if(1===e[i].status)if(25<=e[i].kd)n=k,p="maxretry";else{var q=e[i].update(c.Q(m).V());u(q)?(za("transaction failed: Data returned ",q),q=R(q),c=c.xa(m,q),e[i].nc&&(f=f.xa(m,q))):(n=k,p="nodata")}n&&(e[i].status=
3,setTimeout(e[i].kc,0),e[i].C&&(n=new J(a,e[i].path),m=new S(c.Q(m),n),"nodata"===p?h.push(w(e[i].C,l,l,o,m)):h.push(w(e[i].C,l,Error(p),o,m))))}p=U(a.g.I,d).j();c=c.Ea(p);f=f.Ea(p);V(a.gb,d,c);V(a.g.la,d,f);fe(a,a.fb);for(i=0;i<h.length;i++)ac(h[i]);ee(a)}return d}function ie(a,b){for(var c,d=a.fb;(c=F(b))!==l&&d.k()===l;)d=L(d,c),b=Ka(b);return d}function ge(a,b){var c=[];je(a,b,c);c.sort(function(a,b){return a.ed-b.ed});return c}
function je(a,b,c){var d=b.k();if(d!==l)for(var e=0;e<d.length;e++)c.push(d[e]);b.w(function(b){je(a,b,c)})}function fe(a,b){var c=b.k();if(c){for(var d=0,e=0;e<c.length;e++)3!==c[e].status&&(c[d]=c[e],d++);c.length=d;M(b,0<c.length?c:l)}b.w(function(b){fe(a,b)})}function be(a,b){var c=ie(a,b).path(),d=L(a.fb,b);Qa(d,function(a){ke(a)});ke(d);Pa(d,function(a){ke(a)});return c}
function ke(a){var b=a.k();if(b!==l){for(var c=[],d=-1,e=0;e<b.length;e++)4!==b[e].status&&(2===b[e].status?(z(d===e-1,"All SENT items should be at beginning of queue."),d=e,b[e].status=4,b[e].lc="set"):(z(1===b[e].status),b[e].kc(),b[e].C&&c.push(w(b[e].C,l,Error("set"),o,l))));-1===d?M(a,l):b.length=d+1;for(e=0;e<c.length;e++)ac(c[e])}}function he(a,b){var c=new J(a,b);return new S(U(a.gb,b),c)};function Y(){this.ab={}}da(Y);Y.prototype.Ha=function(){for(var a in this.ab)this.ab[a].Ha()};Y.prototype.interrupt=Y.prototype.Ha;Y.prototype.bb=function(){for(var a in this.ab)this.ab[a].bb()};Y.prototype.resume=Y.prototype.bb;var Z={Ad:function(a){var b=Q.prototype.hash;Q.prototype.hash=a;var c=bc.prototype.hash;bc.prototype.hash=a;return function(){Q.prototype.hash=b;bc.prototype.hash=c}}};Z.hijackHash=Z.Ad;Z.La=function(a){return a.La()};Z.queryIdentifier=Z.La;Z.Cd=function(a){return a.n.u.fa};Z.listens=Z.Cd;Z.Kd=function(a){return a.n.u.ia};Z.refConnection=Z.Kd;Z.pd=Wc;Z.DataConnection=Z.pd;Wc.prototype.sendRequest=Wc.prototype.Da;Wc.prototype.interrupt=Wc.prototype.Ha;Z.qd=Oc;Z.RealTimeConnection=Z.qd;
Oc.prototype.sendRequest=Oc.prototype.ld;Oc.prototype.close=Oc.prototype.close;Z.od=qb;Z.ConnectionTarget=Z.od;Z.yd=function(){Hc=zc=k};Z.forceLongPolling=Z.yd;Z.zd=function(){Ic=k};Z.forceWebSockets=Z.zd;Z.Qd=function(a,b){a.n.u.Lc=b};Z.setSecurityDebugCallback=Z.Qd;Z.Nc=function(a,b){a.n.Nc(b)};Z.stats=Z.Nc;Z.Oc=function(a,b){a.n.Oc(b)};Z.statsIncrementCounter=Z.Oc;Z.tc=function(a){return a.n.tc};function $(a,b,c){this.Gb=a;this.S=b;this.Ca=c}$.prototype.cancel=function(a){A("Firebase.onDisconnect().cancel",0,1,arguments.length);C("Firebase.onDisconnect().cancel",1,a,k);this.Gb.Ec(this.S,a)};$.prototype.cancel=$.prototype.cancel;$.prototype.remove=function(a){A("Firebase.onDisconnect().remove",0,1,arguments.length);E("Firebase.onDisconnect().remove",this.S);C("Firebase.onDisconnect().remove",1,a,k);ce(this.Gb,this.S,l,a)};$.prototype.remove=$.prototype.remove;
$.prototype.set=function(a,b){A("Firebase.onDisconnect().set",1,2,arguments.length);E("Firebase.onDisconnect().set",this.S);ya("Firebase.onDisconnect().set",a,o);C("Firebase.onDisconnect().set",2,b,k);ce(this.Gb,this.S,a,b)};$.prototype.set=$.prototype.set;
$.prototype.eb=function(a,b,c){A("Firebase.onDisconnect().setWithPriority",2,3,arguments.length);E("Firebase.onDisconnect().setWithPriority",this.S);ya("Firebase.onDisconnect().setWithPriority",a,o);Da("Firebase.onDisconnect().setWithPriority",2,b,o);C("Firebase.onDisconnect().setWithPriority",3,c,k);(".length"===this.Ca||".keys"===this.Ca)&&g("Firebase.onDisconnect().setWithPriority failed: "+this.Ca+" is a read-only object.");var d=this.Gb,e=this.S,f=R(a,b);dd(d.u,e.toString(),f.V(k),function(a){"ok"===
a&&id(d.R,e,f);X(c,a)})};$.prototype.setWithPriority=$.prototype.eb;
$.prototype.update=function(a,b){A("Firebase.onDisconnect().update",1,2,arguments.length);E("Firebase.onDisconnect().update",this.S);Ca("Firebase.onDisconnect().update",a);C("Firebase.onDisconnect().update",2,b,k);var c=this.Gb,d=this.S,e=k,f;for(f in a)e=o;if(e)Nb("onDisconnect().update() called with empty data.  Don't do anything."),X(b,k);else{e=c.u;f=d.toString();var h=function(e){if("ok"===e)for(var f in a){var h=R(a[f]);id(c.R,d.F(f),h)}X(b,e)};e.P?ed(e,"om",f,a,h):e.xb.push({Jc:f,action:"om",
data:a,C:h})}};$.prototype.update=$.prototype.update;var le,me=0,ne=[];le=function(a){var b=a===me;me=a;for(var c=Array(8),d=7;0<=d;d--)c[d]="-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(a%64),a=Math.floor(a/64);z(0===a);a=c.join("");if(b){for(d=11;0<=d&&63===ne[d];d--)ne[d]=0;ne[d]++}else for(d=0;12>d;d++)ne[d]=Math.floor(64*Math.random());for(d=0;12>d;d++)a+="-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(ne[d]);z(20===a.length,"NextPushId: Length should be 20.");return a};function J(){var a,b,c;if(arguments[0]instanceof Xd)c=arguments[0],a=arguments[1];else{A("new Firebase",1,2,arguments.length);var d=arguments[0];b=a="";var e=k,f="";if(v(d)){var h=d.indexOf("//");if(0<=h)var i=d.substring(0,h-1),d=d.substring(h+2);h=d.indexOf("/");-1===h&&(h=d.length);a=d.substring(0,h);var d=d.substring(h+1),m=a.split(".");if(3==m.length){h=m[2].indexOf(":");e=0<=h?"https"===i:k;if("firebase"===m[1])Rb(a+" is no longer supported. Please use <YOUR FIREBASE>.firebaseio.com instead");
else{b=m[0];f="";d=("/"+d).split("/");for(i=0;i<d.length;i++)if(0<d[i].length){h=d[i];try{h=decodeURIComponent(h.replace(/\+/g," "))}catch(n){}f+="/"+h}}b=b.toLowerCase()}else b=l}e||"undefined"!==typeof window&&(window.location&&window.location.protocol&&-1!==window.location.protocol.indexOf("https:"))&&N("Insecure Firebase access from a secure page. Please use https in calls to new Firebase().");a=new qb(a,e,b);b=new K(f);e=b.toString();if(!(d=!v(a.host)))if(!(d=0===a.host.length))if(!(d=!xa(a.ub)))if(d=
0!==e.length)e&&(e=e.replace(/^\/*\.info(\/|$)/,"/")),d=!(v(e)&&0!==e.length&&!wa.test(e));d&&g(Error(B("new Firebase",1,o)+'must be a valid firebase URL and the path can\'t contain ".", "#", "$", "[", or "]".'));arguments[1]?arguments[1]instanceof Y?c=arguments[1]:g(Error("Expected a valid Firebase.Context for second argument to new Firebase()")):c=Y.mb();e=a.toString();d=ua(c.ab,e);d||(d=new Xd(a),c.ab[e]=d);c=d;a=b}H.call(this,c,a)}ka(J,H);var oe=J,pe=["Firebase"],qe=ba;
!(pe[0]in qe)&&qe.execScript&&qe.execScript("var "+pe[0]);for(var re;pe.length&&(re=pe.shift());)!pe.length&&u(oe)?qe[re]=oe:qe=qe[re]?qe[re]:qe[re]={};J.prototype.name=function(){A("Firebase.name",0,0,arguments.length);return this.path.f()?l:this.path.Z<this.path.m.length?this.path.m[this.path.m.length-1]:l};J.prototype.name=J.prototype.name;
J.prototype.F=function(a){A("Firebase.child",1,1,arguments.length);if(ga(a))a=String(a);else if(!(a instanceof K))if(F(this.path)===l){var b=a;b&&(b=b.replace(/^\/*\.info(\/|$)/,"/"));Ga("Firebase.child",b)}else Ga("Firebase.child",a);return new J(this.n,this.path.F(a))};J.prototype.child=J.prototype.F;J.prototype.parent=function(){A("Firebase.parent",0,0,arguments.length);var a=this.path.parent();return a===l?l:new J(this.n,a)};J.prototype.parent=J.prototype.parent;
J.prototype.root=function(){A("Firebase.ref",0,0,arguments.length);for(var a=this;a.parent()!==l;)a=a.parent();return a};J.prototype.root=J.prototype.root;J.prototype.toString=function(){A("Firebase.toString",0,0,arguments.length);var a;if(this.parent()===l)a=this.n.toString();else{a=this.parent().toString()+"/";var b=this.name();a+=encodeURIComponent(String(b))}return a};J.prototype.toString=J.prototype.toString;
J.prototype.set=function(a,b){A("Firebase.set",1,2,arguments.length);E("Firebase.set",this.path);ya("Firebase.set",a,o);C("Firebase.set",2,b,k);return this.n.eb(this.path,a,l,b)};J.prototype.set=J.prototype.set;J.prototype.update=function(a,b){A("Firebase.update",1,2,arguments.length);E("Firebase.update",this.path);Ca("Firebase.update",a);C("Firebase.update",2,b,k);return this.n.update(this.path,a,b)};J.prototype.update=J.prototype.update;
J.prototype.eb=function(a,b,c){A("Firebase.setWithPriority",2,3,arguments.length);E("Firebase.setWithPriority",this.path);ya("Firebase.setWithPriority",a,o);Da("Firebase.setWithPriority",2,b,o);C("Firebase.setWithPriority",3,c,k);(".length"===this.name()||".keys"===this.name())&&g("Firebase.setWithPriority failed: "+this.name()+" is a read-only object.");return this.n.eb(this.path,a,b,c)};J.prototype.setWithPriority=J.prototype.eb;
J.prototype.remove=function(a){A("Firebase.remove",0,1,arguments.length);E("Firebase.remove",this.path);C("Firebase.remove",1,a,k);this.set(l,a)};J.prototype.remove=J.prototype.remove;
J.prototype.transaction=function(a,b,c){function d(){}A("Firebase.transaction",1,3,arguments.length);E("Firebase.transaction",this.path);C("Firebase.transaction",1,a,o);C("Firebase.transaction",2,b,k);u(c)&&"boolean"!=typeof c&&g(Error(B("Firebase.transaction",3,k)+"must be a boolean."));(".length"===this.name()||".keys"===this.name())&&g("Firebase.transaction failed: "+this.name()+" is a read-only object.");"undefined"===typeof c&&(c=k);var e=this.n,f=this.path,h=c;e.e("transaction on "+f);var i=
new J(e,f);i.Ya("value",d);var h={path:f,update:a,C:b,status:l,ed:Hb(),nc:h,kd:0,kc:function(){i.vb("value",d)},lc:l},m=h.update(U(e.gb,f).V());if(u(m)){za("transaction failed: Data returned ",m);h.status=1;var n=L(e.fb,f),p=n.k()||[];p.push(h);M(n,p);p="object"===typeof m&&m!==l&&D(m,".priority")?m[".priority"]:U(e.g.I,f).j();n=$d(e);m=R(m,p);m=Wd(m,n);V(e.gb,f,m);h.nc&&(V(e.g.la,f,m),Qd(e.H,f,[f]));ee(e)}else h.kc(),h.C&&(e=he(e,f),h.C(l,o,e))};J.prototype.transaction=J.prototype.transaction;
J.prototype.Mc=function(a,b){A("Firebase.setPriority",1,2,arguments.length);E("Firebase.setPriority",this.path);Da("Firebase.setPriority",1,a,o);C("Firebase.setPriority",2,b,k);this.n.Mc(this.path,a,b)};J.prototype.setPriority=J.prototype.Mc;J.prototype.push=function(a,b){A("Firebase.push",0,2,arguments.length);E("Firebase.push",this.path);ya("Firebase.push",a,k);C("Firebase.push",2,b,k);var c=Zd(this.n),c=le(c),c=this.F(c);"undefined"!==typeof a&&a!==l&&c.set(a,b);return c};J.prototype.push=J.prototype.push;
J.prototype.ga=function(){return new $(this.n,this.path,this.name())};J.prototype.onDisconnect=J.prototype.ga;J.prototype.Ld=function(){N("FirebaseRef.removeOnDisconnect() being deprecated. Please use FirebaseRef.onDisconnect().remove() instead.");this.ga().remove();de(this.n)};J.prototype.removeOnDisconnect=J.prototype.Ld;J.prototype.Pd=function(a){N("FirebaseRef.setOnDisconnect(value) being deprecated. Please use FirebaseRef.onDisconnect().set(value) instead.");this.ga().set(a);de(this.n)};
J.prototype.setOnDisconnect=J.prototype.Pd;J.prototype.ib=function(a,b,c){A("Firebase.auth",1,3,arguments.length);v(a)||g(Error(B("Firebase.auth",1,o)+"must be a valid credential (a string)."));C("Firebase.auth",2,b,k);C("Firebase.auth",3,b,k);this.n.ib(a,b,c)};J.prototype.auth=J.prototype.ib;J.prototype.Lb=function(a){A("Firebase.unauth",0,1,arguments.length);C("Firebase.unauth",1,a,k);this.n.Lb(a)};J.prototype.unauth=J.prototype.Lb;
J.goOffline=function(){A("Firebase.goOffline",0,0,arguments.length);Y.mb().Ha()};J.goOnline=function(){A("Firebase.goOnline",0,0,arguments.length);Y.mb().bb()};function Ob(a,b){z(!b||a===k||a===o,"Can't turn on custom loggers persistently.");a===k?("undefined"!==typeof console&&("function"===typeof console.log?Lb=w(console.log,console):"object"===typeof console.log&&(Lb=function(a){console.log(a)})),b&&ob.setItem("logging_enabled","true")):a?Lb=a:(Lb=l,ob.removeItem("logging_enabled"))}
J.enableLogging=Ob;J.ServerValue={TIMESTAMP:{".sv":"timestamp"}};J.INTERNAL=Z;J.Context=Y;})();

},{}],28:[function(require,module,exports){


//
// The shims in this file are not fully implemented shims for the ES5
// features, but do work for the particular usecases there is in
// the other modules.
//

var toString = Object.prototype.toString;
var hasOwnProperty = Object.prototype.hasOwnProperty;

// Array.isArray is supported in IE9
function isArray(xs) {
  return toString.call(xs) === '[object Array]';
}
exports.isArray = typeof Array.isArray === 'function' ? Array.isArray : isArray;

// Array.prototype.indexOf is supported in IE9
exports.indexOf = function indexOf(xs, x) {
  if (xs.indexOf) return xs.indexOf(x);
  for (var i = 0; i < xs.length; i++) {
    if (x === xs[i]) return i;
  }
  return -1;
};

// Array.prototype.filter is supported in IE9
exports.filter = function filter(xs, fn) {
  if (xs.filter) return xs.filter(fn);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    if (fn(xs[i], i, xs)) res.push(xs[i]);
  }
  return res;
};

// Array.prototype.forEach is supported in IE9
exports.forEach = function forEach(xs, fn, self) {
  if (xs.forEach) return xs.forEach(fn, self);
  for (var i = 0; i < xs.length; i++) {
    fn.call(self, xs[i], i, xs);
  }
};

// Array.prototype.map is supported in IE9
exports.map = function map(xs, fn) {
  if (xs.map) return xs.map(fn);
  var out = new Array(xs.length);
  for (var i = 0; i < xs.length; i++) {
    out[i] = fn(xs[i], i, xs);
  }
  return out;
};

// Array.prototype.reduce is supported in IE9
exports.reduce = function reduce(array, callback, opt_initialValue) {
  if (array.reduce) return array.reduce(callback, opt_initialValue);
  var value, isValueSet = false;

  if (2 < arguments.length) {
    value = opt_initialValue;
    isValueSet = true;
  }
  for (var i = 0, l = array.length; l > i; ++i) {
    if (array.hasOwnProperty(i)) {
      if (isValueSet) {
        value = callback(value, array[i], i, array);
      }
      else {
        value = array[i];
        isValueSet = true;
      }
    }
  }

  return value;
};

// String.prototype.substr - negative index don't work in IE8
if ('ab'.substr(-1) !== 'b') {
  exports.substr = function (str, start, length) {
    // did we get a negative start, calculate how much it is from the beginning of the string
    if (start < 0) start = str.length + start;

    // call the original function
    return str.substr(start, length);
  };
} else {
  exports.substr = function (str, start, length) {
    return str.substr(start, length);
  };
}

// String.prototype.trim is supported in IE9
exports.trim = function (str) {
  if (str.trim) return str.trim();
  return str.replace(/^\s+|\s+$/g, '');
};

// Function.prototype.bind is supported in IE9
exports.bind = function () {
  var args = Array.prototype.slice.call(arguments);
  var fn = args.shift();
  if (fn.bind) return fn.bind.apply(fn, args);
  var self = args.shift();
  return function () {
    fn.apply(self, args.concat([Array.prototype.slice.call(arguments)]));
  };
};

// Object.create is supported in IE9
function create(prototype, properties) {
  var object;
  if (prototype === null) {
    object = { '__proto__' : null };
  }
  else {
    if (typeof prototype !== 'object') {
      throw new TypeError(
        'typeof prototype[' + (typeof prototype) + '] != \'object\''
      );
    }
    var Type = function () {};
    Type.prototype = prototype;
    object = new Type();
    object.__proto__ = prototype;
  }
  if (typeof properties !== 'undefined' && Object.defineProperties) {
    Object.defineProperties(object, properties);
  }
  return object;
}
exports.create = typeof Object.create === 'function' ? Object.create : create;

// Object.keys and Object.getOwnPropertyNames is supported in IE9 however
// they do show a description and number property on Error objects
function notObject(object) {
  return ((typeof object != "object" && typeof object != "function") || object === null);
}

function keysShim(object) {
  if (notObject(object)) {
    throw new TypeError("Object.keys called on a non-object");
  }

  var result = [];
  for (var name in object) {
    if (hasOwnProperty.call(object, name)) {
      result.push(name);
    }
  }
  return result;
}

// getOwnPropertyNames is almost the same as Object.keys one key feature
//  is that it returns hidden properties, since that can't be implemented,
//  this feature gets reduced so it just shows the length property on arrays
function propertyShim(object) {
  if (notObject(object)) {
    throw new TypeError("Object.getOwnPropertyNames called on a non-object");
  }

  var result = keysShim(object);
  if (exports.isArray(object) && exports.indexOf(object, 'length') === -1) {
    result.push('length');
  }
  return result;
}

var keys = typeof Object.keys === 'function' ? Object.keys : keysShim;
var getOwnPropertyNames = typeof Object.getOwnPropertyNames === 'function' ?
  Object.getOwnPropertyNames : propertyShim;

if (new Error().hasOwnProperty('description')) {
  var ERROR_PROPERTY_FILTER = function (obj, array) {
    if (toString.call(obj) === '[object Error]') {
      array = exports.filter(array, function (name) {
        return name !== 'description' && name !== 'number' && name !== 'message';
      });
    }
    return array;
  };

  exports.keys = function (object) {
    return ERROR_PROPERTY_FILTER(object, keys(object));
  };
  exports.getOwnPropertyNames = function (object) {
    return ERROR_PROPERTY_FILTER(object, getOwnPropertyNames(object));
  };
} else {
  exports.keys = keys;
  exports.getOwnPropertyNames = getOwnPropertyNames;
}

// Object.getOwnPropertyDescriptor - supported in IE8 but only on dom elements
function valueObject(value, key) {
  return { value: value[key] };
}

if (typeof Object.getOwnPropertyDescriptor === 'function') {
  try {
    Object.getOwnPropertyDescriptor({'a': 1}, 'a');
    exports.getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  } catch (e) {
    // IE8 dom element issue - use a try catch and default to valueObject
    exports.getOwnPropertyDescriptor = function (value, key) {
      try {
        return Object.getOwnPropertyDescriptor(value, key);
      } catch (e) {
        return valueObject(value, key);
      }
    };
  }
} else {
  exports.getOwnPropertyDescriptor = valueObject;
}

},{}],29:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// UTILITY
var util = require('util');
var shims = require('_shims');
var pSlice = Array.prototype.slice;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  this.message = options.message || getMessage(this);
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (util.isUndefined(value)) {
    return '' + value;
  }
  if (util.isNumber(value) && (isNaN(value) || !isFinite(value))) {
    return value.toString();
  }
  if (util.isFunction(value) || util.isRegExp(value)) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (util.isString(s)) {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

function getMessage(self) {
  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
         self.operator + ' ' +
         truncate(JSON.stringify(self.expected, replacer), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!util.isObject(actual) && !util.isObject(expected)) {
    return actual == expected;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = shims.keys(a),
        kb = shims.keys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (util.isString(expected)) {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};
},{"_shims":28,"util":31}],30:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// Query String Utilities

var QueryString = exports;
var util = require('util');
var shims = require('_shims');
var Buffer = require('buffer').Buffer;

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}


function charCode(c) {
  return c.charCodeAt(0);
}


// a safe fast alternative to decodeURIComponent
QueryString.unescapeBuffer = function(s, decodeSpaces) {
  var out = new Buffer(s.length);
  var state = 'CHAR'; // states: CHAR, HEX0, HEX1
  var n, m, hexchar;

  for (var inIndex = 0, outIndex = 0; inIndex <= s.length; inIndex++) {
    var c = s.charCodeAt(inIndex);
    switch (state) {
      case 'CHAR':
        switch (c) {
          case charCode('%'):
            n = 0;
            m = 0;
            state = 'HEX0';
            break;
          case charCode('+'):
            if (decodeSpaces) c = charCode(' ');
            // pass thru
          default:
            out[outIndex++] = c;
            break;
        }
        break;

      case 'HEX0':
        state = 'HEX1';
        hexchar = c;
        if (charCode('0') <= c && c <= charCode('9')) {
          n = c - charCode('0');
        } else if (charCode('a') <= c && c <= charCode('f')) {
          n = c - charCode('a') + 10;
        } else if (charCode('A') <= c && c <= charCode('F')) {
          n = c - charCode('A') + 10;
        } else {
          out[outIndex++] = charCode('%');
          out[outIndex++] = c;
          state = 'CHAR';
          break;
        }
        break;

      case 'HEX1':
        state = 'CHAR';
        if (charCode('0') <= c && c <= charCode('9')) {
          m = c - charCode('0');
        } else if (charCode('a') <= c && c <= charCode('f')) {
          m = c - charCode('a') + 10;
        } else if (charCode('A') <= c && c <= charCode('F')) {
          m = c - charCode('A') + 10;
        } else {
          out[outIndex++] = charCode('%');
          out[outIndex++] = hexchar;
          out[outIndex++] = c;
          break;
        }
        out[outIndex++] = 16 * n + m;
        break;
    }
  }

  // TODO support returning arbitrary buffers.

  return out.slice(0, outIndex - 1);
};


QueryString.unescape = function(s, decodeSpaces) {
  return QueryString.unescapeBuffer(s, decodeSpaces).toString();
};


QueryString.escape = function(str) {
  return encodeURIComponent(str);
};

var stringifyPrimitive = function(v) {
  if (util.isString(v))
    return v;
  if (util.isBoolean(v))
    return v ? 'true' : 'false';
  if (util.isNumber(v))
    return isFinite(v) ? v : '';
  return '';
};


QueryString.stringify = QueryString.encode = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (util.isNull(obj)) {
    obj = undefined;
  }

  if (util.isObject(obj)) {
    return shims.map(shims.keys(obj), function(k) {
      var ks = QueryString.escape(stringifyPrimitive(k)) + eq;
      if (util.isArray(obj[k])) {
        return shims.map(obj[k], function(v) {
          return ks + QueryString.escape(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + QueryString.escape(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return QueryString.escape(stringifyPrimitive(name)) + eq +
         QueryString.escape(stringifyPrimitive(obj));
};

// Parse a key=val string.
QueryString.parse = QueryString.decode = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (!util.isString(qs) || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && util.isNumber(options.maxKeys)) {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    try {
      k = decodeURIComponent(kstr);
      v = decodeURIComponent(vstr);
    } catch (e) {
      k = QueryString.unescape(kstr, true);
      v = QueryString.unescape(vstr, true);
    }

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (util.isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};
},{"_shims":28,"buffer":33,"util":31}],31:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var shims = require('_shims');

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};

/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  shims.forEach(array, function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = shims.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = shims.getOwnPropertyNames(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }

  shims.forEach(keys, function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = shims.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }

  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (shims.indexOf(ctx.seen, desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = shims.reduce(output, function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return shims.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) && objectToString(e) === '[object Error]';
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.binarySlice === 'function'
  ;
}
exports.isBuffer = isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = shims.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = shims.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

},{"_shims":28}],32:[function(require,module,exports){
exports.readIEEE754 = function(buffer, offset, isBE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isBE ? 0 : (nBytes - 1),
      d = isBE ? 1 : -1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.writeIEEE754 = function(buffer, value, offset, isBE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isBE ? (nBytes - 1) : 0,
      d = isBE ? -1 : 1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],33:[function(require,module,exports){
var assert;
exports.Buffer = Buffer;
exports.SlowBuffer = Buffer;
Buffer.poolSize = 8192;
exports.INSPECT_MAX_BYTES = 50;

function stringtrim(str) {
  if (str.trim) return str.trim();
  return str.replace(/^\s+|\s+$/g, '');
}

function Buffer(subject, encoding, offset) {
  if(!assert) assert= require('assert');
  if (!(this instanceof Buffer)) {
    return new Buffer(subject, encoding, offset);
  }
  this.parent = this;
  this.offset = 0;

  // Work-around: node's base64 implementation
  // allows for non-padded strings while base64-js
  // does not..
  if (encoding == "base64" && typeof subject == "string") {
    subject = stringtrim(subject);
    while (subject.length % 4 != 0) {
      subject = subject + "="; 
    }
  }

  var type;

  // Are we slicing?
  if (typeof offset === 'number') {
    this.length = coerce(encoding);
    // slicing works, with limitations (no parent tracking/update)
    // check https://github.com/toots/buffer-browserify/issues/19
    for (var i = 0; i < this.length; i++) {
        this[i] = subject.get(i+offset);
    }
  } else {
    // Find the length
    switch (type = typeof subject) {
      case 'number':
        this.length = coerce(subject);
        break;

      case 'string':
        this.length = Buffer.byteLength(subject, encoding);
        break;

      case 'object': // Assume object is an array
        this.length = coerce(subject.length);
        break;

      default:
        throw new Error('First argument needs to be a number, ' +
                        'array or string.');
    }

    // Treat array-ish objects as a byte array.
    if (isArrayIsh(subject)) {
      for (var i = 0; i < this.length; i++) {
        if (subject instanceof Buffer) {
          this[i] = subject.readUInt8(i);
        }
        else {
          this[i] = subject[i];
        }
      }
    } else if (type == 'string') {
      // We are a string
      this.length = this.write(subject, 0, encoding);
    } else if (type === 'number') {
      for (var i = 0; i < this.length; i++) {
        this[i] = 0;
      }
    }
  }
}

Buffer.prototype.get = function get(i) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this[i];
};

Buffer.prototype.set = function set(i, v) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this[i] = v;
};

Buffer.byteLength = function (str, encoding) {
  switch (encoding || "utf8") {
    case 'hex':
      return str.length / 2;

    case 'utf8':
    case 'utf-8':
      return utf8ToBytes(str).length;

    case 'ascii':
    case 'binary':
      return str.length;

    case 'base64':
      return base64ToBytes(str).length;

    default:
      throw new Error('Unknown encoding');
  }
};

Buffer.prototype.utf8Write = function (string, offset, length) {
  var bytes, pos;
  return Buffer._charsWritten =  blitBuffer(utf8ToBytes(string), this, offset, length);
};

Buffer.prototype.asciiWrite = function (string, offset, length) {
  var bytes, pos;
  return Buffer._charsWritten =  blitBuffer(asciiToBytes(string), this, offset, length);
};

Buffer.prototype.binaryWrite = Buffer.prototype.asciiWrite;

Buffer.prototype.base64Write = function (string, offset, length) {
  var bytes, pos;
  return Buffer._charsWritten = blitBuffer(base64ToBytes(string), this, offset, length);
};

Buffer.prototype.base64Slice = function (start, end) {
  var bytes = Array.prototype.slice.apply(this, arguments)
  return require("base64-js").fromByteArray(bytes);
};

Buffer.prototype.utf8Slice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var res = "";
  var tmp = "";
  var i = 0;
  while (i < bytes.length) {
    if (bytes[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(bytes[i]);
      tmp = "";
    } else
      tmp += "%" + bytes[i].toString(16);

    i++;
  }

  return res + decodeUtf8Char(tmp);
}

Buffer.prototype.asciiSlice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var ret = "";
  for (var i = 0; i < bytes.length; i++)
    ret += String.fromCharCode(bytes[i]);
  return ret;
}

Buffer.prototype.binarySlice = Buffer.prototype.asciiSlice;

Buffer.prototype.inspect = function() {
  var out = [],
      len = this.length;
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i]);
    if (i == exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...';
      break;
    }
  }
  return '<Buffer ' + out.join(' ') + '>';
};


Buffer.prototype.hexSlice = function(start, end) {
  var len = this.length;

  if (!start || start < 0) start = 0;
  if (!end || end < 0 || end > len) end = len;

  var out = '';
  for (var i = start; i < end; i++) {
    out += toHex(this[i]);
  }
  return out;
};


Buffer.prototype.toString = function(encoding, start, end) {
  encoding = String(encoding || 'utf8').toLowerCase();
  start = +start || 0;
  if (typeof end == 'undefined') end = this.length;

  // Fastpath empty strings
  if (+end == start) {
    return '';
  }

  switch (encoding) {
    case 'hex':
      return this.hexSlice(start, end);

    case 'utf8':
    case 'utf-8':
      return this.utf8Slice(start, end);

    case 'ascii':
      return this.asciiSlice(start, end);

    case 'binary':
      return this.binarySlice(start, end);

    case 'base64':
      return this.base64Slice(start, end);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Slice(start, end);

    default:
      throw new Error('Unknown encoding');
  }
};


Buffer.prototype.hexWrite = function(string, offset, length) {
  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }

  // must be an even number of digits
  var strLen = string.length;
  if (strLen % 2) {
    throw new Error('Invalid hex string');
  }
  if (length > strLen / 2) {
    length = strLen / 2;
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16);
    if (isNaN(byte)) throw new Error('Invalid hex string');
    this[offset + i] = byte;
  }
  Buffer._charsWritten = i * 2;
  return i;
};


Buffer.prototype.write = function(string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length;
      length = undefined;
    }
  } else {  // legacy
    var swap = encoding;
    encoding = offset;
    offset = length;
    length = swap;
  }

  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase();

  switch (encoding) {
    case 'hex':
      return this.hexWrite(string, offset, length);

    case 'utf8':
    case 'utf-8':
      return this.utf8Write(string, offset, length);

    case 'ascii':
      return this.asciiWrite(string, offset, length);

    case 'binary':
      return this.binaryWrite(string, offset, length);

    case 'base64':
      return this.base64Write(string, offset, length);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Write(string, offset, length);

    default:
      throw new Error('Unknown encoding');
  }
};

// slice(start, end)
function clamp(index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue;
  index = ~~index;  // Coerce to integer.
  if (index >= len) return len;
  if (index >= 0) return index;
  index += len;
  if (index >= 0) return index;
  return 0;
}

Buffer.prototype.slice = function(start, end) {
  var len = this.length;
  start = clamp(start, len, 0);
  end = clamp(end, len, len);
  return new Buffer(this, end - start, +start);
};

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function(target, target_start, start, end) {
  var source = this;
  start || (start = 0);
  if (end === undefined || isNaN(end)) {
    end = this.length;
  }
  target_start || (target_start = 0);

  if (end < start) throw new Error('sourceEnd < sourceStart');

  // Copy 0 bytes; we're done
  if (end === start) return 0;
  if (target.length == 0 || source.length == 0) return 0;

  if (target_start < 0 || target_start >= target.length) {
    throw new Error('targetStart out of bounds');
  }

  if (start < 0 || start >= source.length) {
    throw new Error('sourceStart out of bounds');
  }

  if (end < 0 || end > source.length) {
    throw new Error('sourceEnd out of bounds');
  }

  // Are we oob?
  if (end > this.length) {
    end = this.length;
  }

  if (target.length - target_start < end - start) {
    end = target.length - target_start + start;
  }

  var temp = [];
  for (var i=start; i<end; i++) {
    assert.ok(typeof this[i] !== 'undefined', "copying undefined buffer bytes!");
    temp.push(this[i]);
  }

  for (var i=target_start; i<target_start+temp.length; i++) {
    target[i] = temp[i-target_start];
  }
};

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill(value, start, end) {
  value || (value = 0);
  start || (start = 0);
  end || (end = this.length);

  if (typeof value === 'string') {
    value = value.charCodeAt(0);
  }
  if (!(typeof value === 'number') || isNaN(value)) {
    throw new Error('value is not a number');
  }

  if (end < start) throw new Error('end < start');

  // Fill 0 bytes; we're done
  if (end === start) return 0;
  if (this.length == 0) return 0;

  if (start < 0 || start >= this.length) {
    throw new Error('start out of bounds');
  }

  if (end < 0 || end > this.length) {
    throw new Error('end out of bounds');
  }

  for (var i = start; i < end; i++) {
    this[i] = value;
  }
}

// Static methods
Buffer.isBuffer = function isBuffer(b) {
  return b instanceof Buffer || b instanceof Buffer;
};

Buffer.concat = function (list, totalLength) {
  if (!isArray(list)) {
    throw new Error("Usage: Buffer.concat(list, [totalLength])\n \
      list should be an Array.");
  }

  if (list.length === 0) {
    return new Buffer(0);
  } else if (list.length === 1) {
    return list[0];
  }

  if (typeof totalLength !== 'number') {
    totalLength = 0;
    for (var i = 0; i < list.length; i++) {
      var buf = list[i];
      totalLength += buf.length;
    }
  }

  var buffer = new Buffer(totalLength);
  var pos = 0;
  for (var i = 0; i < list.length; i++) {
    var buf = list[i];
    buf.copy(buffer, pos);
    pos += buf.length;
  }
  return buffer;
};

Buffer.isEncoding = function(encoding) {
  switch ((encoding + '').toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
    case 'raw':
      return true;

    default:
      return false;
  }
};

// helpers

function coerce(length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length);
  return length < 0 ? 0 : length;
}

function isArray(subject) {
  return (Array.isArray ||
    function(subject){
      return {}.toString.apply(subject) == '[object Array]'
    })
    (subject)
}

function isArrayIsh(subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
         subject && typeof subject === 'object' &&
         typeof subject.length === 'number';
}

function toHex(n) {
  if (n < 16) return '0' + n.toString(16);
  return n.toString(16);
}

function utf8ToBytes(str) {
  var byteArray = [];
  for (var i = 0; i < str.length; i++)
    if (str.charCodeAt(i) <= 0x7F)
      byteArray.push(str.charCodeAt(i));
    else {
      var h = encodeURIComponent(str.charAt(i)).substr(1).split('%');
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16));
    }

  return byteArray;
}

function asciiToBytes(str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++ )
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push( str.charCodeAt(i) & 0xFF );

  return byteArray;
}

function base64ToBytes(str) {
  return require("base64-js").toByteArray(str);
}

function blitBuffer(src, dst, offset, length) {
  var pos, i = 0;
  while (i < length) {
    if ((i+offset >= dst.length) || (i >= src.length))
      break;

    dst[i + offset] = src[i];
    i++;
  }
  return i;
}

function decodeUtf8Char(str) {
  try {
    return decodeURIComponent(str);
  } catch (err) {
    return String.fromCharCode(0xFFFD); // UTF 8 invalid char
  }
}

// read/write bit-twiddling

Buffer.prototype.readUInt8 = function(offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return;

  return buffer[offset];
};

function readUInt16(buffer, offset, isBigEndian, noAssert) {
  var val = 0;


  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return 0;

  if (isBigEndian) {
    val = buffer[offset] << 8;
    if (offset + 1 < buffer.length) {
      val |= buffer[offset + 1];
    }
  } else {
    val = buffer[offset];
    if (offset + 1 < buffer.length) {
      val |= buffer[offset + 1] << 8;
    }
  }

  return val;
}

Buffer.prototype.readUInt16LE = function(offset, noAssert) {
  return readUInt16(this, offset, false, noAssert);
};

Buffer.prototype.readUInt16BE = function(offset, noAssert) {
  return readUInt16(this, offset, true, noAssert);
};

function readUInt32(buffer, offset, isBigEndian, noAssert) {
  var val = 0;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return 0;

  if (isBigEndian) {
    if (offset + 1 < buffer.length)
      val = buffer[offset + 1] << 16;
    if (offset + 2 < buffer.length)
      val |= buffer[offset + 2] << 8;
    if (offset + 3 < buffer.length)
      val |= buffer[offset + 3];
    val = val + (buffer[offset] << 24 >>> 0);
  } else {
    if (offset + 2 < buffer.length)
      val = buffer[offset + 2] << 16;
    if (offset + 1 < buffer.length)
      val |= buffer[offset + 1] << 8;
    val |= buffer[offset];
    if (offset + 3 < buffer.length)
      val = val + (buffer[offset + 3] << 24 >>> 0);
  }

  return val;
}

Buffer.prototype.readUInt32LE = function(offset, noAssert) {
  return readUInt32(this, offset, false, noAssert);
};

Buffer.prototype.readUInt32BE = function(offset, noAssert) {
  return readUInt32(this, offset, true, noAssert);
};


/*
 * Signed integer types, yay team! A reminder on how two's complement actually
 * works. The first bit is the signed bit, i.e. tells us whether or not the
 * number should be positive or negative. If the two's complement value is
 * positive, then we're done, as it's equivalent to the unsigned representation.
 *
 * Now if the number is positive, you're pretty much done, you can just leverage
 * the unsigned translations and return those. Unfortunately, negative numbers
 * aren't quite that straightforward.
 *
 * At first glance, one might be inclined to use the traditional formula to
 * translate binary numbers between the positive and negative values in two's
 * complement. (Though it doesn't quite work for the most negative value)
 * Mainly:
 *  - invert all the bits
 *  - add one to the result
 *
 * Of course, this doesn't quite work in Javascript. Take for example the value
 * of -128. This could be represented in 16 bits (big-endian) as 0xff80. But of
 * course, Javascript will do the following:
 *
 * > ~0xff80
 * -65409
 *
 * Whoh there, Javascript, that's not quite right. But wait, according to
 * Javascript that's perfectly correct. When Javascript ends up seeing the
 * constant 0xff80, it has no notion that it is actually a signed number. It
 * assumes that we've input the unsigned value 0xff80. Thus, when it does the
 * binary negation, it casts it into a signed value, (positive 0xff80). Then
 * when you perform binary negation on that, it turns it into a negative number.
 *
 * Instead, we're going to have to use the following general formula, that works
 * in a rather Javascript friendly way. I'm glad we don't support this kind of
 * weird numbering scheme in the kernel.
 *
 * (BIT-MAX - (unsigned)val + 1) * -1
 *
 * The astute observer, may think that this doesn't make sense for 8-bit numbers
 * (really it isn't necessary for them). However, when you get 16-bit numbers,
 * you do. Let's go back to our prior example and see how this will look:
 *
 * (0xffff - 0xff80 + 1) * -1
 * (0x007f + 1) * -1
 * (0x0080) * -1
 */
Buffer.prototype.readInt8 = function(offset, noAssert) {
  var buffer = this;
  var neg;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return;

  neg = buffer[offset] & 0x80;
  if (!neg) {
    return (buffer[offset]);
  }

  return ((0xff - buffer[offset] + 1) * -1);
};

function readInt16(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt16(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x8000;
  if (!neg) {
    return val;
  }

  return (0xffff - val + 1) * -1;
}

Buffer.prototype.readInt16LE = function(offset, noAssert) {
  return readInt16(this, offset, false, noAssert);
};

Buffer.prototype.readInt16BE = function(offset, noAssert) {
  return readInt16(this, offset, true, noAssert);
};

function readInt32(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt32(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x80000000;
  if (!neg) {
    return (val);
  }

  return (0xffffffff - val + 1) * -1;
}

Buffer.prototype.readInt32LE = function(offset, noAssert) {
  return readInt32(this, offset, false, noAssert);
};

Buffer.prototype.readInt32BE = function(offset, noAssert) {
  return readInt32(this, offset, true, noAssert);
};

function readFloat(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.readFloatLE = function(offset, noAssert) {
  return readFloat(this, offset, false, noAssert);
};

Buffer.prototype.readFloatBE = function(offset, noAssert) {
  return readFloat(this, offset, true, noAssert);
};

function readDouble(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 7 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.readDoubleLE = function(offset, noAssert) {
  return readDouble(this, offset, false, noAssert);
};

Buffer.prototype.readDoubleBE = function(offset, noAssert) {
  return readDouble(this, offset, true, noAssert);
};


/*
 * We have to make sure that the value is a valid integer. This means that it is
 * non-negative. It has no fractional component and that it does not exceed the
 * maximum allowed value.
 *
 *      value           The number to check for validity
 *
 *      max             The maximum value
 */
function verifuint(value, max) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value >= 0,
      'specified a negative value for writing an unsigned value');

  assert.ok(value <= max, 'value is larger than maximum value for type');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

Buffer.prototype.writeUInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xff);
  }

  if (offset < buffer.length) {
    buffer[offset] = value;
  }
};

function writeUInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffff);
  }

  for (var i = 0; i < Math.min(buffer.length - offset, 2); i++) {
    buffer[offset + i] =
        (value & (0xff << (8 * (isBigEndian ? 1 - i : i)))) >>>
            (isBigEndian ? 1 - i : i) * 8;
  }

}

Buffer.prototype.writeUInt16LE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt16BE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, true, noAssert);
};

function writeUInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffffffff);
  }

  for (var i = 0; i < Math.min(buffer.length - offset, 4); i++) {
    buffer[offset + i] =
        (value >>> (isBigEndian ? 3 - i : i) * 8) & 0xff;
  }
}

Buffer.prototype.writeUInt32LE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt32BE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, true, noAssert);
};


/*
 * We now move onto our friends in the signed number category. Unlike unsigned
 * numbers, we're going to have to worry a bit more about how we put values into
 * arrays. Since we are only worrying about signed 32-bit values, we're in
 * slightly better shape. Unfortunately, we really can't do our favorite binary
 * & in this system. It really seems to do the wrong thing. For example:
 *
 * > -32 & 0xff
 * 224
 *
 * What's happening above is really: 0xe0 & 0xff = 0xe0. However, the results of
 * this aren't treated as a signed number. Ultimately a bad thing.
 *
 * What we're going to want to do is basically create the unsigned equivalent of
 * our representation and pass that off to the wuint* functions. To do that
 * we're going to do the following:
 *
 *  - if the value is positive
 *      we can pass it directly off to the equivalent wuint
 *  - if the value is negative
 *      we do the following computation:
 *         mb + val + 1, where
 *         mb   is the maximum unsigned value in that byte size
 *         val  is the Javascript negative integer
 *
 *
 * As a concrete value, take -128. In signed 16 bits this would be 0xff80. If
 * you do out the computations:
 *
 * 0xffff - 128 + 1
 * 0xffff - 127
 * 0xff80
 *
 * You can then encode this value as the signed version. This is really rather
 * hacky, but it should work and get the job done which is our goal here.
 */

/*
 * A series of checks to make sure we actually have a signed 32-bit number
 */
function verifsint(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

function verifIEEE754(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');
}

Buffer.prototype.writeInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7f, -0x80);
  }

  if (value >= 0) {
    buffer.writeUInt8(value, offset, noAssert);
  } else {
    buffer.writeUInt8(0xff + value + 1, offset, noAssert);
  }
};

function writeInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fff, -0x8000);
  }

  if (value >= 0) {
    writeUInt16(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt16(buffer, 0xffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt16LE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt16BE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, true, noAssert);
};

function writeInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fffffff, -0x80000000);
  }

  if (value >= 0) {
    writeUInt32(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt32(buffer, 0xffffffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt32LE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt32BE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, true, noAssert);
};

function writeFloat(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.writeFloatLE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, false, noAssert);
};

Buffer.prototype.writeFloatBE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, true, noAssert);
};

function writeDouble(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 7 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.writeDoubleLE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, false, noAssert);
};

Buffer.prototype.writeDoubleBE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, true, noAssert);
};

},{"./buffer_ieee754":32,"assert":29,"base64-js":34}],34:[function(require,module,exports){
(function (exports) {
	'use strict';

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	function b64ToByteArray(b64) {
		var i, j, l, tmp, placeHolders, arr;
	
		if (b64.length % 4 > 0) {
			throw 'Invalid string. Length must be a multiple of 4';
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		placeHolders = b64.indexOf('=');
		placeHolders = placeHolders > 0 ? b64.length - placeHolders : 0;

		// base64 is 4/3 + up to two characters of the original data
		arr = [];//new Uint8Array(b64.length * 3 / 4 - placeHolders);

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length;

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (lookup.indexOf(b64[i]) << 18) | (lookup.indexOf(b64[i + 1]) << 12) | (lookup.indexOf(b64[i + 2]) << 6) | lookup.indexOf(b64[i + 3]);
			arr.push((tmp & 0xFF0000) >> 16);
			arr.push((tmp & 0xFF00) >> 8);
			arr.push(tmp & 0xFF);
		}

		if (placeHolders === 2) {
			tmp = (lookup.indexOf(b64[i]) << 2) | (lookup.indexOf(b64[i + 1]) >> 4);
			arr.push(tmp & 0xFF);
		} else if (placeHolders === 1) {
			tmp = (lookup.indexOf(b64[i]) << 10) | (lookup.indexOf(b64[i + 1]) << 4) | (lookup.indexOf(b64[i + 2]) >> 2);
			arr.push((tmp >> 8) & 0xFF);
			arr.push(tmp & 0xFF);
		}

		return arr;
	}

	function uint8ToBase64(uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length;

		function tripletToBase64 (num) {
			return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
		};

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
			output += tripletToBase64(temp);
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1];
				output += lookup[temp >> 2];
				output += lookup[(temp << 4) & 0x3F];
				output += '==';
				break;
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1]);
				output += lookup[temp >> 10];
				output += lookup[(temp >> 4) & 0x3F];
				output += lookup[(temp << 2) & 0x3F];
				output += '=';
				break;
		}

		return output;
	}

	module.exports.toByteArray = b64ToByteArray;
	module.exports.fromByteArray = uint8ToBase64;
}());

},{}],35:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],36:[function(require,module,exports){
"use strict";

var invariant               = require('react/lib/invariant');
var NotFoundError           = require('react-app-controller/not-found-error');
var utils                   = require('react-app-controller/utils');
var factory                 = require('react-app-controller/factory');
var BaseInterface           = require('react-app-controller/interface');
var BaseRenderingInterface  = require('react-app-controller/rendering-interface');

/**
 * Creates a function that invokes two functions and ignores their return vales.
 *
 * @param {function} one Function to invoke first.
 * @param {function} two Function to invoke second.
 * @return {function} Function that invokes the two argument functions.
 * @private
 */
function createChainedFunction (one, two) {
  return function chainedFunction () {
    one.apply(this, arguments);
    two.apply(this, arguments);
  };
}

function noop () {}

var ControllerInterface = utils.extend(BaseInterface, {

  /**
   * Create a page for a specified request
   *
   * @param {Request} req
   * @private
   */
  createPageForRequest: function (req) {
    var match = this.router.match(req.path);

    if (!match) {
      throw new NotFoundError(req.path);
    }

    var props = utils.extend({request: req}, match.params);
    return new match.handler(this, props);
  },

  defaultRender: function () {
    return this.state.page.render();
  },

  componentWillUpdate: function (nextProps, nextState) {
    if (this.state.page !== nextState.page) {
      if (this.state.page.state) {
        if (typeof this.state.page.componentWillUnmount === 'function') {
          this.state.page.componentWillUnmount();
        }
      }

      if (typeof nextState.page.componentWillMount === 'function') {
        nextState.page.componentWillMount();
      }
    }
  },

  componentDidUpdate: function (prevProps, prevState) {
    if (prevState.page !== this.state.page) {
      if (prevState.page.state) {
        if (typeof prevState.page.componentDidUnmount === 'function') {
          prevState.page.componentDidUnmount();
        }
      }

      if (typeof this.state.page.componentDidMount === 'function') {
        this.state.page.componentDidMount(this.getDOMNode());
      }
    }
  }
});

function Page (controller, props) {
  this.controller = controller;
  this.state = controller.state;
  this.props = utils.assign(Object.create(controller.props), props);
}

Page.prototype = {
  getDOMNode: function () {
    return this.controller.getDOMNode();
  },

  isMounted: function () {
    return (this.controller.isMounted() && this.controller.state.page === this);
  },

  forceUpdate: function () {
    this.controller.forceUpdate();
  },

  setTitle: function (title) {
    document.title = title;
  }
};

var MANY = [
  'componentWillMount',
  'componentDidMount',
  'componentWillUnmount',
  'componentDidUnmount'
];

function mixSpecIntoComponent (Constructor, spec) {
  var proto = Constructor.prototype;
  for (var name in spec) {
    var property = spec[name];
    if (!spec.hasOwnProperty(name) || !property) {
      continue;
    }

    if (MANY.indexOf(name) > -1) {
      if (typeof proto[name] !== 'function') {
        proto[name] = noop;
      }
      proto[name] = createChainedFunction(proto[name], property);
    } else {
      proto[name] = property;
    }
  }
}

function createPage (spec) {
  invariant(
    typeof spec.render === 'function',
    'createPage(spec): `render` function should be provided'
  );

  function PageConstructor (controller, props) {
    Page.call(this, controller, props);
  }

  PageConstructor.prototype = utils.assign(Object.create(Page.prototype), spec);

  if (spec.hasOwnProperty('mixins')) {
    for (var i = 0; i < spec.mixins.length; i++) {
      mixSpecIntoComponent(PageConstructor, spec.mixins[i]);
    }
    delete PageConstructor.prototype.mixins;
  }

  return PageConstructor;
}

function createController (spec) {
  return factory(ControllerInterface, BaseRenderingInterface, spec);
}


module.exports = createController;
module.exports.createController = createController;
module.exports.createPage = createPage;

},{"react-app-controller/factory":37,"react-app-controller/interface":38,"react-app-controller/not-found-error":41,"react-app-controller/rendering-interface":42,"react-app-controller/utils":45,"react/lib/invariant":156}],37:[function(require,module,exports){
"use strict";

var React                 = require('react');
var invariant             = require('react/lib/invariant');
var createRouter          = require('./router');

/**
 * Create controller
 *
 * @param {Object} spec React component specification extended with `routes`
 *                      declarations
 */
function factory(iface, renderingIface, spec) {
  spec = spec || {};

  invariant(
    spec.routes || spec.router,
    'missing `routes` declaration for a react-app controller'
  );

  if (!spec.router && spec.routes)
    spec.router = createRouter(spec.routes);

  if (!spec.render)
    spec.render = iface.defaultRender;

  spec.mixins = spec.mixins || [];
  spec.mixins.unshift(iface);

  var cls = React.createClass(spec);

  for (var k in renderingIface)
    cls[k] = renderingIface[k];

  return cls;
}

module.exports = factory;

},{"./router":44,"react":175,"react/lib/invariant":156}],38:[function(require,module,exports){
"use strict";

var React                 = require('react');
var NotFoundError         = require('./not-found-error');
var utils                 = require('./utils');
var request               = require('./request');

module.exports = {

  getInitialState: function() {
    var req = this.props.request;
    var page = this.createPageForRequest(req);
    return {
      request: req,
      page: page
    };
  },

  /**
   * Default render implementation.
   *
   * Will be mixed in by createController function to workaround
   * ReactCompositeComponent policy which disallows render() method overrides.
   */
  defaultRender: function() {
    if (this.state.page !== null) {
      return React.DOM.div(null, this.state.page);
    } else if (typeof this.renderNotFound === 'function') {
      return this.renderNotFound();
    } else {
      throw new NotFoundError(this.state.request.path);
    }
  },

  componentDidMount: function() {
    window.addEventListener('popstate', this.onPopState);
  },

  componentWillUnmount: function() {
    window.removeEventListener('popstate', this.onPopState);
  },

  /**
   * Create a page for a specified request
   *
   * @param {Request} req
   * @private
   */
  createPageForRequest: function(req) {
    var match = this.router.match(req.path);

    if (!match) {
      return null;
    }

    return match.handler(utils.extend({request: req}, match.params));
  },

  /**
   * Process request
   *
   * @param {Request} req
   * @param {Callback?} cb
   *
   * @private
   */
  process: function(req, cb) {
    req = request.normalizeRequest(req);

    if (request.isEqual(this.state.request, req))
      return;

    var page = this.createPageForRequest(req);

    this.setState({
      request: req,
      page: page
    }, cb);
  },

  /**
   * Handle 'popstate' event
   *
   * @private
   */
  onPopState: function(e) {
    e.preventDefault();
    this.process();
  },

  /**
   * Navigate to a new URL
   *
   * @param {String|Request} URL
   * @param {Callback} cb
   */
  navigate: function(req, cb) {
    req = request.normalizeRequest(req);
    var url = request.createURLFromRequest(req);
    window.history.pushState(null, '', url);
    this.process(req, cb);
  },

  /**
   * Navigate to a new URL by updating querystring
   *
   * @param {Object} query Values for querystring
   * @param {Callback} cb
   */
  navigateQuery: function(query, cb) {
    var k, newQuery = {}
    for (k in this.activeRequest.query)
      newQuery[k] = this.activeRequest.query[k];
    for (k in query)
      newQuery[k] = query[k];
    var req= {path: this.activeRequest.path, query: newQuery};
    this.navigate(req, cb);
  }
};

},{"./not-found-error":41,"./request":43,"./utils":45,"react":175}],39:[function(require,module,exports){
// Generated by CoffeeScript 1.4.0
var common;

module.exports = common = {
  getNames: function(arg) {
    var names, regex, results;
    if (arg instanceof RegExp) {
      return [];
    }
    regex = /:([^\/]+)/g;
    names = [];
    results = regex.exec(arg);
    while (results != null) {
      names.push(results[1]);
      results = regex.exec(arg);
    }
    return names;
  },
  toRegexString: function(arg) {
    common.getNames(arg).forEach(function(name) {
      return arg = arg.replace(':' + name, '([^\/]+)');
    });
    return '^' + arg.replace(/\*/g, '.*') + '$';
  }
};

},{}],40:[function(require,module,exports){
// Generated by CoffeeScript 1.4.0
var common, pattern;

common = require('./common');

pattern = {
  match: function(url) {
    var bound, captured, i, match, _i, _ref;
    match = this.regex.exec(url);
    if (match == null) {
      return null;
    }
    captured = match.slice(1);
    if (this.isRegex) {
      return captured;
    }
    bound = {};
    for (i = _i = 0, _ref = captured.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      bound[this.names[i]] = captured[i];
    }
    return bound;
  }
};

module.exports = function(arg) {
  var isRegex, p;
  isRegex = arg instanceof RegExp;
  if (!(('string' === typeof arg) || isRegex)) {
    throw new TypeError('argument must be a regex or a string');
  }
  p = Object.create(pattern);
  p.isRegex = isRegex;
  p.regex = isRegex ? arg : new RegExp(common.toRegexString(arg));
  if (!isRegex) {
    p.names = common.getNames(arg);
  }
  return p;
};

},{"./common":39}],41:[function(require,module,exports){
"use strict";

/**
 * Error which will be thrown in case of no match found for a processed request.
 *
 * @param {String} url
 */
function NotFoundError(url) {
  Error.call(this, 'not found: ' + url);
  this.url = url;
}
NotFoundError.prototype = new Error();
NotFoundError.prototype.constructor = NotFoundError;
NotFoundError.prototype.name = 'NotFoundError';
NotFoundError.prototype.isNotFoundError = true;

module.exports = NotFoundError;

},{}],42:[function(require,module,exports){
"use strict";

var React                 = require('react');
var invariant             = require('react/lib/invariant');
var request               = require('./request');

module.exports = {

  /**
   * Render controller component into DOM element for specified request.
   *
   * If not request is specified than it will be constructed from
   * window.location.
   *
   * If no callback is specified and error is occurred then it will be thrown.
   *
   * @param {DOMElement} element
   * @param {Request?} req
   * @paran {Callback?}
   */
  render: function(element, req, cb) {
    var controller;

    if (typeof req === 'function') {
      cb = req;
      req = null;
    }

    try {
      controller = this({request: request.normalizeRequest(req)});
      controller = React.renderComponent(controller, element);
    } catch(err) {
      if (cb)
        return cb(err)
      else
        throw err;
    }

    cb && cb(null, controller);
  },

  /**
   * Render controller for specified request into markup string
   *
   * @param {Request} req
   * @param {Callback} cb callback receives object {markup: ..., request: ...}
   */
  renderToString: function(req, cb) {
    invariant(
      typeof cb === 'function',
      'provide callback as a last argument to renderToString(...)'
    );

    var controller = this({request: request.normalizeRequest(req)});
    try {
      React.renderComponentToString(controller, function(markup) {
        cb(null, {markup: markup, request: req, controller: controller});
      });
    } catch (err) {
      cb(err);
    }
  }
};

},{"./request":43,"react":175,"react/lib/invariant":156}],43:[function(require,module,exports){
"use strict";

var qs    = require('querystring');
var utils = require('./utils');

function createURLFromRequest(request) {
  var url = request.path;
  if (request.query)
    url = url + '?' + qs.stringify(request.query);
  return url;
}

/**
 * Create request from URL
 *
 * @param {String} url
 */
function createRequestFromURL(url) {
  if (url.indexOf('?') > -1) {
    var parts = url.split('?');
    return {
      path: parts[0],
      query: qs.parse(parts[1])
    };
  } else {
    return {
      path: url,
      query: undefined
    };
  }
}

/**
 * Create request from location (such as window.location)
 *
 * @param {Location} loc
 */
function createRequestFromLocation(loc) {
  return {
    path: loc.pathname,
    query: loc.search ? qs.parse(loc.search.slice(1)) : null
  };
}

function normalizeRequest(req) {
  if (utils.isString(req)) {
    req = createRequestFromURL(req);
  } else if (!req) {
    req = createRequestFromLocation(window.location);
  } else if (req && !req.path) {
    var data = req;
    req = createRequestFromLocation(window.location);
    for (var k in data)
      if (k !== 'path' && k !== 'query')
        req[k] = data[k];
  }
  return req;
}

function isEqual(a, b) {
  if (a.path !== b.path)
    return false;

  if (a.query !== b.query)
    return false;

  var k;

  for (k in a.query)
    if (a.query[k] !== b.query[k])
      return false;

  for (k in b.query)
    if (a.query[k] !== b.query[k])
      return false;

  return true;
}

module.exports = {
  isEqual: isEqual,
  normalizeRequest: normalizeRequest,
  createRequestFromURL: createRequestFromURL,
  createRequestFromLocation: createRequestFromLocation,
  createURLFromRequest: createURLFromRequest
};

},{"./utils":45,"querystring":30}],44:[function(require,module,exports){
/**
 * URL router
 *
 * 2013 (c) Andrey Popp <8mayday@gmail.com>
 */
"use strict";

var toPattern = require('url-pattern');

function Router(routes) {
  this.registered = [];

  if (routes) {
    for (var k in routes) {
      this.addRoute(k, routes[k]);
    }
  }
}

Router.prototype = {
  addRoute: function(pattern, handler) {
    this.registered.push({
      pattern: toPattern(pattern),
      handler: handler
    });
    return this;
  },

  match: function(path) {
    for (var i = 0, length = this.registered.length; i < length; i++) {
      var params = this.registered[i].pattern.match(path);
      if (params !== null) {
        return {handler: this.registered[i].handler, params: params};
      }
    }
  }
};

module.exports = function(routes) {
  return new Router(routes);
}

},{"url-pattern":40}],45:[function(require,module,exports){
"use strict";

/**
 * If object is a string
 *
 * @param {Object} obj
 */
function isString(obj) {
  return Object.prototype.toString.call(obj) === '[object String]';
}

function assign(dst, src) {
  for (var k in src)
    dst[k] = src[k];
  return dst;
}

function extend(a, b) {
  var result = {};

  assign(result, a);
  assign(result, b);

  return result;
}

module.exports = {
  isString: isString,
  extend: extend,
  assign: assign
};

},{}],46:[function(require,module,exports){
'use strict';

var copyProperties = require('./lib/copyProperties');

var WARNING_MESSAGE = (
  'It looks like you\'re trying to use jeffbski\'s React.js project.\n' +
  'The `react` npm package now points to the React JavaScript library for ' +
  'building user interfaces, not the React.js project for managing asynchronous ' +
  'control flow. If you\'re looking for that library, please npm install autoflow.'
);

function error() {
  throw new Error(WARNING_MESSAGE);
}

// Model the React.js project's public interface exactly.

function ReactJSShim() {
  error();
}

ReactJSShim.logEvents = error;
ReactJSShim.resolvePromises = error;
ReactJSShim.trackTasks = error;
ReactJSShim.createEventCollector = error;

// These could throw using defineProperty() but supporting older browsers will
// be painful. Additionally any error messages around this will contain the string
// so I think this is sufficient.
ReactJSShim.options = WARNING_MESSAGE;
ReactJSShim.events = WARNING_MESSAGE;

var ReactJSErrors = {
  wrap: function(module) {
    copyProperties(ReactJSShim, module);
    return ReactJSShim;
  }
};

module.exports = ReactJSErrors;

},{"./lib/copyProperties":135}],47:[function(require,module,exports){
var process=require("__browserify_process");module.exports = require('./lib/ReactWithAddons');
if ('production' !== process.env.NODE_ENV) {
  module.exports = require('./ReactJSErrors').wrap(module.exports);
}

},{"./ReactJSErrors":46,"./lib/ReactWithAddons":118,"__browserify_process":35}],48:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule $
 * @typechecks
 */

var ge = require("./ge");
var ex = require("./ex");

/**
 * Find a node by ID.
 *
 * If your application code depends on the existence of the element, use $,
 * which will throw if the element doesn't exist.
 *
 * If you're not sure whether or not the element exists, use ge instead, and
 * manually check for the element's existence in your application code.
 *
 * @param {string|DOMDocument|DOMElement|DOMTextNode|Comment} id
 * @return {DOMDocument|DOMElement|DOMTextNode|Comment}
 */
function $(id) {
  var element = ge(id);
  if (!element) {
    throw new Error(ex(
      'Tried to get element with id of "%s" but it is not present on the page.',
      id
    ));
  }
  return element;
}

module.exports = $;

},{"./ex":143,"./ge":147}],49:[function(require,module,exports){
var process=require("__browserify_process");/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule CSSCore
 * @typechecks
 */

var invariant = require("./invariant");

/**
 * The CSSCore module specifies the API (and implements most of the methods)
 * that should be used when dealing with the display of elements (via their
 * CSS classes and visibility on screeni. It is an API focused on mutating the
 * display and not reading it as no logical state should be encoded in the
 * display of elements.
 */

/**
 * Tests whether the element has the class specified.
 *
 * Note: This function is not exported in CSSCore because CSS classNames should
 * not store any logical information about the element. Use DataStore to store
 * information on an element.
 *
 * @param {DOMElement} element the element to set the class on
 * @param {string} className the CSS className
 * @returns {boolean} true if the element has the class, false if not
 */
function hasClass(element, className) {
  if (element.classList) {
    return !!className && element.classList.contains(className);
  }
  return (' ' + element.className + ' ').indexOf(' ' + className + ' ') > -1;
}

var CSSCore = {

  /**
   * Adds the class passed in to the element if it doesn't already have it.
   *
   * @param {DOMElement} element the element to set the class on
   * @param {string} className the CSS className
   * @return {DOMElement} the element passed in
   */
  addClass: function(element, className) {
    ("production" !== process.env.NODE_ENV ? invariant(
      !/\s/.test(className),
      'CSSCore.addClass takes only a single class name. "%s" contains ' +
      'multiple classes.', className
    ) : invariant(!/\s/.test(className)));

    if (className) {
      if (element.classList) {
        element.classList.add(className);
      } else if (!hasClass(element, className)) {
        element.className = element.className + ' ' + className;
      }
    }
    return element;
  },

  /**
   * Removes the class passed in from the element
   *
   * @param {DOMElement} element the element to set the class on
   * @param {string} className the CSS className
   * @return {DOMElement} the element passed in
   */
  removeClass: function(element, className) {
    ("production" !== process.env.NODE_ENV ? invariant(
      !/\s/.test(className),
      'CSSCore.removeClass takes only a single class name. "%s" contains ' +
      'multiple classes.', className
    ) : invariant(!/\s/.test(className)));

    if (className) {
      if (element.classList) {
        element.classList.remove(className);
      } else if (hasClass(element, className)) {
        element.className = element.className
          .replace(new RegExp('(^|\\s)' + className + '(?:\\s|$)', 'g'), '$1')
          .replace(/\s+/g, ' ') // multiple spaces to one
          .replace(/^\s*|\s*$/g, ''); // trim the ends
      }
    }
    return element;
  },

  /**
   * Helper to add or remove a class from an element based on a condition.
   *
   * @param {DOMElement} element the element to set the class on
   * @param {string} className the CSS className
   * @param {*} bool condition to whether to add or remove the class
   * @return {DOMElement} the element passed in
   */
  conditionClass: function(element, className, bool) {
    return (bool ? CSSCore.addClass : CSSCore.removeClass)(element, className);
  }
};

module.exports = CSSCore;

},{"./invariant":156,"__browserify_process":35}],50:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule CSSProperty
 */

"use strict";

/**
 * CSS properties which accept numbers but are not in units of "px".
 */
var isUnitlessNumber = {
  fillOpacity: true,
  fontWeight: true,
  lineHeight: true,
  opacity: true,
  orphans: true,
  zIndex: true,
  zoom: true
};

/**
 * Most style properties can be unset by doing .style[prop] = '' but IE8
 * doesn't like doing that with shorthand properties so for the properties that
 * IE8 breaks on, which are listed here, we instead unset each of the
 * individual properties. See http://bugs.jquery.com/ticket/12385.
 * The 4-value 'clock' properties like margin, padding, border-width seem to
 * behave without any problems. Curiously, list-style works too without any
 * special prodding.
 */
var shorthandPropertyExpansions = {
  background: {
    backgroundImage: true,
    backgroundPosition: true,
    backgroundRepeat: true,
    backgroundColor: true
  },
  border: {
    borderWidth: true,
    borderStyle: true,
    borderColor: true
  },
  borderBottom: {
    borderBottomWidth: true,
    borderBottomStyle: true,
    borderBottomColor: true
  },
  borderLeft: {
    borderLeftWidth: true,
    borderLeftStyle: true,
    borderLeftColor: true
  },
  borderRight: {
    borderRightWidth: true,
    borderRightStyle: true,
    borderRightColor: true
  },
  borderTop: {
    borderTopWidth: true,
    borderTopStyle: true,
    borderTopColor: true
  },
  font: {
    fontStyle: true,
    fontVariant: true,
    fontWeight: true,
    fontSize: true,
    lineHeight: true,
    fontFamily: true
  }
};

var CSSProperty = {
  isUnitlessNumber: isUnitlessNumber,
  shorthandPropertyExpansions: shorthandPropertyExpansions
};

module.exports = CSSProperty;

},{}],51:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule CSSPropertyOperations
 * @typechecks static-only
 */

"use strict";

var CSSProperty = require("./CSSProperty");

var dangerousStyleValue = require("./dangerousStyleValue");
var escapeTextForBrowser = require("./escapeTextForBrowser");
var hyphenate = require("./hyphenate");
var memoizeStringOnly = require("./memoizeStringOnly");

var processStyleName = memoizeStringOnly(function(styleName) {
  return escapeTextForBrowser(hyphenate(styleName));
});

/**
 * Operations for dealing with CSS properties.
 */
var CSSPropertyOperations = {

  /**
   * Serializes a mapping of style properties for use as inline styles:
   *
   *   > createMarkupForStyles({width: '200px', height: 0})
   *   "width:200px;height:0;"
   *
   * Undefined values are ignored so that declarative programming is easier.
   *
   * @param {object} styles
   * @return {?string}
   */
  createMarkupForStyles: function(styles) {
    var serialized = '';
    for (var styleName in styles) {
      if (!styles.hasOwnProperty(styleName)) {
        continue;
      }
      var styleValue = styles[styleName];
      if (styleValue != null) {
        serialized += processStyleName(styleName) + ':';
        serialized += dangerousStyleValue(styleName, styleValue) + ';';
      }
    }
    return serialized || null;
  },

  /**
   * Sets the value for multiple styles on a node.  If a value is specified as
   * '' (empty string), the corresponding style property will be unset.
   *
   * @param {DOMElement} node
   * @param {object} styles
   */
  setValueForStyles: function(node, styles) {
    var style = node.style;
    for (var styleName in styles) {
      if (!styles.hasOwnProperty(styleName)) {
        continue;
      }
      var styleValue = dangerousStyleValue(styleName, styles[styleName]);
      if (styleValue) {
        style[styleName] = styleValue;
      } else {
        var expansion = CSSProperty.shorthandPropertyExpansions[styleName];
        if (expansion) {
          // Shorthand property that IE8 won't like unsetting, so unset each
          // component to placate it
          for (var individualStyleName in expansion) {
            style[individualStyleName] = '';
          }
        } else {
          style[styleName] = '';
        }
      }
    }
  }

};

module.exports = CSSPropertyOperations;

},{"./CSSProperty":50,"./dangerousStyleValue":140,"./escapeTextForBrowser":142,"./hyphenate":155,"./memoizeStringOnly":164}],52:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule CallbackRegistry
 * @typechecks static-only
 */

"use strict";

var listenerBank = {};

/**
 * Stores "listeners" by `registrationName`/`id`. There should be at most one
 * "listener" per `registrationName`/`id` in the `listenerBank`.
 *
 * Access listeners via `listenerBank[registrationName][id]`.
 *
 * @class CallbackRegistry
 * @internal
 */
var CallbackRegistry = {

  /**
   * Stores `listener` at `listenerBank[registrationName][id]`. Is idempotent.
   *
   * @param {string} id ID of the DOM element.
   * @param {string} registrationName Name of listener (e.g. `onClick`).
   * @param {?function} listener The callback to store.
   */
  putListener: function(id, registrationName, listener) {
    var bankForRegistrationName =
      listenerBank[registrationName] || (listenerBank[registrationName] = {});
    bankForRegistrationName[id] = listener;
  },

  /**
   * @param {string} id ID of the DOM element.
   * @param {string} registrationName Name of listener (e.g. `onClick`).
   * @return {?function} The stored callback.
   */
  getListener: function(id, registrationName) {
    var bankForRegistrationName = listenerBank[registrationName];
    return bankForRegistrationName && bankForRegistrationName[id];
  },

  /**
   * Deletes a listener from the registration bank.
   *
   * @param {string} id ID of the DOM element.
   * @param {string} registrationName Name of listener (e.g. `onClick`).
   */
  deleteListener: function(id, registrationName) {
    var bankForRegistrationName = listenerBank[registrationName];
    if (bankForRegistrationName) {
      delete bankForRegistrationName[id];
    }
  },

  /**
   * Deletes all listeners for the DOM element with the supplied ID.
   *
   * @param {string} id ID of the DOM element.
   */
  deleteAllListeners: function(id) {
    for (var registrationName in listenerBank) {
      delete listenerBank[registrationName][id];
    }
  },

  /**
   * This is needed for tests only. Do not use!
   */
  __purge: function() {
    listenerBank = {};
  }

};

module.exports = CallbackRegistry;

},{}],53:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ChangeEventPlugin
 */

"use strict";

var EventConstants = require("./EventConstants");
var EventPluginHub = require("./EventPluginHub");
var EventPropagators = require("./EventPropagators");
var ExecutionEnvironment = require("./ExecutionEnvironment");
var SyntheticEvent = require("./SyntheticEvent");

var isEventSupported = require("./isEventSupported");
var isTextInputElement = require("./isTextInputElement");
var keyOf = require("./keyOf");

var topLevelTypes = EventConstants.topLevelTypes;

var eventTypes = {
  change: {
    phasedRegistrationNames: {
      bubbled: keyOf({onChange: null}),
      captured: keyOf({onChangeCapture: null})
    }
  }
};

/**
 * For IE shims
 */
var activeElement = null;
var activeElementID = null;
var activeElementValue = null;
var activeElementValueProp = null;

/**
 * SECTION: handle `change` event
 */
function shouldUseChangeEvent(elem) {
  return (
    elem.nodeName === 'SELECT' ||
    (elem.nodeName === 'INPUT' && elem.type === 'file')
  );
}

var doesChangeEventBubble = false;
if (ExecutionEnvironment.canUseDOM) {
  // See `handleChange` comment below
  doesChangeEventBubble = isEventSupported('change') && (
    !('documentMode' in document) || document.documentMode > 8
  );
}

function manualDispatchChangeEvent(nativeEvent) {
  var event = SyntheticEvent.getPooled(
    eventTypes.change,
    activeElementID,
    nativeEvent
  );
  EventPropagators.accumulateTwoPhaseDispatches(event);

  // If change bubbled, we'd just bind to it like all the other events
  // and have it go through ReactEventTopLevelCallback. Since it doesn't, we
  // manually listen for the change event and so we have to enqueue and
  // process the abstract event manually.
  EventPluginHub.enqueueEvents(event);
  EventPluginHub.processEventQueue();
}

function startWatchingForChangeEventIE8(target, targetID) {
  activeElement = target;
  activeElementID = targetID;
  activeElement.attachEvent('onchange', manualDispatchChangeEvent);
}

function stopWatchingForChangeEventIE8() {
  if (!activeElement) {
    return;
  }
  activeElement.detachEvent('onchange', manualDispatchChangeEvent);
  activeElement = null;
  activeElementID = null;
}

function getTargetIDForChangeEvent(
    topLevelType,
    topLevelTarget,
    topLevelTargetID) {
  if (topLevelType === topLevelTypes.topChange) {
    return topLevelTargetID;
  }
}
function handleEventsForChangeEventIE8(
    topLevelType,
    topLevelTarget,
    topLevelTargetID) {
  if (topLevelType === topLevelTypes.topFocus) {
    // stopWatching() should be a noop here but we call it just in case we
    // missed a blur event somehow.
    stopWatchingForChangeEventIE8();
    startWatchingForChangeEventIE8(topLevelTarget, topLevelTargetID);
  } else if (topLevelType === topLevelTypes.topBlur) {
    stopWatchingForChangeEventIE8();
  }
}


/**
 * SECTION: handle `input` event
 */
var isInputEventSupported = false;
if (ExecutionEnvironment.canUseDOM) {
  // IE9 claims to support the input event but fails to trigger it when
  // deleting text, so we ignore its input events
  isInputEventSupported = isEventSupported('input') && (
    !('documentMode' in document) || document.documentMode > 9
  );
}

/**
 * (For old IE.) Replacement getter/setter for the `value` property that gets
 * set on the active element.
 */
var newValueProp =  {
  get: function() {
    return activeElementValueProp.get.call(this);
  },
  set: function(val) {
    // Cast to a string so we can do equality checks.
    activeElementValue = '' + val;
    activeElementValueProp.set.call(this, val);
  }
};

/**
 * (For old IE.) Starts tracking propertychange events on the passed-in element
 * and override the value property so that we can distinguish user events from
 * value changes in JS.
 */
function startWatchingForValueChange(target, targetID) {
  activeElement = target;
  activeElementID = targetID;
  activeElementValue = target.value;
  activeElementValueProp = Object.getOwnPropertyDescriptor(
    target.constructor.prototype,
    'value'
  );

  Object.defineProperty(activeElement, 'value', newValueProp);
  activeElement.attachEvent('onpropertychange', handlePropertyChange);
}

/**
 * (For old IE.) Removes the event listeners from the currently-tracked element,
 * if any exists.
 */
function stopWatchingForValueChange() {
  if (!activeElement) {
    return;
  }

  // delete restores the original property definition
  delete activeElement.value;
  activeElement.detachEvent('onpropertychange', handlePropertyChange);

  activeElement = null;
  activeElementID = null;
  activeElementValue = null;
  activeElementValueProp = null;
}

/**
 * (For old IE.) Handles a propertychange event, sending a `change` event if
 * the value of the active element has changed.
 */
function handlePropertyChange(nativeEvent) {
  if (nativeEvent.propertyName !== 'value') {
    return;
  }
  var value = nativeEvent.srcElement.value;
  if (value === activeElementValue) {
    return;
  }
  activeElementValue = value;

  manualDispatchChangeEvent(nativeEvent);
}

/**
 * If a `change` event should be fired, returns the target's ID.
 */
function getTargetIDForInputEvent(
    topLevelType,
    topLevelTarget,
    topLevelTargetID) {
  if (topLevelType === topLevelTypes.topInput) {
    // In modern browsers (i.e., not IE8 or IE9), the input event is exactly
    // what we want so fall through here and trigger an abstract event
    return topLevelTargetID;
  }
}

// For IE8 and IE9.
function handleEventsForInputEventIE(
    topLevelType,
    topLevelTarget,
    topLevelTargetID) {
  if (topLevelType === topLevelTypes.topFocus) {
    // In IE8, we can capture almost all .value changes by adding a
    // propertychange handler and looking for events with propertyName
    // equal to 'value'
    // In IE9, propertychange fires for most input events but is buggy and
    // doesn't fire when text is deleted, but conveniently, selectionchange
    // appears to fire in all of the remaining cases so we catch those and
    // forward the event if the value has changed
    // In either case, we don't want to call the event handler if the value
    // is changed from JS so we redefine a setter for `.value` that updates
    // our activeElementValue variable, allowing us to ignore those changes
    //
    // stopWatching() should be a noop here but we call it just in case we
    // missed a blur event somehow.
    stopWatchingForValueChange();
    startWatchingForValueChange(topLevelTarget, topLevelTargetID);
  } else if (topLevelType === topLevelTypes.topBlur) {
    stopWatchingForValueChange();
  }
}

// For IE8 and IE9.
function getTargetIDForInputEventIE(
    topLevelType,
    topLevelTarget,
    topLevelTargetID) {
  if (topLevelType === topLevelTypes.topSelectionChange ||
      topLevelType === topLevelTypes.topKeyUp ||
      topLevelType === topLevelTypes.topKeyDown) {
    // On the selectionchange event, the target is just document which isn't
    // helpful for us so just check activeElement instead.
    //
    // 99% of the time, keydown and keyup aren't necessary. IE8 fails to fire
    // propertychange on the first input event after setting `value` from a
    // script and fires only keydown, keypress, keyup. Catching keyup usually
    // gets it and catching keydown lets us fire an event for the first
    // keystroke if user does a key repeat (it'll be a little delayed: right
    // before the second keystroke). Other input methods (e.g., paste) seem to
    // fire selectionchange normally.
    if (activeElement && activeElement.value !== activeElementValue) {
      activeElementValue = activeElement.value;
      return activeElementID;
    }
  }
}


/**
 * SECTION: handle `click` event
 */
function shouldUseClickEvent(elem) {
  // Use the `click` event to detect changes to checkbox and radio inputs.
  // This approach works across all browsers, whereas `change` does not fire
  // until `blur` in IE8.
  return (
    elem.nodeName === 'INPUT' &&
    (elem.type === 'checkbox' || elem.type === 'radio')
  );
}

function getTargetIDForClickEvent(
    topLevelType,
    topLevelTarget,
    topLevelTargetID) {
  if (topLevelType === topLevelTypes.topClick) {
    return topLevelTargetID;
  }
}

/**
 * This plugin creates an `onChange` event that normalizes change events
 * across form elements. This event fires at a time when it's possible to
 * change the element's value without seeing a flicker.
 *
 * Supported elements are:
 * - input (see `isTextInputElement`)
 * - textarea
 * - select
 */
var ChangeEventPlugin = {

  eventTypes: eventTypes,

  /**
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {DOMEventTarget} topLevelTarget The listening component root node.
   * @param {string} topLevelTargetID ID of `topLevelTarget`.
   * @param {object} nativeEvent Native browser event.
   * @return {*} An accumulation of synthetic events.
   * @see {EventPluginHub.extractEvents}
   */
  extractEvents: function(
      topLevelType,
      topLevelTarget,
      topLevelTargetID,
      nativeEvent) {

    var getTargetIDFunc, handleEventFunc;
    if (shouldUseChangeEvent(topLevelTarget)) {
      if (doesChangeEventBubble) {
        getTargetIDFunc = getTargetIDForChangeEvent;
      } else {
        handleEventFunc = handleEventsForChangeEventIE8;
      }
    } else if (isTextInputElement(topLevelTarget)) {
      if (isInputEventSupported) {
        getTargetIDFunc = getTargetIDForInputEvent;
      } else {
        getTargetIDFunc = getTargetIDForInputEventIE;
        handleEventFunc = handleEventsForInputEventIE;
      }
    } else if (shouldUseClickEvent(topLevelTarget)) {
      getTargetIDFunc = getTargetIDForClickEvent;
    }

    if (getTargetIDFunc) {
      var targetID = getTargetIDFunc(
        topLevelType,
        topLevelTarget,
        topLevelTargetID
      );
      if (targetID) {
        var event = SyntheticEvent.getPooled(
          eventTypes.change,
          targetID,
          nativeEvent
        );
        EventPropagators.accumulateTwoPhaseDispatches(event);
        return event;
      }
    }

    if (handleEventFunc) {
      handleEventFunc(
        topLevelType,
        topLevelTarget,
        topLevelTargetID
      );
    }
  }

};

module.exports = ChangeEventPlugin;

},{"./EventConstants":62,"./EventPluginHub":64,"./EventPropagators":67,"./ExecutionEnvironment":68,"./SyntheticEvent":123,"./isEventSupported":157,"./isTextInputElement":159,"./keyOf":163}],54:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule CompositionEventPlugin
 * @typechecks static-only
 */

"use strict";

var EventConstants = require("./EventConstants");
var EventPropagators = require("./EventPropagators");
var ExecutionEnvironment = require("./ExecutionEnvironment");
var ReactInputSelection = require("./ReactInputSelection");
var SyntheticCompositionEvent = require("./SyntheticCompositionEvent");

var getTextContentAccessor = require("./getTextContentAccessor");
var keyOf = require("./keyOf");

var END_KEYCODES = [9, 13, 27, 32]; // Tab, Return, Esc, Space
var START_KEYCODE = 229;

var useCompositionEvent = ExecutionEnvironment.canUseDOM &&
  'CompositionEvent' in window;
var topLevelTypes = EventConstants.topLevelTypes;
var currentComposition = null;

// Events and their corresponding property names.
var eventTypes = {
  compositionEnd: {
    phasedRegistrationNames: {
      bubbled: keyOf({onCompositionEnd: null}),
      captured: keyOf({onCompositionEndCapture: null})
    }
  },
  compositionStart: {
    phasedRegistrationNames: {
      bubbled: keyOf({onCompositionStart: null}),
      captured: keyOf({onCompositionStartCapture: null})
    }
  },
  compositionUpdate: {
    phasedRegistrationNames: {
      bubbled: keyOf({onCompositionUpdate: null}),
      captured: keyOf({onCompositionUpdateCapture: null})
    }
  }
};

/**
 * Translate native top level events into event types.
 *
 * @param {string} topLevelType
 * @return {object}
 */
function getCompositionEventType(topLevelType) {
  switch (topLevelType) {
    case topLevelTypes.topCompositionStart:
      return eventTypes.compositionStart;
    case topLevelTypes.topCompositionEnd:
      return eventTypes.compositionEnd;
    case topLevelTypes.topCompositionUpdate:
      return eventTypes.compositionUpdate;
  }
}

/**
 * Does our fallback best-guess model think this event signifies that
 * composition has begun?
 *
 * @param {string} topLevelType
 * @param {object} nativeEvent
 * @return {boolean}
 */
function isFallbackStart(topLevelType, nativeEvent) {
  return (
    topLevelType === topLevelTypes.topKeyDown &&
    nativeEvent.keyCode === START_KEYCODE
  );
}

/**
 * Does our fallback mode think that this event is the end of composition?
 *
 * @param {string} topLevelType
 * @param {object} nativeEvent
 * @return {boolean}
 */
function isFallbackEnd(topLevelType, nativeEvent) {
  switch (topLevelType) {
    case topLevelTypes.topKeyUp:
      // Command keys insert or clear IME input.
      return (END_KEYCODES.indexOf(nativeEvent.keyCode) !== -1);
    case topLevelTypes.topKeyDown:
      // Expect IME keyCode on each keydown. If we get any other
      // code we must have exited earlier.
      return (nativeEvent.keyCode !== START_KEYCODE);
    case topLevelTypes.topKeyPress:
    case topLevelTypes.topMouseDown:
    case topLevelTypes.topBlur:
      // Events are not possible without cancelling IME.
      return true;
    default:
      return false;
  }
}

/**
 * Helper class stores information about selection and document state
 * so we can figure out what changed at a later date.
 *
 * @param {DOMEventTarget} root
 */
function FallbackCompositionState(root) {
  this.root = root;
  this.startSelection = ReactInputSelection.getSelection(root);
  this.startValue = this.getText();
}

/**
 * Get current text of input.
 *
 * @return {string}
 */
FallbackCompositionState.prototype.getText = function() {
  return this.root.value || this.root[getTextContentAccessor()];
};

/**
 * Text that has changed since the start of composition.
 *
 * @return {string}
 */
FallbackCompositionState.prototype.getData = function() {
  var endValue = this.getText();
  var prefixLength = this.startSelection.start;
  var suffixLength = this.startValue.length - this.startSelection.end;

  return endValue.substr(
    prefixLength,
    endValue.length - suffixLength - prefixLength
  );
};

/**
 * This plugin creates `onCompositionStart`, `onCompositionUpdate` and
 * `onCompositionEnd` events on inputs, textareas and contentEditable
 * nodes.
 */
var CompositionEventPlugin = {

  eventTypes: eventTypes,

  /**
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {DOMEventTarget} topLevelTarget The listening component root node.
   * @param {string} topLevelTargetID ID of `topLevelTarget`.
   * @param {object} nativeEvent Native browser event.
   * @return {*} An accumulation of synthetic events.
   * @see {EventPluginHub.extractEvents}
   */
  extractEvents: function(
      topLevelType,
      topLevelTarget,
      topLevelTargetID,
      nativeEvent) {

    var eventType;
    var data;

    if (useCompositionEvent) {
      eventType = getCompositionEventType(topLevelType);
    } else if (!currentComposition) {
      if (isFallbackStart(topLevelType, nativeEvent)) {
        eventType = eventTypes.start;
        currentComposition = new FallbackCompositionState(topLevelTarget);
      }
    } else if (isFallbackEnd(topLevelType, nativeEvent)) {
      eventType = eventTypes.compositionEnd;
      data = currentComposition.getData();
      currentComposition = null;
    }

    if (eventType) {
      var event = SyntheticCompositionEvent.getPooled(
        eventType,
        topLevelTargetID,
        nativeEvent
      );
      if (data) {
        // Inject data generated from fallback path into the synthetic event.
        // This matches the property of native CompositionEventInterface.
        event.data = data;
      }
      EventPropagators.accumulateTwoPhaseDispatches(event);
      return event;
    }
  }
};

module.exports = CompositionEventPlugin;

},{"./EventConstants":62,"./EventPropagators":67,"./ExecutionEnvironment":68,"./ReactInputSelection":97,"./SyntheticCompositionEvent":122,"./getTextContentAccessor":153,"./keyOf":163}],55:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule DOMChildrenOperations
 * @typechecks static-only
 */

"use strict";

var Danger = require("./Danger");
var ReactMultiChildUpdateTypes = require("./ReactMultiChildUpdateTypes");

var getTextContentAccessor = require("./getTextContentAccessor");

/**
 * The DOM property to use when setting text content.
 *
 * @type {string}
 * @private
 */
var textContentAccessor = getTextContentAccessor() || 'NA';

/**
 * Inserts `childNode` as a child of `parentNode` at the `index`.
 *
 * @param {DOMElement} parentNode Parent node in which to insert.
 * @param {DOMElement} childNode Child node to insert.
 * @param {number} index Index at which to insert the child.
 * @internal
 */
function insertChildAt(parentNode, childNode, index) {
  var childNodes = parentNode.childNodes;
  if (childNodes[index] === childNode) {
    return;
  }
  // If `childNode` is already a child of `parentNode`, remove it so that
  // computing `childNodes[index]` takes into account the removal.
  if (childNode.parentNode === parentNode) {
    parentNode.removeChild(childNode);
  }
  if (index >= childNodes.length) {
    parentNode.appendChild(childNode);
  } else {
    parentNode.insertBefore(childNode, childNodes[index]);
  }
}

/**
 * Operations for updating with DOM children.
 */
var DOMChildrenOperations = {

  dangerouslyReplaceNodeWithMarkup: Danger.dangerouslyReplaceNodeWithMarkup,

  /**
   * Updates a component's children by processing a series of updates. The
   * update configurations are each expected to have a `parentNode` property.
   *
   * @param {array<object>} updates List of update configurations.
   * @param {array<string>} markupList List of markup strings.
   * @internal
   */
  processUpdates: function(updates, markupList) {
    var update;
    // Mapping from parent IDs to initial child orderings.
    var initialChildren = null;
    // List of children that will be moved or removed.
    var updatedChildren = null;

    for (var i = 0; update = updates[i]; i++) {
      if (update.type === ReactMultiChildUpdateTypes.MOVE_EXISTING ||
          update.type === ReactMultiChildUpdateTypes.REMOVE_NODE) {
        var updatedIndex = update.fromIndex;
        var updatedChild = update.parentNode.childNodes[updatedIndex];
        var parentID = update.parentID;

        initialChildren = initialChildren || {};
        initialChildren[parentID] = initialChildren[parentID] || [];
        initialChildren[parentID][updatedIndex] = updatedChild;

        updatedChildren = updatedChildren || [];
        updatedChildren.push(updatedChild);
      }
    }

    var renderedMarkup = Danger.dangerouslyRenderMarkup(markupList);

    // Remove updated children first so that `toIndex` is consistent.
    if (updatedChildren) {
      for (var j = 0; j < updatedChildren.length; j++) {
        updatedChildren[j].parentNode.removeChild(updatedChildren[j]);
      }
    }

    for (var k = 0; update = updates[k]; k++) {
      switch (update.type) {
        case ReactMultiChildUpdateTypes.INSERT_MARKUP:
          insertChildAt(
            update.parentNode,
            renderedMarkup[update.markupIndex],
            update.toIndex
          );
          break;
        case ReactMultiChildUpdateTypes.MOVE_EXISTING:
          insertChildAt(
            update.parentNode,
            initialChildren[update.parentID][update.fromIndex],
            update.toIndex
          );
          break;
        case ReactMultiChildUpdateTypes.TEXT_CONTENT:
          update.parentNode[textContentAccessor] = update.textContent;
          break;
        case ReactMultiChildUpdateTypes.REMOVE_NODE:
          // Already removed by the for-loop above.
          break;
      }
    }
  }

};

module.exports = DOMChildrenOperations;

},{"./Danger":58,"./ReactMultiChildUpdateTypes":104,"./getTextContentAccessor":153}],56:[function(require,module,exports){
var process=require("__browserify_process");/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule DOMProperty
 * @typechecks static-only
 */

/*jslint bitwise: true */

"use strict";

var invariant = require("./invariant");

var DOMPropertyInjection = {
  /**
   * Mapping from normalized, camelcased property names to a configuration that
   * specifies how the associated DOM property should be accessed or rendered.
   */
  MUST_USE_ATTRIBUTE: 0x1,
  MUST_USE_PROPERTY: 0x2,
  HAS_SIDE_EFFECTS: 0x4,
  HAS_BOOLEAN_VALUE: 0x8,
  HAS_POSITIVE_NUMERIC_VALUE: 0x10,

  /**
   * Inject some specialized knowledge about the DOM. This takes a config object
   * with the following properties:
   *
   * isCustomAttribute: function that given an attribute name will return true
   * if it can be inserted into the DOM verbatim. Useful for data-* or aria-*
   * attributes where it's impossible to enumerate all of the possible
   * attribute names,
   *
   * Properties: object mapping DOM property name to one of the
   * DOMPropertyInjection constants or null. If your attribute isn't in here,
   * it won't get written to the DOM.
   *
   * DOMAttributeNames: object mapping React attribute name to the DOM
   * attribute name. Attribute names not specified use the **lowercase**
   * normalized name.
   *
   * DOMPropertyNames: similar to DOMAttributeNames but for DOM properties.
   * Property names not specified use the normalized name.
   *
   * DOMMutationMethods: Properties that require special mutation methods. If
   * `value` is undefined, the mutation method should unset the property.
   *
   * @param {object} domPropertyConfig the config as described above.
   */
  injectDOMPropertyConfig: function(domPropertyConfig) {
    var Properties = domPropertyConfig.Properties || {};
    var DOMAttributeNames = domPropertyConfig.DOMAttributeNames || {};
    var DOMPropertyNames = domPropertyConfig.DOMPropertyNames || {};
    var DOMMutationMethods = domPropertyConfig.DOMMutationMethods || {};

    if (domPropertyConfig.isCustomAttribute) {
      DOMProperty._isCustomAttributeFunctions.push(
        domPropertyConfig.isCustomAttribute
      );
    }

    for (var propName in Properties) {
      ("production" !== process.env.NODE_ENV ? invariant(
        !DOMProperty.isStandardName[propName],
        'injectDOMPropertyConfig(...): You\'re trying to inject DOM property ' +
        '\'%s\' which has already been injected. You may be accidentally ' +
        'injecting the same DOM property config twice, or you may be ' +
        'injecting two configs that have conflicting property names.',
        propName
      ) : invariant(!DOMProperty.isStandardName[propName]));

      DOMProperty.isStandardName[propName] = true;

      var lowerCased = propName.toLowerCase();
      DOMProperty.getPossibleStandardName[lowerCased] = propName;

      var attributeName = DOMAttributeNames[propName];
      if (attributeName) {
        DOMProperty.getPossibleStandardName[attributeName] = propName;
      }

      DOMProperty.getAttributeName[propName] = attributeName || lowerCased;

      DOMProperty.getPropertyName[propName] =
        DOMPropertyNames[propName] || propName;

      var mutationMethod = DOMMutationMethods[propName];
      if (mutationMethod) {
        DOMProperty.getMutationMethod[propName] = mutationMethod;
      }

      var propConfig = Properties[propName];
      DOMProperty.mustUseAttribute[propName] =
        propConfig & DOMPropertyInjection.MUST_USE_ATTRIBUTE;
      DOMProperty.mustUseProperty[propName] =
        propConfig & DOMPropertyInjection.MUST_USE_PROPERTY;
      DOMProperty.hasSideEffects[propName] =
        propConfig & DOMPropertyInjection.HAS_SIDE_EFFECTS;
      DOMProperty.hasBooleanValue[propName] =
        propConfig & DOMPropertyInjection.HAS_BOOLEAN_VALUE;
      DOMProperty.hasPositiveNumericValue[propName] =
        propConfig & DOMPropertyInjection.HAS_POSITIVE_NUMERIC_VALUE;

      ("production" !== process.env.NODE_ENV ? invariant(
        !DOMProperty.mustUseAttribute[propName] ||
          !DOMProperty.mustUseProperty[propName],
        'DOMProperty: Cannot require using both attribute and property: %s',
        propName
      ) : invariant(!DOMProperty.mustUseAttribute[propName] ||
        !DOMProperty.mustUseProperty[propName]));
      ("production" !== process.env.NODE_ENV ? invariant(
        DOMProperty.mustUseProperty[propName] ||
          !DOMProperty.hasSideEffects[propName],
        'DOMProperty: Properties that have side effects must use property: %s',
        propName
      ) : invariant(DOMProperty.mustUseProperty[propName] ||
        !DOMProperty.hasSideEffects[propName]));
      ("production" !== process.env.NODE_ENV ? invariant(
        !DOMProperty.hasBooleanValue[propName] ||
          !DOMProperty.hasPositiveNumericValue[propName],
        'DOMProperty: Cannot have both boolean and positive numeric value: %s',
        propName
      ) : invariant(!DOMProperty.hasBooleanValue[propName] ||
        !DOMProperty.hasPositiveNumericValue[propName]));
    }
  }
};
var defaultValueCache = {};

/**
 * DOMProperty exports lookup objects that can be used like functions:
 *
 *   > DOMProperty.isValid['id']
 *   true
 *   > DOMProperty.isValid['foobar']
 *   undefined
 *
 * Although this may be confusing, it performs better in general.
 *
 * @see http://jsperf.com/key-exists
 * @see http://jsperf.com/key-missing
 */
var DOMProperty = {

  /**
   * Checks whether a property name is a standard property.
   * @type {Object}
   */
  isStandardName: {},

  /**
   * Mapping from lowercase property names to the properly cased version, used
   * to warn in the case of missing properties.
   * @type {Object}
   */
  getPossibleStandardName: {},

  /**
   * Mapping from normalized names to attribute names that differ. Attribute
   * names are used when rendering markup or with `*Attribute()`.
   * @type {Object}
   */
  getAttributeName: {},

  /**
   * Mapping from normalized names to properties on DOM node instances.
   * (This includes properties that mutate due to external factors.)
   * @type {Object}
   */
  getPropertyName: {},

  /**
   * Mapping from normalized names to mutation methods. This will only exist if
   * mutation cannot be set simply by the property or `setAttribute()`.
   * @type {Object}
   */
  getMutationMethod: {},

  /**
   * Whether the property must be accessed and mutated as an object property.
   * @type {Object}
   */
  mustUseAttribute: {},

  /**
   * Whether the property must be accessed and mutated using `*Attribute()`.
   * (This includes anything that fails `<propName> in <element>`.)
   * @type {Object}
   */
  mustUseProperty: {},

  /**
   * Whether or not setting a value causes side effects such as triggering
   * resources to be loaded or text selection changes. We must ensure that
   * the value is only set if it has changed.
   * @type {Object}
   */
  hasSideEffects: {},

  /**
   * Whether the property should be removed when set to a falsey value.
   * @type {Object}
   */
  hasBooleanValue: {},

  /**
   * Whether the property must be positive numeric or parse as a positive
   * numeric and should be removed when set to a falsey value.
   * @type {Object}
   */
  hasPositiveNumericValue: {},

  /**
   * All of the isCustomAttribute() functions that have been injected.
   */
  _isCustomAttributeFunctions: [],

  /**
   * Checks whether a property name is a custom attribute.
   * @method
   */
  isCustomAttribute: function(attributeName) {
    return DOMProperty._isCustomAttributeFunctions.some(
      function(isCustomAttributeFn) {
        return isCustomAttributeFn.call(null, attributeName);
      }
    );
  },

  /**
   * Returns the default property value for a DOM property (i.e., not an
   * attribute). Most default values are '' or false, but not all. Worse yet,
   * some (in particular, `type`) vary depending on the type of element.
   *
   * TODO: Is it better to grab all the possible properties when creating an
   * element to avoid having to create the same element twice?
   */
  getDefaultValueForProperty: function(nodeName, prop) {
    var nodeDefaults = defaultValueCache[nodeName];
    var testElement;
    if (!nodeDefaults) {
      defaultValueCache[nodeName] = nodeDefaults = {};
    }
    if (!(prop in nodeDefaults)) {
      testElement = document.createElement(nodeName);
      nodeDefaults[prop] = testElement[prop];
    }
    return nodeDefaults[prop];
  },

  injection: DOMPropertyInjection
};

module.exports = DOMProperty;

},{"./invariant":156,"__browserify_process":35}],57:[function(require,module,exports){
var process=require("__browserify_process");/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule DOMPropertyOperations
 * @typechecks static-only
 */

"use strict";

var DOMProperty = require("./DOMProperty");

var escapeTextForBrowser = require("./escapeTextForBrowser");
var memoizeStringOnly = require("./memoizeStringOnly");

function shouldIgnoreValue(name, value) {
  return value == null ||
    DOMProperty.hasBooleanValue[name] && !value ||
    DOMProperty.hasPositiveNumericValue[name] && (isNaN(value) || value < 1);
}

var processAttributeNameAndPrefix = memoizeStringOnly(function(name) {
  return escapeTextForBrowser(name) + '="';
});

if ("production" !== process.env.NODE_ENV) {
  var reactProps = {
    __owner__: true,
    children: true,
    dangerouslySetInnerHTML: true,
    key: true,
    ref: true
  };
  var warnedProperties = {};

  var warnUnknownProperty = function(name) {
    if (reactProps[name] || warnedProperties[name]) {
      return;
    }

    warnedProperties[name] = true;
    var lowerCasedName = name.toLowerCase();

    // data-* attributes should be lowercase; suggest the lowercase version
    var standardName = DOMProperty.isCustomAttribute(lowerCasedName) ?
      lowerCasedName : DOMProperty.getPossibleStandardName[lowerCasedName];

    // For now, only warn when we have a suggested correction. This prevents
    // logging too much when using transferPropsTo.
    if (standardName != null) {
      console.warn(
        'Unknown DOM property ' + name + '. Did you mean ' + standardName + '?'
      );
    }

  };
}

/**
 * Operations for dealing with DOM properties.
 */
var DOMPropertyOperations = {

  /**
   * Creates markup for a property.
   *
   * @param {string} name
   * @param {*} value
   * @return {?string} Markup string, or null if the property was invalid.
   */
  createMarkupForProperty: function(name, value) {
    if (DOMProperty.isStandardName[name]) {
      if (shouldIgnoreValue(name, value)) {
        return '';
      }
      var attributeName = DOMProperty.getAttributeName[name];
      return processAttributeNameAndPrefix(attributeName) +
        escapeTextForBrowser(value) + '"';
    } else if (DOMProperty.isCustomAttribute(name)) {
      if (value == null) {
        return '';
      }
      return processAttributeNameAndPrefix(name) +
        escapeTextForBrowser(value) + '"';
    } else if ("production" !== process.env.NODE_ENV) {
      warnUnknownProperty(name);
    }
    return null;
  },

  /**
   * Sets the value for a property on a node.
   *
   * @param {DOMElement} node
   * @param {string} name
   * @param {*} value
   */
  setValueForProperty: function(node, name, value) {
    if (DOMProperty.isStandardName[name]) {
      var mutationMethod = DOMProperty.getMutationMethod[name];
      if (mutationMethod) {
        mutationMethod(node, value);
      } else if (shouldIgnoreValue(name, value)) {
        this.deleteValueForProperty(node, name);
      } else if (DOMProperty.mustUseAttribute[name]) {
        node.setAttribute(DOMProperty.getAttributeName[name], '' + value);
      } else {
        var propName = DOMProperty.getPropertyName[name];
        if (!DOMProperty.hasSideEffects[name] || node[propName] !== value) {
          node[propName] = value;
        }
      }
    } else if (DOMProperty.isCustomAttribute(name)) {
      if (value == null) {
        node.removeAttribute(DOMProperty.getAttributeName[name]);
      } else {
        node.setAttribute(name, '' + value);
      }
    } else if ("production" !== process.env.NODE_ENV) {
      warnUnknownProperty(name);
    }
  },

  /**
   * Deletes the value for a property on a node.
   *
   * @param {DOMElement} node
   * @param {string} name
   */
  deleteValueForProperty: function(node, name) {
    if (DOMProperty.isStandardName[name]) {
      var mutationMethod = DOMProperty.getMutationMethod[name];
      if (mutationMethod) {
        mutationMethod(node, undefined);
      } else if (DOMProperty.mustUseAttribute[name]) {
        node.removeAttribute(DOMProperty.getAttributeName[name]);
      } else {
        var propName = DOMProperty.getPropertyName[name];
        var defaultValue = DOMProperty.getDefaultValueForProperty(
          node.nodeName,
          name
        );
        if (!DOMProperty.hasSideEffects[name] ||
            node[propName] !== defaultValue) {
          node[propName] = defaultValue;
        }
      }
    } else if (DOMProperty.isCustomAttribute(name)) {
      node.removeAttribute(name);
    } else if ("production" !== process.env.NODE_ENV) {
      warnUnknownProperty(name);
    }
  }

};

module.exports = DOMPropertyOperations;

},{"./DOMProperty":56,"./escapeTextForBrowser":142,"./memoizeStringOnly":164,"__browserify_process":35}],58:[function(require,module,exports){
var process=require("__browserify_process");/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule Danger
 * @typechecks static-only
 */

/*jslint evil: true, sub: true */

"use strict";

var ExecutionEnvironment = require("./ExecutionEnvironment");

var createNodesFromMarkup = require("./createNodesFromMarkup");
var emptyFunction = require("./emptyFunction");
var getMarkupWrap = require("./getMarkupWrap");
var invariant = require("./invariant");
var mutateHTMLNodeWithMarkup = require("./mutateHTMLNodeWithMarkup");

var OPEN_TAG_NAME_EXP = /^(<[^ \/>]+)/;
var RESULT_INDEX_ATTR = 'data-danger-index';

/**
 * Extracts the `nodeName` from a string of markup.
 *
 * NOTE: Extracting the `nodeName` does not require a regular expression match
 * because we make assumptions about React-generated markup (i.e. there are no
 * spaces surrounding the opening tag and there is at least one attribute).
 *
 * @param {string} markup String of markup.
 * @return {string} Node name of the supplied markup.
 * @see http://jsperf.com/extract-nodename
 */
function getNodeName(markup) {
  return markup.substring(1, markup.indexOf(' '));
}

var Danger = {

  /**
   * Renders markup into an array of nodes. The markup is expected to render
   * into a list of root nodes. Also, the length of `resultList` and
   * `markupList` should be the same.
   *
   * @param {array<string>} markupList List of markup strings to render.
   * @return {array<DOMElement>} List of rendered nodes.
   * @internal
   */
  dangerouslyRenderMarkup: function(markupList) {
    ("production" !== process.env.NODE_ENV ? invariant(
      ExecutionEnvironment.canUseDOM,
      'dangerouslyRenderMarkup(...): Cannot render markup in a Worker ' +
      'thread. This is likely a bug in the framework. Please report ' +
      'immediately.'
    ) : invariant(ExecutionEnvironment.canUseDOM));
    var nodeName;
    var markupByNodeName = {};
    // Group markup by `nodeName` if a wrap is necessary, else by '*'.
    for (var i = 0; i < markupList.length; i++) {
      ("production" !== process.env.NODE_ENV ? invariant(
        markupList[i],
        'dangerouslyRenderMarkup(...): Missing markup.'
      ) : invariant(markupList[i]));
      nodeName = getNodeName(markupList[i]);
      nodeName = getMarkupWrap(nodeName) ? nodeName : '*';
      markupByNodeName[nodeName] = markupByNodeName[nodeName] || [];
      markupByNodeName[nodeName][i] = markupList[i];
    }
    var resultList = [];
    var resultListAssignmentCount = 0;
    for (nodeName in markupByNodeName) {
      if (!markupByNodeName.hasOwnProperty(nodeName)) {
        continue;
      }
      var markupListByNodeName = markupByNodeName[nodeName];

      // This for-in loop skips the holes of the sparse array. The order of
      // iteration should follow the order of assignment, which happens to match
      // numerical index order, but we don't rely on that.
      for (var resultIndex in markupListByNodeName) {
        if (markupListByNodeName.hasOwnProperty(resultIndex)) {
          var markup = markupListByNodeName[resultIndex];

          // Push the requested markup with an additional RESULT_INDEX_ATTR
          // attribute.  If the markup does not start with a < character, it
          // will be discarded below (with an appropriate console.error).
          markupListByNodeName[resultIndex] = markup.replace(
            OPEN_TAG_NAME_EXP,
            // This index will be parsed back out below.
            '$1 ' + RESULT_INDEX_ATTR + '="' + resultIndex + '" '
          );
        }
      }

      // Render each group of markup with similar wrapping `nodeName`.
      var renderNodes = createNodesFromMarkup(
        markupListByNodeName.join(''),
        emptyFunction // Do nothing special with <script> tags.
      );

      for (i = 0; i < renderNodes.length; ++i) {
        var renderNode = renderNodes[i];
        if (renderNode.hasAttribute &&
            renderNode.hasAttribute(RESULT_INDEX_ATTR)) {

          resultIndex = +renderNode.getAttribute(RESULT_INDEX_ATTR);
          renderNode.removeAttribute(RESULT_INDEX_ATTR);

          ("production" !== process.env.NODE_ENV ? invariant(
            !resultList.hasOwnProperty(resultIndex),
            'Danger: Assigning to an already-occupied result index.'
          ) : invariant(!resultList.hasOwnProperty(resultIndex)));

          resultList[resultIndex] = renderNode;

          // This should match resultList.length and markupList.length when
          // we're done.
          resultListAssignmentCount += 1;

        } else if ("production" !== process.env.NODE_ENV) {
          console.error(
            "Danger: Discarding unexpected node:",
            renderNode
          );
        }
      }
    }

    // Although resultList was populated out of order, it should now be a dense
    // array.
    ("production" !== process.env.NODE_ENV ? invariant(
      resultListAssignmentCount === resultList.length,
      'Danger: Did not assign to every index of resultList.'
    ) : invariant(resultListAssignmentCount === resultList.length));

    ("production" !== process.env.NODE_ENV ? invariant(
      resultList.length === markupList.length,
      'Danger: Expected markup to render %s nodes, but rendered %s.',
      markupList.length,
      resultList.length
    ) : invariant(resultList.length === markupList.length));

    return resultList;
  },

  /**
   * Replaces a node with a string of markup at its current position within its
   * parent. The markup must render into a single root node.
   *
   * @param {DOMElement} oldChild Child node to replace.
   * @param {string} markup Markup to render in place of the child node.
   * @internal
   */
  dangerouslyReplaceNodeWithMarkup: function(oldChild, markup) {
    ("production" !== process.env.NODE_ENV ? invariant(
      ExecutionEnvironment.canUseDOM,
      'dangerouslyReplaceNodeWithMarkup(...): Cannot render markup in a ' +
      'worker thread. This is likely a bug in the framework. Please report ' +
      'immediately.'
    ) : invariant(ExecutionEnvironment.canUseDOM));
    ("production" !== process.env.NODE_ENV ? invariant(markup, 'dangerouslyReplaceNodeWithMarkup(...): Missing markup.') : invariant(markup));
    // createNodesFromMarkup() won't work if the markup is rooted by <html>
    // since it has special semantic meaning. So we use an alternatie strategy.
    if (oldChild.tagName.toLowerCase() === 'html') {
      mutateHTMLNodeWithMarkup(oldChild, markup);
      return;
    }
    var newChild = createNodesFromMarkup(markup, emptyFunction)[0];
    oldChild.parentNode.replaceChild(newChild, oldChild);
  }

};

module.exports = Danger;

},{"./ExecutionEnvironment":68,"./createNodesFromMarkup":137,"./emptyFunction":141,"./getMarkupWrap":150,"./invariant":156,"./mutateHTMLNodeWithMarkup":169,"__browserify_process":35}],59:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule DefaultDOMPropertyConfig
 */

/*jslint bitwise: true*/

"use strict";

var DOMProperty = require("./DOMProperty");

var MUST_USE_ATTRIBUTE = DOMProperty.injection.MUST_USE_ATTRIBUTE;
var MUST_USE_PROPERTY = DOMProperty.injection.MUST_USE_PROPERTY;
var HAS_BOOLEAN_VALUE = DOMProperty.injection.HAS_BOOLEAN_VALUE;
var HAS_SIDE_EFFECTS = DOMProperty.injection.HAS_SIDE_EFFECTS;
var HAS_POSITIVE_NUMERIC_VALUE =
  DOMProperty.injection.HAS_POSITIVE_NUMERIC_VALUE;

var DefaultDOMPropertyConfig = {
  isCustomAttribute: RegExp.prototype.test.bind(
    /^(data|aria)-[a-z_][a-z\d_.\-]*$/
  ),
  Properties: {
    /**
     * Standard Properties
     */
    accept: null,
    accessKey: null,
    action: null,
    allowFullScreen: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
    allowTransparency: MUST_USE_ATTRIBUTE,
    alt: null,
    async: HAS_BOOLEAN_VALUE,
    autoComplete: null,
    autoFocus: HAS_BOOLEAN_VALUE,
    autoPlay: HAS_BOOLEAN_VALUE,
    cellPadding: null,
    cellSpacing: null,
    charSet: MUST_USE_ATTRIBUTE,
    checked: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    className: MUST_USE_PROPERTY,
    cols: MUST_USE_ATTRIBUTE | HAS_POSITIVE_NUMERIC_VALUE,
    colSpan: null,
    content: null,
    contentEditable: null,
    contextMenu: MUST_USE_ATTRIBUTE,
    controls: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    data: null, // For `<object />` acts as `src`.
    dateTime: MUST_USE_ATTRIBUTE,
    defer: HAS_BOOLEAN_VALUE,
    dir: null,
    disabled: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
    draggable: null,
    encType: null,
    form: MUST_USE_ATTRIBUTE,
    frameBorder: MUST_USE_ATTRIBUTE,
    height: MUST_USE_ATTRIBUTE,
    hidden: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
    href: null,
    htmlFor: null,
    httpEquiv: null,
    icon: null,
    id: MUST_USE_PROPERTY,
    label: null,
    lang: null,
    list: null,
    loop: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    max: null,
    maxLength: MUST_USE_ATTRIBUTE,
    method: null,
    min: null,
    multiple: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    name: null,
    pattern: null,
    placeholder: null,
    poster: null,
    preload: null,
    radioGroup: null,
    readOnly: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    rel: null,
    required: HAS_BOOLEAN_VALUE,
    role: MUST_USE_ATTRIBUTE,
    rows: MUST_USE_ATTRIBUTE | HAS_POSITIVE_NUMERIC_VALUE,
    rowSpan: null,
    scrollLeft: MUST_USE_PROPERTY,
    scrollTop: MUST_USE_PROPERTY,
    selected: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    size: MUST_USE_ATTRIBUTE | HAS_POSITIVE_NUMERIC_VALUE,
    spellCheck: null,
    src: null,
    step: null,
    style: null,
    tabIndex: null,
    target: null,
    title: null,
    type: null,
    value: MUST_USE_PROPERTY | HAS_SIDE_EFFECTS,
    width: MUST_USE_ATTRIBUTE,
    wmode: MUST_USE_ATTRIBUTE,

    /**
     * Non-standard Properties
     */
    autoCapitalize: null, // Supported in Mobile Safari for keyboard hints
    autoCorrect: null, // Supported in Mobile Safari for keyboard hints

    /**
     * SVG Properties
     */
    cx: MUST_USE_ATTRIBUTE,
    cy: MUST_USE_ATTRIBUTE,
    d: MUST_USE_ATTRIBUTE,
    fill: MUST_USE_ATTRIBUTE,
    fx: MUST_USE_ATTRIBUTE,
    fy: MUST_USE_ATTRIBUTE,
    gradientTransform: MUST_USE_ATTRIBUTE,
    gradientUnits: MUST_USE_ATTRIBUTE,
    offset: MUST_USE_ATTRIBUTE,
    points: MUST_USE_ATTRIBUTE,
    r: MUST_USE_ATTRIBUTE,
    rx: MUST_USE_ATTRIBUTE,
    ry: MUST_USE_ATTRIBUTE,
    spreadMethod: MUST_USE_ATTRIBUTE,
    stopColor: MUST_USE_ATTRIBUTE,
    stopOpacity: MUST_USE_ATTRIBUTE,
    stroke: MUST_USE_ATTRIBUTE,
    strokeLinecap: MUST_USE_ATTRIBUTE,
    strokeWidth: MUST_USE_ATTRIBUTE,
    transform: MUST_USE_ATTRIBUTE,
    version: MUST_USE_ATTRIBUTE,
    viewBox: MUST_USE_ATTRIBUTE,
    x1: MUST_USE_ATTRIBUTE,
    x2: MUST_USE_ATTRIBUTE,
    x: MUST_USE_ATTRIBUTE,
    y1: MUST_USE_ATTRIBUTE,
    y2: MUST_USE_ATTRIBUTE,
    y: MUST_USE_ATTRIBUTE
  },
  DOMAttributeNames: {
    className: 'class',
    gradientTransform: 'gradientTransform',
    gradientUnits: 'gradientUnits',
    htmlFor: 'for',
    spreadMethod: 'spreadMethod',
    stopColor: 'stop-color',
    stopOpacity: 'stop-opacity',
    strokeLinecap: 'stroke-linecap',
    strokeWidth: 'stroke-width',
    viewBox: 'viewBox'
  },
  DOMPropertyNames: {
    autoCapitalize: 'autocapitalize',
    autoComplete: 'autocomplete',
    autoCorrect: 'autocorrect',
    autoFocus: 'autofocus',
    autoPlay: 'autoplay',
    encType: 'enctype',
    radioGroup: 'radiogroup',
    spellCheck: 'spellcheck'
  },
  DOMMutationMethods: {
    /**
     * Setting `className` to null may cause it to be set to the string "null".
     *
     * @param {DOMElement} node
     * @param {*} value
     */
    className: function(node, value) {
      node.className = value || '';
    }
  }
};

module.exports = DefaultDOMPropertyConfig;

},{"./DOMProperty":56}],60:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule DefaultEventPluginOrder
 */

"use strict";

 var keyOf = require("./keyOf");

/**
 * Module that is injectable into `EventPluginHub`, that specifies a
 * deterministic ordering of `EventPlugin`s. A convenient way to reason about
 * plugins, without having to package every one of them. This is better than
 * having plugins be ordered in the same order that they are injected because
 * that ordering would be influenced by the packaging order.
 * `ResponderEventPlugin` must occur before `SimpleEventPlugin` so that
 * preventing default on events is convenient in `SimpleEventPlugin` handlers.
 */
var DefaultEventPluginOrder = [
  keyOf({ResponderEventPlugin: null}),
  keyOf({SimpleEventPlugin: null}),
  keyOf({TapEventPlugin: null}),
  keyOf({EnterLeaveEventPlugin: null}),
  keyOf({ChangeEventPlugin: null}),
  keyOf({SelectEventPlugin: null}),
  keyOf({CompositionEventPlugin: null}),
  keyOf({AnalyticsEventPlugin: null}),
  keyOf({MobileSafariClickEventPlugin: null})
];

module.exports = DefaultEventPluginOrder;

},{"./keyOf":163}],61:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule EnterLeaveEventPlugin
 * @typechecks static-only
 */

"use strict";

var EventConstants = require("./EventConstants");
var EventPropagators = require("./EventPropagators");
var SyntheticMouseEvent = require("./SyntheticMouseEvent");

var ReactMount = require("./ReactMount");
var keyOf = require("./keyOf");

var topLevelTypes = EventConstants.topLevelTypes;
var getFirstReactDOM = ReactMount.getFirstReactDOM;

var eventTypes = {
  mouseEnter: {registrationName: keyOf({onMouseEnter: null})},
  mouseLeave: {registrationName: keyOf({onMouseLeave: null})}
};

var extractedEvents = [null, null];

var EnterLeaveEventPlugin = {

  eventTypes: eventTypes,

  /**
   * For almost every interaction we care about, there will be both a top-level
   * `mouseover` and `mouseout` event that occurs. Only use `mouseout` so that
   * we do not extract duplicate events. However, moving the mouse into the
   * browser from outside will not fire a `mouseout` event. In this case, we use
   * the `mouseover` top-level event.
   *
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {DOMEventTarget} topLevelTarget The listening component root node.
   * @param {string} topLevelTargetID ID of `topLevelTarget`.
   * @param {object} nativeEvent Native browser event.
   * @return {*} An accumulation of synthetic events.
   * @see {EventPluginHub.extractEvents}
   */
  extractEvents: function(
      topLevelType,
      topLevelTarget,
      topLevelTargetID,
      nativeEvent) {
    if (topLevelType === topLevelTypes.topMouseOver &&
        (nativeEvent.relatedTarget || nativeEvent.fromElement)) {
      return null;
    }
    if (topLevelType !== topLevelTypes.topMouseOut &&
        topLevelType !== topLevelTypes.topMouseOver) {
      // Must not be a mouse in or mouse out - ignoring.
      return null;
    }

    var from, to;
    if (topLevelType === topLevelTypes.topMouseOut) {
      from = topLevelTarget;
      to =
        getFirstReactDOM(nativeEvent.relatedTarget || nativeEvent.toElement) ||
        window;
    } else {
      from = window;
      to = topLevelTarget;
    }

    if (from === to) {
      // Nothing pertains to our managed components.
      return null;
    }

    var fromID = from ? ReactMount.getID(from) : '';
    var toID = to ? ReactMount.getID(to) : '';

    var leave = SyntheticMouseEvent.getPooled(
      eventTypes.mouseLeave,
      fromID,
      nativeEvent
    );
    var enter = SyntheticMouseEvent.getPooled(
      eventTypes.mouseEnter,
      toID,
      nativeEvent
    );

    EventPropagators.accumulateEnterLeaveDispatches(leave, enter, fromID, toID);

    extractedEvents[0] = leave;
    extractedEvents[1] = enter;

    return extractedEvents;
  }

};

module.exports = EnterLeaveEventPlugin;

},{"./EventConstants":62,"./EventPropagators":67,"./ReactMount":101,"./SyntheticMouseEvent":126,"./keyOf":163}],62:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule EventConstants
 */

"use strict";

var keyMirror = require("./keyMirror");

var PropagationPhases = keyMirror({bubbled: null, captured: null});

/**
 * Types of raw signals from the browser caught at the top level.
 */
var topLevelTypes = keyMirror({
  topBlur: null,
  topChange: null,
  topClick: null,
  topCompositionEnd: null,
  topCompositionStart: null,
  topCompositionUpdate: null,
  topContextMenu: null,
  topCopy: null,
  topCut: null,
  topDoubleClick: null,
  topDrag: null,
  topDragEnd: null,
  topDragEnter: null,
  topDragExit: null,
  topDragLeave: null,
  topDragOver: null,
  topDragStart: null,
  topDrop: null,
  topFocus: null,
  topInput: null,
  topKeyDown: null,
  topKeyPress: null,
  topKeyUp: null,
  topMouseDown: null,
  topMouseMove: null,
  topMouseOut: null,
  topMouseOver: null,
  topMouseUp: null,
  topPaste: null,
  topScroll: null,
  topSelectionChange: null,
  topSubmit: null,
  topTouchCancel: null,
  topTouchEnd: null,
  topTouchMove: null,
  topTouchStart: null,
  topWheel: null
});

var EventConstants = {
  topLevelTypes: topLevelTypes,
  PropagationPhases: PropagationPhases
};

module.exports = EventConstants;

},{"./keyMirror":162}],63:[function(require,module,exports){
var process=require("__browserify_process");/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule EventListener
 */

/**
 * Upstream version of event listener. Does not take into account specific
 * nature of platform.
 */
var EventListener = {
  /**
   * Listens to bubbled events on a DOM node.
   *
   * @param {Element} el DOM element to register listener on.
   * @param {string} handlerBaseName 'click'/'mouseover'
   * @param {Function!} cb Callback function
   */
  listen: function(el, handlerBaseName, cb) {
    if (el.addEventListener) {
      el.addEventListener(handlerBaseName, cb, false);
    } else if (el.attachEvent) {
      el.attachEvent('on' + handlerBaseName, cb);
    }
  },

  /**
   * Listens to captured events on a DOM node.
   *
   * @see `EventListener.listen` for params.
   * @throws Exception if addEventListener is not supported.
   */
  capture: function(el, handlerBaseName, cb) {
    if (!el.addEventListener) {
      if ("production" !== process.env.NODE_ENV) {
        console.error(
          'You are attempting to use addEventListener ' +
          'in a browser that does not support it.' +
          'This likely means that you will not receive events that ' +
          'your application relies on (such as scroll).');
      }
      return;
    } else {
      el.addEventListener(handlerBaseName, cb, true);
    }
  }
};

module.exports = EventListener;

},{"__browserify_process":35}],64:[function(require,module,exports){
var process=require("__browserify_process");/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule EventPluginHub
 */

"use strict";

var CallbackRegistry = require("./CallbackRegistry");
var EventPluginRegistry = require("./EventPluginRegistry");
var EventPluginUtils = require("./EventPluginUtils");
var EventPropagators = require("./EventPropagators");
var ExecutionEnvironment = require("./ExecutionEnvironment");

var accumulate = require("./accumulate");
var forEachAccumulated = require("./forEachAccumulated");
var invariant = require("./invariant");

/**
 * Internal queue of events that have accumulated their dispatches and are
 * waiting to have their dispatches executed.
 */
var eventQueue = null;

/**
 * Dispatches an event and releases it back into the pool, unless persistent.
 *
 * @param {?object} event Synthetic event to be dispatched.
 * @private
 */
var executeDispatchesAndRelease = function(event) {
  if (event) {
    var executeDispatch = EventPluginUtils.executeDispatch;
    // Plugins can provide custom behavior when dispatching events.
    var PluginModule = EventPluginRegistry.getPluginModuleForEvent(event);
    if (PluginModule && PluginModule.executeDispatch) {
      executeDispatch = PluginModule.executeDispatch;
    }
    EventPluginUtils.executeDispatchesInOrder(event, executeDispatch);

    if (!event.isPersistent()) {
      event.constructor.release(event);
    }
  }
};

/**
 * This is a unified interface for event plugins to be installed and configured.
 *
 * Event plugins can implement the following properties:
 *
 *   `extractEvents` {function(string, DOMEventTarget, string, object): *}
 *     Required. When a top-level event is fired, this method is expected to
 *     extract synthetic events that will in turn be queued and dispatched.
 *
 *   `eventTypes` {object}
 *     Optional, plugins that fire events must publish a mapping of registration
 *     names that are used to register listeners. Values of this mapping must
 *     be objects that contain `registrationName` or `phasedRegistrationNames`.
 *
 *   `executeDispatch` {function(object, function, string)}
 *     Optional, allows plugins to override how an event gets dispatched. By
 *     default, the listener is simply invoked.
 *
 * Each plugin that is injected into `EventsPluginHub` is immediately operable.
 *
 * @public
 */
var EventPluginHub = {

  /**
   * Methods for injecting dependencies.
   */
  injection: {

    /**
     * @param {object} InjectedInstanceHandle
     * @public
     */
    injectInstanceHandle: EventPropagators.injection.injectInstanceHandle,

    /**
     * @param {array} InjectedEventPluginOrder
     * @public
     */
    injectEventPluginOrder: EventPluginRegistry.injectEventPluginOrder,

    /**
     * @param {object} injectedNamesToPlugins Map from names to plugin modules.
     */
    injectEventPluginsByName: EventPluginRegistry.injectEventPluginsByName

  },

  registrationNames: EventPluginRegistry.registrationNames,

  putListener: CallbackRegistry.putListener,

  getListener: CallbackRegistry.getListener,

  deleteListener: CallbackRegistry.deleteListener,

  deleteAllListeners: CallbackRegistry.deleteAllListeners,

  /**
   * Allows registered plugins an opportunity to extract events from top-level
   * native browser events.
   *
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {DOMEventTarget} topLevelTarget The listening component root node.
   * @param {string} topLevelTargetID ID of `topLevelTarget`.
   * @param {object} nativeEvent Native browser event.
   * @return {*} An accumulation of synthetic events.
   * @internal
   */
  extractEvents: function(
      topLevelType,
      topLevelTarget,
      topLevelTargetID,
      nativeEvent) {
    var events;
    var plugins = EventPluginRegistry.plugins;
    for (var i = 0, l = plugins.length; i < l; i++) {
      // Not every plugin in the ordering may be loaded at runtime.
      var possiblePlugin = plugins[i];
      if (possiblePlugin) {
        var extractedEvents = possiblePlugin.extractEvents(
          topLevelType,
          topLevelTarget,
          topLevelTargetID,
          nativeEvent
        );
        if (extractedEvents) {
          events = accumulate(events, extractedEvents);
        }
      }
    }
    return events;
  },

  /**
   * Enqueues a synthetic event that should be dispatched when
   * `processEventQueue` is invoked.
   *
   * @param {*} events An accumulation of synthetic events.
   * @internal
   */
  enqueueEvents: function(events) {
    if (events) {
      eventQueue = accumulate(eventQueue, events);
    }
  },

  /**
   * Dispatches all synthetic events on the event queue.
   *
   * @internal
   */
  processEventQueue: function() {
    // Set `eventQueue` to null before processing it so that we can tell if more
    // events get enqueued while processing.
    var processingEventQueue = eventQueue;
    eventQueue = null;
    forEachAccumulated(processingEventQueue, executeDispatchesAndRelease);
    ("production" !== process.env.NODE_ENV ? invariant(
      !eventQueue,
      'processEventQueue(): Additional events were enqueued while processing ' +
      'an event queue. Support for this has not yet been implemented.'
    ) : invariant(!eventQueue));
  }

};

if (ExecutionEnvironment.canUseDOM) {
  window.EventPluginHub = EventPluginHub;
}

module.exports = EventPluginHub;

},{"./CallbackRegistry":52,"./EventPluginRegistry":65,"./EventPluginUtils":66,"./EventPropagators":67,"./ExecutionEnvironment":68,"./accumulate":132,"./forEachAccumulated":146,"./invariant":156,"__browserify_process":35}],65:[function(require,module,exports){
var process=require("__browserify_process");/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule EventPluginRegistry
 * @typechecks static-only
 */

"use strict";

var invariant = require("./invariant");

/**
 * Injectable ordering of event plugins.
 */
var EventPluginOrder = null;

/**
 * Injectable mapping from names to event plugin modules.
 */
var namesToPlugins = {};

/**
 * Recomputes the plugin list using the injected plugins and plugin ordering.
 *
 * @private
 */
function recomputePluginOrdering() {
  if (!EventPluginOrder) {
    // Wait until an `EventPluginOrder` is injected.
    return;
  }
  for (var pluginName in namesToPlugins) {
    var PluginModule = namesToPlugins[pluginName];
    var pluginIndex = EventPluginOrder.indexOf(pluginName);
    ("production" !== process.env.NODE_ENV ? invariant(
      pluginIndex > -1,
      'EventPluginRegistry: Cannot inject event plugins that do not exist in ' +
      'the plugin ordering, `%s`.',
      pluginName
    ) : invariant(pluginIndex > -1));
    if (EventPluginRegistry.plugins[pluginIndex]) {
      continue;
    }
    ("production" !== process.env.NODE_ENV ? invariant(
      PluginModule.extractEvents,
      'EventPluginRegistry: Event plugins must implement an `extractEvents` ' +
      'method, but `%s` does not.',
      pluginName
    ) : invariant(PluginModule.extractEvents));
    EventPluginRegistry.plugins[pluginIndex] = PluginModule;
    var publishedEvents = PluginModule.eventTypes;
    for (var eventName in publishedEvents) {
      ("production" !== process.env.NODE_ENV ? invariant(
        publishEventForPlugin(publishedEvents[eventName], PluginModule),
        'EventPluginRegistry: Failed to publish event `%s` for plugin `%s`.',
        eventName,
        pluginName
      ) : invariant(publishEventForPlugin(publishedEvents[eventName], PluginModule)));
    }
  }
}

/**
 * Publishes an event so that it can be dispatched by the supplied plugin.
 *
 * @param {object} dispatchConfig Dispatch configuration for the event.
 * @param {object} PluginModule Plugin publishing the event.
 * @return {boolean} True if the event was successfully published.
 * @private
 */
function publishEventForPlugin(dispatchConfig, PluginModule) {
  var phasedRegistrationNames = dispatchConfig.phasedRegistrationNames;
  if (phasedRegistrationNames) {
    for (var phaseName in phasedRegistrationNames) {
      if (phasedRegistrationNames.hasOwnProperty(phaseName)) {
        var phasedRegistrationName = phasedRegistrationNames[phaseName];
        publishRegistrationName(phasedRegistrationName, PluginModule);
      }
    }
    return true;
  } else if (dispatchConfig.registrationName) {
    publishRegistrationName(dispatchConfig.registrationName, PluginModule);
    return true;
  }
  return false;
}

/**
 * Publishes a registration name that is used to identify dispatched events and
 * can be used with `EventPluginHub.putListener` to register listeners.
 *
 * @param {string} registrationName Registration name to add.
 * @param {object} PluginModule Plugin publishing the event.
 * @private
 */
function publishRegistrationName(registrationName, PluginModule) {
  ("production" !== process.env.NODE_ENV ? invariant(
    !EventPluginRegistry.registrationNames[registrationName],
    'EventPluginHub: More than one plugin attempted to publish the same ' +
    'registration name, `%s`.',
    registrationName
  ) : invariant(!EventPluginRegistry.registrationNames[registrationName]));
  EventPluginRegistry.registrationNames[registrationName] = PluginModule;
}

/**
 * Registers plugins so that they can extract and dispatch events.
 *
 * @see {EventPluginHub}
 */
var EventPluginRegistry = {

  /**
   * Ordered list of injected plugins.
   */
  plugins: [],

  /**
   * Mapping from registration names to plugin modules.
   */
  registrationNames: {},

  /**
   * Injects an ordering of plugins (by plugin name). This allows the ordering
   * to be decoupled from injection of the actual plugins so that ordering is
   * always deterministic regardless of packaging, on-the-fly injection, etc.
   *
   * @param {array} InjectedEventPluginOrder
   * @internal
   * @see {EventPluginHub.injection.injectEventPluginOrder}
   */
  injectEventPluginOrder: function(InjectedEventPluginOrder) {
    ("production" !== process.env.NODE_ENV ? invariant(
      !EventPluginOrder,
      'EventPluginRegistry: Cannot inject event plugin ordering more than once.'
    ) : invariant(!EventPluginOrder));
    // Clone the ordering so it cannot be dynamically mutated.
    EventPluginOrder = Array.prototype.slice.call(InjectedEventPluginOrder);
    recomputePluginOrdering();
  },

  /**
   * Injects plugins to be used by `EventPluginHub`. The plugin names must be
   * in the ordering injected by `injectEventPluginOrder`.
   *
   * Plugins can be injected as part of page initialization or on-the-fly.
   *
   * @param {object} injectedNamesToPlugins Map from names to plugin modules.
   * @internal
   * @see {EventPluginHub.injection.injectEventPluginsByName}
   */
  injectEventPluginsByName: function(injectedNamesToPlugins) {
    var isOrderingDirty = false;
    for (var pluginName in injectedNamesToPlugins) {
      if (!injectedNamesToPlugins.hasOwnProperty(pluginName)) {
        continue;
      }
      var PluginModule = injectedNamesToPlugins[pluginName];
      if (namesToPlugins[pluginName] !== PluginModule) {
        ("production" !== process.env.NODE_ENV ? invariant(
          !namesToPlugins[pluginName],
          'EventPluginRegistry: Cannot inject two different event plugins ' +
          'using the same name, `%s`.',
          pluginName
        ) : invariant(!namesToPlugins[pluginName]));
        namesToPlugins[pluginName] = PluginModule;
        isOrderingDirty = true;
      }
    }
    if (isOrderingDirty) {
      recomputePluginOrdering();
    }
  },

  /**
   * Looks up the plugin for the supplied event.
   *
   * @param {object} event A synthetic event.
   * @return {?object} The plugin that created the supplied event.
   * @internal
   */
  getPluginModuleForEvent: function(event) {
    var dispatchConfig = event.dispatchConfig;
    if (dispatchConfig.registrationName) {
      return EventPluginRegistry.registrationNames[
        dispatchConfig.registrationName
      ] || null;
    }
    for (var phase in dispatchConfig.phasedRegistrationNames) {
      if (!dispatchConfig.phasedRegistrationNames.hasOwnProperty(phase)) {
        continue;
      }
      var PluginModule = EventPluginRegistry.registrationNames[
        dispatchConfig.phasedRegistrationNames[phase]
      ];
      if (PluginModule) {
        return PluginModule;
      }
    }
    return null;
  },

  /**
   * Exposed for unit testing.
   * @private
   */
  _resetEventPlugins: function() {
    EventPluginOrder = null;
    for (var pluginName in namesToPlugins) {
      if (namesToPlugins.hasOwnProperty(pluginName)) {
        delete namesToPlugins[pluginName];
      }
    }
    EventPluginRegistry.plugins.length = 0;
    var registrationNames = EventPluginRegistry.registrationNames;
    for (var registrationName in registrationNames) {
      if (registrationNames.hasOwnProperty(registrationName)) {
        delete registrationNames[registrationName];
      }
    }
  }

};

module.exports = EventPluginRegistry;

},{"./invariant":156,"__browserify_process":35}],66:[function(require,module,exports){
var process=require("__browserify_process");/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule EventPluginUtils
 */

"use strict";

var EventConstants = require("./EventConstants");

var invariant = require("./invariant");

var topLevelTypes = EventConstants.topLevelTypes;

function isEndish(topLevelType) {
  return topLevelType === topLevelTypes.topMouseUp ||
         topLevelType === topLevelTypes.topTouchEnd ||
         topLevelType === topLevelTypes.topTouchCancel;
}

function isMoveish(topLevelType) {
  return topLevelType === topLevelTypes.topMouseMove ||
         topLevelType === topLevelTypes.topTouchMove;
}
function isStartish(topLevelType) {
  return topLevelType === topLevelTypes.topMouseDown ||
         topLevelType === topLevelTypes.topTouchStart;
}

var validateEventDispatches;
if ("production" !== process.env.NODE_ENV) {
  validateEventDispatches = function(event) {
    var dispatchListeners = event._dispatchListeners;
    var dispatchIDs = event._dispatchIDs;

    var listenersIsArr = Array.isArray(dispatchListeners);
    var idsIsArr = Array.isArray(dispatchIDs);
    var IDsLen = idsIsArr ? dispatchIDs.length : dispatchIDs ? 1 : 0;
    var listenersLen = listenersIsArr ?
      dispatchListeners.length :
      dispatchListeners ? 1 : 0;

    ("production" !== process.env.NODE_ENV ? invariant(
      idsIsArr === listenersIsArr && IDsLen === listenersLen,
      'EventPluginUtils: Invalid `event`.'
    ) : invariant(idsIsArr === listenersIsArr && IDsLen === listenersLen));
  };
}

/**
 * Invokes `cb(event, listener, id)`. Avoids using call if no scope is
 * provided. The `(listener,id)` pair effectively forms the "dispatch" but are
 * kept separate to conserve memory.
 */
function forEachEventDispatch(event, cb) {
  var dispatchListeners = event._dispatchListeners;
  var dispatchIDs = event._dispatchIDs;
  if ("production" !== process.env.NODE_ENV) {
    validateEventDispatches(event);
  }
  if (Array.isArray(dispatchListeners)) {
    for (var i = 0; i < dispatchListeners.length; i++) {
      if (event.isPropagationStopped()) {
        break;
      }
      // Listeners and IDs are two parallel arrays that are always in sync.
      cb(event, dispatchListeners[i], dispatchIDs[i]);
    }
  } else if (dispatchListeners) {
    cb(event, dispatchListeners, dispatchIDs);
  }
}

/**
 * Default implementation of PluginModule.executeDispatch().
 * @param {SyntheticEvent} SyntheticEvent to handle
 * @param {function} Application-level callback
 * @param {string} domID DOM id to pass to the callback.
 */
function executeDispatch(event, listener, domID) {
  listener(event, domID);
}

/**
 * Standard/simple iteration through an event's collected dispatches.
 */
function executeDispatchesInOrder(event, executeDispatch) {
  forEachEventDispatch(event, executeDispatch);
  event._dispatchListeners = null;
  event._dispatchIDs = null;
}

/**
 * Standard/simple iteration through an event's collected dispatches, but stops
 * at the first dispatch execution returning true, and returns that id.
 *
 * @return id of the first dispatch execution who's listener returns true, or
 * null if no listener returned true.
 */
function executeDispatchesInOrderStopAtTrue(event) {
  var dispatchListeners = event._dispatchListeners;
  var dispatchIDs = event._dispatchIDs;
  if ("production" !== process.env.NODE_ENV) {
    validateEventDispatches(event);
  }
  if (Array.isArray(dispatchListeners)) {
    for (var i = 0; i < dispatchListeners.length; i++) {
      if (event.isPropagationStopped()) {
        break;
      }
      // Listeners and IDs are two parallel arrays that are always in sync.
      if (dispatchListeners[i](event, dispatchIDs[i])) {
        return dispatchIDs[i];
      }
    }
  } else if (dispatchListeners) {
    if (dispatchListeners(event, dispatchIDs)) {
      return dispatchIDs;
    }
  }
  return null;
}

/**
 * Execution of a "direct" dispatch - there must be at most one dispatch
 * accumulated on the event or it is considered an error. It doesn't really make
 * sense for an event with multiple dispatches (bubbled) to keep track of the
 * return values at each dispatch execution, but it does tend to make sense when
 * dealing with "direct" dispatches.
 *
 * @return The return value of executing the single dispatch.
 */
function executeDirectDispatch(event) {
  if ("production" !== process.env.NODE_ENV) {
    validateEventDispatches(event);
  }
  var dispatchListener = event._dispatchListeners;
  var dispatchID = event._dispatchIDs;
  ("production" !== process.env.NODE_ENV ? invariant(
    !Array.isArray(dispatchListener),
    'executeDirectDispatch(...): Invalid `event`.'
  ) : invariant(!Array.isArray(dispatchListener)));
  var res = dispatchListener ?
    dispatchListener(event, dispatchID) :
    null;
  event._dispatchListeners = null;
  event._dispatchIDs = null;
  return res;
}

/**
 * @param {SyntheticEvent} event
 * @return {bool} True iff number of dispatches accumulated is greater than 0.
 */
function hasDispatches(event) {
  return !!event._dispatchListeners;
}

/**
 * General utilities that are useful in creating custom Event Plugins.
 */
var EventPluginUtils = {
  isEndish: isEndish,
  isMoveish: isMoveish,
  isStartish: isStartish,
  executeDispatchesInOrder: executeDispatchesInOrder,
  executeDispatchesInOrderStopAtTrue: executeDispatchesInOrderStopAtTrue,
  executeDirectDispatch: executeDirectDispatch,
  hasDispatches: hasDispatches,
  executeDispatch: executeDispatch
};

module.exports = EventPluginUtils;

},{"./EventConstants":62,"./invariant":156,"__browserify_process":35}],67:[function(require,module,exports){
var process=require("__browserify_process");/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule EventPropagators
 */

"use strict";

var CallbackRegistry = require("./CallbackRegistry");
var EventConstants = require("./EventConstants");

var accumulate = require("./accumulate");
var forEachAccumulated = require("./forEachAccumulated");
var getListener = CallbackRegistry.getListener;
var PropagationPhases = EventConstants.PropagationPhases;

/**
 * Injected dependencies:
 */

/**
 * - `InstanceHandle`: [required] Module that performs logical traversals of DOM
 *   hierarchy given ids of the logical DOM elements involved.
 */
var injection = {
  InstanceHandle: null,
  injectInstanceHandle: function(InjectedInstanceHandle) {
    injection.InstanceHandle = InjectedInstanceHandle;
    if ("production" !== process.env.NODE_ENV) {
      injection.validate();
    }
  },
  validate: function() {
    var invalid = !injection.InstanceHandle||
      !injection.InstanceHandle.traverseTwoPhase ||
      !injection.InstanceHandle.traverseEnterLeave;
    if (invalid) {
      throw new Error('InstanceHandle not injected before use!');
    }
  }
};

/**
 * Some event types have a notion of different registration names for different
 * "phases" of propagation. This finds listeners by a given phase.
 */
function listenerAtPhase(id, event, propagationPhase) {
  var registrationName =
    event.dispatchConfig.phasedRegistrationNames[propagationPhase];
  return getListener(id, registrationName);
}

/**
 * Tags a `SyntheticEvent` with dispatched listeners. Creating this function
 * here, allows us to not have to bind or create functions for each event.
 * Mutating the event's members allows us to not have to create a wrapping
 * "dispatch" object that pairs the event with the listener.
 */
function accumulateDirectionalDispatches(domID, upwards, event) {
  if ("production" !== process.env.NODE_ENV) {
    if (!domID) {
      throw new Error('Dispatching id must not be null');
    }
    injection.validate();
  }
  var phase = upwards ? PropagationPhases.bubbled : PropagationPhases.captured;
  var listener = listenerAtPhase(domID, event, phase);
  if (listener) {
    event._dispatchListeners = accumulate(event._dispatchListeners, listener);
    event._dispatchIDs = accumulate(event._dispatchIDs, domID);
  }
}

/**
 * Collect dispatches (must be entirely collected before dispatching - see unit
 * tests). Lazily allocate the array to conserve memory.  We must loop through
 * each event and perform the traversal for each one. We can not perform a
 * single traversal for the entire collection of events because each event may
 * have a different target.
 */
function accumulateTwoPhaseDispatchesSingle(event) {
  if (event && event.dispatchConfig.phasedRegistrationNames) {
    injection.InstanceHandle.traverseTwoPhase(
      event.dispatchMarker,
      accumulateDirectionalDispatches,
      event
    );
  }
}


/**
 * Accumulates without regard to direction, does not look for phased
 * registration names. Same as `accumulateDirectDispatchesSingle` but without
 * requiring that the `dispatchMarker` be the same as the dispatched ID.
 */
function accumulateDispatches(id, ignoredDirection, event) {
  if (event && event.dispatchConfig.registrationName) {
    var registrationName = event.dispatchConfig.registrationName;
    var listener = getListener(id, registrationName);
    if (listener) {
      event._dispatchListeners = accumulate(event._dispatchListeners, listener);
      event._dispatchIDs = accumulate(event._dispatchIDs, id);
    }
  }
}

/**
 * Accumulates dispatches on an `SyntheticEvent`, but only for the
 * `dispatchMarker`.
 * @param {SyntheticEvent} event
 */
function accumulateDirectDispatchesSingle(event) {
  if (event && event.dispatchConfig.registrationName) {
    accumulateDispatches(event.dispatchMarker, null, event);
  }
}

function accumulateTwoPhaseDispatches(events) {
  if ("production" !== process.env.NODE_ENV) {
    injection.validate();
  }
  forEachAccumulated(events, accumulateTwoPhaseDispatchesSingle);
}

function accumulateEnterLeaveDispatches(leave, enter, fromID, toID) {
  if ("production" !== process.env.NODE_ENV) {
    injection.validate();
  }
  injection.InstanceHandle.traverseEnterLeave(
    fromID,
    toID,
    accumulateDispatches,
    leave,
    enter
  );
}


function accumulateDirectDispatches(events) {
  if ("production" !== process.env.NODE_ENV) {
    injection.validate();
  }
  forEachAccumulated(events, accumulateDirectDispatchesSingle);
}



/**
 * A small set of propagation patterns, each of which will accept a small amount
 * of information, and generate a set of "dispatch ready event objects" - which
 * are sets of events that have already been annotated with a set of dispatched
 * listener functions/ids. The API is designed this way to discourage these
 * propagation strategies from actually executing the dispatches, since we
 * always want to collect the entire set of dispatches before executing event a
 * single one.
 *
 * @constructor EventPropagators
 */
var EventPropagators = {
  accumulateTwoPhaseDispatches: accumulateTwoPhaseDispatches,
  accumulateDirectDispatches: accumulateDirectDispatches,
  accumulateEnterLeaveDispatches: accumulateEnterLeaveDispatches,
  injection: injection
};

module.exports = EventPropagators;

},{"./CallbackRegistry":52,"./EventConstants":62,"./accumulate":132,"./forEachAccumulated":146,"__browserify_process":35}],68:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ExecutionEnvironment
 */

/*jslint evil: true */

"use strict";

var canUseDOM = typeof window !== 'undefined';

/**
 * Simple, lightweight module assisting with the detection and context of
 * Worker. Helps avoid circular dependencies and allows code to reason about
 * whether or not they are in a Worker, even if they never include the main
 * `ReactWorker` dependency.
 */
var ExecutionEnvironment = {

  canUseDOM: canUseDOM,

  canUseWorkers: typeof Worker !== 'undefined',

  isInWorker: !canUseDOM // For now, this is true - might change in the future.

};

module.exports = ExecutionEnvironment;

},{}],69:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule LinkedStateMixin
 * @typechecks static-only
 */

"use strict";

var ReactLink = require("./ReactLink");
var ReactStateSetters = require("./ReactStateSetters");

/**
 * A simple mixin around ReactLink.forState().
 */
var LinkedStateMixin = {
  /**
   * Create a ReactLink that's linked to part of this component's state. The
   * ReactLink will have the current value of this.state[key] and will call
   * setState() when a change is requested.
   *
   * @param {string} key state key to update. Note: you may want to use keyOf()
   * if you're using Google Closure Compiler advanced mode.
   * @return {ReactLink} ReactLink instance linking to the state.
   */
  linkState: function(key) {
    return new ReactLink(
      this.state[key],
      ReactStateSetters.createStateKeySetter(this, key)
    );
  }
};

module.exports = LinkedStateMixin;

},{"./ReactLink":99,"./ReactStateSetters":111}],70:[function(require,module,exports){
var process=require("__browserify_process");/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule LinkedValueMixin
 * @typechecks static-only
 */

"use strict";

var invariant = require("./invariant");

/**
 * Provide a linked `value` attribute for controlled forms. You should not use
 * this outside of the ReactDOM controlled form components.
 */
var LinkedValueMixin = {
  _assertLink: function() {
    ("production" !== process.env.NODE_ENV ? invariant(
      this.props.value == null && this.props.onChange == null,
      'Cannot provide a valueLink and a value or onChange event. If you ' +
        'want to use value or onChange, you probably don\'t want to use ' +
        'valueLink'
    ) : invariant(this.props.value == null && this.props.onChange == null));
  },

  /**
   * @return {*} current value of the input either from value prop or link.
   */
  getValue: function() {
    if (this.props.valueLink) {
      this._assertLink();
      return this.props.valueLink.value;
    }
    return this.props.value;
  },

  /**
   * @return {function} change callback either from onChange prop or link.
   */
  getOnChange: function() {
    if (this.props.valueLink) {
      this._assertLink();
      return this._handleLinkedValueChange;
    }
    return this.props.onChange;
  },

  /**
   * @param {SyntheticEvent} e change event to handle
   */
  _handleLinkedValueChange: function(e) {
    this.props.valueLink.requestChange(e.target.value);
  }
};

module.exports = LinkedValueMixin;

},{"./invariant":156,"__browserify_process":35}],71:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule MobileSafariClickEventPlugin
 * @typechecks static-only
 */

"use strict";

var EventConstants = require("./EventConstants");

var emptyFunction = require("./emptyFunction");

var topLevelTypes = EventConstants.topLevelTypes;

/**
 * Mobile Safari does not fire properly bubble click events on non-interactive
 * elements, which means delegated click listeners do not fire. The workaround
 * for this bug involves attaching an empty click listener on the target node.
 *
 * This particular plugin works around the bug by attaching an empty click
 * listener on `touchstart` (which does fire on every element).
 */
var MobileSafariClickEventPlugin = {

  eventTypes: null,

  /**
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {DOMEventTarget} topLevelTarget The listening component root node.
   * @param {string} topLevelTargetID ID of `topLevelTarget`.
   * @param {object} nativeEvent Native browser event.
   * @return {*} An accumulation of synthetic events.
   * @see {EventPluginHub.extractEvents}
   */
  extractEvents: function(
      topLevelType,
      topLevelTarget,
      topLevelTargetID,
      nativeEvent) {
    if (topLevelType === topLevelTypes.topTouchStart) {
      var target = nativeEvent.target;
      if (target && !target.onclick) {
        target.onclick = emptyFunction;
      }
    }
  }

};

module.exports = MobileSafariClickEventPlugin;

},{"./EventConstants":62,"./emptyFunction":141}],72:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule PooledClass
 */

"use strict";

/**
 * Static poolers. Several custom versions for each potential number of
 * arguments. A completely generic pooler is easy to implement, but would
 * require accessing the `arguments` object. In each of these, `this` refers to
 * the Class itself, not an instance. If any others are needed, simply add them
 * here, or in their own files.
 */
var oneArgumentPooler = function(copyFieldsFrom) {
  var Klass = this;
  if (Klass.instancePool.length) {
    var instance = Klass.instancePool.pop();
    Klass.call(instance, copyFieldsFrom);
    return instance;
  } else {
    return new Klass(copyFieldsFrom);
  }
};

var twoArgumentPooler = function(a1, a2) {
  var Klass = this;
  if (Klass.instancePool.length) {
    var instance = Klass.instancePool.pop();
    Klass.call(instance, a1, a2);
    return instance;
  } else {
    return new Klass(a1, a2);
  }
};

var threeArgumentPooler = function(a1, a2, a3) {
  var Klass = this;
  if (Klass.instancePool.length) {
    var instance = Klass.instancePool.pop();
    Klass.call(instance, a1, a2, a3);
    return instance;
  } else {
    return new Klass(a1, a2, a3);
  }
};

var fiveArgumentPooler = function(a1, a2, a3, a4, a5) {
  var Klass = this;
  if (Klass.instancePool.length) {
    var instance = Klass.instancePool.pop();
    Klass.call(instance, a1, a2, a3, a4, a5);
    return instance;
  } else {
    return new Klass(a1, a2, a3, a4, a5);
  }
};

var standardReleaser = function(instance) {
  var Klass = this;
  if (instance.destructor) {
    instance.destructor();
  }
  if (Klass.instancePool.length < Klass.poolSize) {
    Klass.instancePool.push(instance);
  }
};

var DEFAULT_POOL_SIZE = 10;
var DEFAULT_POOLER = oneArgumentPooler;

/**
 * Augments `CopyConstructor` to be a poolable class, augmenting only the class
 * itself (statically) not adding any prototypical fields. Any CopyConstructor
 * you give this may have a `poolSize` property, and will look for a
 * prototypical `destructor` on instances (optional).
 *
 * @param {Function} CopyConstructor Constructor that can be used to reset.
 * @param {Function} pooler Customizable pooler.
 */
var addPoolingTo = function(CopyConstructor, pooler) {
  var NewKlass = CopyConstructor;
  NewKlass.instancePool = [];
  NewKlass.getPooled = pooler || DEFAULT_POOLER;
  if (!NewKlass.poolSize) {
    NewKlass.poolSize = DEFAULT_POOL_SIZE;
  }
  NewKlass.release = standardReleaser;
  return NewKlass;
};

var PooledClass = {
  addPoolingTo: addPoolingTo,
  oneArgumentPooler: oneArgumentPooler,
  twoArgumentPooler: twoArgumentPooler,
  threeArgumentPooler: threeArgumentPooler,
  fiveArgumentPooler: fiveArgumentPooler
};

module.exports = PooledClass;

},{}],73:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule React
 */

"use strict";

var ReactComponent = require("./ReactComponent");
var ReactCompositeComponent = require("./ReactCompositeComponent");
var ReactCurrentOwner = require("./ReactCurrentOwner");
var ReactDOM = require("./ReactDOM");
var ReactDOMComponent = require("./ReactDOMComponent");
var ReactDefaultInjection = require("./ReactDefaultInjection");
var ReactInstanceHandles = require("./ReactInstanceHandles");
var ReactMount = require("./ReactMount");
var ReactMultiChild = require("./ReactMultiChild");
var ReactPerf = require("./ReactPerf");
var ReactPropTypes = require("./ReactPropTypes");
var ReactServerRendering = require("./ReactServerRendering");
var ReactTextComponent = require("./ReactTextComponent");

ReactDefaultInjection.inject();

var React = {
  DOM: ReactDOM,
  PropTypes: ReactPropTypes,
  initializeTouchEvents: function(shouldUseTouch) {
    ReactMount.useTouchEvents = shouldUseTouch;
  },
  createClass: ReactCompositeComponent.createClass,
  constructAndRenderComponent: ReactMount.constructAndRenderComponent,
  constructAndRenderComponentByID: ReactMount.constructAndRenderComponentByID,
  renderComponent: ReactPerf.measure(
    'React',
    'renderComponent',
    ReactMount.renderComponent
  ),
  renderComponentToString: ReactServerRendering.renderComponentToString,
  unmountComponentAtNode: ReactMount.unmountComponentAtNode,
  unmountAndReleaseReactRootNode: ReactMount.unmountAndReleaseReactRootNode,
  isValidClass: ReactCompositeComponent.isValidClass,
  isValidComponent: ReactComponent.isValidComponent,
  __internals: {
    Component: ReactComponent,
    CurrentOwner: ReactCurrentOwner,
    DOMComponent: ReactDOMComponent,
    InstanceHandles: ReactInstanceHandles,
    Mount: ReactMount,
    MultiChild: ReactMultiChild,
    TextComponent: ReactTextComponent
  }
};

// Version exists only in the open-source version of React, not in Facebook's
// internal version.
React.version = '0.8.0';

module.exports = React;

},{"./ReactComponent":75,"./ReactCompositeComponent":78,"./ReactCurrentOwner":79,"./ReactDOM":80,"./ReactDOMComponent":82,"./ReactDefaultInjection":91,"./ReactInstanceHandles":98,"./ReactMount":101,"./ReactMultiChild":103,"./ReactPerf":106,"./ReactPropTypes":108,"./ReactServerRendering":110,"./ReactTextComponent":112}],74:[function(require,module,exports){
var process=require("__browserify_process");/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactChildren
 */

"use strict";

var PooledClass = require("./PooledClass");

var invariant = require("./invariant");
var traverseAllChildren = require("./traverseAllChildren");

var twoArgumentPooler = PooledClass.twoArgumentPooler;
var threeArgumentPooler = PooledClass.threeArgumentPooler;

/**
 * PooledClass representing the bookkeeping associated with performing a child
 * traversal. Allows avoiding binding callbacks.
 *
 * @constructor ForEachBookKeeping
 * @param {!function} forEachFunction Function to perform traversal with.
 * @param {?*} forEachContext Context to perform context with.
 */
function ForEachBookKeeping(forEachFunction, forEachContext) {
  this.forEachFunction = forEachFunction;
  this.forEachContext = forEachContext;
}
PooledClass.addPoolingTo(ForEachBookKeeping, twoArgumentPooler);

function forEachSingleChild(traverseContext, child, name, i) {
  var forEachBookKeeping = traverseContext;
  forEachBookKeeping.forEachFunction.call(
    forEachBookKeeping.forEachContext, child, i);
}

/**
 * Iterates through children that are typically specified as `props.children`.
 *
 * The provided forEachFunc(child, index) will be called for each
 * leaf child.
 *
 * @param {array} children
 * @param {function(*, int)} forEachFunc.
 * @param {*} forEachContext Context for forEachContext.
 */
function forEachChildren(children, forEachFunc, forEachContext) {
  if (children == null) {
    return children;
  }

  var traverseContext =
    ForEachBookKeeping.getPooled(forEachFunc, forEachContext);
  traverseAllChildren(children, forEachSingleChild, traverseContext);
  ForEachBookKeeping.release(traverseContext);
}

/**
 * PooledClass representing the bookkeeping associated with performing a child
 * mapping. Allows avoiding binding callbacks.
 *
 * @constructor MapBookKeeping
 * @param {!*} mapResult Object containing the ordered map of results.
 * @param {!function} mapFunction Function to perform mapping with.
 * @param {?*} mapContext Context to perform mapping with.
 */
function MapBookKeeping(mapResult, mapFunction, mapContext) {
  this.mapResult = mapResult;
  this.mapFunction = mapFunction;
  this.mapContext = mapContext;
}
PooledClass.addPoolingTo(MapBookKeeping, threeArgumentPooler);

function mapSingleChildIntoContext(traverseContext, child, name, i) {
  var mapBookKeeping = traverseContext;
  var mapResult = mapBookKeeping.mapResult;
  var mappedChild =
    mapBookKeeping.mapFunction.call(mapBookKeeping.mapContext, child, i);
  // We found a component instance
  ("production" !== process.env.NODE_ENV ? invariant(
    !mapResult.hasOwnProperty(name),
    'ReactChildren.map(...): Encountered two children with the same key, ' +
    '`%s`. Children keys must be unique.',
    name
  ) : invariant(!mapResult.hasOwnProperty(name)));
  mapResult[name] = mappedChild;
}

/**
 * Maps children that are typically specified as `props.children`.
 *
 * The provided mapFunction(child, key, index) will be called for each
 * leaf child.
 *
 * TODO: This may likely break any calls to `ReactChildren.map` that were
 * previously relying on the fact that we guarded against null children.
 *
 * @param {array} children
 * @param {function(*, int)} mapFunction.
 * @param {*} mapContext Context for mapFunction.
 * @return {array} mirrored array with mapped children.
 */
function mapChildren(children, func, context) {
  if (children == null) {
    return children;
  }

  var mapResult = {};
  var traverseContext = MapBookKeeping.getPooled(mapResult, func, context);
  traverseAllChildren(children, mapSingleChildIntoContext, traverseContext);
  MapBookKeeping.release(traverseContext);
  return mapResult;
}

var ReactChildren = {
  forEach: forEachChildren,
  map: mapChildren
};

module.exports = ReactChildren;

},{"./PooledClass":72,"./invariant":156,"./traverseAllChildren":174,"__browserify_process":35}],75:[function(require,module,exports){
var process=require("__browserify_process");/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactComponent
 */

"use strict";

var ReactComponentEnvironment = require("./ReactComponentEnvironment");
var ReactCurrentOwner = require("./ReactCurrentOwner");
var ReactOwner = require("./ReactOwner");
var ReactUpdates = require("./ReactUpdates");

var invariant = require("./invariant");
var keyMirror = require("./keyMirror");
var merge = require("./merge");

/**
 * Every React component is in one of these life cycles.
 */
var ComponentLifeCycle = keyMirror({
  /**
   * Mounted components have a DOM node representation and are capable of
   * receiving new props.
   */
  MOUNTED: null,
  /**
   * Unmounted components are inactive and cannot receive new props.
   */
  UNMOUNTED: null
});

/**
 * Warn if there's no key explicitly set on dynamic arrays of children.
 * This allows us to keep track of children between updates.
 */

var ownerHasWarned = {};

/**
 * Warn if the component doesn't have an explicit key assigned to it.
 * This component is in an array. The array could grow and shrink or be
 * reordered. All children, that hasn't already been validated, are required to
 * have a "key" property assigned to it.
 *
 * @internal
 * @param {ReactComponent} component Component that requires a key.
 */
function validateExplicitKey(component) {
  if (component.__keyValidated__ || component.props.key != null) {
    return;
  }
  component.__keyValidated__ = true;

  // We can't provide friendly warnings for top level components.
  if (!ReactCurrentOwner.current) {
    return;
  }

  // Name of the component whose render method tried to pass children.
  var currentName = ReactCurrentOwner.current.constructor.displayName;
  if (ownerHasWarned.hasOwnProperty(currentName)) {
    return;
  }
  ownerHasWarned[currentName] = true;

  var message = 'Each child in an array should have a unique "key" prop. ' +
                'Check the render method of ' + currentName + '.';
  if (!component.isOwnedBy(ReactCurrentOwner.current)) {
    // Name of the component that originally created this child.
    var childOwnerName =
      component.props.__owner__ &&
      component.props.__owner__.constructor.displayName;

    // Usually the current owner is the offender, but if it accepts
    // children as a property, it may be the creator of the child that's
    // responsible for assigning it a key.
    message += ' It was passed a child from ' + childOwnerName + '.';
  }

  console.warn(message);
}

/**
 * Ensure that every component either is passed in a static location or, if
 * if it's passed in an array, has an explicit key property defined.
 *
 * @internal
 * @param {*} component Statically passed child of any type.
 * @return {boolean}
 */
function validateChildKeys(component) {
  if (Array.isArray(component)) {
    for (var i = 0; i < component.length; i++) {
      var child = component[i];
      if (ReactComponent.isValidComponent(child)) {
        validateExplicitKey(child);
      }
    }
  } else if (ReactComponent.isValidComponent(component)) {
    // This component was passed in a valid location.
    component.__keyValidated__ = true;
  }
}

/**
 * Components are the basic units of composition in React.
 *
 * Every component accepts a set of keyed input parameters known as "props" that
 * are initialized by the constructor. Once a component is mounted, the props
 * can be mutated using `setProps` or `replaceProps`.
 *
 * Every component is capable of the following operations:
 *
 *   `mountComponent`
 *     Initializes the component, renders markup, and registers event listeners.
 *
 *   `receiveComponent`
 *     Updates the rendered DOM nodes to match the given component.
 *
 *   `unmountComponent`
 *     Releases any resources allocated by this component.
 *
 * Components can also be "owned" by other components. Being owned by another
 * component means being constructed by that component. This is different from
 * being the child of a component, which means having a DOM representation that
 * is a child of the DOM representation of that component.
 *
 * @class ReactComponent
 */
var ReactComponent = {

  /**
   * @param {?object} object
   * @return {boolean} True if `object` is a valid component.
   * @final
   */
  isValidComponent: function(object) {
    return !!(
      object &&
      typeof object.mountComponentIntoNode === 'function' &&
      typeof object.receiveComponent === 'function'
    );
  },

  /**
   * Generate a key string that identifies a component within a set.
   *
   * @param {*} component A component that could contain a manual key.
   * @param {number} index Index that is used if a manual key is not provided.
   * @return {string}
   * @internal
   */
  getKey: function(component, index) {
    if (component && component.props && component.props.key != null) {
      // Explicit key
      return '{' + component.props.key + '}';
    }
    // Implicit key determined by the index in the set
    return '[' + index + ']';
  },

  /**
   * @internal
   */
  LifeCycle: ComponentLifeCycle,

  /**
   * Injected module that provides ability to mutate individual properties.
   * Injected into the base class because many different subclasses need access
   * to this.
   *
   * @internal
   */
  DOMIDOperations: ReactComponentEnvironment.DOMIDOperations,

  /**
   * Optionally injectable environment dependent cleanup hook. (server vs.
   * browser etc). Example: A browser system caches DOM nodes based on component
   * ID and must remove that cache entry when this instance is unmounted.
   *
   * @private
   */
  unmountIDFromEnvironment: ReactComponentEnvironment.unmountIDFromEnvironment,

  /**
   * The "image" of a component tree, is the platform specific (typically
   * serialized) data that represents a tree of lower level UI building blocks.
   * On the web, this "image" is HTML markup which describes a construction of
   * low level `div` and `span` nodes. Other platforms may have different
   * encoding of this "image". This must be injected.
   *
   * @private
   */
  mountImageIntoNode: ReactComponentEnvironment.mountImageIntoNode,

  /**
   * React references `ReactReconcileTransaction` using this property in order
   * to allow dependency injection.
   *
   * @internal
   */
  ReactReconcileTransaction:
    ReactComponentEnvironment.ReactReconcileTransaction,

  /**
   * Base functionality for every ReactComponent constructor. Mixed into the
   * `ReactComponent` prototype, but exposed statically for easy access.
   *
   * @lends {ReactComponent.prototype}
   */
  Mixin: merge(ReactComponentEnvironment.Mixin, {

    /**
     * Checks whether or not this component is mounted.
     *
     * @return {boolean} True if mounted, false otherwise.
     * @final
     * @protected
     */
    isMounted: function() {
      return this._lifeCycleState === ComponentLifeCycle.MOUNTED;
    },

    /**
     * Sets a subset of the props.
     *
     * @param {object} partialProps Subset of the next props.
     * @param {?function} callback Called after props are updated.
     * @final
     * @public
     */
    setProps: function(partialProps, callback) {
      // Merge with `_pendingProps` if it exists, otherwise with existing props.
      this.replaceProps(
        merge(this._pendingProps || this.props, partialProps),
        callback
      );
    },

    /**
     * Replaces all of the props.
     *
     * @param {object} props New props.
     * @param {?function} callback Called after props are updated.
     * @final
     * @public
     */
    replaceProps: function(props, callback) {
      ("production" !== process.env.NODE_ENV ? invariant(
        !this.props.__owner__,
        'replaceProps(...): You called `setProps` or `replaceProps` on a ' +
        'component with an owner. This is an anti-pattern since props will ' +
        'get reactively updated when rendered. Instead, change the owner\'s ' +
        '`render` method to pass the correct value as props to the component ' +
        'where it is created.'
      ) : invariant(!this.props.__owner__));
      ("production" !== process.env.NODE_ENV ? invariant(
        this.isMounted(),
        'replaceProps(...): Can only update a mounted component.'
      ) : invariant(this.isMounted()));
      this._pendingProps = props;
      ReactUpdates.enqueueUpdate(this, callback);
    },

    /**
     * Base constructor for all React component.
     *
     * Subclasses that override this method should make sure to invoke
     * `ReactComponent.Mixin.construct.call(this, ...)`.
     *
     * @param {?object} initialProps
     * @param {*} children
     * @internal
     */
    construct: function(initialProps, children) {
      this.props = initialProps || {};
      // Record the component responsible for creating this component.
      this.props.__owner__ = ReactCurrentOwner.current;
      // All components start unmounted.
      this._lifeCycleState = ComponentLifeCycle.UNMOUNTED;

      this._pendingProps = null;
      this._pendingCallbacks = null;

      // Children can be more than one argument
      var childrenLength = arguments.length - 1;
      if (childrenLength === 1) {
        if ("production" !== process.env.NODE_ENV) {
          validateChildKeys(children);
        }
        this.props.children = children;
      } else if (childrenLength > 1) {
        var childArray = Array(childrenLength);
        for (var i = 0; i < childrenLength; i++) {
          if ("production" !== process.env.NODE_ENV) {
            validateChildKeys(arguments[i + 1]);
          }
          childArray[i] = arguments[i + 1];
        }
        this.props.children = childArray;
      }
    },

    /**
     * Initializes the component, renders markup, and registers event listeners.
     *
     * NOTE: This does not insert any nodes into the DOM.
     *
     * Subclasses that override this method should make sure to invoke
     * `ReactComponent.Mixin.mountComponent.call(this, ...)`.
     *
     * @param {string} rootID DOM ID of the root node.
     * @param {ReactReconcileTransaction} transaction
     * @param {number} mountDepth number of components in the owner hierarchy.
     * @return {?string} Rendered markup to be inserted into the DOM.
     * @internal
     */
    mountComponent: function(rootID, transaction, mountDepth) {
      ("production" !== process.env.NODE_ENV ? invariant(
        !this.isMounted(),
        'mountComponent(%s, ...): Can only mount an unmounted component.',
        rootID
      ) : invariant(!this.isMounted()));
      var props = this.props;
      if (props.ref != null) {
        ReactOwner.addComponentAsRefTo(this, props.ref, props.__owner__);
      }
      this._rootNodeID = rootID;
      this._lifeCycleState = ComponentLifeCycle.MOUNTED;
      this._mountDepth = mountDepth;
      // Effectively: return '';
    },

    /**
     * Releases any resources allocated by `mountComponent`.
     *
     * NOTE: This does not remove any nodes from the DOM.
     *
     * Subclasses that override this method should make sure to invoke
     * `ReactComponent.Mixin.unmountComponent.call(this)`.
     *
     * @internal
     */
    unmountComponent: function() {
      ("production" !== process.env.NODE_ENV ? invariant(
        this.isMounted(),
        'unmountComponent(): Can only unmount a mounted component.'
      ) : invariant(this.isMounted()));
      var props = this.props;
      if (props.ref != null) {
        ReactOwner.removeComponentAsRefFrom(this, props.ref, props.__owner__);
      }
      ReactComponent.unmountIDFromEnvironment(this._rootNodeID);
      this._rootNodeID = null;
      this._lifeCycleState = ComponentLifeCycle.UNMOUNTED;
    },

    /**
     * Given a new instance of this component, updates the rendered DOM nodes
     * as if that instance was rendered instead.
     *
     * Subclasses that override this method should make sure to invoke
     * `ReactComponent.Mixin.receiveComponent.call(this, ...)`.
     *
     * @param {object} nextComponent Next set of properties.
     * @param {ReactReconcileTransaction} transaction
     * @internal
     */
    receiveComponent: function(nextComponent, transaction) {
      ("production" !== process.env.NODE_ENV ? invariant(
        this.isMounted(),
        'receiveComponent(...): Can only update a mounted component.'
      ) : invariant(this.isMounted()));
      this._pendingProps = nextComponent.props;
      this._performUpdateIfNecessary(transaction);
    },

    /**
     * Call `_performUpdateIfNecessary` within a new transaction.
     *
     * @param {ReactReconcileTransaction} transaction
     * @internal
     */
    performUpdateIfNecessary: function() {
      var transaction = ReactComponent.ReactReconcileTransaction.getPooled();
      transaction.perform(this._performUpdateIfNecessary, this, transaction);
      ReactComponent.ReactReconcileTransaction.release(transaction);
    },

    /**
     * If `_pendingProps` is set, update the component.
     *
     * @param {ReactReconcileTransaction} transaction
     * @internal
     */
    _performUpdateIfNecessary: function(transaction) {
      if (this._pendingProps == null) {
        return;
      }
      var prevProps = this.props;
      this.props = this._pendingProps;
      this._pendingProps = null;
      this.updateComponent(transaction, prevProps);
    },

    /**
     * Updates the component's currently mounted representation.
     *
     * @param {ReactReconcileTransaction} transaction
     * @param {object} prevProps
     * @internal
     */
    updateComponent: function(transaction, prevProps) {
      var props = this.props;
      // If either the owner or a `ref` has changed, make sure the newest owner
      // has stored a reference to `this`, and the previous owner (if different)
      // has forgotten the reference to `this`.
      if (props.__owner__ !== prevProps.__owner__ ||
          props.ref !== prevProps.ref) {
        if (prevProps.ref != null) {
          ReactOwner.removeComponentAsRefFrom(
            this, prevProps.ref, prevProps.__owner__
          );
        }
        // Correct, even if the owner is the same, and only the ref has changed.
        if (props.ref != null) {
          ReactOwner.addComponentAsRefTo(this, props.ref, props.__owner__);
        }
      }
    },

    /**
     * Mounts this component and inserts it into the DOM.
     *
     * @param {string} rootID DOM ID of the root node.
     * @param {DOMElement} container DOM element to mount into.
     * @param {boolean} shouldReuseMarkup If true, do not insert markup
     * @final
     * @internal
     * @see {ReactMount.renderComponent}
     */
    mountComponentIntoNode: function(rootID, container, shouldReuseMarkup) {
      var transaction = ReactComponent.ReactReconcileTransaction.getPooled();
      transaction.perform(
        this._mountComponentIntoNode,
        this,
        rootID,
        container,
        transaction,
        shouldReuseMarkup
      );
      ReactComponent.ReactReconcileTransaction.release(transaction);
    },

    /**
     * @param {string} rootID DOM ID of the root node.
     * @param {DOMElement} container DOM element to mount into.
     * @param {ReactReconcileTransaction} transaction
     * @param {boolean} shouldReuseMarkup If true, do not insert markup
     * @final
     * @private
     */
    _mountComponentIntoNode: function(
        rootID,
        container,
        transaction,
        shouldReuseMarkup) {
      var markup = this.mountComponent(rootID, transaction, 0);
      ReactComponent.mountImageIntoNode(markup, container, shouldReuseMarkup);
    },

    /**
     * Checks if this component is owned by the supplied `owner` component.
     *
     * @param {ReactComponent} owner Component to check.
     * @return {boolean} True if `owners` owns this component.
     * @final
     * @internal
     */
    isOwnedBy: function(owner) {
      return this.props.__owner__ === owner;
    },

    /**
     * Gets another component, that shares the same owner as this one, by ref.
     *
     * @param {string} ref of a sibling Component.
     * @return {?ReactComponent} the actual sibling Component.
     * @final
     * @internal
     */
    getSiblingByRef: function(ref) {
      var owner = this.props.__owner__;
      if (!owner || !owner.refs) {
        return null;
      }
      return owner.refs[ref];
    }
  })
};

module.exports = ReactComponent;

},{"./ReactComponentEnvironment":77,"./ReactCurrentOwner":79,"./ReactOwner":105,"./ReactUpdates":117,"./invariant":156,"./keyMirror":162,"./merge":165,"__browserify_process":35}],76:[function(require,module,exports){
var process=require("__browserify_process");/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactComponentBrowserEnvironment
 */

/*jslint evil: true */

"use strict";

var ReactDOMIDOperations = require("./ReactDOMIDOperations");
var ReactMarkupChecksum = require("./ReactMarkupChecksum");
var ReactMount = require("./ReactMount");
var ReactReconcileTransaction = require("./ReactReconcileTransaction");

var getReactRootElementInContainer = require("./getReactRootElementInContainer");
var invariant = require("./invariant");
var mutateHTMLNodeWithMarkup = require("./mutateHTMLNodeWithMarkup");


var ELEMENT_NODE_TYPE = 1;
var DOC_NODE_TYPE = 9;


/**
 * Abstracts away all functionality of `ReactComponent` requires knowledge of
 * the browser context.
 */
var ReactComponentBrowserEnvironment = {
  /**
   * Mixed into every component instance.
   */
  Mixin: {
    /**
     * Returns the DOM node rendered by this component.
     *
     * @return {DOMElement} The root node of this component.
     * @final
     * @protected
     */
    getDOMNode: function() {
      ("production" !== process.env.NODE_ENV ? invariant(
        this.isMounted(),
        'getDOMNode(): A component must be mounted to have a DOM node.'
      ) : invariant(this.isMounted()));
      return ReactMount.getNode(this._rootNodeID);
    }
  },

  ReactReconcileTransaction: ReactReconcileTransaction,

  DOMIDOperations: ReactDOMIDOperations,

  /**
   * If a particular environment requires that some resources be cleaned up,
   * specify this in the injected Mixin. In the DOM, we would likely want to
   * purge any cached node ID lookups.
   *
   * @private
   */
  unmountIDFromEnvironment: function(rootNodeID) {
    ReactMount.purgeID(rootNodeID);
  },

  /**
   * @param {string} markup Markup string to place into the DOM Element.
   * @param {DOMElement} container DOM Element to insert markup into.
   * @param {boolean} shouldReuseMarkup Should reuse the existing markup in the
   * container if possible.
   */
  mountImageIntoNode: function(markup, container, shouldReuseMarkup) {
    ("production" !== process.env.NODE_ENV ? invariant(
      container && (
        container.nodeType === ELEMENT_NODE_TYPE ||
        container.nodeType === DOC_NODE_TYPE && ReactMount.allowFullPageRender
      ),
      'mountComponentIntoNode(...): Target container is not valid.'
    ) : invariant(container && (
      container.nodeType === ELEMENT_NODE_TYPE ||
      container.nodeType === DOC_NODE_TYPE && ReactMount.allowFullPageRender
    )));
    if (shouldReuseMarkup) {
      if (ReactMarkupChecksum.canReuseMarkup(
            markup,
            getReactRootElementInContainer(container))) {
        return;
      } else {
        if ("production" !== process.env.NODE_ENV) {
          console.warn(
            'React attempted to use reuse markup in a container but the ' +
            'checksum was invalid. This generally means that you are using ' +
            'server rendering and the markup generated on the server was ' +
            'not what the client was expecting. React injected new markup ' +
            'to compensate which works but you have lost many of the ' +
            'benefits of server rendering. Instead, figure out why the ' +
            'markup being generated is different on the client or server.'
          );
        }
      }
    }

    // You can't naively set the innerHTML of the entire document. You need
    // to mutate documentElement which requires doing some crazy tricks. See
    // mutateHTMLNodeWithMarkup()
    if (container.nodeType === DOC_NODE_TYPE) {
      mutateHTMLNodeWithMarkup(container.documentElement, markup);
      return;
    }

    // Asynchronously inject markup by ensuring that the container is not in
    // the document when settings its `innerHTML`.
    var parent = container.parentNode;
    if (parent) {
      var next = container.nextSibling;
      parent.removeChild(container);
      container.innerHTML = markup;
      if (next) {
        parent.insertBefore(container, next);
      } else {
        parent.appendChild(container);
      }
    } else {
      container.innerHTML = markup;
    }
  }
};

module.exports = ReactComponentBrowserEnvironment;

},{"./ReactDOMIDOperations":84,"./ReactMarkupChecksum":100,"./ReactMount":101,"./ReactReconcileTransaction":109,"./getReactRootElementInContainer":152,"./invariant":156,"./mutateHTMLNodeWithMarkup":169,"__browserify_process":35}],77:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactComponentEnvironment
 */

var ReactComponentBrowserEnvironment =
  require("./ReactComponentBrowserEnvironment");

var ReactComponentEnvironment = ReactComponentBrowserEnvironment;

module.exports = ReactComponentEnvironment;

},{"./ReactComponentBrowserEnvironment":76}],78:[function(require,module,exports){
var process=require("__browserify_process");/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactCompositeComponent
 */

"use strict";

var ReactComponent = require("./ReactComponent");
var ReactCurrentOwner = require("./ReactCurrentOwner");
var ReactErrorUtils = require("./ReactErrorUtils");
var ReactOwner = require("./ReactOwner");
var ReactPerf = require("./ReactPerf");
var ReactPropTransferer = require("./ReactPropTransferer");
var ReactUpdates = require("./ReactUpdates");

var invariant = require("./invariant");
var keyMirror = require("./keyMirror");
var merge = require("./merge");
var mixInto = require("./mixInto");
var objMap = require("./objMap");

/**
 * Policies that describe methods in `ReactCompositeComponentInterface`.
 */
var SpecPolicy = keyMirror({
  /**
   * These methods may be defined only once by the class specification or mixin.
   */
  DEFINE_ONCE: null,
  /**
   * These methods may be defined by both the class specification and mixins.
   * Subsequent definitions will be chained. These methods must return void.
   */
  DEFINE_MANY: null,
  /**
   * These methods are overriding the base ReactCompositeComponent class.
   */
  OVERRIDE_BASE: null,
  /**
   * These methods are similar to DEFINE_MANY, except we assume they return
   * objects. We try to merge the keys of the return values of all the mixed in
   * functions. If there is a key conflict we throw.
   */
  DEFINE_MANY_MERGED: null
});

/**
 * Composite components are higher-level components that compose other composite
 * or native components.
 *
 * To create a new type of `ReactCompositeComponent`, pass a specification of
 * your new class to `React.createClass`. The only requirement of your class
 * specification is that you implement a `render` method.
 *
 *   var MyComponent = React.createClass({
 *     render: function() {
 *       return <div>Hello World</div>;
 *     }
 *   });
 *
 * The class specification supports a specific protocol of methods that have
 * special meaning (e.g. `render`). See `ReactCompositeComponentInterface` for
 * more the comprehensive protocol. Any other properties and methods in the
 * class specification will available on the prototype.
 *
 * @interface ReactCompositeComponentInterface
 * @internal
 */
var ReactCompositeComponentInterface = {

  /**
   * An array of Mixin objects to include when defining your component.
   *
   * @type {array}
   * @optional
   */
  mixins: SpecPolicy.DEFINE_MANY,

  /**
   * Definition of prop types for this component.
   *
   * @type {object}
   * @optional
   */
  propTypes: SpecPolicy.DEFINE_ONCE,



  // ==== Definition methods ====

  /**
   * Invoked when the component is mounted. Values in the mapping will be set on
   * `this.props` if that prop is not specified (i.e. using an `in` check).
   *
   * This method is invoked before `getInitialState` and therefore cannot rely
   * on `this.state` or use `this.setState`.
   *
   * @return {object}
   * @optional
   */
  getDefaultProps: SpecPolicy.DEFINE_MANY_MERGED,

  /**
   * Invoked once before the component is mounted. The return value will be used
   * as the initial value of `this.state`.
   *
   *   getInitialState: function() {
   *     return {
   *       isOn: false,
   *       fooBaz: new BazFoo()
   *     }
   *   }
   *
   * @return {object}
   * @optional
   */
  getInitialState: SpecPolicy.DEFINE_MANY_MERGED,

  /**
   * Uses props from `this.props` and state from `this.state` to render the
   * structure of the component.
   *
   * No guarantees are made about when or how often this method is invoked, so
   * it must not have side effects.
   *
   *   render: function() {
   *     var name = this.props.name;
   *     return <div>Hello, {name}!</div>;
   *   }
   *
   * @return {ReactComponent}
   * @nosideeffects
   * @required
   */
  render: SpecPolicy.DEFINE_ONCE,



  // ==== Delegate methods ====

  /**
   * Invoked when the component is initially created and about to be mounted.
   * This may have side effects, but any external subscriptions or data created
   * by this method must be cleaned up in `componentWillUnmount`.
   *
   * @optional
   */
  componentWillMount: SpecPolicy.DEFINE_MANY,

  /**
   * Invoked when the component has been mounted and has a DOM representation.
   * However, there is no guarantee that the DOM node is in the document.
   *
   * Use this as an opportunity to operate on the DOM when the component has
   * been mounted (initialized and rendered) for the first time.
   *
   * @param {DOMElement} rootNode DOM element representing the component.
   * @optional
   */
  componentDidMount: SpecPolicy.DEFINE_MANY,

  /**
   * Invoked before the component receives new props.
   *
   * Use this as an opportunity to react to a prop transition by updating the
   * state using `this.setState`. Current props are accessed via `this.props`.
   *
   *   componentWillReceiveProps: function(nextProps) {
   *     this.setState({
   *       likesIncreasing: nextProps.likeCount > this.props.likeCount
   *     });
   *   }
   *
   * NOTE: There is no equivalent `componentWillReceiveState`. An incoming prop
   * transition may cause a state change, but the opposite is not true. If you
   * need it, you are probably looking for `componentWillUpdate`.
   *
   * @param {object} nextProps
   * @optional
   */
  componentWillReceiveProps: SpecPolicy.DEFINE_MANY,

  /**
   * Invoked while deciding if the component should be updated as a result of
   * receiving new props and state.
   *
   * Use this as an opportunity to `return false` when you're certain that the
   * transition to the new props and state will not require a component update.
   *
   *   shouldComponentUpdate: function(nextProps, nextState) {
   *     return !equal(nextProps, this.props) || !equal(nextState, this.state);
   *   }
   *
   * @param {object} nextProps
   * @param {?object} nextState
   * @return {boolean} True if the component should update.
   * @optional
   */
  shouldComponentUpdate: SpecPolicy.DEFINE_ONCE,

  /**
   * Invoked when the component is about to update due to a transition from
   * `this.props` and `this.state` to `nextProps` and `nextState`.
   *
   * Use this as an opportunity to perform preparation before an update occurs.
   *
   * NOTE: You **cannot** use `this.setState()` in this method.
   *
   * @param {object} nextProps
   * @param {?object} nextState
   * @param {ReactReconcileTransaction} transaction
   * @optional
   */
  componentWillUpdate: SpecPolicy.DEFINE_MANY,

  /**
   * Invoked when the component's DOM representation has been updated.
   *
   * Use this as an opportunity to operate on the DOM when the component has
   * been updated.
   *
   * @param {object} prevProps
   * @param {?object} prevState
   * @param {DOMElement} rootNode DOM element representing the component.
   * @optional
   */
  componentDidUpdate: SpecPolicy.DEFINE_MANY,

  /**
   * Invoked when the component is about to be removed from its parent and have
   * its DOM representation destroyed.
   *
   * Use this as an opportunity to deallocate any external resources.
   *
   * NOTE: There is no `componentDidUnmount` since your component will have been
   * destroyed by that point.
   *
   * @optional
   */
  componentWillUnmount: SpecPolicy.DEFINE_MANY,



  // ==== Advanced methods ====

  /**
   * Updates the component's currently mounted DOM representation.
   *
   * By default, this implements React's rendering and reconciliation algorithm.
   * Sophisticated clients may wish to override this.
   *
   * @param {ReactReconcileTransaction} transaction
   * @internal
   * @overridable
   */
  updateComponent: SpecPolicy.OVERRIDE_BASE

};

/**
 * Mapping from class specification keys to special processing functions.
 *
 * Although these are declared in the specification when defining classes
 * using `React.createClass`, they will not be on the component's prototype.
 */
var RESERVED_SPEC_KEYS = {
  displayName: function(Constructor, displayName) {
    Constructor.displayName = displayName;
  },
  mixins: function(Constructor, mixins) {
    if (mixins) {
      for (var i = 0; i < mixins.length; i++) {
        mixSpecIntoComponent(Constructor, mixins[i]);
      }
    }
  },
  propTypes: function(Constructor, propTypes) {
    Constructor.propTypes = propTypes;
  }
};

function validateMethodOverride(proto, name) {
  var specPolicy = ReactCompositeComponentInterface[name];

  // Disallow overriding of base class methods unless explicitly allowed.
  if (ReactCompositeComponentMixin.hasOwnProperty(name)) {
    ("production" !== process.env.NODE_ENV ? invariant(
      specPolicy === SpecPolicy.OVERRIDE_BASE,
      'ReactCompositeComponentInterface: You are attempting to override ' +
      '`%s` from your class specification. Ensure that your method names ' +
      'do not overlap with React methods.',
      name
    ) : invariant(specPolicy === SpecPolicy.OVERRIDE_BASE));
  }

  // Disallow defining methods more than once unless explicitly allowed.
  if (proto.hasOwnProperty(name)) {
    ("production" !== process.env.NODE_ENV ? invariant(
      specPolicy === SpecPolicy.DEFINE_MANY ||
      specPolicy === SpecPolicy.DEFINE_MANY_MERGED,
      'ReactCompositeComponentInterface: You are attempting to define ' +
      '`%s` on your component more than once. This conflict may be due ' +
      'to a mixin.',
      name
    ) : invariant(specPolicy === SpecPolicy.DEFINE_MANY ||
    specPolicy === SpecPolicy.DEFINE_MANY_MERGED));
  }
}


function validateLifeCycleOnReplaceState(instance) {
  var compositeLifeCycleState = instance._compositeLifeCycleState;
  ("production" !== process.env.NODE_ENV ? invariant(
    instance.isMounted() ||
      compositeLifeCycleState === CompositeLifeCycle.MOUNTING,
    'replaceState(...): Can only update a mounted or mounting component.'
  ) : invariant(instance.isMounted() ||
    compositeLifeCycleState === CompositeLifeCycle.MOUNTING));
  ("production" !== process.env.NODE_ENV ? invariant(compositeLifeCycleState !== CompositeLifeCycle.RECEIVING_STATE,
    'replaceState(...): Cannot update during an existing state transition ' +
    '(such as within `render`). This could potentially cause an infinite ' +
    'loop so it is forbidden.'
  ) : invariant(compositeLifeCycleState !== CompositeLifeCycle.RECEIVING_STATE));
  ("production" !== process.env.NODE_ENV ? invariant(compositeLifeCycleState !== CompositeLifeCycle.UNMOUNTING,
    'replaceState(...): Cannot update while unmounting component. This ' +
    'usually means you called setState() on an unmounted component.'
  ) : invariant(compositeLifeCycleState !== CompositeLifeCycle.UNMOUNTING));
}

/**
 * Custom version of `mixInto` which handles policy validation and reserved
 * specification keys when building `ReactCompositeComponent` classses.
 */
function mixSpecIntoComponent(Constructor, spec) {
  var proto = Constructor.prototype;
  for (var name in spec) {
    var property = spec[name];
    if (!spec.hasOwnProperty(name) || !property) {
      continue;
    }
    validateMethodOverride(proto, name);

    if (RESERVED_SPEC_KEYS.hasOwnProperty(name)) {
      RESERVED_SPEC_KEYS[name](Constructor, property);
    } else {
      // Setup methods on prototype:
      // The following member methods should not be automatically bound:
      // 1. Expected ReactCompositeComponent methods (in the "interface").
      // 2. Overridden methods (that were mixed in).
      var isCompositeComponentMethod = name in ReactCompositeComponentInterface;
      var isInherited = name in proto;
      var markedDontBind = property.__reactDontBind;
      var isFunction = typeof property === 'function';
      var shouldAutoBind =
        isFunction &&
        !isCompositeComponentMethod &&
        !isInherited &&
        !markedDontBind;

      if (shouldAutoBind) {
        if (!proto.__reactAutoBindMap) {
          proto.__reactAutoBindMap = {};
        }
        proto.__reactAutoBindMap[name] = property;
        proto[name] = property;
      } else {
        if (isInherited) {
          // For methods which are defined more than once, call the existing
          // methods before calling the new property.
          if (ReactCompositeComponentInterface[name] ===
              SpecPolicy.DEFINE_MANY_MERGED) {
            proto[name] = createMergedResultFunction(proto[name], property);
          } else {
            proto[name] = createChainedFunction(proto[name], property);
          }
        } else {
          proto[name] = property;
        }
      }
    }
  }
}

/**
 * Merge two objects, but throw if both contain the same key.
 *
 * @param {object} one The first object, which is mutated.
 * @param {object} two The second object
 * @return {object} one after it has been mutated to contain everything in two.
 */
function mergeObjectsWithNoDuplicateKeys(one, two) {
  ("production" !== process.env.NODE_ENV ? invariant(
    one && two && typeof one === 'object' && typeof two === 'object',
    'mergeObjectsWithNoDuplicateKeys(): Cannot merge non-objects'
  ) : invariant(one && two && typeof one === 'object' && typeof two === 'object'));

  objMap(two, function(value, key) {
    ("production" !== process.env.NODE_ENV ? invariant(
      one[key] === undefined,
      'mergeObjectsWithNoDuplicateKeys(): ' +
      'Tried to merge two objects with the same key: %s',
      key
    ) : invariant(one[key] === undefined));
    one[key] = value;
  });
  return one;
}

/**
 * Creates a function that invokes two functions and merges their return values.
 *
 * @param {function} one Function to invoke first.
 * @param {function} two Function to invoke second.
 * @return {function} Function that invokes the two argument functions.
 * @private
 */
function createMergedResultFunction(one, two) {
  return function mergedResult() {
    return mergeObjectsWithNoDuplicateKeys(
      one.apply(this, arguments),
      two.apply(this, arguments)
    );
  };
}

/**
 * Creates a function that invokes two functions and ignores their return vales.
 *
 * @param {function} one Function to invoke first.
 * @param {function} two Function to invoke second.
 * @return {function} Function that invokes the two argument functions.
 * @private
 */
function createChainedFunction(one, two) {
  return function chainedFunction() {
    one.apply(this, arguments);
    two.apply(this, arguments);
  };
}

/**
 * `ReactCompositeComponent` maintains an auxiliary life cycle state in
 * `this._compositeLifeCycleState` (which can be null).
 *
 * This is different from the life cycle state maintained by `ReactComponent` in
 * `this._lifeCycleState`. The following diagram shows how the states overlap in
 * time. There are times when the CompositeLifeCycle is null - at those times it
 * is only meaningful to look at ComponentLifeCycle alone.
 *
 * Top Row: ReactComponent.ComponentLifeCycle
 * Low Row: ReactComponent.CompositeLifeCycle
 *
 * +-------+------------------------------------------------------+--------+
 * |  UN   |                    MOUNTED                           |   UN   |
 * |MOUNTED|                                                      | MOUNTED|
 * +-------+------------------------------------------------------+--------+
 * |       ^--------+   +------+   +------+   +------+   +--------^        |
 * |       |        |   |      |   |      |   |      |   |        |        |
 * |    0--|MOUNTING|-0-|RECEIV|-0-|RECEIV|-0-|RECEIV|-0-|   UN   |--->0   |
 * |       |        |   |PROPS |   | PROPS|   | STATE|   |MOUNTING|        |
 * |       |        |   |      |   |      |   |      |   |        |        |
 * |       |        |   |      |   |      |   |      |   |        |        |
 * |       +--------+   +------+   +------+   +------+   +--------+        |
 * |       |                                                      |        |
 * +-------+------------------------------------------------------+--------+
 */
var CompositeLifeCycle = keyMirror({
  /**
   * Components in the process of being mounted respond to state changes
   * differently.
   */
  MOUNTING: null,
  /**
   * Components in the process of being unmounted are guarded against state
   * changes.
   */
  UNMOUNTING: null,
  /**
   * Components that are mounted and receiving new props respond to state
   * changes differently.
   */
  RECEIVING_PROPS: null,
  /**
   * Components that are mounted and receiving new state are guarded against
   * additional state changes.
   */
  RECEIVING_STATE: null
});

/**
 * @lends {ReactCompositeComponent.prototype}
 */
var ReactCompositeComponentMixin = {

  /**
   * Base constructor for all composite component.
   *
   * @param {?object} initialProps
   * @param {*} children
   * @final
   * @internal
   */
  construct: function(initialProps, children) {
    // Children can be either an array or more than one argument
    ReactComponent.Mixin.construct.apply(this, arguments);
    this.state = null;
    this._pendingState = null;
    this._compositeLifeCycleState = null;
  },

  /**
   * Checks whether or not this composite component is mounted.
   * @return {boolean} True if mounted, false otherwise.
   * @protected
   * @final
   */
  isMounted: function() {
    return ReactComponent.Mixin.isMounted.call(this) &&
      this._compositeLifeCycleState !== CompositeLifeCycle.MOUNTING;
  },

  /**
   * Initializes the component, renders markup, and registers event listeners.
   *
   * @param {string} rootID DOM ID of the root node.
   * @param {ReactReconcileTransaction} transaction
   * @param {number} mountDepth number of components in the owner hierarchy
   * @return {?string} Rendered markup to be inserted into the DOM.
   * @final
   * @internal
   */
  mountComponent: ReactPerf.measure(
    'ReactCompositeComponent',
    'mountComponent',
    function(rootID, transaction, mountDepth) {
      ReactComponent.Mixin.mountComponent.call(
        this,
        rootID,
        transaction,
        mountDepth
      );
      this._compositeLifeCycleState = CompositeLifeCycle.MOUNTING;

      this._defaultProps = this.getDefaultProps ? this.getDefaultProps() : null;
      this._processProps(this.props);

      if (this.__reactAutoBindMap) {
        this._bindAutoBindMethods();
      }

      this.state = this.getInitialState ? this.getInitialState() : null;
      this._pendingState = null;
      this._pendingForceUpdate = false;

      if (this.componentWillMount) {
        this.componentWillMount();
        // When mounting, calls to `setState` by `componentWillMount` will set
        // `this._pendingState` without triggering a re-render.
        if (this._pendingState) {
          this.state = this._pendingState;
          this._pendingState = null;
        }
      }

      this._renderedComponent = this._renderValidatedComponent();

      // Done with mounting, `setState` will now trigger UI changes.
      this._compositeLifeCycleState = null;
      var markup = this._renderedComponent.mountComponent(
        rootID,
        transaction,
        mountDepth + 1
      );
      if (this.componentDidMount) {
        transaction.getReactMountReady().enqueue(this, this.componentDidMount);
      }
      return markup;
    }
  ),

  /**
   * Releases any resources allocated by `mountComponent`.
   *
   * @final
   * @internal
   */
  unmountComponent: function() {
    this._compositeLifeCycleState = CompositeLifeCycle.UNMOUNTING;
    if (this.componentWillUnmount) {
      this.componentWillUnmount();
    }
    this._compositeLifeCycleState = null;

    this._defaultProps = null;

    ReactComponent.Mixin.unmountComponent.call(this);
    this._renderedComponent.unmountComponent();
    this._renderedComponent = null;

    if (this.refs) {
      this.refs = null;
    }

    // Some existing components rely on this.props even after they've been
    // destroyed (in event handlers).
    // TODO: this.props = null;
    // TODO: this.state = null;
  },

  /**
   * Sets a subset of the state. Always use this or `replaceState` to mutate
   * state. You should treat `this.state` as immutable.
   *
   * There is no guarantee that `this.state` will be immediately updated, so
   * accessing `this.state` after calling this method may return the old value.
   *
   * There is no guarantee that calls to `setState` will run synchronously,
   * as they may eventually be batched together.  You can provide an optional
   * callback that will be executed when the call to setState is actually
   * completed.
   *
   * @param {object} partialState Next partial state to be merged with state.
   * @param {?function} callback Called after state is updated.
   * @final
   * @protected
   */
  setState: function(partialState, callback) {
    // Merge with `_pendingState` if it exists, otherwise with existing state.
    this.replaceState(
      merge(this._pendingState || this.state, partialState),
      callback
    );
  },

  /**
   * Replaces all of the state. Always use this or `setState` to mutate state.
   * You should treat `this.state` as immutable.
   *
   * There is no guarantee that `this.state` will be immediately updated, so
   * accessing `this.state` after calling this method may return the old value.
   *
   * @param {object} completeState Next state.
   * @param {?function} callback Called after state is updated.
   * @final
   * @protected
   */
  replaceState: function(completeState, callback) {
    validateLifeCycleOnReplaceState(this);
    this._pendingState = completeState;
    ReactUpdates.enqueueUpdate(this, callback);
  },

  /**
   * Processes props by setting default values for unspecified props and
   * asserting that the props are valid.
   *
   * @param {object} props
   * @private
   */
  _processProps: function(props) {
    var propName;
    var defaultProps = this._defaultProps;
    for (propName in defaultProps) {
      if (!(propName in props)) {
        props[propName] = defaultProps[propName];
      }
    }
    var propTypes = this.constructor.propTypes;
    if (propTypes) {
      var componentName = this.constructor.displayName;
      for (propName in propTypes) {
        var checkProp = propTypes[propName];
        if (checkProp) {
          checkProp(props, propName, componentName);
        }
      }
    }
  },

  performUpdateIfNecessary: function() {
    var compositeLifeCycleState = this._compositeLifeCycleState;
    // Do not trigger a state transition if we are in the middle of mounting or
    // receiving props because both of those will already be doing this.
    if (compositeLifeCycleState === CompositeLifeCycle.MOUNTING ||
        compositeLifeCycleState === CompositeLifeCycle.RECEIVING_PROPS) {
      return;
    }
    ReactComponent.Mixin.performUpdateIfNecessary.call(this);
  },

  /**
   * If any of `_pendingProps`, `_pendingState`, or `_pendingForceUpdate` is
   * set, update the component.
   *
   * @param {ReactReconcileTransaction} transaction
   * @internal
   */
  _performUpdateIfNecessary: function(transaction) {
    if (this._pendingProps == null &&
        this._pendingState == null &&
        !this._pendingForceUpdate) {
      return;
    }

    var nextProps = this.props;
    if (this._pendingProps != null) {
      nextProps = this._pendingProps;
      this._processProps(nextProps);
      this._pendingProps = null;

      this._compositeLifeCycleState = CompositeLifeCycle.RECEIVING_PROPS;
      if (this.componentWillReceiveProps) {
        this.componentWillReceiveProps(nextProps, transaction);
      }
    }

    this._compositeLifeCycleState = CompositeLifeCycle.RECEIVING_STATE;

    var nextState = this._pendingState || this.state;
    this._pendingState = null;

    if (this._pendingForceUpdate ||
        !this.shouldComponentUpdate ||
        this.shouldComponentUpdate(nextProps, nextState)) {
      this._pendingForceUpdate = false;
      // Will set `this.props` and `this.state`.
      this._performComponentUpdate(nextProps, nextState, transaction);
    } else {
      // If it's determined that a component should not update, we still want
      // to set props and state.
      this.props = nextProps;
      this.state = nextState;
    }

    this._compositeLifeCycleState = null;
  },

  /**
   * Merges new props and state, notifies delegate methods of update and
   * performs update.
   *
   * @param {object} nextProps Next object to set as properties.
   * @param {?object} nextState Next object to set as state.
   * @param {ReactReconcileTransaction} transaction
   * @private
   */
  _performComponentUpdate: function(nextProps, nextState, transaction) {
    var prevProps = this.props;
    var prevState = this.state;

    if (this.componentWillUpdate) {
      this.componentWillUpdate(nextProps, nextState, transaction);
    }

    this.props = nextProps;
    this.state = nextState;

    this.updateComponent(transaction, prevProps, prevState);

    if (this.componentDidUpdate) {
      transaction.getReactMountReady().enqueue(
        this,
        this.componentDidUpdate.bind(this, prevProps, prevState)
      );
    }
  },

  /**
   * Updates the component's currently mounted DOM representation.
   *
   * By default, this implements React's rendering and reconciliation algorithm.
   * Sophisticated clients may wish to override this.
   *
   * @param {ReactReconcileTransaction} transaction
   * @param {object} prevProps
   * @param {?object} prevState
   * @internal
   * @overridable
   */
  updateComponent: ReactPerf.measure(
    'ReactCompositeComponent',
    'updateComponent',
    function(transaction, prevProps, prevState) {
      ReactComponent.Mixin.updateComponent.call(this, transaction, prevProps);
      var currentComponent = this._renderedComponent;
      var nextComponent = this._renderValidatedComponent();
      if (currentComponent.constructor === nextComponent.constructor) {
        currentComponent.receiveComponent(nextComponent, transaction);
      } else {
        // These two IDs are actually the same! But nothing should rely on that.
        var thisID = this._rootNodeID;
        var currentComponentID = currentComponent._rootNodeID;
        currentComponent.unmountComponent();
        this._renderedComponent = nextComponent;
        var nextMarkup = nextComponent.mountComponent(
          thisID,
          transaction,
          this._mountDepth + 1
        );
        ReactComponent.DOMIDOperations.dangerouslyReplaceNodeWithMarkupByID(
          currentComponentID,
          nextMarkup
        );
      }
    }
  ),

  /**
   * Forces an update. This should only be invoked when it is known with
   * certainty that we are **not** in a DOM transaction.
   *
   * You may want to call this when you know that some deeper aspect of the
   * component's state has changed but `setState` was not called.
   *
   * This will not invoke `shouldUpdateComponent`, but it will invoke
   * `componentWillUpdate` and `componentDidUpdate`.
   *
   * @param {?function} callback Called after update is complete.
   * @final
   * @protected
   */
  forceUpdate: function(callback) {
    var compositeLifeCycleState = this._compositeLifeCycleState;
    ("production" !== process.env.NODE_ENV ? invariant(
      this.isMounted() ||
        compositeLifeCycleState === CompositeLifeCycle.MOUNTING,
      'forceUpdate(...): Can only force an update on mounted or mounting ' +
        'components.'
    ) : invariant(this.isMounted() ||
      compositeLifeCycleState === CompositeLifeCycle.MOUNTING));
    ("production" !== process.env.NODE_ENV ? invariant(
      compositeLifeCycleState !== CompositeLifeCycle.RECEIVING_STATE &&
      compositeLifeCycleState !== CompositeLifeCycle.UNMOUNTING,
      'forceUpdate(...): Cannot force an update while unmounting component ' +
      'or during an existing state transition (such as within `render`).'
    ) : invariant(compositeLifeCycleState !== CompositeLifeCycle.RECEIVING_STATE &&
    compositeLifeCycleState !== CompositeLifeCycle.UNMOUNTING));
    this._pendingForceUpdate = true;
    ReactUpdates.enqueueUpdate(this, callback);
  },

  /**
   * @private
   */
  _renderValidatedComponent: function() {
    var renderedComponent;
    ReactCurrentOwner.current = this;
    try {
      renderedComponent = this.render();
    } catch (error) {
      // IE8 requires `catch` in order to use `finally`.
      throw error;
    } finally {
      ReactCurrentOwner.current = null;
    }
    ("production" !== process.env.NODE_ENV ? invariant(
      ReactComponent.isValidComponent(renderedComponent),
      '%s.render(): A valid ReactComponent must be returned. You may have ' +
      'returned null, undefined, an array, or some other invalid object.',
      this.constructor.displayName || 'ReactCompositeComponent'
    ) : invariant(ReactComponent.isValidComponent(renderedComponent)));
    return renderedComponent;
  },

  /**
   * @private
   */
  _bindAutoBindMethods: function() {
    for (var autoBindKey in this.__reactAutoBindMap) {
      if (!this.__reactAutoBindMap.hasOwnProperty(autoBindKey)) {
        continue;
      }
      var method = this.__reactAutoBindMap[autoBindKey];
      this[autoBindKey] = this._bindAutoBindMethod(ReactErrorUtils.guard(
        method,
        this.constructor.displayName + '.' + autoBindKey
      ));
    }
  },

  /**
   * Binds a method to the component.
   *
   * @param {function} method Method to be bound.
   * @private
   */
  _bindAutoBindMethod: function(method) {
    var component = this;
    var boundMethod = function() {
      return method.apply(component, arguments);
    };
    if ("production" !== process.env.NODE_ENV) {
      boundMethod.__reactBoundContext = component;
      boundMethod.__reactBoundMethod = method;
      boundMethod.__reactBoundArguments = null;
      var componentName = component.constructor.displayName;
      var _bind = boundMethod.bind;
      boundMethod.bind = function(newThis) {
        // User is trying to bind() an autobound method; we effectively will
        // ignore the value of "this" that the user is trying to use, so
        // let's warn.
        if (newThis !== component && newThis !== null) {
          console.warn(
            'bind(): React component methods may only be bound to the ' +
            'component instance. See ' + componentName
          );
        } else if (arguments.length === 1) {
          console.warn(
            'bind(): You are binding a component method to the component. ' +
            'React does this for you automatically in a high-performance ' +
            'way, so you can safely remove this call. See ' + componentName
          );
          return boundMethod;
        }
        var reboundMethod = _bind.apply(boundMethod, arguments);
        reboundMethod.__reactBoundContext = component;
        reboundMethod.__reactBoundMethod = method;
        reboundMethod.__reactBoundArguments =
          Array.prototype.slice.call(arguments, 1);
        return reboundMethod;
      };
    }
    return boundMethod;
  }
};

var ReactCompositeComponentBase = function() {};
mixInto(ReactCompositeComponentBase, ReactComponent.Mixin);
mixInto(ReactCompositeComponentBase, ReactOwner.Mixin);
mixInto(ReactCompositeComponentBase, ReactPropTransferer.Mixin);
mixInto(ReactCompositeComponentBase, ReactCompositeComponentMixin);

/**
 * Module for creating composite components.
 *
 * @class ReactCompositeComponent
 * @extends ReactComponent
 * @extends ReactOwner
 * @extends ReactPropTransferer
 */
var ReactCompositeComponent = {

  LifeCycle: CompositeLifeCycle,

  Base: ReactCompositeComponentBase,

  /**
   * Creates a composite component class given a class specification.
   *
   * @param {object} spec Class specification (which must define `render`).
   * @return {function} Component constructor function.
   * @public
   */
  createClass: function(spec) {
    var Constructor = function() {};
    Constructor.prototype = new ReactCompositeComponentBase();
    Constructor.prototype.constructor = Constructor;
    mixSpecIntoComponent(Constructor, spec);

    ("production" !== process.env.NODE_ENV ? invariant(
      Constructor.prototype.render,
      'createClass(...): Class specification must implement a `render` method.'
    ) : invariant(Constructor.prototype.render));

    if ("production" !== process.env.NODE_ENV) {
      if (Constructor.prototype.componentShouldUpdate) {
        console.warn(
          (spec.displayName || 'A component') + ' has a method called ' +
          'componentShouldUpdate(). Did you mean shouldComponentUpdate()? ' +
          'The name is phrased as a question because the function is ' +
          'expected to return a value.'
         );
      }
    }

    // Reduce time spent doing lookups by setting these on the prototype.
    for (var methodName in ReactCompositeComponentInterface) {
      if (!Constructor.prototype[methodName]) {
        Constructor.prototype[methodName] = null;
      }
    }

    var ConvenienceConstructor = function(props, children) {
      var instance = new Constructor();
      instance.construct.apply(instance, arguments);
      return instance;
    };
    ConvenienceConstructor.componentConstructor = Constructor;
    ConvenienceConstructor.originalSpec = spec;
    return ConvenienceConstructor;
  },

  /**
   * Checks if a value is a valid component constructor.
   *
   * @param {*}
   * @return {boolean}
   * @public
   */
  isValidClass: function(componentClass) {
    return componentClass instanceof Function &&
           'componentConstructor' in componentClass &&
           componentClass.componentConstructor instanceof Function;
  }
};

module.exports = ReactCompositeComponent;

},{"./ReactComponent":75,"./ReactCurrentOwner":79,"./ReactErrorUtils":93,"./ReactOwner":105,"./ReactPerf":106,"./ReactPropTransferer":107,"./ReactUpdates":117,"./invariant":156,"./keyMirror":162,"./merge":165,"./mixInto":168,"./objMap":170,"__browserify_process":35}],79:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactCurrentOwner
 */

"use strict";

/**
 * Keeps track of the current owner.
 *
 * The current owner is the component who should own any components that are
 * currently being constructed.
 *
 * The depth indicate how many composite components are above this render level.
 */
var ReactCurrentOwner = {

  /**
   * @internal
   * @type {ReactComponent}
   */
  current: null

};

module.exports = ReactCurrentOwner;

},{}],80:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactDOM
 * @typechecks static-only
 */

"use strict";

var ReactDOMComponent = require("./ReactDOMComponent");

var mergeInto = require("./mergeInto");
var objMapKeyVal = require("./objMapKeyVal");

/**
 * Creates a new React class that is idempotent and capable of containing other
 * React components. It accepts event listeners and DOM properties that are
 * valid according to `DOMProperty`.
 *
 *  - Event listeners: `onClick`, `onMouseDown`, etc.
 *  - DOM properties: `className`, `name`, `title`, etc.
 *
 * The `style` property functions differently from the DOM API. It accepts an
 * object mapping of style properties to values.
 *
 * @param {string} tag Tag name (e.g. `div`).
 * @param {boolean} omitClose True if the close tag should be omitted.
 * @private
 */
function createDOMComponentClass(tag, omitClose) {
  var Constructor = function() {};
  Constructor.prototype = new ReactDOMComponent(tag, omitClose);
  Constructor.prototype.constructor = Constructor;
  Constructor.displayName = tag;

  var ConvenienceConstructor = function(props, children) {
    var instance = new Constructor();
    instance.construct.apply(instance, arguments);
    return instance;
  };
  ConvenienceConstructor.componentConstructor = Constructor;
  return ConvenienceConstructor;
}

/**
 * Creates a mapping from supported HTML tags to `ReactDOMComponent` classes.
 * This is also accessible via `React.DOM`.
 *
 * @public
 */
var ReactDOM = objMapKeyVal({
  a: false,
  abbr: false,
  address: false,
  area: false,
  article: false,
  aside: false,
  audio: false,
  b: false,
  base: false,
  bdi: false,
  bdo: false,
  big: false,
  blockquote: false,
  body: false,
  br: true,
  button: false,
  canvas: false,
  caption: false,
  cite: false,
  code: false,
  col: true,
  colgroup: false,
  data: false,
  datalist: false,
  dd: false,
  del: false,
  details: false,
  dfn: false,
  div: false,
  dl: false,
  dt: false,
  em: false,
  embed: true,
  fieldset: false,
  figcaption: false,
  figure: false,
  footer: false,
  form: false, // NOTE: Injected, see `ReactDOMForm`.
  h1: false,
  h2: false,
  h3: false,
  h4: false,
  h5: false,
  h6: false,
  head: false,
  header: false,
  hr: true,
  html: false,
  i: false,
  iframe: false,
  img: true,
  input: true,
  ins: false,
  kbd: false,
  keygen: true,
  label: false,
  legend: false,
  li: false,
  link: false,
  main: false,
  map: false,
  mark: false,
  menu: false,
  menuitem: false, // NOTE: Close tag should be omitted, but causes problems.
  meta: true,
  meter: false,
  nav: false,
  noscript: false,
  object: false,
  ol: false,
  optgroup: false,
  option: false,
  output: false,
  p: false,
  param: true,
  pre: false,
  progress: false,
  q: false,
  rp: false,
  rt: false,
  ruby: false,
  s: false,
  samp: false,
  script: false,
  section: false,
  select: false,
  small: false,
  source: false,
  span: false,
  strong: false,
  style: false,
  sub: false,
  summary: false,
  sup: false,
  table: false,
  tbody: false,
  td: false,
  textarea: false, // NOTE: Injected, see `ReactDOMTextarea`.
  tfoot: false,
  th: false,
  thead: false,
  time: false,
  title: false,
  tr: false,
  track: true,
  u: false,
  ul: false,
  'var': false,
  video: false,
  wbr: false,

  // SVG
  circle: false,
  g: false,
  line: false,
  path: false,
  polyline: false,
  rect: false,
  svg: false,
  text: false
}, createDOMComponentClass);

var injection = {
  injectComponentClasses: function(componentClasses) {
    mergeInto(ReactDOM, componentClasses);
  }
};

ReactDOM.injection = injection;

module.exports = ReactDOM;

},{"./ReactDOMComponent":82,"./mergeInto":167,"./objMapKeyVal":171}],81:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactDOMButton
 */

"use strict";

var ReactCompositeComponent = require("./ReactCompositeComponent");
var ReactDOM = require("./ReactDOM");

var keyMirror = require("./keyMirror");

// Store a reference to the <button> `ReactDOMComponent`.
var button = ReactDOM.button;

var mouseListenerNames = keyMirror({
  onClick: true,
  onDoubleClick: true,
  onMouseDown: true,
  onMouseMove: true,
  onMouseUp: true,
  onClickCapture: true,
  onDoubleClickCapture: true,
  onMouseDownCapture: true,
  onMouseMoveCapture: true,
  onMouseUpCapture: true
});

/**
 * Implements a <button> native component that does not receive mouse events
 * when `disabled` is set.
 */
var ReactDOMButton = ReactCompositeComponent.createClass({

  render: function() {
    var props = {};

    // Copy the props; except the mouse listeners if we're disabled
    for (var key in this.props) {
      if (this.props.hasOwnProperty(key) &&
          (!this.props.disabled || !mouseListenerNames[key])) {
        props[key] = this.props[key];
      }
    }

    return button(props, this.props.children);
  }

});

module.exports = ReactDOMButton;

},{"./ReactCompositeComponent":78,"./ReactDOM":80,"./keyMirror":162}],82:[function(require,module,exports){
var process=require("__browserify_process");/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactDOMComponent
 * @typechecks static-only
 */

"use strict";

var CSSPropertyOperations = require("./CSSPropertyOperations");
var DOMProperty = require("./DOMProperty");
var DOMPropertyOperations = require("./DOMPropertyOperations");
var ReactComponent = require("./ReactComponent");
var ReactEventEmitter = require("./ReactEventEmitter");
var ReactMultiChild = require("./ReactMultiChild");
var ReactMount = require("./ReactMount");
var ReactPerf = require("./ReactPerf");

var escapeTextForBrowser = require("./escapeTextForBrowser");
var invariant = require("./invariant");
var keyOf = require("./keyOf");
var merge = require("./merge");
var mixInto = require("./mixInto");

var putListener = ReactEventEmitter.putListener;
var deleteListener = ReactEventEmitter.deleteListener;
var registrationNames = ReactEventEmitter.registrationNames;

// For quickly matching children type, to test if can be treated as content.
var CONTENT_TYPES = {'string': true, 'number': true};

var STYLE = keyOf({style: null});

/**
 * @param {?object} props
 */
function assertValidProps(props) {
  if (!props) {
    return;
  }
  // Note the use of `==` which checks for null or undefined.
  ("production" !== process.env.NODE_ENV ? invariant(
    props.children == null || props.dangerouslySetInnerHTML == null,
    'Can only set one of `children` or `props.dangerouslySetInnerHTML`.'
  ) : invariant(props.children == null || props.dangerouslySetInnerHTML == null));
  ("production" !== process.env.NODE_ENV ? invariant(
    props.style == null || typeof props.style === 'object',
    'The `style` prop expects a mapping from style properties to values, ' +
    'not a string.'
  ) : invariant(props.style == null || typeof props.style === 'object'));
}

/**
 * @constructor ReactDOMComponent
 * @extends ReactComponent
 * @extends ReactMultiChild
 */
function ReactDOMComponent(tag, omitClose) {
  this._tagOpen = '<' + tag;
  this._tagClose = omitClose ? '' : '</' + tag + '>';
  this.tagName = tag.toUpperCase();
}

ReactDOMComponent.Mixin = {

  /**
   * Generates root tag markup then recurses. This method has side effects and
   * is not idempotent.
   *
   * @internal
   * @param {string} rootID The root DOM ID for this node.
   * @param {ReactReconcileTransaction} transaction
   * @param {number} mountDepth number of components in the owner hierarchy
   * @return {string} The computed markup.
   */
  mountComponent: ReactPerf.measure(
    'ReactDOMComponent',
    'mountComponent',
    function(rootID, transaction, mountDepth) {
      ReactComponent.Mixin.mountComponent.call(
        this,
        rootID,
        transaction,
        mountDepth
      );
      assertValidProps(this.props);
      return (
        this._createOpenTagMarkup() +
        this._createContentMarkup(transaction) +
        this._tagClose
      );
    }
  ),

  /**
   * Creates markup for the open tag and all attributes.
   *
   * This method has side effects because events get registered.
   *
   * Iterating over object properties is faster than iterating over arrays.
   * @see http://jsperf.com/obj-vs-arr-iteration
   *
   * @private
   * @return {string} Markup of opening tag.
   */
  _createOpenTagMarkup: function() {
    var props = this.props;
    var ret = this._tagOpen;

    for (var propKey in props) {
      if (!props.hasOwnProperty(propKey)) {
        continue;
      }
      var propValue = props[propKey];
      if (propValue == null) {
        continue;
      }
      if (registrationNames[propKey]) {
        putListener(this._rootNodeID, propKey, propValue);
      } else {
        if (propKey === STYLE) {
          if (propValue) {
            propValue = props.style = merge(props.style);
          }
          propValue = CSSPropertyOperations.createMarkupForStyles(propValue);
        }
        var markup =
          DOMPropertyOperations.createMarkupForProperty(propKey, propValue);
        if (markup) {
          ret += ' ' + markup;
        }
      }
    }

    var escapedID = escapeTextForBrowser(this._rootNodeID);
    return ret + ' ' + ReactMount.ATTR_NAME + '="' + escapedID + '">';
  },

  /**
   * Creates markup for the content between the tags.
   *
   * @private
   * @param {ReactReconcileTransaction} transaction
   * @return {string} Content markup.
   */
  _createContentMarkup: function(transaction) {
    // Intentional use of != to avoid catching zero/false.
    var innerHTML = this.props.dangerouslySetInnerHTML;
    if (innerHTML != null) {
      if (innerHTML.__html != null) {
        return innerHTML.__html;
      }
    } else {
      var contentToUse =
        CONTENT_TYPES[typeof this.props.children] ? this.props.children : null;
      var childrenToUse = contentToUse != null ? null : this.props.children;
      if (contentToUse != null) {
        return escapeTextForBrowser(contentToUse);
      } else if (childrenToUse != null) {
        var mountImages = this.mountChildren(
          childrenToUse,
          transaction
        );
        return mountImages.join('');
      }
    }
    return '';
  },

  receiveComponent: function(nextComponent, transaction) {
    assertValidProps(nextComponent.props);
    ReactComponent.Mixin.receiveComponent.call(
      this,
      nextComponent,
      transaction
    );
  },

  /**
   * Updates a native DOM component after it has already been allocated and
   * attached to the DOM. Reconciles the root DOM node, then recurses.
   *
   * @param {ReactReconcileTransaction} transaction
   * @param {object} prevProps
   * @internal
   * @overridable
   */
  updateComponent: ReactPerf.measure(
    'ReactDOMComponent',
    'updateComponent',
    function(transaction, prevProps) {
      ReactComponent.Mixin.updateComponent.call(this, transaction, prevProps);
      this._updateDOMProperties(prevProps);
      this._updateDOMChildren(prevProps, transaction);
    }
  ),

  /**
   * Reconciles the properties by detecting differences in property values and
   * updating the DOM as necessary. This function is probably the single most
   * critical path for performance optimization.
   *
   * TODO: Benchmark whether checking for changed values in memory actually
   *       improves performance (especially statically positioned elements).
   * TODO: Benchmark the effects of putting this at the top since 99% of props
   *       do not change for a given reconciliation.
   * TODO: Benchmark areas that can be improved with caching.
   *
   * @private
   * @param {object} lastProps
   */
  _updateDOMProperties: function(lastProps) {
    var nextProps = this.props;
    var propKey;
    var styleName;
    var styleUpdates;
    for (propKey in lastProps) {
      if (nextProps.hasOwnProperty(propKey) ||
         !lastProps.hasOwnProperty(propKey)) {
        continue;
      }
      if (propKey === STYLE) {
        var lastStyle = lastProps[propKey];
        for (styleName in lastStyle) {
          if (lastStyle.hasOwnProperty(styleName)) {
            styleUpdates = styleUpdates || {};
            styleUpdates[styleName] = '';
          }
        }
      } else if (registrationNames[propKey]) {
        deleteListener(this._rootNodeID, propKey);
      } else if (
          DOMProperty.isStandardName[propKey] ||
          DOMProperty.isCustomAttribute(propKey)) {
        ReactComponent.DOMIDOperations.deletePropertyByID(
          this._rootNodeID,
          propKey
        );
      }
    }
    for (propKey in nextProps) {
      var nextProp = nextProps[propKey];
      var lastProp = lastProps[propKey];
      if (!nextProps.hasOwnProperty(propKey) || nextProp === lastProp) {
        continue;
      }
      if (propKey === STYLE) {
        if (nextProp) {
          nextProp = nextProps.style = merge(nextProp);
        }
        if (lastProp) {
          // Unset styles on `lastProp` but not on `nextProp`.
          for (styleName in lastProp) {
            if (lastProp.hasOwnProperty(styleName) &&
                !nextProp.hasOwnProperty(styleName)) {
              styleUpdates = styleUpdates || {};
              styleUpdates[styleName] = '';
            }
          }
          // Update styles that changed since `lastProp`.
          for (styleName in nextProp) {
            if (nextProp.hasOwnProperty(styleName) &&
                lastProp[styleName] !== nextProp[styleName]) {
              styleUpdates = styleUpdates || {};
              styleUpdates[styleName] = nextProp[styleName];
            }
          }
        } else {
          // Relies on `updateStylesByID` not mutating `styleUpdates`.
          styleUpdates = nextProp;
        }
      } else if (registrationNames[propKey]) {
        putListener(this._rootNodeID, propKey, nextProp);
      } else if (
          DOMProperty.isStandardName[propKey] ||
          DOMProperty.isCustomAttribute(propKey)) {
        ReactComponent.DOMIDOperations.updatePropertyByID(
          this._rootNodeID,
          propKey,
          nextProp
        );
      }
    }
    if (styleUpdates) {
      ReactComponent.DOMIDOperations.updateStylesByID(
        this._rootNodeID,
        styleUpdates
      );
    }
  },

  /**
   * Reconciles the children with the various properties that affect the
   * children content.
   *
   * @param {object} lastProps
   * @param {ReactReconcileTransaction} transaction
   */
  _updateDOMChildren: function(lastProps, transaction) {
    var nextProps = this.props;

    var lastContent =
      CONTENT_TYPES[typeof lastProps.children] ? lastProps.children : null;
    var nextContent =
      CONTENT_TYPES[typeof nextProps.children] ? nextProps.children : null;

    var lastHtml =
      lastProps.dangerouslySetInnerHTML &&
      lastProps.dangerouslySetInnerHTML.__html;
    var nextHtml =
      nextProps.dangerouslySetInnerHTML &&
      nextProps.dangerouslySetInnerHTML.__html;

    // Note the use of `!=` which checks for null or undefined.
    var lastChildren = lastContent != null ? null : lastProps.children;
    var nextChildren = nextContent != null ? null : nextProps.children;

    // If we're switching from children to content/html or vice versa, remove
    // the old content
    var lastHasContentOrHtml = lastContent != null || lastHtml != null;
    var nextHasContentOrHtml = nextContent != null || nextHtml != null;
    if (lastChildren != null && nextChildren == null) {
      this.updateChildren(null, transaction);
    } else if (lastHasContentOrHtml && !nextHasContentOrHtml) {
      this.updateTextContent('');
    }

    if (nextContent != null) {
      if (lastContent !== nextContent) {
        this.updateTextContent('' + nextContent);
      }
    } else if (nextHtml != null) {
      if (lastHtml !== nextHtml) {
        ReactComponent.DOMIDOperations.updateInnerHTMLByID(
          this._rootNodeID,
          nextHtml
        );
      }
    } else if (nextChildren != null) {
      this.updateChildren(nextChildren, transaction);
    }
  },

  /**
   * Destroys all event registrations for this instance. Does not remove from
   * the DOM. That must be done by the parent.
   *
   * @internal
   */
  unmountComponent: function() {
    ReactEventEmitter.deleteAllListeners(this._rootNodeID);
    ReactComponent.Mixin.unmountComponent.call(this);
    this.unmountChildren();
  }

};

mixInto(ReactDOMComponent, ReactComponent.Mixin);
mixInto(ReactDOMComponent, ReactDOMComponent.Mixin);
mixInto(ReactDOMComponent, ReactMultiChild.Mixin);

module.exports = ReactDOMComponent;

},{"./CSSPropertyOperations":51,"./DOMProperty":56,"./DOMPropertyOperations":57,"./ReactComponent":75,"./ReactEventEmitter":94,"./ReactMount":101,"./ReactMultiChild":103,"./ReactPerf":106,"./escapeTextForBrowser":142,"./invariant":156,"./keyOf":163,"./merge":165,"./mixInto":168,"__browserify_process":35}],83:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactDOMForm
 */

"use strict";

var ReactCompositeComponent = require("./ReactCompositeComponent");
var ReactDOM = require("./ReactDOM");
var ReactEventEmitter = require("./ReactEventEmitter");
var EventConstants = require("./EventConstants");

// Store a reference to the <form> `ReactDOMComponent`.
var form = ReactDOM.form;

/**
 * Since onSubmit doesn't bubble OR capture on the top level in IE8, we need
 * to capture it on the <form> element itself. There are lots of hacks we could
 * do to accomplish this, but the most reliable is to make <form> a
 * composite component and use `componentDidMount` to attach the event handlers.
 */
var ReactDOMForm = ReactCompositeComponent.createClass({
  render: function() {
    // TODO: Instead of using `ReactDOM` directly, we should use JSX. However,
    // `jshint` fails to parse JSX so in order for linting to work in the open
    // source repo, we need to just use `ReactDOM.form`.
    return this.transferPropsTo(form(null, this.props.children));
  },

  componentDidMount: function(node) {
    ReactEventEmitter.trapBubbledEvent(
      EventConstants.topLevelTypes.topSubmit,
      'submit',
      node
    );
  }
});

module.exports = ReactDOMForm;

},{"./EventConstants":62,"./ReactCompositeComponent":78,"./ReactDOM":80,"./ReactEventEmitter":94}],84:[function(require,module,exports){
var process=require("__browserify_process");/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactDOMIDOperations
 * @typechecks static-only
 */

/*jslint evil: true */

"use strict";

var CSSPropertyOperations = require("./CSSPropertyOperations");
var DOMChildrenOperations = require("./DOMChildrenOperations");
var DOMPropertyOperations = require("./DOMPropertyOperations");
var ReactMount = require("./ReactMount");

var getTextContentAccessor = require("./getTextContentAccessor");
var invariant = require("./invariant");

/**
 * Errors for properties that should not be updated with `updatePropertyById()`.
 *
 * @type {object}
 * @private
 */
var INVALID_PROPERTY_ERRORS = {
  dangerouslySetInnerHTML:
    '`dangerouslySetInnerHTML` must be set using `updateInnerHTMLByID()`.',
  style: '`style` must be set using `updateStylesByID()`.'
};

/**
 * The DOM property to use when setting text content.
 *
 * @type {string}
 * @private
 */
var textContentAccessor = getTextContentAccessor() || 'NA';

var LEADING_SPACE = /^ /;

/**
 * Operations used to process updates to DOM nodes. This is made injectable via
 * `ReactComponent.DOMIDOperations`.
 */
var ReactDOMIDOperations = {

  /**
   * Updates a DOM node with new property values. This should only be used to
   * update DOM properties in `DOMProperty`.
   *
   * @param {string} id ID of the node to update.
   * @param {string} name A valid property name, see `DOMProperty`.
   * @param {*} value New value of the property.
   * @internal
   */
  updatePropertyByID: function(id, name, value) {
    var node = ReactMount.getNode(id);
    ("production" !== process.env.NODE_ENV ? invariant(
      !INVALID_PROPERTY_ERRORS.hasOwnProperty(name),
      'updatePropertyByID(...): %s',
      INVALID_PROPERTY_ERRORS[name]
    ) : invariant(!INVALID_PROPERTY_ERRORS.hasOwnProperty(name)));

    // If we're updating to null or undefined, we should remove the property
    // from the DOM node instead of inadvertantly setting to a string. This
    // brings us in line with the same behavior we have on initial render.
    if (value != null) {
      DOMPropertyOperations.setValueForProperty(node, name, value);
    } else {
      DOMPropertyOperations.deleteValueForProperty(node, name);
    }
  },

  /**
   * Updates a DOM node to remove a property. This should only be used to remove
   * DOM properties in `DOMProperty`.
   *
   * @param {string} id ID of the node to update.
   * @param {string} name A property name to remove, see `DOMProperty`.
   * @internal
   */
  deletePropertyByID: function(id, name, value) {
    var node = ReactMount.getNode(id);
    ("production" !== process.env.NODE_ENV ? invariant(
      !INVALID_PROPERTY_ERRORS.hasOwnProperty(name),
      'updatePropertyByID(...): %s',
      INVALID_PROPERTY_ERRORS[name]
    ) : invariant(!INVALID_PROPERTY_ERRORS.hasOwnProperty(name)));
    DOMPropertyOperations.deleteValueForProperty(node, name, value);
  },

  /**
   * Updates a DOM node with new style values. If a value is specified as '',
   * the corresponding style property will be unset.
   *
   * @param {string} id ID of the node to update.
   * @param {object} styles Mapping from styles to values.
   * @internal
   */
  updateStylesByID: function(id, styles) {
    var node = ReactMount.getNode(id);
    CSSPropertyOperations.setValueForStyles(node, styles);
  },

  /**
   * Updates a DOM node's innerHTML.
   *
   * @param {string} id ID of the node to update.
   * @param {string} html An HTML string.
   * @internal
   */
  updateInnerHTMLByID: function(id, html) {
    var node = ReactMount.getNode(id);
    // HACK: IE8- normalize whitespace in innerHTML, removing leading spaces.
    // @see quirksmode.org/bugreports/archives/2004/11/innerhtml_and_t.html
    node.innerHTML = html.replace(LEADING_SPACE, '&nbsp;');
  },

  /**
   * Updates a DOM node's text content set by `props.content`.
   *
   * @param {string} id ID of the node to update.
   * @param {string} content Text content.
   * @internal
   */
  updateTextContentByID: function(id, content) {
    var node = ReactMount.getNode(id);
    node[textContentAccessor] = content;
  },

  /**
   * Replaces a DOM node that exists in the document with markup.
   *
   * @param {string} id ID of child to be replaced.
   * @param {string} markup Dangerous markup to inject in place of child.
   * @internal
   * @see {Danger.dangerouslyReplaceNodeWithMarkup}
   */
  dangerouslyReplaceNodeWithMarkupByID: function(id, markup) {
    var node = ReactMount.getNode(id);
    DOMChildrenOperations.dangerouslyReplaceNodeWithMarkup(node, markup);
  },

  /**
   * Updates a component's children by processing a series of updates.
   *
   * @param {array<object>} updates List of update configurations.
   * @param {array<string>} markup List of markup strings.
   * @internal
   */
  dangerouslyProcessChildrenUpdates: function(updates, markup) {
    for (var i = 0; i < updates.length; i++) {
      updates[i].parentNode = ReactMount.getNode(updates[i].parentID);
    }
    DOMChildrenOperations.processUpdates(updates, markup);
  }

};

module.exports = ReactDOMIDOperations;

},{"./CSSPropertyOperations":51,"./DOMChildrenOperations":55,"./DOMPropertyOperations":57,"./ReactMount":101,"./getTextContentAccessor":153,"./invariant":156,"__browserify_process":35}],85:[function(require,module,exports){
var process=require("__browserify_process");/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactDOMInput
 */

"use strict";

var DOMPropertyOperations = require("./DOMPropertyOperations");
var LinkedValueMixin = require("./LinkedValueMixin");
var ReactCompositeComponent = require("./ReactCompositeComponent");
var ReactDOM = require("./ReactDOM");
var ReactMount = require("./ReactMount");

var invariant = require("./invariant");
var merge = require("./merge");

// Store a reference to the <input> `ReactDOMComponent`.
var input = ReactDOM.input;

var instancesByReactID = {};

/**
 * Implements an <input> native component that allows setting these optional
 * props: `checked`, `value`, `defaultChecked`, and `defaultValue`.
 *
 * If `checked` or `value` are not supplied (or null/undefined), user actions
 * that affect the checked state or value will trigger updates to the element.
 *
 * If they are supplied (and not null/undefined), the rendered element will not
 * trigger updates to the element. Instead, the props must change in order for
 * the rendered element to be updated.
 *
 * The rendered element will be initialized as unchecked (or `defaultChecked`)
 * with an empty value (or `defaultValue`).
 *
 * @see http://www.w3.org/TR/2012/WD-html5-20121025/the-input-element.html
 */
var ReactDOMInput = ReactCompositeComponent.createClass({
  mixins: [LinkedValueMixin],

  getInitialState: function() {
    var defaultValue = this.props.defaultValue;
    return {
      checked: this.props.defaultChecked || false,
      value: defaultValue != null ? defaultValue : null
    };
  },

  shouldComponentUpdate: function() {
    // Defer any updates to this component during the `onChange` handler.
    return !this._isChanging;
  },

  render: function() {
    // Clone `this.props` so we don't mutate the input.
    var props = merge(this.props);

    props.defaultChecked = null;
    props.defaultValue = null;
    props.checked =
      this.props.checked != null ? this.props.checked : this.state.checked;

    var value = this.getValue();
    props.value = value != null ? value : this.state.value;

    props.onChange = this._handleChange;

    return input(props, this.props.children);
  },

  componentDidMount: function(rootNode) {
    var id = ReactMount.getID(rootNode);
    instancesByReactID[id] = this;
  },

  componentWillUnmount: function() {
    var rootNode = this.getDOMNode();
    var id = ReactMount.getID(rootNode);
    delete instancesByReactID[id];
  },

  componentDidUpdate: function(prevProps, prevState, rootNode) {
    if (this.props.checked != null) {
      DOMPropertyOperations.setValueForProperty(
        rootNode,
        'checked',
        this.props.checked || false
      );
    }

    var value = this.getValue();
    if (value != null) {
      // Cast `value` to a string to ensure the value is set correctly. While
      // browsers typically do this as necessary, jsdom doesn't.
      DOMPropertyOperations.setValueForProperty(rootNode, 'value', '' + value);
    }
  },

  _handleChange: function(event) {
    var returnValue;
    var onChange = this.getOnChange();
    if (onChange) {
      this._isChanging = true;
      returnValue = onChange(event);
      this._isChanging = false;
    }
    this.setState({
      checked: event.target.checked,
      value: event.target.value
    });

    var name = this.props.name;
    if (this.props.type === 'radio' && name != null) {
      var rootNode = this.getDOMNode();
      // If `rootNode.form` was non-null, then we could try `form.elements`,
      // but that sometimes behaves strangely in IE8. We could also try using
      // `form.getElementsByName`, but that will only return direct children
      // and won't include inputs that use the HTML5 `form=` attribute. Since
      // the input might not even be in a form, let's just use the global
      // `getElementsByName` to ensure we don't miss anything.
      var group = document.getElementsByName(name);
      for (var i = 0, groupLen = group.length; i < groupLen; i++) {
        var otherNode = group[i];
        if (otherNode === rootNode ||
            otherNode.nodeName !== 'INPUT' || otherNode.type !== 'radio' ||
            otherNode.form !== rootNode.form) {
          continue;
        }
        var otherID = ReactMount.getID(otherNode);
        ("production" !== process.env.NODE_ENV ? invariant(
          otherID,
          'ReactDOMInput: Mixing React and non-React radio inputs with the ' +
          'same `name` is not supported.'
        ) : invariant(otherID));
        var otherInstance = instancesByReactID[otherID];
        ("production" !== process.env.NODE_ENV ? invariant(
          otherInstance,
          'ReactDOMInput: Unknown radio button ID %s.',
          otherID
        ) : invariant(otherInstance));
        // In some cases, this will actually change the `checked` state value.
        // In other cases, there's no change but this forces a reconcile upon
        // which componentDidUpdate will reset the DOM property to whatever it
        // should be.
        otherInstance.setState({
          checked: false
        });
      }
    }

    return returnValue;
  }

});

module.exports = ReactDOMInput;

},{"./DOMPropertyOperations":57,"./LinkedValueMixin":70,"./ReactCompositeComponent":78,"./ReactDOM":80,"./ReactMount":101,"./invariant":156,"./merge":165,"__browserify_process":35}],86:[function(require,module,exports){
var process=require("__browserify_process");/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactDOMOption
 */

"use strict";

var ReactCompositeComponent = require("./ReactCompositeComponent");
var ReactDOM = require("./ReactDOM");

// Store a reference to the <option> `ReactDOMComponent`.
var option = ReactDOM.option;

/**
 * Implements an <option> native component that warns when `selected` is set.
 */
var ReactDOMOption = ReactCompositeComponent.createClass({

  componentWillMount: function() {
    // TODO (yungsters): Remove support for `selected` in <option>.
    if (this.props.selected != null) {
      if ("production" !== process.env.NODE_ENV) {
        console.warn(
          'Use the `defaultValue` or `value` props on <select> instead of ' +
          'setting `selected` on <option>.'
        );
      }
    }
  },

  render: function() {
    return option(this.props, this.props.children);
  }

});

module.exports = ReactDOMOption;

},{"./ReactCompositeComponent":78,"./ReactDOM":80,"__browserify_process":35}],87:[function(require,module,exports){
var process=require("__browserify_process");/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactDOMSelect
 */

"use strict";

var LinkedValueMixin = require("./LinkedValueMixin");
var ReactCompositeComponent = require("./ReactCompositeComponent");
var ReactDOM = require("./ReactDOM");

var invariant = require("./invariant");
var merge = require("./merge");

// Store a reference to the <select> `ReactDOMComponent`.
var select = ReactDOM.select;

/**
 * Validation function for `value` and `defaultValue`.
 * @private
 */
function selectValueType(props, propName, componentName) {
  if (props[propName] == null) {
    return;
  }
  if (props.multiple) {
    ("production" !== process.env.NODE_ENV ? invariant(
      Array.isArray(props[propName]),
      'The `%s` prop supplied to <select> must be an array if `multiple` is ' +
      'true.',
      propName
    ) : invariant(Array.isArray(props[propName])));
  } else {
    ("production" !== process.env.NODE_ENV ? invariant(
      !Array.isArray(props[propName]),
      'The `%s` prop supplied to <select> must be a scalar value if ' +
      '`multiple` is false.',
      propName
    ) : invariant(!Array.isArray(props[propName])));
  }
}

/**
 * If `value` is supplied, updates <option> elements on mount and update.
 * @private
 */
function updateOptions() {
  /*jshint validthis:true */
  var propValue = this.getValue();
  var value = propValue != null ? propValue : this.state.value;
  var options = this.getDOMNode().options;
  var selectedValue = '' + value;

  for (var i = 0, l = options.length; i < l; i++) {
    var selected = this.props.multiple ?
      selectedValue.indexOf(options[i].value) >= 0 :
      selected = options[i].value === selectedValue;

    if (selected !== options[i].selected) {
      options[i].selected = selected;
    }
  }
}

/**
 * Implements a <select> native component that allows optionally setting the
 * props `value` and `defaultValue`. If `multiple` is false, the prop must be a
 * string. If `multiple` is true, the prop must be an array of strings.
 *
 * If `value` is not supplied (or null/undefined), user actions that change the
 * selected option will trigger updates to the rendered options.
 *
 * If it is supplied (and not null/undefined), the rendered options will not
 * update in response to user actions. Instead, the `value` prop must change in
 * order for the rendered options to update.
 *
 * If `defaultValue` is provided, any options with the supplied values will be
 * selected.
 */
var ReactDOMSelect = ReactCompositeComponent.createClass({
  mixins: [LinkedValueMixin],

  propTypes: {
    defaultValue: selectValueType,
    value: selectValueType
  },

  getInitialState: function() {
    return {value: this.props.defaultValue || (this.props.multiple ? [] : '')};
  },

  componentWillReceiveProps: function(nextProps) {
    if (!this.props.multiple && nextProps.multiple) {
      this.setState({value: [this.state.value]});
    } else if (this.props.multiple && !nextProps.multiple) {
      this.setState({value: this.state.value[0]});
    }
  },

  shouldComponentUpdate: function() {
    // Defer any updates to this component during the `onChange` handler.
    return !this._isChanging;
  },

  render: function() {
    // Clone `this.props` so we don't mutate the input.
    var props = merge(this.props);

    props.onChange = this._handleChange;
    props.value = null;

    return select(props, this.props.children);
  },

  componentDidMount: updateOptions,

  componentDidUpdate: updateOptions,

  _handleChange: function(event) {
    var returnValue;
    var onChange = this.getOnChange();
    if (onChange) {
      this._isChanging = true;
      returnValue = onChange(event);
      this._isChanging = false;
    }

    var selectedValue;
    if (this.props.multiple) {
      selectedValue = [];
      var options = event.target.options;
      for (var i = 0, l = options.length; i < l; i++) {
        if (options[i].selected) {
          selectedValue.push(options[i].value);
        }
      }
    } else {
      selectedValue = event.target.value;
    }

    this.setState({value: selectedValue});
    return returnValue;
  }

});

module.exports = ReactDOMSelect;

},{"./LinkedValueMixin":70,"./ReactCompositeComponent":78,"./ReactDOM":80,"./invariant":156,"./merge":165,"__browserify_process":35}],88:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactDOMSelection
 */

"use strict";

var getNodeForCharacterOffset = require("./getNodeForCharacterOffset");
var getTextContentAccessor = require("./getTextContentAccessor");

/**
 * Get the appropriate anchor and focus node/offset pairs for IE.
 *
 * The catch here is that IE's selection API doesn't provide information
 * about whether the selection is forward or backward, so we have to
 * behave as though it's always forward.
 *
 * IE text differs from modern selection in that it behaves as though
 * block elements end with a new line. This means character offsets will
 * differ between the two APIs.
 *
 * @param {DOMElement} node
 * @return {object}
 */
function getIEOffsets(node) {
  var selection = document.selection;
  var selectedRange = selection.createRange();
  var selectedLength = selectedRange.text.length;

  // Duplicate selection so we can move range without breaking user selection.
  var fromStart = selectedRange.duplicate();
  fromStart.moveToElementText(node);
  fromStart.setEndPoint('EndToStart', selectedRange);

  var startOffset = fromStart.text.length;
  var endOffset = startOffset + selectedLength;

  return {
    start: startOffset,
    end: endOffset
  };
}

/**
 * @param {DOMElement} node
 * @return {?object}
 */
function getModernOffsets(node) {
  var selection = window.getSelection();

  if (selection.rangeCount === 0) {
    return null;
  }

  var anchorNode = selection.anchorNode;
  var anchorOffset = selection.anchorOffset;
  var focusNode = selection.focusNode;
  var focusOffset = selection.focusOffset;

  var currentRange = selection.getRangeAt(0);
  var rangeLength = currentRange.toString().length;

  var tempRange = currentRange.cloneRange();
  tempRange.selectNodeContents(node);
  tempRange.setEnd(currentRange.startContainer, currentRange.startOffset);

  var start = tempRange.toString().length;
  var end = start + rangeLength;

  // Detect whether the selection is backward.
  var detectionRange = document.createRange();
  detectionRange.setStart(anchorNode, anchorOffset);
  detectionRange.setEnd(focusNode, focusOffset);
  var isBackward = detectionRange.collapsed;
  detectionRange.detach();

  return {
    start: isBackward ? end : start,
    end: isBackward ? start : end
  };
}

/**
 * @param {DOMElement|DOMTextNode} node
 * @param {object} offsets
 */
function setIEOffsets(node, offsets) {
  var range = document.selection.createRange().duplicate();
  var start, end;

  if (typeof offsets.end === 'undefined') {
    start = offsets.start;
    end = start;
  } else if (offsets.start > offsets.end) {
    start = offsets.end;
    end = offsets.start;
  } else {
    start = offsets.start;
    end = offsets.end;
  }

  range.moveToElementText(node);
  range.moveStart('character', start);
  range.setEndPoint('EndToStart', range);
  range.moveEnd('character', end - start);
  range.select();
}

/**
 * In modern non-IE browsers, we can support both forward and backward
 * selections.
 *
 * Note: IE10+ supports the Selection object, but it does not support
 * the `extend` method, which means that even in modern IE, it's not possible
 * to programatically create a backward selection. Thus, for all IE
 * versions, we use the old IE API to create our selections.
 *
 * @param {DOMElement|DOMTextNode} node
 * @param {object} offsets
 */
function setModernOffsets(node, offsets) {
  var selection = window.getSelection();

  var length = node[getTextContentAccessor()].length;
  var start = Math.min(offsets.start, length);
  var end = typeof offsets.end === 'undefined' ?
            start : Math.min(offsets.end, length);

  // IE 11 uses modern selection, but doesn't support the extend method.
  // Flip backward selections, so we can set with a single range.
  if (!selection.extend && start > end) {
    var temp = end;
    end = start;
    start = temp;
  }

  var startMarker = getNodeForCharacterOffset(node, start);
  var endMarker = getNodeForCharacterOffset(node, end);

  if (startMarker && endMarker) {
    var range = document.createRange();
    range.setStart(startMarker.node, startMarker.offset);
    selection.removeAllRanges();

    if (start > end) {
      selection.addRange(range);
      selection.extend(endMarker.node, endMarker.offset);
    } else {
      range.setEnd(endMarker.node, endMarker.offset);
      selection.addRange(range);
    }

    range.detach();
  }
}

var ReactDOMSelection = {
  /**
   * @param {DOMElement} node
   */
  getOffsets: function(node) {
    var getOffsets = document.selection ? getIEOffsets : getModernOffsets;
    return getOffsets(node);
  },

  /**
   * @param {DOMElement|DOMTextNode} node
   * @param {object} offsets
   */
  setOffsets: function(node, offsets) {
    var setOffsets = document.selection ? setIEOffsets : setModernOffsets;
    setOffsets(node, offsets);
  }
};

module.exports = ReactDOMSelection;

},{"./getNodeForCharacterOffset":151,"./getTextContentAccessor":153}],89:[function(require,module,exports){
var process=require("__browserify_process");/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactDOMTextarea
 */

"use strict";

var DOMPropertyOperations = require("./DOMPropertyOperations");
var LinkedValueMixin = require("./LinkedValueMixin");
var ReactCompositeComponent = require("./ReactCompositeComponent");
var ReactDOM = require("./ReactDOM");

var invariant = require("./invariant");
var merge = require("./merge");

// Store a reference to the <textarea> `ReactDOMComponent`.
var textarea = ReactDOM.textarea;

/**
 * Implements a <textarea> native component that allows setting `value`, and
 * `defaultValue`. This differs from the traditional DOM API because value is
 * usually set as PCDATA children.
 *
 * If `value` is not supplied (or null/undefined), user actions that affect the
 * value will trigger updates to the element.
 *
 * If `value` is supplied (and not null/undefined), the rendered element will
 * not trigger updates to the element. Instead, the `value` prop must change in
 * order for the rendered element to be updated.
 *
 * The rendered element will be initialized with an empty value, the prop
 * `defaultValue` if specified, or the children content (deprecated).
 */
var ReactDOMTextarea = ReactCompositeComponent.createClass({
  mixins: [LinkedValueMixin],

  getInitialState: function() {
    var defaultValue = this.props.defaultValue;
    // TODO (yungsters): Remove support for children content in <textarea>.
    var children = this.props.children;
    if (children != null) {
      if ("production" !== process.env.NODE_ENV) {
        console.warn(
          'Use the `defaultValue` or `value` props instead of setting ' +
          'children on <textarea>.'
        );
      }
      ("production" !== process.env.NODE_ENV ? invariant(
        defaultValue == null,
        'If you supply `defaultValue` on a <textarea>, do not pass children.'
      ) : invariant(defaultValue == null));
      if (Array.isArray(children)) {
        ("production" !== process.env.NODE_ENV ? invariant(
          children.length <= 1,
          '<textarea> can only have at most one child.'
        ) : invariant(children.length <= 1));
        children = children[0];
      }

      defaultValue = '' + children;
    }
    if (defaultValue == null) {
      defaultValue = '';
    }
    var value = this.getValue();
    return {
      // We save the initial value so that `ReactDOMComponent` doesn't update
      // `textContent` (unnecessary since we update value).
      // The initial value can be a boolean or object so that's why it's
      // forced to be a string.
      initialValue: '' + (value != null ? value : defaultValue),
      value: defaultValue
    };
  },

  shouldComponentUpdate: function() {
    // Defer any updates to this component during the `onChange` handler.
    return !this._isChanging;
  },

  render: function() {
    // Clone `this.props` so we don't mutate the input.
    var props = merge(this.props);
    var value = this.getValue();

    ("production" !== process.env.NODE_ENV ? invariant(
      props.dangerouslySetInnerHTML == null,
      '`dangerouslySetInnerHTML` does not make sense on <textarea>.'
    ) : invariant(props.dangerouslySetInnerHTML == null));

    props.defaultValue = null;
    props.value = value != null ? value : this.state.value;
    props.onChange = this._handleChange;

    // Always set children to the same thing. In IE9, the selection range will
    // get reset if `textContent` is mutated.
    return textarea(props, this.state.initialValue);
  },

  componentDidUpdate: function(prevProps, prevState, rootNode) {
    var value = this.getValue();
    if (value != null) {
      // Cast `value` to a string to ensure the value is set correctly. While
      // browsers typically do this as necessary, jsdom doesn't.
      DOMPropertyOperations.setValueForProperty(rootNode, 'value', '' + value);
    }
  },

  _handleChange: function(event) {
    var returnValue;
    var onChange = this.getOnChange();
    if (onChange) {
      this._isChanging = true;
      returnValue = onChange(event);
      this._isChanging = false;
    }
    this.setState({value: event.target.value});
    return returnValue;
  }

});

module.exports = ReactDOMTextarea;

},{"./DOMPropertyOperations":57,"./LinkedValueMixin":70,"./ReactCompositeComponent":78,"./ReactDOM":80,"./invariant":156,"./merge":165,"__browserify_process":35}],90:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactDefaultBatchingStrategy
 */

"use strict";

var ReactUpdates = require("./ReactUpdates");
var Transaction = require("./Transaction");

var emptyFunction = require("./emptyFunction");
var mixInto = require("./mixInto");

var RESET_BATCHED_UPDATES = {
  initialize: emptyFunction,
  close: function() {
    ReactDefaultBatchingStrategy.isBatchingUpdates = false;
  }
};

var FLUSH_BATCHED_UPDATES = {
  initialize: emptyFunction,
  close: ReactUpdates.flushBatchedUpdates.bind(ReactUpdates)
};

var TRANSACTION_WRAPPERS = [FLUSH_BATCHED_UPDATES, RESET_BATCHED_UPDATES];

function ReactDefaultBatchingStrategyTransaction() {
  this.reinitializeTransaction();
}

mixInto(ReactDefaultBatchingStrategyTransaction, Transaction.Mixin);
mixInto(ReactDefaultBatchingStrategyTransaction, {
  getTransactionWrappers: function() {
    return TRANSACTION_WRAPPERS;
  }
});

var transaction = new ReactDefaultBatchingStrategyTransaction();

var ReactDefaultBatchingStrategy = {
  isBatchingUpdates: false,

  /**
   * Call the provided function in a context within which calls to `setState`
   * and friends are batched such that components aren't updated unnecessarily.
   */
  batchedUpdates: function(callback, param) {
    var alreadyBatchingUpdates = ReactDefaultBatchingStrategy.isBatchingUpdates;

    ReactDefaultBatchingStrategy.isBatchingUpdates = true;

    // The code is written this way to avoid extra allocations
    if (alreadyBatchingUpdates) {
      callback(param);
    } else {
      transaction.perform(callback, null, param);
    }
  }
};

module.exports = ReactDefaultBatchingStrategy;

},{"./ReactUpdates":117,"./Transaction":130,"./emptyFunction":141,"./mixInto":168}],91:[function(require,module,exports){
var process=require("__browserify_process");/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactDefaultInjection
 */

"use strict";

var ReactDOM = require("./ReactDOM");
var ReactDOMButton = require("./ReactDOMButton");
var ReactDOMForm = require("./ReactDOMForm");
var ReactDOMInput = require("./ReactDOMInput");
var ReactDOMOption = require("./ReactDOMOption");
var ReactDOMSelect = require("./ReactDOMSelect");
var ReactDOMTextarea = require("./ReactDOMTextarea");
var ReactEventEmitter = require("./ReactEventEmitter");
var ReactEventTopLevelCallback = require("./ReactEventTopLevelCallback");
var ReactPerf = require("./ReactPerf");

var DefaultDOMPropertyConfig = require("./DefaultDOMPropertyConfig");
var DOMProperty = require("./DOMProperty");

var ChangeEventPlugin = require("./ChangeEventPlugin");
var CompositionEventPlugin = require("./CompositionEventPlugin");
var DefaultEventPluginOrder = require("./DefaultEventPluginOrder");
var EnterLeaveEventPlugin = require("./EnterLeaveEventPlugin");
var EventPluginHub = require("./EventPluginHub");
var MobileSafariClickEventPlugin = require("./MobileSafariClickEventPlugin");
var ReactInstanceHandles = require("./ReactInstanceHandles");
var SelectEventPlugin = require("./SelectEventPlugin");
var SimpleEventPlugin = require("./SimpleEventPlugin");

var ReactDefaultBatchingStrategy = require("./ReactDefaultBatchingStrategy");
var ReactUpdates = require("./ReactUpdates");

function inject() {
  ReactEventEmitter.TopLevelCallbackCreator = ReactEventTopLevelCallback;
  /**
   * Inject module for resolving DOM hierarchy and plugin ordering.
   */
  EventPluginHub.injection.injectEventPluginOrder(DefaultEventPluginOrder);
  EventPluginHub.injection.injectInstanceHandle(ReactInstanceHandles);

  /**
   * Some important event plugins included by default (without having to require
   * them).
   */
  EventPluginHub.injection.injectEventPluginsByName({
    SimpleEventPlugin: SimpleEventPlugin,
    EnterLeaveEventPlugin: EnterLeaveEventPlugin,
    ChangeEventPlugin: ChangeEventPlugin,
    CompositionEventPlugin: CompositionEventPlugin,
    MobileSafariClickEventPlugin: MobileSafariClickEventPlugin,
    SelectEventPlugin: SelectEventPlugin
  });

  ReactDOM.injection.injectComponentClasses({
    button: ReactDOMButton,
    form: ReactDOMForm,
    input: ReactDOMInput,
    option: ReactDOMOption,
    select: ReactDOMSelect,
    textarea: ReactDOMTextarea
  });

  DOMProperty.injection.injectDOMPropertyConfig(DefaultDOMPropertyConfig);

  if ("production" !== process.env.NODE_ENV) {
    ReactPerf.injection.injectMeasure(require("./ReactDefaultPerf").measure);
  }

  ReactUpdates.injection.injectBatchingStrategy(
    ReactDefaultBatchingStrategy
  );
}

module.exports = {
  inject: inject
};

},{"./ChangeEventPlugin":53,"./CompositionEventPlugin":54,"./DOMProperty":56,"./DefaultDOMPropertyConfig":59,"./DefaultEventPluginOrder":60,"./EnterLeaveEventPlugin":61,"./EventPluginHub":64,"./MobileSafariClickEventPlugin":71,"./ReactDOM":80,"./ReactDOMButton":81,"./ReactDOMForm":83,"./ReactDOMInput":85,"./ReactDOMOption":86,"./ReactDOMSelect":87,"./ReactDOMTextarea":89,"./ReactDefaultBatchingStrategy":90,"./ReactDefaultPerf":92,"./ReactEventEmitter":94,"./ReactEventTopLevelCallback":96,"./ReactInstanceHandles":98,"./ReactPerf":106,"./ReactUpdates":117,"./SelectEventPlugin":119,"./SimpleEventPlugin":120,"__browserify_process":35}],92:[function(require,module,exports){
var process=require("__browserify_process");/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactDefaultPerf
 * @typechecks static-only
 */

"use strict";

var performanceNow = require("./performanceNow");

var ReactDefaultPerf = {};

if ("production" !== process.env.NODE_ENV) {
  ReactDefaultPerf = {
    /**
     * Gets the stored information for a given object's function.
     *
     * @param {string} objName
     * @param {string} fnName
     * @return {?object}
     */
    getInfo: function(objName, fnName) {
      if (!this.info[objName] || !this.info[objName][fnName]) {
        return null;
      }
      return this.info[objName][fnName];
    },

    /**
     * Gets the logs pertaining to a given object's function.
     *
     * @param {string} objName
     * @param {string} fnName
     * @return {?array<object>}
     */
    getLogs: function(objName, fnName) {
      if (!this.getInfo(objName, fnName)) {
        return null;
      }
      return this.logs.filter(function(log) {
        return log.objName === objName && log.fnName === fnName;
      });
    },

    /**
     * Runs through the logs and builds an array of arrays, where each array
     * walks through the mounting/updating of each component underneath.
     *
     * @param {string} rootID The reactID of the root node, e.g. '.r[2cpyq]'
     * @return {array<array>}
     */
    getRawRenderHistory: function(rootID) {
      var history = [];
      /**
       * Since logs are added after the method returns, the logs are in a sense
       * upside-down: the inner-most elements from mounting/updating are logged
       * first, and the last addition to the log is the top renderComponent.
       * Therefore, we flip the logs upside down for ease of processing, and
       * reverse the history array at the end so the earliest event has index 0.
       */
      var logs = this.logs.filter(function(log) {
        return log.reactID.indexOf(rootID) === 0;
      }).reverse();

      var subHistory = [];
      logs.forEach(function(log, i) {
        if (i && log.reactID === rootID && logs[i - 1].reactID !== rootID) {
          subHistory.length && history.push(subHistory);
          subHistory = [];
        }
        subHistory.push(log);
      });
      if (subHistory.length) {
        history.push(subHistory);
      }
      return history.reverse();
    },

    /**
     * Runs through the logs and builds an array of strings, where each string
     * is a multiline formatted way of walking through the mounting/updating
     * underneath.
     *
     * @param {string} rootID The reactID of the root node, e.g. '.r[2cpyq]'
     * @return {array<string>}
     */
    getRenderHistory: function(rootID) {
      var history = this.getRawRenderHistory(rootID);

      return history.map(function(subHistory) {
        var headerString = (
          'log# Component (execution time) [bloat from logging]\n' +
          '================================================================\n'
        );
        return headerString + subHistory.map(function(log) {
          // Add two spaces for every layer in the reactID.
          var indents = '\t' + Array(log.reactID.split('.[').length).join('  ');
          var delta = _microTime(log.timing.delta);
          var bloat = _microTime(log.timing.timeToLog);

          return log.index + indents + log.name + ' (' + delta + 'ms)' +
            ' [' + bloat + 'ms]';
        }).join('\n');
      });
    },

    /**
     * Print the render history from `getRenderHistory` using console.log.
     * This is currently the best way to display perf data from
     * any React component; working on that.
     *
     * @param {string} rootID The reactID of the root node, e.g. '.r[2cpyq]'
     * @param {number} index
     */
    printRenderHistory: function(rootID, index) {
      var history = this.getRenderHistory(rootID);
      if (!history[index]) {
        console.warn(
          'Index', index, 'isn\'t available! ' +
          'The render history is', history.length, 'long.'
        );
        return;
      }
      console.log(
        'Loading render history #' + (index + 1) +
        ' of ' + history.length + ':\n' + history[index]
      );
    },

    /**
     * Prints the heatmap legend to console, showing how the colors correspond
     * with render times. This relies on console.log styles.
     */
    printHeatmapLegend: function() {
      if (!this.options.heatmap.enabled) {
        return;
      }
      var max = this.info.React
        && this.info.React.renderComponent
        && this.info.React.renderComponent.max;
      if (max) {
        var logStr = 'Heatmap: ';
        for (var ii = 0; ii <= 10 * max; ii += max) {
          logStr += '%c ' + (Math.round(ii) / 10) + 'ms ';
        }
        console.log(
          logStr,
          'background-color: hsla(100, 100%, 50%, 0.6);',
          'background-color: hsla( 90, 100%, 50%, 0.6);',
          'background-color: hsla( 80, 100%, 50%, 0.6);',
          'background-color: hsla( 70, 100%, 50%, 0.6);',
          'background-color: hsla( 60, 100%, 50%, 0.6);',
          'background-color: hsla( 50, 100%, 50%, 0.6);',
          'background-color: hsla( 40, 100%, 50%, 0.6);',
          'background-color: hsla( 30, 100%, 50%, 0.6);',
          'background-color: hsla( 20, 100%, 50%, 0.6);',
          'background-color: hsla( 10, 100%, 50%, 0.6);',
          'background-color: hsla(  0, 100%, 50%, 0.6);'
        );
      }
    },

    /**
     * Measure a given function with logging information, and calls a callback
     * if there is one.
     *
     * @param {string} objName
     * @param {string} fnName
     * @param {function} func
     * @return {function}
     */
    measure: function(objName, fnName, func) {
      var info = _getNewInfo(objName, fnName);

      var fnArgs = _getFnArguments(func);

      return function() {
        var timeBeforeFn = performanceNow();
        var fnReturn = func.apply(this, arguments);
        var timeAfterFn = performanceNow();

        /**
         * Hold onto arguments in a readable way: args[1] -> args.component.
         * args is also passed to the callback, so if you want to save an
         * argument in the log, do so in the callback.
         */
        var args = {};
        for (var i = 0; i < arguments.length; i++) {
          args[fnArgs[i]] = arguments[i];
        }

        var log = {
          index: ReactDefaultPerf.logs.length,
          fnName: fnName,
          objName: objName,
          timing: {
            before: timeBeforeFn,
            after: timeAfterFn,
            delta: timeAfterFn - timeBeforeFn
          }
        };

        ReactDefaultPerf.logs.push(log);

        /**
         * The callback gets:
         * - this (the component)
         * - the original method's arguments
         * - what the method returned
         * - the log object, and
         * - the wrapped method's info object.
         */
        var callback = _getCallback(objName, fnName);
        callback && callback(this, args, fnReturn, log, info);

        log.timing.timeToLog = performanceNow() - timeAfterFn;

        return fnReturn;
      };
    },

    /**
     * Holds information on wrapped objects/methods.
     * For instance, ReactDefaultPerf.info.React.renderComponent
     */
    info: {},

    /**
     * Holds all of the logs. Filter this to pull desired information.
     */
    logs: [],

    /**
     * Toggle settings for ReactDefaultPerf
     */
    options: {
      /**
       * The heatmap sets the background color of the React containers
       * according to how much total time has been spent rendering them.
       * The most temporally expensive component is set as pure red,
       * and the others are colored from green to red as a fraction
       * of that max component time.
       */
      heatmap: {
        enabled: true
      }
    }
  };

  /**
   * Gets a info area for a given object's function, adding a new one if
   * necessary.
   *
   * @param {string} objName
   * @param {string} fnName
   * @return {object}
   */
  var _getNewInfo = function(objName, fnName) {
    var info = ReactDefaultPerf.getInfo(objName, fnName);
    if (info) {
      return info;
    }
    ReactDefaultPerf.info[objName] = ReactDefaultPerf.info[objName] || {};

    return ReactDefaultPerf.info[objName][fnName] = {
      getLogs: function() {
        return ReactDefaultPerf.getLogs(objName, fnName);
      }
    };
  };

  /**
   * Gets a list of the argument names from a function's definition.
   * This is useful for storing arguments by their names within wrapFn().
   *
   * @param {function} fn
   * @return {array<string>}
   */
  var _getFnArguments = function(fn) {
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    var fnStr = fn.toString().replace(STRIP_COMMENTS, '');
    fnStr = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')'));
    return fnStr.match(/([^\s,]+)/g);
  };

  /**
   * Store common callbacks within ReactDefaultPerf.
   *
   * @param {string} objName
   * @param {string} fnName
   * @return {?function}
   */
  var _getCallback = function(objName, fnName) {
    switch (objName + '.' + fnName) {
      case 'React.renderComponent':
        return _renderComponentCallback;
      case 'ReactDOMComponent.mountComponent':
      case 'ReactDOMComponent.updateComponent':
        return _nativeComponentCallback;
      case 'ReactCompositeComponent.mountComponent':
      case 'ReactCompositeComponent.updateComponent':
        return _compositeComponentCallback;
      default:
        return null;
    }
  };

  /**
   * Callback function for React.renderComponent
   *
   * @param {object} component
   * @param {object} args
   * @param {?object} fnReturn
   * @param {object} log
   * @param {object} info
   */
  var _renderComponentCallback =
    function(component, args, fnReturn, log, info) {
    log.name = args.nextComponent.constructor.displayName || '[unknown]';
    log.reactID = fnReturn._rootNodeID || null;

    if (ReactDefaultPerf.options.heatmap.enabled) {
      var container = args.container;
      if (!container.loggedByReactDefaultPerf) {
        container.loggedByReactDefaultPerf = true;
        info.components = info.components || [];
        info.components.push(container);
      }

      container.count = container.count || 0;
      container.count += log.timing.delta;
      info.max = info.max || 0;
      if (container.count > info.max) {
        info.max = container.count;
        info.components.forEach(function(component) {
          _setHue(component, 100 - 100 * component.count / info.max);
        });
      } else {
        _setHue(container, 100 - 100 * container.count / info.max);
      }
    }
  };

  /**
   * Callback function for ReactDOMComponent
   *
   * @param {object} component
   * @param {object} args
   * @param {?object} fnReturn
   * @param {object} log
   * @param {object} info
   */
  var _nativeComponentCallback =
    function(component, args, fnReturn, log, info) {
    log.name = component.tagName || '[unknown]';
    log.reactID = component._rootNodeID;
  };

  /**
   * Callback function for ReactCompositeComponent
   *
   * @param {object} component
   * @param {object} args
   * @param {?object} fnReturn
   * @param {object} log
   * @param {object} info
   */
  var _compositeComponentCallback =
    function(component, args, fnReturn, log, info) {
    log.name = component.constructor.displayName || '[unknown]';
    log.reactID = component._rootNodeID;
  };

  /**
   * Using the hsl() background-color attribute, colors an element.
   *
   * @param {DOMElement} el
   * @param {number} hue [0 for red, 120 for green, 240 for blue]
   */
  var _setHue = function(el, hue) {
    el.style.backgroundColor = 'hsla(' + hue + ', 100%, 50%, 0.6)';
  };

  /**
   * Round to the thousandth place.
   * @param {number} time
   * @return {number}
   */
  var _microTime = function(time) {
    return Math.round(time * 1000) / 1000;
  };
}

module.exports = ReactDefaultPerf;

},{"./performanceNow":172,"__browserify_process":35}],93:[function(require,module,exports){
var process=require("__browserify_process");/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactErrorUtils
 * @typechecks
 */

var ReactErrorUtils = {
  /**
   * Creates a guarded version of a function. This is supposed to make debugging
   * of event handlers easier. This implementation provides only basic error
   * logging and re-throws the error.
   *
   * @param {function} func Function to be executed
   * @param {string} name The name of the guard
   * @return {function}
   */
  guard: function(func, name) {
    if ("production" !== process.env.NODE_ENV) {
      return function guarded() {
        try {
          return func.apply(this, arguments);
        } catch(ex) {
          console.error(name + ': ' + ex.message);
          throw ex;
        }
      };
    } else {
      return func;
    }
  }
};

module.exports = ReactErrorUtils;

},{"__browserify_process":35}],94:[function(require,module,exports){
var process=require("__browserify_process");/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactEventEmitter
 * @typechecks static-only
 */

"use strict";

var EventConstants = require("./EventConstants");
var EventListener = require("./EventListener");
var EventPluginHub = require("./EventPluginHub");
var ExecutionEnvironment = require("./ExecutionEnvironment");
var ReactEventEmitterMixin = require("./ReactEventEmitterMixin");
var ViewportMetrics = require("./ViewportMetrics");

var invariant = require("./invariant");
var isEventSupported = require("./isEventSupported");
var merge = require("./merge");

/**
 * Summary of `ReactEventEmitter` event handling:
 *
 *  - Top-level delegation is used to trap native browser events. We normalize
 *    and de-duplicate events to account for browser quirks.
 *
 *  - Forward these native events (with the associated top-level type used to
 *    trap it) to `EventPluginHub`, which in turn will ask plugins if they want
 *    to extract any synthetic events.
 *
 *  - The `EventPluginHub` will then process each event by annotating them with
 *    "dispatches", a sequence of listeners and IDs that care about that event.
 *
 *  - The `EventPluginHub` then dispatches the events.
 *
 * Overview of React and the event system:
 *
 *                   .
 * +------------+    .
 * |    DOM     |    .
 * +------------+    .                         +-----------+
 *       +           .               +--------+|SimpleEvent|
 *       |           .               |         |Plugin     |
 * +-----|------+    .               v         +-----------+
 * |     |      |    .    +--------------+                    +------------+
 * |     +-----------.--->|EventPluginHub|                    |    Event   |
 * |            |    .    |              |     +-----------+  | Propagators|
 * | ReactEvent |    .    |              |     |TapEvent   |  |------------|
 * |  Emitter   |    .    |              |<---+|Plugin     |  |other plugin|
 * |            |    .    |              |     +-----------+  |  utilities |
 * |     +-----------.---------+         |                    +------------+
 * |     |      |    .    +----|---------+
 * +-----|------+    .         |      ^        +-----------+
 *       |           .         |      |        |Enter/Leave|
 *       +           .         |      +-------+|Plugin     |
 * +-------------+   .         v               +-----------+
 * | application |   .    +----------+
 * |-------------|   .    | callback |
 * |             |   .    | registry |
 * |             |   .    +----------+
 * +-------------+   .
 *                   .
 *    React Core     .  General Purpose Event Plugin System
 */

/**
 * Traps top-level events by using event bubbling.
 *
 * @param {string} topLevelType Record from `EventConstants`.
 * @param {string} handlerBaseName Event name (e.g. "click").
 * @param {DOMEventTarget} element Element on which to attach listener.
 * @internal
 */
function trapBubbledEvent(topLevelType, handlerBaseName, element) {
  EventListener.listen(
    element,
    handlerBaseName,
    ReactEventEmitter.TopLevelCallbackCreator.createTopLevelCallback(
      topLevelType
    )
  );
}

/**
 * Traps a top-level event by using event capturing.
 *
 * @param {string} topLevelType Record from `EventConstants`.
 * @param {string} handlerBaseName Event name (e.g. "click").
 * @param {DOMEventTarget} element Element on which to attach listener.
 * @internal
 */
function trapCapturedEvent(topLevelType, handlerBaseName, element) {
  EventListener.capture(
    element,
    handlerBaseName,
    ReactEventEmitter.TopLevelCallbackCreator.createTopLevelCallback(
      topLevelType
    )
  );
}

/**
 * Listens to window scroll and resize events. We cache scroll values so that
 * application code can access them without triggering reflows.
 *
 * NOTE: Scroll events do not bubble.
 *
 * @private
 * @see http://www.quirksmode.org/dom/events/scroll.html
 */
function registerScrollValueMonitoring() {
  var refresh = ViewportMetrics.refreshScrollValues;
  EventListener.listen(window, 'scroll', refresh);
  EventListener.listen(window, 'resize', refresh);
}

/**
 * `ReactEventEmitter` is used to attach top-level event listeners. For example:
 *
 *   ReactEventEmitter.putListener('myID', 'onClick', myFunction);
 *
 * This would allocate a "registration" of `('onClick', myFunction)` on 'myID'.
 *
 * @internal
 */
var ReactEventEmitter = merge(ReactEventEmitterMixin, {

  /**
   * React references `ReactEventTopLevelCallback` using this property in order
   * to allow dependency injection.
   */
  TopLevelCallbackCreator: null,

  /**
   * Ensures that top-level event delegation listeners are installed.
   *
   * There are issues with listening to both touch events and mouse events on
   * the top-level, so we make the caller choose which one to listen to. (If
   * there's a touch top-level listeners, anchors don't receive clicks for some
   * reason, and only in some cases).
   *
   * @param {boolean} touchNotMouse Listen to touch events instead of mouse.
   * @param {DOMDocument} contentDocument DOM document to listen on
   */
  ensureListening: function(touchNotMouse, contentDocument) {
    ("production" !== process.env.NODE_ENV ? invariant(
      ExecutionEnvironment.canUseDOM,
      'ensureListening(...): Cannot toggle event listening in a Worker ' +
      'thread. This is likely a bug in the framework. Please report ' +
      'immediately.'
    ) : invariant(ExecutionEnvironment.canUseDOM));
    ("production" !== process.env.NODE_ENV ? invariant(
      ReactEventEmitter.TopLevelCallbackCreator,
      'ensureListening(...): Cannot be called without a top level callback ' +
      'creator being injected.'
    ) : invariant(ReactEventEmitter.TopLevelCallbackCreator));
    // Call out to base implementation.
    ReactEventEmitterMixin.ensureListening.call(
      ReactEventEmitter,
      {
        touchNotMouse: touchNotMouse,
        contentDocument: contentDocument
      }
    );
  },

  /**
   * Sets whether or not any created callbacks should be enabled.
   *
   * @param {boolean} enabled True if callbacks should be enabled.
   */
  setEnabled: function(enabled) {
    ("production" !== process.env.NODE_ENV ? invariant(
      ExecutionEnvironment.canUseDOM,
      'setEnabled(...): Cannot toggle event listening in a Worker thread. ' +
      'This is likely a bug in the framework. Please report immediately.'
    ) : invariant(ExecutionEnvironment.canUseDOM));
    if (ReactEventEmitter.TopLevelCallbackCreator) {
      ReactEventEmitter.TopLevelCallbackCreator.setEnabled(enabled);
    }
  },

  /**
   * @return {boolean} True if callbacks are enabled.
   */
  isEnabled: function() {
    return !!(
      ReactEventEmitter.TopLevelCallbackCreator &&
      ReactEventEmitter.TopLevelCallbackCreator.isEnabled()
    );
  },

  /**
   * We listen for bubbled touch events on the document object.
   *
   * Firefox v8.01 (and possibly others) exhibited strange behavior when
   * mounting `onmousemove` events at some node that was not the document
   * element. The symptoms were that if your mouse is not moving over something
   * contained within that mount point (for example on the background) the
   * top-level listeners for `onmousemove` won't be called. However, if you
   * register the `mousemove` on the document object, then it will of course
   * catch all `mousemove`s. This along with iOS quirks, justifies restricting
   * top-level listeners to the document object only, at least for these
   * movement types of events and possibly all events.
   *
   * @see http://www.quirksmode.org/blog/archives/2010/09/click_event_del.html
   *
   * Also, `keyup`/`keypress`/`keydown` do not bubble to the window on IE, but
   * they bubble to document.
   *
   * @param {boolean} touchNotMouse Listen to touch events instead of mouse.
   * @param {DOMDocument} contentDocument Document which owns the container
   * @private
   * @see http://www.quirksmode.org/dom/events/keys.html.
   */
  listenAtTopLevel: function(touchNotMouse, contentDocument) {
    ("production" !== process.env.NODE_ENV ? invariant(
      !contentDocument._isListening,
      'listenAtTopLevel(...): Cannot setup top-level listener more than once.'
    ) : invariant(!contentDocument._isListening));
    var topLevelTypes = EventConstants.topLevelTypes;
    var mountAt = contentDocument;

    registerScrollValueMonitoring();
    trapBubbledEvent(topLevelTypes.topMouseOver, 'mouseover', mountAt);
    trapBubbledEvent(topLevelTypes.topMouseDown, 'mousedown', mountAt);
    trapBubbledEvent(topLevelTypes.topMouseUp, 'mouseup', mountAt);
    trapBubbledEvent(topLevelTypes.topMouseMove, 'mousemove', mountAt);
    trapBubbledEvent(topLevelTypes.topMouseOut, 'mouseout', mountAt);
    trapBubbledEvent(topLevelTypes.topClick, 'click', mountAt);
    trapBubbledEvent(topLevelTypes.topDoubleClick, 'dblclick', mountAt);
    trapBubbledEvent(topLevelTypes.topContextMenu, 'contextmenu', mountAt);
    if (touchNotMouse) {
      trapBubbledEvent(topLevelTypes.topTouchStart, 'touchstart', mountAt);
      trapBubbledEvent(topLevelTypes.topTouchEnd, 'touchend', mountAt);
      trapBubbledEvent(topLevelTypes.topTouchMove, 'touchmove', mountAt);
      trapBubbledEvent(topLevelTypes.topTouchCancel, 'touchcancel', mountAt);
    }
    trapBubbledEvent(topLevelTypes.topKeyUp, 'keyup', mountAt);
    trapBubbledEvent(topLevelTypes.topKeyPress, 'keypress', mountAt);
    trapBubbledEvent(topLevelTypes.topKeyDown, 'keydown', mountAt);
    trapBubbledEvent(topLevelTypes.topInput, 'input', mountAt);
    trapBubbledEvent(topLevelTypes.topChange, 'change', mountAt);
    trapBubbledEvent(
      topLevelTypes.topSelectionChange,
      'selectionchange',
      mountAt
    );

    trapBubbledEvent(
      topLevelTypes.topCompositionEnd,
      'compositionend',
      mountAt
    );
    trapBubbledEvent(
      topLevelTypes.topCompositionStart,
      'compositionstart',
      mountAt
    );
    trapBubbledEvent(
      topLevelTypes.topCompositionUpdate,
      'compositionupdate',
      mountAt
    );

    if (isEventSupported('drag')) {
      trapBubbledEvent(topLevelTypes.topDrag, 'drag', mountAt);
      trapBubbledEvent(topLevelTypes.topDragEnd, 'dragend', mountAt);
      trapBubbledEvent(topLevelTypes.topDragEnter, 'dragenter', mountAt);
      trapBubbledEvent(topLevelTypes.topDragExit, 'dragexit', mountAt);
      trapBubbledEvent(topLevelTypes.topDragLeave, 'dragleave', mountAt);
      trapBubbledEvent(topLevelTypes.topDragOver, 'dragover', mountAt);
      trapBubbledEvent(topLevelTypes.topDragStart, 'dragstart', mountAt);
      trapBubbledEvent(topLevelTypes.topDrop, 'drop', mountAt);
    }

    if (isEventSupported('wheel')) {
      trapBubbledEvent(topLevelTypes.topWheel, 'wheel', mountAt);
    } else if (isEventSupported('mousewheel')) {
      trapBubbledEvent(topLevelTypes.topWheel, 'mousewheel', mountAt);
    } else {
      // Firefox needs to capture a different mouse scroll event.
      // @see http://www.quirksmode.org/dom/events/tests/scroll.html
      trapBubbledEvent(topLevelTypes.topWheel, 'DOMMouseScroll', mountAt);
    }

    // IE<9 does not support capturing so just trap the bubbled event there.
    if (isEventSupported('scroll', true)) {
      trapCapturedEvent(topLevelTypes.topScroll, 'scroll', mountAt);
    } else {
      trapBubbledEvent(topLevelTypes.topScroll, 'scroll', window);
    }

    if (isEventSupported('focus', true)) {
      trapCapturedEvent(topLevelTypes.topFocus, 'focus', mountAt);
      trapCapturedEvent(topLevelTypes.topBlur, 'blur', mountAt);
    } else if (isEventSupported('focusin')) {
      // IE has `focusin` and `focusout` events which bubble.
      // @see
      // http://www.quirksmode.org/blog/archives/2008/04/delegating_the.html
      trapBubbledEvent(topLevelTypes.topFocus, 'focusin', mountAt);
      trapBubbledEvent(topLevelTypes.topBlur, 'focusout', mountAt);
    }

    if (isEventSupported('copy')) {
      trapBubbledEvent(topLevelTypes.topCopy, 'copy', mountAt);
      trapBubbledEvent(topLevelTypes.topCut, 'cut', mountAt);
      trapBubbledEvent(topLevelTypes.topPaste, 'paste', mountAt);
    }
  },

  registrationNames: EventPluginHub.registrationNames,

  putListener: EventPluginHub.putListener,

  getListener: EventPluginHub.getListener,

  deleteListener: EventPluginHub.deleteListener,

  deleteAllListeners: EventPluginHub.deleteAllListeners,

  trapBubbledEvent: trapBubbledEvent,

  trapCapturedEvent: trapCapturedEvent

});


module.exports = ReactEventEmitter;

},{"./EventConstants":62,"./EventListener":63,"./EventPluginHub":64,"./ExecutionEnvironment":68,"./ReactEventEmitterMixin":95,"./ViewportMetrics":131,"./invariant":156,"./isEventSupported":157,"./merge":165,"__browserify_process":35}],95:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactEventEmitterMixin
 */

"use strict";

var EventPluginHub = require("./EventPluginHub");
var ReactUpdates = require("./ReactUpdates");

function runEventQueueInBatch(events) {
  EventPluginHub.enqueueEvents(events);
  EventPluginHub.processEventQueue();
}

var ReactEventEmitterMixin = {
  /**
   * Whether or not `ensureListening` has been invoked.
   * @type {boolean}
   * @private
   */
  _isListening: false,

  /**
   * Function, must be implemented. Listens to events on the top level of the
   * application.
   *
   * @abstract
   *
   * listenAtTopLevel: null,
   */

  /**
   * Ensures that top-level event delegation listeners are installed.
   *
   * There are issues with listening to both touch events and mouse events on
   * the top-level, so we make the caller choose which one to listen to. (If
   * there's a touch top-level listeners, anchors don't receive clicks for some
   * reason, and only in some cases).
   *
   * @param {*} config Configuration passed through to `listenAtTopLevel`.
   */
  ensureListening: function(config) {
    if (!config.contentDocument._reactIsListening) {
      this.listenAtTopLevel(config.touchNotMouse, config.contentDocument);
      config.contentDocument._reactIsListening = true;
    }
  },

  /**
   * Streams a fired top-level event to `EventPluginHub` where plugins have the
   * opportunity to create `ReactEvent`s to be dispatched.
   *
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {object} topLevelTarget The listening component root node.
   * @param {string} topLevelTargetID ID of `topLevelTarget`.
   * @param {object} nativeEvent Native environment event.
   */
  handleTopLevel: function(
      topLevelType,
      topLevelTarget,
      topLevelTargetID,
      nativeEvent) {
    var events = EventPluginHub.extractEvents(
      topLevelType,
      topLevelTarget,
      topLevelTargetID,
      nativeEvent
    );

    // Event queue being processed in the same cycle allows `preventDefault`.
    ReactUpdates.batchedUpdates(runEventQueueInBatch, events);
  }
};

module.exports = ReactEventEmitterMixin;

},{"./EventPluginHub":64,"./ReactUpdates":117}],96:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactEventTopLevelCallback
 * @typechecks static-only
 */

"use strict";

var ReactEventEmitter = require("./ReactEventEmitter");
var ReactMount = require("./ReactMount");

var getEventTarget = require("./getEventTarget");

/**
 * @type {boolean}
 * @private
 */
var _topLevelListenersEnabled = true;

/**
 * Top-level callback creator used to implement event handling using delegation.
 * This is used via dependency injection.
 */
var ReactEventTopLevelCallback = {

  /**
   * Sets whether or not any created callbacks should be enabled.
   *
   * @param {boolean} enabled True if callbacks should be enabled.
   */
  setEnabled: function(enabled) {
    _topLevelListenersEnabled = !!enabled;
  },

  /**
   * @return {boolean} True if callbacks are enabled.
   */
  isEnabled: function() {
    return _topLevelListenersEnabled;
  },

  /**
   * Creates a callback for the supplied `topLevelType` that could be added as
   * a listener to the document. The callback computes a `topLevelTarget` which
   * should be the root node of a mounted React component where the listener
   * is attached.
   *
   * @param {string} topLevelType Record from `EventConstants`.
   * @return {function} Callback for handling top-level events.
   */
  createTopLevelCallback: function(topLevelType) {
    return function(nativeEvent) {
      if (!_topLevelListenersEnabled) {
        return;
      }
      // TODO: Remove when synthetic events are ready, this is for IE<9.
      if (nativeEvent.srcElement &&
          nativeEvent.srcElement !== nativeEvent.target) {
        nativeEvent.target = nativeEvent.srcElement;
      }
      var topLevelTarget = ReactMount.getFirstReactDOM(
        getEventTarget(nativeEvent)
      ) || window;
      var topLevelTargetID = ReactMount.getID(topLevelTarget) || '';
      ReactEventEmitter.handleTopLevel(
        topLevelType,
        topLevelTarget,
        topLevelTargetID,
        nativeEvent
      );
    };
  }

};

module.exports = ReactEventTopLevelCallback;

},{"./ReactEventEmitter":94,"./ReactMount":101,"./getEventTarget":149}],97:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactInputSelection
 */

"use strict";

var ReactDOMSelection = require("./ReactDOMSelection");

var containsNode = require("./containsNode");
var getActiveElement = require("./getActiveElement");

function isInDocument(node) {
  return containsNode(document.documentElement, node);
}

/**
 * @ReactInputSelection: React input selection module. Based on Selection.js,
 * but modified to be suitable for react and has a couple of bug fixes (doesn't
 * assume buttons have range selections allowed).
 * Input selection module for React.
 */
var ReactInputSelection = {

  hasSelectionCapabilities: function(elem) {
    return elem && (
      (elem.nodeName === 'INPUT' && elem.type === 'text') ||
      elem.nodeName === 'TEXTAREA' ||
      elem.contentEditable === 'true'
    );
  },

  getSelectionInformation: function() {
    var focusedElem = getActiveElement();
    return {
      focusedElem: focusedElem,
      selectionRange:
          ReactInputSelection.hasSelectionCapabilities(focusedElem) ?
          ReactInputSelection.getSelection(focusedElem) :
          null
    };
  },

  /**
   * @restoreSelection: If any selection information was potentially lost,
   * restore it. This is useful when performing operations that could remove dom
   * nodes and place them back in, resulting in focus being lost.
   */
  restoreSelection: function(priorSelectionInformation) {
    var curFocusedElem = getActiveElement();
    var priorFocusedElem = priorSelectionInformation.focusedElem;
    var priorSelectionRange = priorSelectionInformation.selectionRange;
    if (curFocusedElem !== priorFocusedElem &&
        isInDocument(priorFocusedElem)) {
      if (ReactInputSelection.hasSelectionCapabilities(priorFocusedElem)) {
        ReactInputSelection.setSelection(
          priorFocusedElem,
          priorSelectionRange
        );
      }
      priorFocusedElem.focus();
    }
  },

  /**
   * @getSelection: Gets the selection bounds of a focused textarea, input or
   * contentEditable node.
   * -@input: Look up selection bounds of this input
   * -@return {start: selectionStart, end: selectionEnd}
   */
  getSelection: function(input) {
    var selection;

    if ('selectionStart' in input) {
      // Modern browser with input or textarea.
      selection = {
        start: input.selectionStart,
        end: input.selectionEnd
      };
    } else if (document.selection && input.nodeName === 'INPUT') {
      // IE8 input.
      var range = document.selection.createRange();
      // There can only be one selection per document in IE, so it must
      // be in our element.
      if (range.parentElement() === input) {
        selection = {
          start: -range.moveStart('character', -input.value.length),
          end: -range.moveEnd('character', -input.value.length)
        };
      }
    } else {
      // Content editable or old IE textarea.
      selection = ReactDOMSelection.getOffsets(input);
    }

    return selection || {start: 0, end: 0};
  },

  /**
   * @setSelection: Sets the selection bounds of a textarea or input and focuses
   * the input.
   * -@input     Set selection bounds of this input or textarea
   * -@offsets   Object of same form that is returned from get*
   */
  setSelection: function(input, offsets) {
    var start = offsets.start;
    var end = offsets.end;
    if (typeof end === 'undefined') {
      end = start;
    }

    if ('selectionStart' in input) {
      input.selectionStart = start;
      input.selectionEnd = Math.min(end, input.value.length);
    } else if (document.selection && input.nodeName === 'INPUT') {
      var range = input.createTextRange();
      range.collapse(true);
      range.moveStart('character', start);
      range.moveEnd('character', end - start);
      range.select();
    } else {
      ReactDOMSelection.setOffsets(input, offsets);
    }
  }
};

module.exports = ReactInputSelection;

},{"./ReactDOMSelection":88,"./containsNode":134,"./getActiveElement":148}],98:[function(require,module,exports){
var process=require("__browserify_process");/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactInstanceHandles
 * @typechecks static-only
 */

"use strict";

var invariant = require("./invariant");

var SEPARATOR = '.';
var SEPARATOR_LENGTH = SEPARATOR.length;

/**
 * Maximum depth of traversals before we consider the possibility of a bad ID.
 */
var MAX_TREE_DEPTH = 100;

/**
 * Size of the reactRoot ID space. We generate random numbers for React root
 * IDs and if there's a collision the events and DOM update system will
 * get confused. If we assume 100 React components per page, and a user
 * loads 1 page per minute 24/7 for 50 years, with a mount point space of
 * 9,999,999 the likelihood of never having a collision is 99.997%.
 */
var GLOBAL_MOUNT_POINT_MAX = 9999999;

/**
 * Creates a DOM ID prefix to use when mounting React components.
 *
 * @param {number} index A unique integer
 * @return {string} React root ID.
 * @internal
 */
function getReactRootIDString(index) {
  return SEPARATOR + 'r[' + index.toString(36) + ']';
}

/**
 * Checks if a character in the supplied ID is a separator or the end.
 *
 * @param {string} id A React DOM ID.
 * @param {number} index Index of the character to check.
 * @return {boolean} True if the character is a separator or end of the ID.
 * @private
 */
function isBoundary(id, index) {
  return id.charAt(index) === SEPARATOR || index === id.length;
}

/**
 * Checks if the supplied string is a valid React DOM ID.
 *
 * @param {string} id A React DOM ID, maybe.
 * @return {boolean} True if the string is a valid React DOM ID.
 * @private
 */
function isValidID(id) {
  return id === '' || (
    id.charAt(0) === SEPARATOR && id.charAt(id.length - 1) !== SEPARATOR
  );
}

/**
 * Checks if the first ID is an ancestor of or equal to the second ID.
 *
 * @param {string} ancestorID
 * @param {string} descendantID
 * @return {boolean} True if `ancestorID` is an ancestor of `descendantID`.
 * @internal
 */
function isAncestorIDOf(ancestorID, descendantID) {
  return (
    descendantID.indexOf(ancestorID) === 0 &&
    isBoundary(descendantID, ancestorID.length)
  );
}

/**
 * Gets the parent ID of the supplied React DOM ID, `id`.
 *
 * @param {string} id ID of a component.
 * @return {string} ID of the parent, or an empty string.
 * @private
 */
function getParentID(id) {
  return id ? id.substr(0, id.lastIndexOf(SEPARATOR)) : '';
}

/**
 * Gets the next DOM ID on the tree path from the supplied `ancestorID` to the
 * supplied `destinationID`. If they are equal, the ID is returned.
 *
 * @param {string} ancestorID ID of an ancestor node of `destinationID`.
 * @param {string} destinationID ID of the destination node.
 * @return {string} Next ID on the path from `ancestorID` to `destinationID`.
 * @private
 */
function getNextDescendantID(ancestorID, destinationID) {
  ("production" !== process.env.NODE_ENV ? invariant(
    isValidID(ancestorID) && isValidID(destinationID),
    'getNextDescendantID(%s, %s): Received an invalid React DOM ID.',
    ancestorID,
    destinationID
  ) : invariant(isValidID(ancestorID) && isValidID(destinationID)));
  ("production" !== process.env.NODE_ENV ? invariant(
    isAncestorIDOf(ancestorID, destinationID),
    'getNextDescendantID(...): React has made an invalid assumption about ' +
    'the DOM hierarchy. Expected `%s` to be an ancestor of `%s`.',
    ancestorID,
    destinationID
  ) : invariant(isAncestorIDOf(ancestorID, destinationID)));
  if (ancestorID === destinationID) {
    return ancestorID;
  }
  // Skip over the ancestor and the immediate separator. Traverse until we hit
  // another separator or we reach the end of `destinationID`.
  var start = ancestorID.length + SEPARATOR_LENGTH;
  for (var i = start; i < destinationID.length; i++) {
    if (isBoundary(destinationID, i)) {
      break;
    }
  }
  return destinationID.substr(0, i);
}

/**
 * Gets the nearest common ancestor ID of two IDs.
 *
 * Using this ID scheme, the nearest common ancestor ID is the longest common
 * prefix of the two IDs that immediately preceded a "marker" in both strings.
 *
 * @param {string} oneID
 * @param {string} twoID
 * @return {string} Nearest common ancestor ID, or the empty string if none.
 * @private
 */
function getFirstCommonAncestorID(oneID, twoID) {
  var minLength = Math.min(oneID.length, twoID.length);
  if (minLength === 0) {
    return '';
  }
  var lastCommonMarkerIndex = 0;
  // Use `<=` to traverse until the "EOL" of the shorter string.
  for (var i = 0; i <= minLength; i++) {
    if (isBoundary(oneID, i) && isBoundary(twoID, i)) {
      lastCommonMarkerIndex = i;
    } else if (oneID.charAt(i) !== twoID.charAt(i)) {
      break;
    }
  }
  var longestCommonID = oneID.substr(0, lastCommonMarkerIndex);
  ("production" !== process.env.NODE_ENV ? invariant(
    isValidID(longestCommonID),
    'getFirstCommonAncestorID(%s, %s): Expected a valid React DOM ID: %s',
    oneID,
    twoID,
    longestCommonID
  ) : invariant(isValidID(longestCommonID)));
  return longestCommonID;
}

/**
 * Traverses the parent path between two IDs (either up or down). The IDs must
 * not be the same, and there must exist a parent path between them.
 *
 * @param {?string} start ID at which to start traversal.
 * @param {?string} stop ID at which to end traversal.
 * @param {function} cb Callback to invoke each ID with.
 * @param {?boolean} skipFirst Whether or not to skip the first node.
 * @param {?boolean} skipLast Whether or not to skip the last node.
 * @private
 */
function traverseParentPath(start, stop, cb, arg, skipFirst, skipLast) {
  start = start || '';
  stop = stop || '';
  ("production" !== process.env.NODE_ENV ? invariant(
    start !== stop,
    'traverseParentPath(...): Cannot traverse from and to the same ID, `%s`.',
    start
  ) : invariant(start !== stop));
  var traverseUp = isAncestorIDOf(stop, start);
  ("production" !== process.env.NODE_ENV ? invariant(
    traverseUp || isAncestorIDOf(start, stop),
    'traverseParentPath(%s, %s, ...): Cannot traverse from two IDs that do ' +
    'not have a parent path.',
    start,
    stop
  ) : invariant(traverseUp || isAncestorIDOf(start, stop)));
  // Traverse from `start` to `stop` one depth at a time.
  var depth = 0;
  var traverse = traverseUp ? getParentID : getNextDescendantID;
  for (var id = start; /* until break */; id = traverse(id, stop)) {
    if ((!skipFirst || id !== start) && (!skipLast || id !== stop)) {
      cb(id, traverseUp, arg);
    }
    if (id === stop) {
      // Only break //after// visiting `stop`.
      break;
    }
    ("production" !== process.env.NODE_ENV ? invariant(
      depth++ < MAX_TREE_DEPTH,
      'traverseParentPath(%s, %s, ...): Detected an infinite loop while ' +
      'traversing the React DOM ID tree. This may be due to malformed IDs: %s',
      start, stop
    ) : invariant(depth++ < MAX_TREE_DEPTH));
  }
}

/**
 * Manages the IDs assigned to DOM representations of React components. This
 * uses a specific scheme in order to traverse the DOM efficiently (e.g. in
 * order to simulate events).
 *
 * @internal
 */
var ReactInstanceHandles = {

  createReactRootID: function() {
    return getReactRootIDString(
      Math.ceil(Math.random() * GLOBAL_MOUNT_POINT_MAX)
    );
  },

  /**
   * Constructs a React ID by joining a root ID with a name.
   *
   * @param {string} rootID Root ID of a parent component.
   * @param {string} name A component's name (as flattened children).
   * @return {string} A React ID.
   * @internal
   */
  createReactID: function(rootID, name) {
    return rootID + SEPARATOR + name;
  },

  /**
   * Gets the DOM ID of the React component that is the root of the tree that
   * contains the React component with the supplied DOM ID.
   *
   * @param {string} id DOM ID of a React component.
   * @return {?string} DOM ID of the React component that is the root.
   * @internal
   */
  getReactRootIDFromNodeID: function(id) {
    var regexResult = /\.r\[[^\]]+\]/.exec(id);
    return regexResult && regexResult[0];
  },

  /**
   * Traverses the ID hierarchy and invokes the supplied `cb` on any IDs that
   * should would receive a `mouseEnter` or `mouseLeave` event.
   *
   * NOTE: Does not invoke the callback on the nearest common ancestor because
   * nothing "entered" or "left" that element.
   *
   * @param {string} leaveID ID being left.
   * @param {string} enterID ID being entered.
   * @param {function} cb Callback to invoke on each entered/left ID.
   * @param {*} upArg Argument to invoke the callback with on left IDs.
   * @param {*} downArg Argument to invoke the callback with on entered IDs.
   * @internal
   */
  traverseEnterLeave: function(leaveID, enterID, cb, upArg, downArg) {
    var ancestorID = getFirstCommonAncestorID(leaveID, enterID);
    if (ancestorID !== leaveID) {
      traverseParentPath(leaveID, ancestorID, cb, upArg, false, true);
    }
    if (ancestorID !== enterID) {
      traverseParentPath(ancestorID, enterID, cb, downArg, true, false);
    }
  },

  /**
   * Simulates the traversal of a two-phase, capture/bubble event dispatch.
   *
   * NOTE: This traversal happens on IDs without touching the DOM.
   *
   * @param {string} targetID ID of the target node.
   * @param {function} cb Callback to invoke.
   * @param {*} arg Argument to invoke the callback with.
   * @internal
   */
  traverseTwoPhase: function(targetID, cb, arg) {
    if (targetID) {
      traverseParentPath('', targetID, cb, arg, true, false);
      traverseParentPath(targetID, '', cb, arg, false, true);
    }
  },

  /**
   * Exposed for unit testing.
   * @private
   */
  _getFirstCommonAncestorID: getFirstCommonAncestorID,

  /**
   * Exposed for unit testing.
   * @private
   */
  _getNextDescendantID: getNextDescendantID,

  isAncestorIDOf: isAncestorIDOf,

  SEPARATOR: SEPARATOR

};

module.exports = ReactInstanceHandles;

},{"./invariant":156,"__browserify_process":35}],99:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactLink
 * @typechecks static-only
 */

"use strict";

/**
 * ReactLink encapsulates a common pattern in which a component wants to modify
 * a prop received from its parent. ReactLink allows the parent to pass down a
 * value coupled with a callback that, when invoked, expresses an intent to
 * modify that value. For example:
 *
 * React.createClass({
 *   getInitialState: function() {
 *     return {value: ''};
 *   },
 *   render: function() {
 *     var valueLink = new ReactLink(this.state.value, this._handleValueChange);
 *     return <input valueLink={valueLink} />;
 *   },
 *   this._handleValueChange: function(newValue) {
 *     this.setState({value: newValue});
 *   }
 * });
 *
 * We have provided some sugary mixins to make the creation and
 * consumption of ReactLink easier; see LinkedValueMixin and LinkedStateMixin.
 */

/**
 * @param {*} value current value of the link
 * @param {function} requestChange callback to request a change
 */
function ReactLink(value, requestChange) {
  this.value = value;
  this.requestChange = requestChange;
}

module.exports = ReactLink;

},{}],100:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactMarkupChecksum
 */

"use strict";

var adler32 = require("./adler32");

var ReactMarkupChecksum = {
  CHECKSUM_ATTR_NAME: 'data-react-checksum',

  /**
   * @param {string} markup Markup string
   * @return {string} Markup string with checksum attribute attached
   */
  addChecksumToMarkup: function(markup) {
    var checksum = adler32(markup);
    return markup.replace(
      '>',
      ' ' + ReactMarkupChecksum.CHECKSUM_ATTR_NAME + '="' + checksum + '">'
    );
  },

  /**
   * @param {string} markup to use
   * @param {DOMElement} element root React element
   * @returns {boolean} whether or not the markup is the same
   */
  canReuseMarkup: function(markup, element) {
    var existingChecksum = element.getAttribute(
      ReactMarkupChecksum.CHECKSUM_ATTR_NAME
    );
    existingChecksum = existingChecksum && parseInt(existingChecksum, 10);
    var markupChecksum = adler32(markup);
    return markupChecksum === existingChecksum;
  }
};

module.exports = ReactMarkupChecksum;

},{"./adler32":133}],101:[function(require,module,exports){
var process=require("__browserify_process");/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactMount
 */

"use strict";

var ReactEventEmitter = require("./ReactEventEmitter");
var ReactInstanceHandles = require("./ReactInstanceHandles");

var $ = require("./$");
var containsNode = require("./containsNode");
var getReactRootElementInContainer = require("./getReactRootElementInContainer");
var invariant = require("./invariant");

var SEPARATOR = ReactInstanceHandles.SEPARATOR;

var ATTR_NAME = 'data-reactid';
var nodeCache = {};

var ELEMENT_NODE_TYPE = 1;
var DOC_NODE_TYPE = 9;

/** Mapping from reactRootID to React component instance. */
var instancesByReactRootID = {};

/** Mapping from reactRootID to `container` nodes. */
var containersByReactRootID = {};

if ("production" !== process.env.NODE_ENV) {
  /** __DEV__-only mapping from reactRootID to root elements. */
  var rootElementsByReactRootID = {};
}

/**
 * @param {DOMElement} container DOM element that may contain a React component.
 * @return {?string} A "reactRoot" ID, if a React component is rendered.
 */
function getReactRootID(container) {
  var rootElement = getReactRootElementInContainer(container);
  return rootElement && ReactMount.getID(rootElement);
}

/**
 * Accessing node[ATTR_NAME] or calling getAttribute(ATTR_NAME) on a form
 * element can return its control whose name or ID equals ATTR_NAME. All
 * DOM nodes support `getAttributeNode` but this can also get called on
 * other objects so just return '' if we're given something other than a
 * DOM node (such as window).
 *
 * @param {?DOMElement|DOMWindow|DOMDocument|DOMTextNode} node DOM node.
 * @return {string} ID of the supplied `domNode`.
 */
function getID(node) {
  var id = internalGetID(node);
  if (id) {
    if (nodeCache.hasOwnProperty(id)) {
      var cached = nodeCache[id];
      if (cached !== node) {
        ("production" !== process.env.NODE_ENV ? invariant(
          !isValid(cached, id),
          'ReactMount: Two valid but unequal nodes with the same `%s`: %s',
          ATTR_NAME, id
        ) : invariant(!isValid(cached, id)));

        nodeCache[id] = node;
      }
    } else {
      nodeCache[id] = node;
    }
  }

  return id;
}

function internalGetID(node) {
  // If node is something like a window, document, or text node, none of
  // which support attributes or a .getAttribute method, gracefully return
  // the empty string, as if the attribute were missing.
  return node && node.getAttribute && node.getAttribute(ATTR_NAME) || '';
}

/**
 * Sets the React-specific ID of the given node.
 *
 * @param {DOMElement} node The DOM node whose ID will be set.
 * @param {string} id The value of the ID attribute.
 */
function setID(node, id) {
  var oldID = internalGetID(node);
  if (oldID !== id) {
    delete nodeCache[oldID];
  }
  node.setAttribute(ATTR_NAME, id);
  nodeCache[id] = node;
}

/**
 * Finds the node with the supplied React-generated DOM ID.
 *
 * @param {string} id A React-generated DOM ID.
 * @return {DOMElement} DOM node with the suppled `id`.
 * @internal
 */
function getNode(id) {
  if (!nodeCache.hasOwnProperty(id) || !isValid(nodeCache[id], id)) {
    nodeCache[id] = ReactMount.findReactNodeByID(id);
  }
  return nodeCache[id];
}

/**
 * A node is "valid" if it is contained by a currently mounted container.
 *
 * This means that the node does not have to be contained by a document in
 * order to be considered valid.
 *
 * @param {?DOMElement} node The candidate DOM node.
 * @param {string} id The expected ID of the node.
 * @return {boolean} Whether the node is contained by a mounted container.
 */
function isValid(node, id) {
  if (node) {
    ("production" !== process.env.NODE_ENV ? invariant(
      internalGetID(node) === id,
      'ReactMount: Unexpected modification of `%s`',
      ATTR_NAME
    ) : invariant(internalGetID(node) === id));

    var container = ReactMount.findReactContainerForID(id);
    if (container && containsNode(container, node)) {
      return true;
    }
  }

  return false;
}

/**
 * Causes the cache to forget about one React-specific ID.
 *
 * @param {string} id The ID to forget.
 */
function purgeID(id) {
  delete nodeCache[id];
}

/**
 * Mounting is the process of initializing a React component by creatings its
 * representative DOM elements and inserting them into a supplied `container`.
 * Any prior content inside `container` is destroyed in the process.
 *
 *   ReactMount.renderComponent(component, $('container'));
 *
 *   <div id="container">                   <-- Supplied `container`.
 *     <div data-reactid=".r[3]">           <-- Rendered reactRoot of React
 *       // ...                                 component.
 *     </div>
 *   </div>
 *
 * Inside of `container`, the first element rendered is the "reactRoot".
 */
var ReactMount = {
  /**
   * Safety guard to prevent accidentally rendering over the entire HTML tree.
   */
  allowFullPageRender: false,

  /** Time spent generating markup. */
  totalInstantiationTime: 0,

  /** Time spent inserting markup into the DOM. */
  totalInjectionTime: 0,

  /** Whether support for touch events should be initialized. */
  useTouchEvents: false,

  /** Exposed for debugging purposes **/
  _instancesByReactRootID: instancesByReactRootID,

  /**
   * This is a hook provided to support rendering React components while
   * ensuring that the apparent scroll position of its `container` does not
   * change.
   *
   * @param {DOMElement} container The `container` being rendered into.
   * @param {function} renderCallback This must be called once to do the render.
   */
  scrollMonitor: function(container, renderCallback) {
    renderCallback();
  },

  /**
   * Ensures that the top-level event delegation listener is set up. This will
   * be invoked some time before the first time any React component is rendered.
   * @param {DOMElement} container container we're rendering into
   *
   * @private
   */
  prepareEnvironmentForDOM: function(container) {
    ("production" !== process.env.NODE_ENV ? invariant(
      container && (
        container.nodeType === ELEMENT_NODE_TYPE ||
        container.nodeType === DOC_NODE_TYPE
      ),
      'prepareEnvironmentForDOM(...): Target container is not a DOM element.'
    ) : invariant(container && (
      container.nodeType === ELEMENT_NODE_TYPE ||
      container.nodeType === DOC_NODE_TYPE
    )));
    var doc = container.nodeType === ELEMENT_NODE_TYPE ?
      container.ownerDocument :
      container;
    ReactEventEmitter.ensureListening(ReactMount.useTouchEvents, doc);
  },

  /**
   * Take a component that's already mounted into the DOM and replace its props
   * @param {ReactComponent} prevComponent component instance already in the DOM
   * @param {ReactComponent} nextComponent component instance to render
   * @param {DOMElement} container container to render into
   * @param {?function} callback function triggered on completion
   */
  _updateRootComponent: function(
      prevComponent,
      nextComponent,
      container,
      callback) {
    var nextProps = nextComponent.props;
    ReactMount.scrollMonitor(container, function() {
      prevComponent.replaceProps(nextProps, callback);
    });

    if ("production" !== process.env.NODE_ENV) {
      // Record the root element in case it later gets transplanted.
      rootElementsByReactRootID[getReactRootID(container)] =
        getReactRootElementInContainer(container);
    }

    return prevComponent;
  },

  /**
   * Register a component into the instance map and start the events system.
   * @param {ReactComponent} nextComponent component instance to render
   * @param {DOMElement} container container to render into
   * @return {string} reactRoot ID prefix
   */
  _registerComponent: function(nextComponent, container) {
    ReactMount.prepareEnvironmentForDOM(container);

    var reactRootID = ReactMount.registerContainer(container);
    instancesByReactRootID[reactRootID] = nextComponent;
    return reactRootID;
  },

  /**
   * Render a new component into the DOM.
   * @param {ReactComponent} nextComponent component instance to render
   * @param {DOMElement} container container to render into
   * @param {boolean} shouldReuseMarkup if we should skip the markup insertion
   * @return {ReactComponent} nextComponent
   */
  _renderNewRootComponent: function(
      nextComponent,
      container,
      shouldReuseMarkup) {
    var reactRootID = ReactMount._registerComponent(nextComponent, container);
    nextComponent.mountComponentIntoNode(
      reactRootID,
      container,
      shouldReuseMarkup
    );

    if ("production" !== process.env.NODE_ENV) {
      // Record the root element in case it later gets transplanted.
      rootElementsByReactRootID[reactRootID] =
        getReactRootElementInContainer(container);
    }

    return nextComponent;
  },

  /**
   * Renders a React component into the DOM in the supplied `container`.
   *
   * If the React component was previously rendered into `container`, this will
   * perform an update on it and only mutate the DOM as necessary to reflect the
   * latest React component.
   *
   * @param {ReactComponent} nextComponent Component instance to render.
   * @param {DOMElement} container DOM element to render into.
   * @param {?function} callback function triggered on completion
   * @return {ReactComponent} Component instance rendered in `container`.
   */
  renderComponent: function(nextComponent, container, callback) {
    var registeredComponent = instancesByReactRootID[getReactRootID(container)];

    if (registeredComponent) {
      if (registeredComponent.constructor === nextComponent.constructor) {
        return ReactMount._updateRootComponent(
          registeredComponent,
          nextComponent,
          container,
          callback
        );
      } else {
        ReactMount.unmountComponentAtNode(container);
      }
    }

    var reactRootElement = getReactRootElementInContainer(container);
    var containerHasReactMarkup =
      reactRootElement && ReactMount.isRenderedByReact(reactRootElement);

    var shouldReuseMarkup = containerHasReactMarkup && !registeredComponent;

    var component = ReactMount._renderNewRootComponent(
      nextComponent,
      container,
      shouldReuseMarkup
    );
    callback && callback();
    return component;
  },

  /**
   * Constructs a component instance of `constructor` with `initialProps` and
   * renders it into the supplied `container`.
   *
   * @param {function} constructor React component constructor.
   * @param {?object} props Initial props of the component instance.
   * @param {DOMElement} container DOM element to render into.
   * @return {ReactComponent} Component instance rendered in `container`.
   */
  constructAndRenderComponent: function(constructor, props, container) {
    return ReactMount.renderComponent(constructor(props), container);
  },

  /**
   * Constructs a component instance of `constructor` with `initialProps` and
   * renders it into a container node identified by supplied `id`.
   *
   * @param {function} componentConstructor React component constructor
   * @param {?object} props Initial props of the component instance.
   * @param {string} id ID of the DOM element to render into.
   * @return {ReactComponent} Component instance rendered in the container node.
   */
  constructAndRenderComponentByID: function(constructor, props, id) {
    return ReactMount.constructAndRenderComponent(constructor, props, $(id));
  },

  /**
   * Registers a container node into which React components will be rendered.
   * This also creates the "reatRoot" ID that will be assigned to the element
   * rendered within.
   *
   * @param {DOMElement} container DOM element to register as a container.
   * @return {string} The "reactRoot" ID of elements rendered within.
   */
  registerContainer: function(container) {
    var reactRootID = getReactRootID(container);
    if (reactRootID) {
      // If one exists, make sure it is a valid "reactRoot" ID.
      reactRootID = ReactInstanceHandles.getReactRootIDFromNodeID(reactRootID);
    }
    if (!reactRootID) {
      // No valid "reactRoot" ID found, create one.
      reactRootID = ReactInstanceHandles.createReactRootID();
    }
    containersByReactRootID[reactRootID] = container;
    return reactRootID;
  },

  /**
   * Unmounts and destroys the React component rendered in the `container`.
   *
   * @param {DOMElement} container DOM element containing a React component.
   * @return {boolean} True if a component was found in and unmounted from
   *                   `container`
   */
  unmountComponentAtNode: function(container) {
    var reactRootID = getReactRootID(container);
    var component = instancesByReactRootID[reactRootID];
    if (!component) {
      return false;
    }
    ReactMount.unmountComponentFromNode(component, container);
    delete instancesByReactRootID[reactRootID];
    delete containersByReactRootID[reactRootID];
    if ("production" !== process.env.NODE_ENV) {
      delete rootElementsByReactRootID[reactRootID];
    }
    return true;
  },

  /**
   * @deprecated
   */
  unmountAndReleaseReactRootNode: function() {
    if ("production" !== process.env.NODE_ENV) {
      console.warn(
        'unmountAndReleaseReactRootNode() has been renamed to ' +
        'unmountComponentAtNode() and will be removed in the next ' +
        'version of React.'
      );
    }
    return ReactMount.unmountComponentAtNode.apply(this, arguments);
  },

  /**
   * Unmounts a component and removes it from the DOM.
   *
   * @param {ReactComponent} instance React component instance.
   * @param {DOMElement} container DOM element to unmount from.
   * @final
   * @internal
   * @see {ReactMount.unmountComponentAtNode}
   */
  unmountComponentFromNode: function(instance, container) {
    instance.unmountComponent();

    if (container.nodeType === DOC_NODE_TYPE) {
      container = container.documentElement;
    }

    // http://jsperf.com/emptying-a-node
    while (container.lastChild) {
      container.removeChild(container.lastChild);
    }
  },

  /**
   * Finds the container DOM element that contains React component to which the
   * supplied DOM `id` belongs.
   *
   * @param {string} id The ID of an element rendered by a React component.
   * @return {?DOMElement} DOM element that contains the `id`.
   */
  findReactContainerForID: function(id) {
    var reactRootID = ReactInstanceHandles.getReactRootIDFromNodeID(id);
    var container = containersByReactRootID[reactRootID];

    if ("production" !== process.env.NODE_ENV) {
      var rootElement = rootElementsByReactRootID[reactRootID];
      if (rootElement && rootElement.parentNode !== container) {
        ("production" !== process.env.NODE_ENV ? invariant(
          // Call internalGetID here because getID calls isValid which calls
          // findReactContainerForID (this function).
          internalGetID(rootElement) === reactRootID,
          'ReactMount: Root element ID differed from reactRootID.'
        ) : invariant(// Call internalGetID here because getID calls isValid which calls
        // findReactContainerForID (this function).
        internalGetID(rootElement) === reactRootID));

        var containerChild = container.firstChild;
        if (containerChild &&
            reactRootID === internalGetID(containerChild)) {
          // If the container has a new child with the same ID as the old
          // root element, then rootElementsByReactRootID[reactRootID] is
          // just stale and needs to be updated. The case that deserves a
          // warning is when the container is empty.
          rootElementsByReactRootID[reactRootID] = containerChild;
        } else {
          console.warn(
            'ReactMount: Root element has been removed from its original ' +
            'container. New container:', rootElement.parentNode
          );
        }
      }
    }

    return container;
  },

  /**
   * Finds an element rendered by React with the supplied ID.
   *
   * @param {string} id ID of a DOM node in the React component.
   * @return {DOMElement} Root DOM node of the React component.
   */
  findReactNodeByID: function(id) {
    var reactRoot = ReactMount.findReactContainerForID(id);
    return ReactMount.findComponentRoot(reactRoot, id);
  },

  /**
   * True if the supplied `node` is rendered by React.
   *
   * @param {*} node DOM Element to check.
   * @return {boolean} True if the DOM Element appears to be rendered by React.
   * @internal
   */
  isRenderedByReact: function(node) {
    if (node.nodeType !== 1) {
      // Not a DOMElement, therefore not a React component
      return false;
    }
    var id = ReactMount.getID(node);
    return id ? id.charAt(0) === SEPARATOR : false;
  },

  /**
   * Traverses up the ancestors of the supplied node to find a node that is a
   * DOM representation of a React component.
   *
   * @param {*} node
   * @return {?DOMEventTarget}
   * @internal
   */
  getFirstReactDOM: function(node) {
    var current = node;
    while (current && current.parentNode !== current) {
      if (ReactMount.isRenderedByReact(current)) {
        return current;
      }
      current = current.parentNode;
    }
    return null;
  },

  /**
   * Finds a node with the supplied `id` inside of the supplied `ancestorNode`.
   * Exploits the ID naming scheme to perform the search quickly.
   *
   * @param {DOMEventTarget} ancestorNode Search from this root.
   * @pararm {string} id ID of the DOM representation of the component.
   * @return {DOMEventTarget} DOM node with the supplied `id`.
   * @internal
   */
  findComponentRoot: function(ancestorNode, id) {
    var firstChildren = [ancestorNode.firstChild];
    var childIndex = 0;

    while (childIndex < firstChildren.length) {
      var child = firstChildren[childIndex++];
      while (child) {
        var childID = ReactMount.getID(child);
        if (childID) {
          if (id === childID) {
            return child;
          } else if (ReactInstanceHandles.isAncestorIDOf(childID, id)) {
            // If we find a child whose ID is an ancestor of the given ID,
            // then we can be sure that we only want to search the subtree
            // rooted at this child, so we can throw out the rest of the
            // search state.
            firstChildren.length = childIndex = 0;
            firstChildren.push(child.firstChild);
            break;
          } else {
            // TODO This should not be necessary if the ID hierarchy is
            // correct, but is occasionally necessary if the DOM has been
            // modified in unexpected ways.
            firstChildren.push(child.firstChild);
          }
        } else {
          // If this child had no ID, then there's a chance that it was
          // injected automatically by the browser, as when a `<table>`
          // element sprouts an extra `<tbody>` child as a side effect of
          // `.innerHTML` parsing. Optimistically continue down this
          // branch, but not before examining the other siblings.
          firstChildren.push(child.firstChild);
        }
        child = child.nextSibling;
      }
    }

    if ("production" !== process.env.NODE_ENV) {
      console.error(
        'Error while invoking `findComponentRoot` with the following ' +
        'ancestor node:',
        ancestorNode
      );
    }
    ("production" !== process.env.NODE_ENV ? invariant(
      false,
      'findComponentRoot(..., %s): Unable to find element. This probably ' +
      'means the DOM was unexpectedly mutated (e.g. by the browser).',
      id,
      ReactMount.getID(ancestorNode)
    ) : invariant(false));
  },


  /**
   * React ID utilities.
   */

  ATTR_NAME: ATTR_NAME,

  getReactRootID: getReactRootID,

  getID: getID,

  setID: setID,

  getNode: getNode,

  purgeID: purgeID,

  injection: {}
};

module.exports = ReactMount;

},{"./$":48,"./ReactEventEmitter":94,"./ReactInstanceHandles":98,"./containsNode":134,"./getReactRootElementInContainer":152,"./invariant":156,"__browserify_process":35}],102:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactMountReady
 */

"use strict";

var PooledClass = require("./PooledClass");

var mixInto = require("./mixInto");

/**
 * A specialized pseudo-event module to help keep track of components waiting to
 * be notified when their DOM representations are available for use.
 *
 * This implements `PooledClass`, so you should never need to instantiate this.
 * Instead, use `ReactMountReady.getPooled()`.
 *
 * @param {?array<function>} initialCollection
 * @class ReactMountReady
 * @implements PooledClass
 * @internal
 */
function ReactMountReady(initialCollection) {
  this._queue = initialCollection || null;
}

mixInto(ReactMountReady, {

  /**
   * Enqueues a callback to be invoked when `notifyAll` is invoked. This is used
   * to enqueue calls to `componentDidMount` and `componentDidUpdate`.
   *
   * @param {ReactComponent} component Component being rendered.
   * @param {function(DOMElement)} callback Invoked when `notifyAll` is invoked.
   * @internal
   */
  enqueue: function(component, callback) {
    this._queue = this._queue || [];
    this._queue.push({component: component, callback: callback});
  },

  /**
   * Invokes all enqueued callbacks and clears the queue. This is invoked after
   * the DOM representation of a component has been created or updated.
   *
   * @internal
   */
  notifyAll: function() {
    var queue = this._queue;
    if (queue) {
      this._queue = null;
      for (var i = 0, l = queue.length; i < l; i++) {
        var component = queue[i].component;
        var callback = queue[i].callback;
        callback.call(component, component.getDOMNode());
      }
      queue.length = 0;
    }
  },

  /**
   * Resets the internal queue.
   *
   * @internal
   */
  reset: function() {
    this._queue = null;
  },

  /**
   * `PooledClass` looks for this.
   */
  destructor: function() {
    this.reset();
  }

});

PooledClass.addPoolingTo(ReactMountReady);

module.exports = ReactMountReady;

},{"./PooledClass":72,"./mixInto":168}],103:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactMultiChild
 * @typechecks static-only
 */

"use strict";

var ReactComponent = require("./ReactComponent");
var ReactMultiChildUpdateTypes = require("./ReactMultiChildUpdateTypes");

var flattenChildren = require("./flattenChildren");

/**
 * Given a `curChild` and `newChild`, determines if `curChild` should be
 * updated as opposed to being destroyed or replaced.
 *
 * @param {?ReactComponent} curChild
 * @param {?ReactComponent} newChild
 * @return {boolean} True if `curChild` should be updated with `newChild`.
 * @protected
 */
function shouldUpdateChild(curChild, newChild) {
  return curChild && newChild && curChild.constructor === newChild.constructor;
}

/**
 * Updating children of a component may trigger recursive updates. The depth is
 * used to batch recursive updates to render markup more efficiently.
 *
 * @type {number}
 * @private
 */
var updateDepth = 0;

/**
 * Queue of update configuration objects.
 *
 * Each object has a `type` property that is in `ReactMultiChildUpdateTypes`.
 *
 * @type {array<object>}
 * @private
 */
var updateQueue = [];

/**
 * Queue of markup to be rendered.
 *
 * @type {array<string>}
 * @private
 */
var markupQueue = [];

/**
 * Enqueues markup to be rendered and inserted at a supplied index.
 *
 * @param {string} parentID ID of the parent component.
 * @param {string} markup Markup that renders into an element.
 * @param {number} toIndex Destination index.
 * @private
 */
function enqueueMarkup(parentID, markup, toIndex) {
  // NOTE: Null values reduce hidden classes.
  updateQueue.push({
    parentID: parentID,
    parentNode: null,
    type: ReactMultiChildUpdateTypes.INSERT_MARKUP,
    markupIndex: markupQueue.push(markup) - 1,
    textContent: null,
    fromIndex: null,
    toIndex: toIndex
  });
}

/**
 * Enqueues moving an existing element to another index.
 *
 * @param {string} parentID ID of the parent component.
 * @param {number} fromIndex Source index of the existing element.
 * @param {number} toIndex Destination index of the element.
 * @private
 */
function enqueueMove(parentID, fromIndex, toIndex) {
  // NOTE: Null values reduce hidden classes.
  updateQueue.push({
    parentID: parentID,
    parentNode: null,
    type: ReactMultiChildUpdateTypes.MOVE_EXISTING,
    markupIndex: null,
    textContent: null,
    fromIndex: fromIndex,
    toIndex: toIndex
  });
}

/**
 * Enqueues removing an element at an index.
 *
 * @param {string} parentID ID of the parent component.
 * @param {number} fromIndex Index of the element to remove.
 * @private
 */
function enqueueRemove(parentID, fromIndex) {
  // NOTE: Null values reduce hidden classes.
  updateQueue.push({
    parentID: parentID,
    parentNode: null,
    type: ReactMultiChildUpdateTypes.REMOVE_NODE,
    markupIndex: null,
    textContent: null,
    fromIndex: fromIndex,
    toIndex: null
  });
}

/**
 * Enqueues setting the text content.
 *
 * @param {string} parentID ID of the parent component.
 * @param {string} textContent Text content to set.
 * @private
 */
function enqueueTextContent(parentID, textContent) {
  // NOTE: Null values reduce hidden classes.
  updateQueue.push({
    parentID: parentID,
    parentNode: null,
    type: ReactMultiChildUpdateTypes.TEXT_CONTENT,
    markupIndex: null,
    textContent: textContent,
    fromIndex: null,
    toIndex: null
  });
}

/**
 * Processes any enqueued updates.
 *
 * @private
 */
function processQueue() {
  if (updateQueue.length) {
    ReactComponent.DOMIDOperations.dangerouslyProcessChildrenUpdates(
      updateQueue,
      markupQueue
    );
    clearQueue();
  }
}

/**
 * Clears any enqueued updates.
 *
 * @private
 */
function clearQueue() {
  updateQueue.length = 0;
  markupQueue.length = 0;
}

/**
 * ReactMultiChild are capable of reconciling multiple children.
 *
 * @class ReactMultiChild
 * @internal
 */
var ReactMultiChild = {

  /**
   * Provides common functionality for components that must reconcile multiple
   * children. This is used by `ReactDOMComponent` to mount, update, and
   * unmount child components.
   *
   * @lends {ReactMultiChild.prototype}
   */
  Mixin: {

    /**
     * Generates a "mount image" for each of the supplied children. In the case
     * of `ReactDOMComponent`, a mount image is a string of markup.
     *
     * @param {?object} nestedChildren Nested child maps.
     * @return {array} An array of mounted representations.
     * @internal
     */
    mountChildren: function(nestedChildren, transaction) {
      var children = flattenChildren(nestedChildren);
      var mountImages = [];
      var index = 0;
      this._renderedChildren = children;
      for (var name in children) {
        var child = children[name];
        if (children.hasOwnProperty(name) && child) {
          // Inlined for performance, see `ReactInstanceHandles.createReactID`.
          var rootID = this._rootNodeID + '.' + name;
          var mountImage = child.mountComponent(
            rootID,
            transaction,
            this._mountDepth + 1
          );
          child._mountImage = mountImage;
          child._mountIndex = index;
          mountImages.push(mountImage);
          index++;
        }
      }
      return mountImages;
    },

    /**
     * Replaces any rendered children with a text content string.
     *
     * @param {string} nextContent String of content.
     * @internal
     */
    updateTextContent: function(nextContent) {
      updateDepth++;
      try {
        var prevChildren = this._renderedChildren;
        // Remove any rendered children.
        for (var name in prevChildren) {
          if (prevChildren.hasOwnProperty(name) &&
              prevChildren[name]) {
            this._unmountChildByName(prevChildren[name], name);
          }
        }
        // Set new text content.
        this.setTextContent(nextContent);
      } catch (error) {
        updateDepth--;
        updateDepth || clearQueue();
        throw error;
      }
      updateDepth--;
      updateDepth || processQueue();
    },

    /**
     * Updates the rendered children with new children.
     *
     * @param {?object} nextNestedChildren Nested child maps.
     * @param {ReactReconcileTransaction} transaction
     * @internal
     */
    updateChildren: function(nextNestedChildren, transaction) {
      updateDepth++;
      try {
        this._updateChildren(nextNestedChildren, transaction);
      } catch (error) {
        updateDepth--;
        updateDepth || clearQueue();
        throw error;
      }
      updateDepth--;
      updateDepth || processQueue();
    },

    /**
     * Improve performance by isolating this hot code path from the try/catch
     * block in `updateChildren`.
     *
     * @param {?object} nextNestedChildren Nested child maps.
     * @param {ReactReconcileTransaction} transaction
     * @final
     * @protected
     */
    _updateChildren: function(nextNestedChildren, transaction) {
      var nextChildren = flattenChildren(nextNestedChildren);
      var prevChildren = this._renderedChildren;
      if (!nextChildren && !prevChildren) {
        return;
      }
      var name;
      // `nextIndex` will increment for each child in `nextChildren`, but
      // `lastIndex` will be the last index visited in `prevChildren`.
      var lastIndex = 0;
      var nextIndex = 0;
      for (name in nextChildren) {
        if (!nextChildren.hasOwnProperty(name)) {
          continue;
        }
        var prevChild = prevChildren && prevChildren[name];
        var nextChild = nextChildren[name];
        if (shouldUpdateChild(prevChild, nextChild)) {
          this.moveChild(prevChild, nextIndex, lastIndex);
          lastIndex = Math.max(prevChild._mountIndex, lastIndex);
          prevChild.receiveComponent(nextChild, transaction);
          prevChild._mountIndex = nextIndex;
        } else {
          if (prevChild) {
            // Update `lastIndex` before `_mountIndex` gets unset by unmounting.
            lastIndex = Math.max(prevChild._mountIndex, lastIndex);
            this._unmountChildByName(prevChild, name);
          }
          if (nextChild) {
            this._mountChildByNameAtIndex(
              nextChild, name, nextIndex, transaction
            );
          }
        }
        if (nextChild) {
          nextIndex++;
        }
      }
      // Remove children that are no longer present.
      for (name in prevChildren) {
        if (prevChildren.hasOwnProperty(name) &&
            prevChildren[name] &&
            !(nextChildren && nextChildren[name])) {
          this._unmountChildByName(prevChildren[name], name);
        }
      }
    },

    /**
     * Unmounts all rendered children. This should be used to clean up children
     * when this component is unmounted.
     *
     * @internal
     */
    unmountChildren: function() {
      var renderedChildren = this._renderedChildren;
      for (var name in renderedChildren) {
        var renderedChild = renderedChildren[name];
        if (renderedChild && renderedChild.unmountComponent) {
          renderedChild.unmountComponent();
        }
      }
      this._renderedChildren = null;
    },

    /**
     * Moves a child component to the supplied index.
     *
     * @param {ReactComponent} child Component to move.
     * @param {number} toIndex Destination index of the element.
     * @param {number} lastIndex Last index visited of the siblings of `child`.
     * @protected
     */
    moveChild: function(child, toIndex, lastIndex) {
      // If the index of `child` is less than `lastIndex`, then it needs to
      // be moved. Otherwise, we do not need to move it because a child will be
      // inserted or moved before `child`.
      if (child._mountIndex < lastIndex) {
        enqueueMove(this._rootNodeID, child._mountIndex, toIndex);
      }
    },

    /**
     * Creates a child component.
     *
     * @param {ReactComponent} child Component to create.
     * @protected
     */
    createChild: function(child) {
      enqueueMarkup(this._rootNodeID, child._mountImage, child._mountIndex);
    },

    /**
     * Removes a child component.
     *
     * @param {ReactComponent} child Child to remove.
     * @protected
     */
    removeChild: function(child) {
      enqueueRemove(this._rootNodeID, child._mountIndex);
    },

    /**
     * Sets this text content string.
     *
     * @param {string} textContent Text content to set.
     * @protected
     */
    setTextContent: function(textContent) {
      enqueueTextContent(this._rootNodeID, textContent);
    },

    /**
     * Mounts a child with the supplied name.
     *
     * NOTE: This is part of `updateChildren` and is here for readability.
     *
     * @param {ReactComponent} child Component to mount.
     * @param {string} name Name of the child.
     * @param {number} index Index at which to insert the child.
     * @param {ReactReconcileTransaction} transaction
     * @private
     */
    _mountChildByNameAtIndex: function(child, name, index, transaction) {
      // Inlined for performance, see `ReactInstanceHandles.createReactID`.
      var rootID = this._rootNodeID + '.' + name;
      var mountImage = child.mountComponent(
        rootID,
        transaction,
        this._mountDepth + 1
      );
      child._mountImage = mountImage;
      child._mountIndex = index;
      this.createChild(child);
      this._renderedChildren = this._renderedChildren || {};
      this._renderedChildren[name] = child;
    },

    /**
     * Unmounts a rendered child by name.
     *
     * NOTE: This is part of `updateChildren` and is here for readability.
     *
     * @param {ReactComponent} child Component to unmount.
     * @param {string} name Name of the child in `this._renderedChildren`.
     * @private
     */
    _unmountChildByName: function(child, name) {
      if (ReactComponent.isValidComponent(child)) {
        this.removeChild(child);
        child._mountImage = null;
        child._mountIndex = null;
        child.unmountComponent();
        delete this._renderedChildren[name];
      }
    }

  }

};

module.exports = ReactMultiChild;

},{"./ReactComponent":75,"./ReactMultiChildUpdateTypes":104,"./flattenChildren":145}],104:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactMultiChildUpdateTypes
 */

var keyMirror = require("./keyMirror");

/**
 * When a component's children are updated, a series of update configuration
 * objects are created in order to batch and serialize the required changes.
 *
 * Enumerates all the possible types of update configurations.
 *
 * @internal
 */
var ReactMultiChildUpdateTypes = keyMirror({
  INSERT_MARKUP: null,
  MOVE_EXISTING: null,
  REMOVE_NODE: null,
  TEXT_CONTENT: null
});

module.exports = ReactMultiChildUpdateTypes;

},{"./keyMirror":162}],105:[function(require,module,exports){
var process=require("__browserify_process");/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactOwner
 */

"use strict";

var invariant = require("./invariant");

/**
 * ReactOwners are capable of storing references to owned components.
 *
 * All components are capable of //being// referenced by owner components, but
 * only ReactOwner components are capable of //referencing// owned components.
 * The named reference is known as a "ref".
 *
 * Refs are available when mounted and updated during reconciliation.
 *
 *   var MyComponent = React.createClass({
 *     render: function() {
 *       return (
 *         <div onClick={this.handleClick}>
 *           <CustomComponent ref="custom" />
 *         </div>
 *       );
 *     },
 *     handleClick: function() {
 *       this.refs.custom.handleClick();
 *     },
 *     componentDidMount: function() {
 *       this.refs.custom.initialize();
 *     }
 *   });
 *
 * Refs should rarely be used. When refs are used, they should only be done to
 * control data that is not handled by React's data flow.
 *
 * @class ReactOwner
 */
var ReactOwner = {

  /**
   * @param {?object} object
   * @return {boolean} True if `object` is a valid owner.
   * @final
   */
  isValidOwner: function(object) {
    return !!(
      object &&
      typeof object.attachRef === 'function' &&
      typeof object.detachRef === 'function'
    );
  },

  /**
   * Adds a component by ref to an owner component.
   *
   * @param {ReactComponent} component Component to reference.
   * @param {string} ref Name by which to refer to the component.
   * @param {ReactOwner} owner Component on which to record the ref.
   * @final
   * @internal
   */
  addComponentAsRefTo: function(component, ref, owner) {
    ("production" !== process.env.NODE_ENV ? invariant(
      ReactOwner.isValidOwner(owner),
      'addComponentAsRefTo(...): Only a ReactOwner can have refs.'
    ) : invariant(ReactOwner.isValidOwner(owner)));
    owner.attachRef(ref, component);
  },

  /**
   * Removes a component by ref from an owner component.
   *
   * @param {ReactComponent} component Component to dereference.
   * @param {string} ref Name of the ref to remove.
   * @param {ReactOwner} owner Component on which the ref is recorded.
   * @final
   * @internal
   */
  removeComponentAsRefFrom: function(component, ref, owner) {
    ("production" !== process.env.NODE_ENV ? invariant(
      ReactOwner.isValidOwner(owner),
      'removeComponentAsRefFrom(...): Only a ReactOwner can have refs.'
    ) : invariant(ReactOwner.isValidOwner(owner)));
    // Check that `component` is still the current ref because we do not want to
    // detach the ref if another component stole it.
    if (owner.refs[ref] === component) {
      owner.detachRef(ref);
    }
  },

  /**
   * A ReactComponent must mix this in to have refs.
   *
   * @lends {ReactOwner.prototype}
   */
  Mixin: {

    /**
     * Lazily allocates the refs object and stores `component` as `ref`.
     *
     * @param {string} ref Reference name.
     * @param {component} component Component to store as `ref`.
     * @final
     * @private
     */
    attachRef: function(ref, component) {
      ("production" !== process.env.NODE_ENV ? invariant(
        component.isOwnedBy(this),
        'attachRef(%s, ...): Only a component\'s owner can store a ref to it.',
        ref
      ) : invariant(component.isOwnedBy(this)));
      var refs = this.refs || (this.refs = {});
      refs[ref] = component;
    },

    /**
     * Detaches a reference name.
     *
     * @param {string} ref Name to dereference.
     * @final
     * @private
     */
    detachRef: function(ref) {
      delete this.refs[ref];
    }

  }

};

module.exports = ReactOwner;

},{"./invariant":156,"__browserify_process":35}],106:[function(require,module,exports){
var process=require("__browserify_process");/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactPerf
 * @typechecks static-only
 */

"use strict";

var ReactPerf = {
  /**
   * Boolean to enable/disable measurement. Set to false by default to prevent
   * accidental logging and perf loss.
   */
  enableMeasure: false,

  /**
   * Holds onto the measure function in use. By default, don't measure
   * anything, but we'll override this if we inject a measure function.
   */
  storedMeasure: _noMeasure,

  /**
   * Use this to wrap methods you want to measure.
   *
   * @param {string} objName
   * @param {string} fnName
   * @param {function} func
   * @return {function}
   */
  measure: function(objName, fnName, func) {
    if ("production" !== process.env.NODE_ENV) {
      var measuredFunc = null;
      return function() {
        if (ReactPerf.enableMeasure) {
          if (!measuredFunc) {
            measuredFunc = ReactPerf.storedMeasure(objName, fnName, func);
          }
          return measuredFunc.apply(this, arguments);
        }
        return func.apply(this, arguments);
      };
    }
    return func;
  },

  injection: {
    /**
     * @param {function} measure
     */
    injectMeasure: function(measure) {
      ReactPerf.storedMeasure = measure;
    }
  }
};

if ("production" !== process.env.NODE_ENV) {
  var ExecutionEnvironment = require("./ExecutionEnvironment");
  var url = (ExecutionEnvironment.canUseDOM && window.location.href) || '';
  ReactPerf.enableMeasure = ReactPerf.enableMeasure ||
    (/[?&]react_perf\b/).test(url);
}

/**
 * Simply passes through the measured function, without measuring it.
 *
 * @param {string} objName
 * @param {string} fnName
 * @param {function} func
 * @return {function}
 */
function _noMeasure(objName, fnName, func) {
  return func;
}

module.exports = ReactPerf;

},{"./ExecutionEnvironment":68,"__browserify_process":35}],107:[function(require,module,exports){
var process=require("__browserify_process");/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactPropTransferer
 */

"use strict";

var emptyFunction = require("./emptyFunction");
var invariant = require("./invariant");
var joinClasses = require("./joinClasses");
var merge = require("./merge");

/**
 * Creates a transfer strategy that will merge prop values using the supplied
 * `mergeStrategy`. If a prop was previously unset, this just sets it.
 *
 * @param {function} mergeStrategy
 * @return {function}
 */
function createTransferStrategy(mergeStrategy) {
  return function(props, key, value) {
    if (!props.hasOwnProperty(key)) {
      props[key] = value;
    } else {
      props[key] = mergeStrategy(props[key], value);
    }
  };
}

/**
 * Transfer strategies dictate how props are transferred by `transferPropsTo`.
 */
var TransferStrategies = {
  /**
   * Never transfer `children`.
   */
  children: emptyFunction,
  /**
   * Transfer the `className` prop by merging them.
   */
  className: createTransferStrategy(joinClasses),
  /**
   * Never transfer the `ref` prop.
   */
  ref: emptyFunction,
  /**
   * Transfer the `style` prop (which is an object) by merging them.
   */
  style: createTransferStrategy(merge)
};

/**
 * ReactPropTransferer are capable of transferring props to another component
 * using a `transferPropsTo` method.
 *
 * @class ReactPropTransferer
 */
var ReactPropTransferer = {

  TransferStrategies: TransferStrategies,

  /**
   * @lends {ReactPropTransferer.prototype}
   */
  Mixin: {

    /**
     * Transfer props from this component to a target component.
     *
     * Props that do not have an explicit transfer strategy will be transferred
     * only if the target component does not already have the prop set.
     *
     * This is usually used to pass down props to a returned root component.
     *
     * @param {ReactComponent} component Component receiving the properties.
     * @return {ReactComponent} The supplied `component`.
     * @final
     * @protected
     */
    transferPropsTo: function(component) {
      ("production" !== process.env.NODE_ENV ? invariant(
        component.props.__owner__ === this,
        '%s: You can\'t call transferPropsTo() on a component that you ' +
        'don\'t own, %s. This usually means you are calling ' +
        'transferPropsTo() on a component passed in as props or children.',
        this.constructor.displayName,
        component.constructor.displayName
      ) : invariant(component.props.__owner__ === this));

      var props = {};
      for (var thatKey in component.props) {
        if (component.props.hasOwnProperty(thatKey)) {
          props[thatKey] = component.props[thatKey];
        }
      }
      for (var thisKey in this.props) {
        if (!this.props.hasOwnProperty(thisKey)) {
          continue;
        }
        var transferStrategy = TransferStrategies[thisKey];
        if (transferStrategy) {
          transferStrategy(props, thisKey, this.props[thisKey]);
        } else if (!props.hasOwnProperty(thisKey)) {
          props[thisKey] = this.props[thisKey];
        }
      }
      component.props = props;
      return component;
    }

  }

};

module.exports = ReactPropTransferer;

},{"./emptyFunction":141,"./invariant":156,"./joinClasses":161,"./merge":165,"__browserify_process":35}],108:[function(require,module,exports){
var process=require("__browserify_process");/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactPropTypes
 */

"use strict";

var createObjectFrom = require("./createObjectFrom");
var invariant = require("./invariant");

/**
 * Collection of methods that allow declaration and validation of props that are
 * supplied to React components. Example usage:
 *
 *   var Props = require('ReactPropTypes');
 *   var MyArticle = React.createClass({
 *     propTypes: {
 *       // An optional string prop named "description".
 *       description: Props.string,
 *
 *       // A required enum prop named "category".
 *       category: Props.oneOf(['News','Photos']).isRequired,
 *
 *       // A prop named "dialog" that requires an instance of Dialog.
 *       dialog: Props.instanceOf(Dialog).isRequired
 *     },
 *     render: function() { ... }
 *   });
 *
 * A more formal specification of how these methods are used:
 *
 *   type := array|bool|func|object|number|string|oneOf([...])|instanceOf(...)
 *   decl := ReactPropTypes.{type}(.isRequired)?
 *
 * Each and every declaration produces a function with the same signature. This
 * allows the creation of custom validation functions. For example:
 *
 *   var Props = require('ReactPropTypes');
 *   var MyLink = React.createClass({
 *     propTypes: {
 *       // An optional string or URI prop named "href".
 *       href: function(props, propName, componentName) {
 *         var propValue = props[propName];
 *         invariant(
 *           propValue == null ||
 *           typeof propValue === 'string' ||
 *           propValue instanceof URI,
 *           'Invalid `%s` supplied to `%s`, expected string or URI.',
 *           propName,
 *           componentName
 *         );
 *       }
 *     },
 *     render: function() { ... }
 *   });
 *
 * @internal
 */
var Props = {

  array: createPrimitiveTypeChecker('array'),
  bool: createPrimitiveTypeChecker('boolean'),
  func: createPrimitiveTypeChecker('function'),
  number: createPrimitiveTypeChecker('number'),
  object: createPrimitiveTypeChecker('object'),
  string: createPrimitiveTypeChecker('string'),

  oneOf: createEnumTypeChecker,

  instanceOf: createInstanceTypeChecker

};

var ANONYMOUS = '<<anonymous>>';

function createPrimitiveTypeChecker(expectedType) {
  function validatePrimitiveType(propValue, propName, componentName) {
    var propType = typeof propValue;
    if (propType === 'object' && Array.isArray(propValue)) {
      propType = 'array';
    }
    ("production" !== process.env.NODE_ENV ? invariant(
      propType === expectedType,
      'Invalid prop `%s` of type `%s` supplied to `%s`, expected `%s`.',
      propName,
      propType,
      componentName,
      expectedType
    ) : invariant(propType === expectedType));
  }
  return createChainableTypeChecker(validatePrimitiveType);
}

function createEnumTypeChecker(expectedValues) {
  var expectedEnum = createObjectFrom(expectedValues);
  function validateEnumType(propValue, propName, componentName) {
    ("production" !== process.env.NODE_ENV ? invariant(
      expectedEnum[propValue],
      'Invalid prop `%s` supplied to `%s`, expected one of %s.',
      propName,
      componentName,
      JSON.stringify(Object.keys(expectedEnum))
    ) : invariant(expectedEnum[propValue]));
  }
  return createChainableTypeChecker(validateEnumType);
}

function createInstanceTypeChecker(expectedClass) {
  function validateInstanceType(propValue, propName, componentName) {
    ("production" !== process.env.NODE_ENV ? invariant(
      propValue instanceof expectedClass,
      'Invalid prop `%s` supplied to `%s`, expected instance of `%s`.',
      propName,
      componentName,
      expectedClass.name || ANONYMOUS
    ) : invariant(propValue instanceof expectedClass));
  }
  return createChainableTypeChecker(validateInstanceType);
}

function createChainableTypeChecker(validate) {
  function createTypeChecker(isRequired) {
    function checkType(props, propName, componentName) {
      var propValue = props[propName];
      if (propValue != null) {
        // Only validate if there is a value to check.
        validate(propValue, propName, componentName || ANONYMOUS);
      } else {
        ("production" !== process.env.NODE_ENV ? invariant(
          !isRequired,
          'Required prop `%s` was not specified in `%s`.',
          propName,
          componentName || ANONYMOUS
        ) : invariant(!isRequired));
      }
    }
    if (!isRequired) {
      checkType.isRequired = createTypeChecker(true);
    }
    return checkType;
  }
  return createTypeChecker(false);
}

module.exports = Props;

},{"./createObjectFrom":138,"./invariant":156,"__browserify_process":35}],109:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactReconcileTransaction
 * @typechecks static-only
 */

"use strict";

var ExecutionEnvironment = require("./ExecutionEnvironment");
var PooledClass = require("./PooledClass");
var ReactEventEmitter = require("./ReactEventEmitter");
var ReactInputSelection = require("./ReactInputSelection");
var ReactMountReady = require("./ReactMountReady");
var Transaction = require("./Transaction");

var mixInto = require("./mixInto");

/**
 * Ensures that, when possible, the selection range (currently selected text
 * input) is not disturbed by performing the transaction.
 */
var SELECTION_RESTORATION = {
  /**
   * @return {Selection} Selection information.
   */
  initialize: ReactInputSelection.getSelectionInformation,
  /**
   * @param {Selection} sel Selection information returned from `initialize`.
   */
  close: ReactInputSelection.restoreSelection
};

/**
 * Suppresses events (blur/focus) that could be inadvertently dispatched due to
 * high level DOM manipulations (like temporarily removing a text input from the
 * DOM).
 */
var EVENT_SUPPRESSION = {
  /**
   * @return {boolean} The enabled status of `ReactEventEmitter` before the
   * reconciliation.
   */
  initialize: function() {
    var currentlyEnabled = ReactEventEmitter.isEnabled();
    ReactEventEmitter.setEnabled(false);
    return currentlyEnabled;
  },

  /**
   * @param {boolean} previouslyEnabled Enabled status of `ReactEventEmitter`
   *   before the reconciliation occured. `close` restores the previous value.
   */
  close: function(previouslyEnabled) {
    ReactEventEmitter.setEnabled(previouslyEnabled);
  }
};

/**
 * Provides a `ReactMountReady` queue for collecting `onDOMReady` callbacks
 * during the performing of the transaction.
 */
var ON_DOM_READY_QUEUEING = {
  /**
   * Initializes the internal `onDOMReady` queue.
   */
  initialize: function() {
    this.reactMountReady.reset();
  },

  /**
   * After DOM is flushed, invoke all registered `onDOMReady` callbacks.
   */
  close: function() {
    this.reactMountReady.notifyAll();
  }
};

/**
 * Executed within the scope of the `Transaction` instance. Consider these as
 * being member methods, but with an implied ordering while being isolated from
 * each other.
 */
var TRANSACTION_WRAPPERS = [
  SELECTION_RESTORATION,
  EVENT_SUPPRESSION,
  ON_DOM_READY_QUEUEING
];

/**
 * Currently:
 * - The order that these are listed in the transaction is critical:
 * - Suppresses events.
 * - Restores selection range.
 *
 * Future:
 * - Restore document/overflow scroll positions that were unintentionally
 *   modified via DOM insertions above the top viewport boundary.
 * - Implement/integrate with customized constraint based layout system and keep
 *   track of which dimensions must be remeasured.
 *
 * @class ReactReconcileTransaction
 */
function ReactReconcileTransaction() {
  this.reinitializeTransaction();
  this.reactMountReady = ReactMountReady.getPooled(null);
}

var Mixin = {
  /**
   * @see Transaction
   * @abstract
   * @final
   * @return {array<object>} List of operation wrap proceedures.
   *   TODO: convert to array<TransactionWrapper>
   */
  getTransactionWrappers: function() {
    if (ExecutionEnvironment.canUseDOM) {
      return TRANSACTION_WRAPPERS;
    } else {
      return [];
    }
  },

  /**
   * @return {object} The queue to collect `onDOMReady` callbacks with.
   *   TODO: convert to ReactMountReady
   */
  getReactMountReady: function() {
    return this.reactMountReady;
  },

  /**
   * `PooledClass` looks for this, and will invoke this before allowing this
   * instance to be resused.
   */
  destructor: function() {
    ReactMountReady.release(this.reactMountReady);
    this.reactMountReady = null;
  }
};


mixInto(ReactReconcileTransaction, Transaction.Mixin);
mixInto(ReactReconcileTransaction, Mixin);

PooledClass.addPoolingTo(ReactReconcileTransaction);

module.exports = ReactReconcileTransaction;

},{"./ExecutionEnvironment":68,"./PooledClass":72,"./ReactEventEmitter":94,"./ReactInputSelection":97,"./ReactMountReady":102,"./Transaction":130,"./mixInto":168}],110:[function(require,module,exports){
var process=require("__browserify_process");/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @typechecks static-only
 * @providesModule ReactServerRendering
 */
"use strict";

var ReactComponent = require("./ReactComponent");
var ReactInstanceHandles = require("./ReactInstanceHandles");
var ReactMarkupChecksum = require("./ReactMarkupChecksum");
var ReactReconcileTransaction = require("./ReactReconcileTransaction");

var invariant = require("./invariant");

/**
 * @param {ReactComponent} component
 * @param {function} callback
 */
function renderComponentToString(component, callback) {
  // We use a callback API to keep the API async in case in the future we ever
  // need it, but in reality this is a synchronous operation.

  ("production" !== process.env.NODE_ENV ? invariant(
    ReactComponent.isValidComponent(component),
    'renderComponentToString(): You must pass a valid ReactComponent.'
  ) : invariant(ReactComponent.isValidComponent(component)));

  ("production" !== process.env.NODE_ENV ? invariant(
    typeof callback === 'function',
    'renderComponentToString(): You must pass a function as a callback.'
  ) : invariant(typeof callback === 'function'));

  var id = ReactInstanceHandles.createReactRootID();
  var transaction = ReactReconcileTransaction.getPooled();
  transaction.reinitializeTransaction();
  try {
    transaction.perform(function() {
      var markup = component.mountComponent(id, transaction, 0);
      markup = ReactMarkupChecksum.addChecksumToMarkup(markup);
      callback(markup);
    }, null);
  } finally {
    ReactReconcileTransaction.release(transaction);
  }
}

module.exports = {
  renderComponentToString: renderComponentToString
};

},{"./ReactComponent":75,"./ReactInstanceHandles":98,"./ReactMarkupChecksum":100,"./ReactReconcileTransaction":109,"./invariant":156,"__browserify_process":35}],111:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactStateSetters
 */

"use strict";

var ReactStateSetters = {
  /**
   * Returns a function that calls the provided function, and uses the result
   * of that to set the component's state.
   *
   * @param {ReactCompositeComponent} component
   * @param {function} funcReturningState Returned callback uses this to
   *                                      determine how to update state.
   * @return {function} callback that when invoked uses funcReturningState to
   *                    determined the object literal to setState.
   */
  createStateSetter: function(component, funcReturningState) {
    return function(a, b, c, d, e, f) {
      var partialState = funcReturningState.call(component, a, b, c, d, e, f);
      if (partialState) {
        component.setState(partialState);
      }
    };
  },

  /**
   * Returns a single-argument callback that can be used to update a single
   * key in the component's state.
   *
   * Note: this is memoized function, which makes it inexpensive to call.
   *
   * @param {ReactCompositeComponent} component
   * @param {string} key The key in the state that you should update.
   * @return {function} callback of 1 argument which calls setState() with
   *                    the provided keyName and callback argument.
   */
  createStateKeySetter: function(component, key) {
    // Memoize the setters.
    var cache = component.__keySetters || (component.__keySetters = {});
    return cache[key] || (cache[key] = createStateKeySetter(component, key));
  }
};

function createStateKeySetter(component, key) {
  // Partial state is allocated outside of the function closure so it can be
  // reused with every call, avoiding memory allocation when this function
  // is called.
  var partialState = {};
  return function stateKeySetter(value) {
    partialState[key] = value;
    component.setState(partialState);
  };
}

ReactStateSetters.Mixin = {
  /**
   * Returns a function that calls the provided function, and uses the result
   * of that to set the component's state.
   *
   * For example, these statements are equivalent:
   *
   *   this.setState({x: 1});
   *   this.createStateSetter(function(xValue) {
   *     return {x: xValue};
   *   })(1);
   *
   * @param {function} funcReturningState Returned callback uses this to
   *                                      determine how to update state.
   * @return {function} callback that when invoked uses funcReturningState to
   *                    determined the object literal to setState.
   */
  createStateSetter: function(funcReturningState) {
    return ReactStateSetters.createStateSetter(this, funcReturningState);
  },

  /**
   * Returns a single-argument callback that can be used to update a single
   * key in the component's state.
   *
   * For example, these statements are equivalent:
   *
   *   this.setState({x: 1});
   *   this.createStateKeySetter('x')(1);
   *
   * Note: this is memoized function, which makes it inexpensive to call.
   *
   * @param {string} key The key in the state that you should update.
   * @return {function} callback of 1 argument which calls setState() with
   *                    the provided keyName and callback argument.
   */
  createStateKeySetter: function(key) {
    return ReactStateSetters.createStateKeySetter(this, key);
  }
};

module.exports = ReactStateSetters;

},{}],112:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactTextComponent
 * @typechecks static-only
 */

"use strict";

var ReactComponent = require("./ReactComponent");
var ReactMount = require("./ReactMount");

var escapeTextForBrowser = require("./escapeTextForBrowser");
var mixInto = require("./mixInto");

/**
 * Text nodes violate a couple assumptions that React makes about components:
 *
 *  - When mounting text into the DOM, adjacent text nodes are merged.
 *  - Text nodes cannot be assigned a React root ID.
 *
 * This component is used to wrap strings in elements so that they can undergo
 * the same reconciliation that is applied to elements.
 *
 * TODO: Investigate representing React components in the DOM with text nodes.
 *
 * @class ReactTextComponent
 * @extends ReactComponent
 * @internal
 */
var ReactTextComponent = function(initialText) {
  this.construct({text: initialText});
};

mixInto(ReactTextComponent, ReactComponent.Mixin);
mixInto(ReactTextComponent, {

  /**
   * Creates the markup for this text node. This node is not intended to have
   * any features besides containing text content.
   *
   * @param {string} rootID DOM ID of the root node.
   * @param {ReactReconcileTransaction} transaction
   * @param {number} mountDepth number of components in the owner hierarchy
   * @return {string} Markup for this text node.
   * @internal
   */
  mountComponent: function(rootID, transaction, mountDepth) {
    ReactComponent.Mixin.mountComponent.call(
      this,
      rootID,
      transaction,
      mountDepth
    );
    return (
      '<span ' + ReactMount.ATTR_NAME + '="' + escapeTextForBrowser(rootID) + '">' +
        escapeTextForBrowser(this.props.text) +
      '</span>'
    );
  },

  /**
   * Updates this component by updating the text content.
   *
   * @param {object} nextComponent Contains the next text content.
   * @param {ReactReconcileTransaction} transaction
   * @internal
   */
  receiveComponent: function(nextComponent, transaction) {
    var nextProps = nextComponent.props;
    if (nextProps.text !== this.props.text) {
      this.props.text = nextProps.text;
      ReactComponent.DOMIDOperations.updateTextContentByID(
        this._rootNodeID,
        nextProps.text
      );
    }
  }

});

module.exports = ReactTextComponent;

},{"./ReactComponent":75,"./ReactMount":101,"./escapeTextForBrowser":142,"./mixInto":168}],113:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactTransitionEvents
 */

"use strict";

var ExecutionEnvironment = require("./ExecutionEnvironment");

var EVENT_NAME_MAP = {
  transitionend: {
    'transition': 'transitionend',
    'WebkitTransition': 'webkitTransitionEnd',
    'MozTransition': 'mozTransitionEnd',
    'OTransition': 'oTransitionEnd',
    'msTransition': 'MSTransitionEnd'
  },

  animationend: {
    'animation': 'animationend',
    'WebkitAnimation': 'webkitAnimationEnd',
    'MozAnimation': 'mozAnimationEnd',
    'OAnimation': 'oAnimationEnd',
    'msAnimation': 'MSAnimationEnd'
  }
};

var endEvents = [];

function detectEvents() {
  var testEl = document.createElement('div');
  var style = testEl.style;
  for (var baseEventName in EVENT_NAME_MAP) {
    var baseEvents = EVENT_NAME_MAP[baseEventName];
    for (var styleName in baseEvents) {
      if (styleName in style) {
        endEvents.push(baseEvents[styleName]);
        break;
      }
    }
  }
}

if (ExecutionEnvironment.canUseDOM) {
  detectEvents();
}

// We use the raw {add|remove}EventListener() call because EventListener
// does not know how to remove event listeners and we really should
// clean up. Also, these events are not triggered in older browsers
// so we should be A-OK here.

function addEventListener(node, eventName, eventListener) {
  node.addEventListener(eventName, eventListener, false);
}

function removeEventListener(node, eventName, eventListener) {
  node.removeEventListener(eventName, eventListener, false);
}

var ReactTransitionEvents = {
  addEndEventListener: function(node, eventListener) {
    if (endEvents.length === 0) {
      // If CSS transitions are not supported, trigger an "end animation"
      // event immediately.
      window.setTimeout(eventListener, 0);
      return;
    }
    endEvents.forEach(function(endEvent) {
      addEventListener(node, endEvent, eventListener);
    });
  },

  removeEndEventListener: function(node, eventListener) {
    if (endEvents.length === 0) {
      return;
    }
    endEvents.forEach(function(endEvent) {
      removeEventListener(node, endEvent, eventListener);
    });
  }
};

module.exports = ReactTransitionEvents;

},{"./ExecutionEnvironment":68}],114:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactTransitionGroup
 */

"use strict";

var React = require("./React");
var ReactTransitionableChild = require("./ReactTransitionableChild");
var ReactTransitionKeySet = require("./ReactTransitionKeySet");

var ReactTransitionGroup = React.createClass({

  propTypes: {
    transitionName: React.PropTypes.string.isRequired,
    transitionEnter: React.PropTypes.bool,
    transitionLeave: React.PropTypes.bool,
    onTransition: React.PropTypes.func,
    component: React.PropTypes.func
  },

  getDefaultProps: function() {
    return {
      transitionEnter: true,
      transitionLeave: true,
      component: React.DOM.span
    };
  },

  componentWillMount: function() {
    // _transitionGroupCurrentKeys stores the union of previous *and* next keys.
    // If this were a component we'd store it as state, however, since this must
    // be a mixin, we need to keep the result of the union of keys in each
    // call to animateChildren() which happens in render(), so we can't
    // call setState() in there.
    this._transitionGroupCurrentKeys = {};
  },

  componentDidUpdate: function() {
    if (this.props.onTransition) {
      this.props.onTransition();
    }
  },

  /**
   * Render some children in a transitionable way.
   */
  renderTransitionableChildren: function(sourceChildren) {
    var children = {};
    var childMapping = ReactTransitionKeySet.getChildMapping(sourceChildren);

    var currentKeys = ReactTransitionKeySet.mergeKeySets(
      this._transitionGroupCurrentKeys,
      ReactTransitionKeySet.getKeySet(sourceChildren)
    );

    for (var key in currentKeys) {
      // Here is how we keep the nodes in the DOM. ReactTransitionableChild
      // knows how to hold onto its child if it changes to undefined. Here, we
      // may look up an old key in the new children, and it may switch to
      // undefined. React's reconciler will keep the ReactTransitionableChild
      // instance alive such that we can animate it.
      if (childMapping[key] || this.props.transitionLeave) {
        children[key] = ReactTransitionableChild({
          name: this.props.transitionName,
          enter: this.props.transitionEnter,
          onDoneLeaving: this._handleDoneLeaving.bind(this, key)
        }, childMapping[key]);
      }
    }

    this._transitionGroupCurrentKeys = currentKeys;

    return children;
  },

  _handleDoneLeaving: function(key) {
    // When the leave animation finishes, we should blow away the actual DOM
    // node.
    delete this._transitionGroupCurrentKeys[key];
    this.forceUpdate();
  },

  render: function() {
    return this.transferPropsTo(
      this.props.component(
        {
          transitionName: null,
          transitionEnter: null,
          transitionLeave: null,
          component: null
        },
        this.renderTransitionableChildren(this.props.children)
      )
    );
  }
});

module.exports = ReactTransitionGroup;

},{"./React":73,"./ReactTransitionKeySet":115,"./ReactTransitionableChild":116}],115:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @typechecks static-only
 * @providesModule ReactTransitionKeySet
 */

"use strict";

var ReactChildren = require("./ReactChildren");

var MERGE_KEY_SETS_TAIL_SENTINEL = {};

var ReactTransitionKeySet = {
  /**
   * Given `this.props.children`, return an object mapping key to child. Just
   * simple syntactic sugar around ReactChildren.map().
   *
   * @param {*} children `this.props.children`
   * @return {object} Mapping of key to child
   */
  getChildMapping: function(children) {
    return ReactChildren.map(children, function(child) {
      return child;
    });
  },

  /**
   * Simple syntactic sugar to get an object with keys of all of `children`.
   * Does not have references to the children themselves.
   *
   * @param {*} children `this.props.children`
   * @return {object} Mapping of key to the value "true"
   */
  getKeySet: function(children) {
    return ReactChildren.map(children, function() {
      return true;
    });
  },

  /**
   * When you're adding or removing children some may be added or removed in the
   * same render pass. We want ot show *both* since we want to simultaneously
   * animate elements in and out. This function takes a previous set of keys
   * and a new set of keys and merges them with its best guess of the correct
   * ordering. In the future we may expose some of the utilities in
   * ReactMultiChild to make this easy, but for now React itself does not
   * directly have this concept of the union of prevChildren and nextChildren
   * so we implement it here.
   *
   * @param {object} prev prev child keys as returned from
   * `ReactTransitionKeySet.getKeySet()`.
   * @param {object} next next child keys as returned from
   * `ReactTransitionKeySet.getKeySet()`.
   * @return {object} a key set that contains all keys in `prev` and all keys
   * in `next` in a reasonable order.
   */
  mergeKeySets: function(prev, next) {
    prev = prev || {};
    next = next || {};

    var keySet = {};
    var prevKeys = Object.keys(prev).concat([MERGE_KEY_SETS_TAIL_SENTINEL]);
    var nextKeys = Object.keys(next).concat([MERGE_KEY_SETS_TAIL_SENTINEL]);
    var i;
    for (i = 0; i < prevKeys.length - 1; i++) {
      var prevKey = prevKeys[i];
      if (next[prevKey]) {
        continue;
      }

      // This key is not in the new set. Place it in our
      // best guess where it should go. We do this by searching
      // for a key after the current one in prevKeys that is
      // still in nextKeys, and inserting right before it.
      // I know this is O(n^2), but this is not a particularly
      // hot code path.
      var insertPos = -1;

      for (var j = i + 1; j < prevKeys.length; j++) {
        insertPos = nextKeys.indexOf(prevKeys[j]);
        if (insertPos >= 0) {
          break;
        }
      }

      // Insert before insertPos
      nextKeys.splice(insertPos, 0, prevKey);
    }

    for (i = 0; i < nextKeys.length - 1; i++) {
      keySet[nextKeys[i]] = true;
    }

    return keySet;
  }
};

module.exports = ReactTransitionKeySet;

},{"./ReactChildren":74}],116:[function(require,module,exports){
var process=require("__browserify_process");/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactTransitionableChild
 */

"use strict";

var React = require("./React");
var CSSCore = require("./CSSCore");
var ReactTransitionEvents = require("./ReactTransitionEvents");

// We don't remove the element from the DOM until we receive an animationend or
// transitionend event. If the user screws up and forgets to add an animation
// their node will be stuck in the DOM forever, so we detect if an animation
// does not start and if it doesn't, we just call the end listener immediately.
var TICK = 17;
var NO_EVENT_TIMEOUT = 5000;

var noEventListener = null;

if ("production" !== process.env.NODE_ENV) {
  noEventListener = function() {
    console.warn(
      'transition(): tried to perform an animation without ' +
      'an animationend or transitionend event after timeout (' +
      NO_EVENT_TIMEOUT + 'ms). You should either disable this ' +
      'transition in JS or add a CSS animation/transition.'
    );
  };
}

/**
 * This component is simply responsible for watching when its single child
 * changes to undefined and animating the old child out. It does this by
 * recording its old child in savedChildren when it detects this event is about
 * to occur.
 */
var ReactTransitionableChild = React.createClass({
  /**
   * Perform an actual DOM transition. This takes care of a few things:
   * - Adding the second CSS class to trigger the transition
   * - Listening for the finish event
   * - Cleaning up the css (unless noReset is true)
   */
  transition: function(animationType, noReset, finishCallback) {
    var node = this.getDOMNode();
    var className = this.props.name + '-' + animationType;
    var activeClassName = className + '-active';
    var noEventTimeout = null;

    var endListener = function() {
      if ("production" !== process.env.NODE_ENV) {
        clearTimeout(noEventTimeout);
      }

      // If this gets invoked after the component is unmounted it's OK.
      if (!noReset) {
        // Usually this means you're about to remove the node if you want to
        // leave it in its animated state.
        CSSCore.removeClass(node, className);
        CSSCore.removeClass(node, activeClassName);
      }

      ReactTransitionEvents.removeEndEventListener(node, endListener);

      // Usually this optional callback is used for informing an owner of
      // a leave animation and telling it to remove the child.
      finishCallback && finishCallback();
    };

    ReactTransitionEvents.addEndEventListener(node, endListener);

    CSSCore.addClass(node, className);

    // Need to do this to actually trigger a transition.
    this.queueClass(activeClassName);

    if ("production" !== process.env.NODE_ENV) {
      noEventTimeout = setTimeout(noEventListener, NO_EVENT_TIMEOUT);
    }
  },

  queueClass: function(className) {
    this.classNameQueue.push(className);

    if (this.props.runNextTick) {
      this.props.runNextTick(this.flushClassNameQueue);
      return;
    }

    if (!this.timeout) {
      this.timeout = setTimeout(this.flushClassNameQueue, TICK);
    }
  },

  flushClassNameQueue: function() {
    if (this.isMounted()) {
      this.classNameQueue.forEach(
        CSSCore.addClass.bind(CSSCore, this.getDOMNode())
      );
    }
    this.classNameQueue.length = 0;
    this.timeout = null;
  },

  componentWillMount: function() {
    this.classNameQueue = [];
  },

  componentWillUnmount: function() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  },

  componentWillReceiveProps: function(nextProps) {
    if (!nextProps.children && this.props.children) {
      this.savedChildren = this.props.children;
    }
  },

  componentDidMount: function(node) {
    if (this.props.enter) {
      this.transition('enter');
    }
  },

  componentDidUpdate: function(prevProps, prevState, node) {
    if (prevProps.children && !this.props.children) {
      this.transition('leave', true, this.props.onDoneLeaving);
    }
  },

  render: function() {
    return this.props.children || this.savedChildren;
  }
});

module.exports = ReactTransitionableChild;

},{"./CSSCore":49,"./React":73,"./ReactTransitionEvents":113,"__browserify_process":35}],117:[function(require,module,exports){
var process=require("__browserify_process");/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactUpdates
 */

"use strict";

var invariant = require("./invariant");

var dirtyComponents = [];

var batchingStrategy = null;

function ensureBatchingStrategy() {
  ("production" !== process.env.NODE_ENV ? invariant(batchingStrategy, 'ReactUpdates: must inject a batching strategy') : invariant(batchingStrategy));
}

function batchedUpdates(callback, param) {
  ensureBatchingStrategy();
  batchingStrategy.batchedUpdates(callback, param);
}

/**
 * Array comparator for ReactComponents by owner depth
 *
 * @param {ReactComponent} c1 first component you're comparing
 * @param {ReactComponent} c2 second component you're comparing
 * @return {number} Return value usable by Array.prototype.sort().
 */
function mountDepthComparator(c1, c2) {
  return c1._mountDepth - c2._mountDepth;
}

function runBatchedUpdates() {
  // Since reconciling a component higher in the owner hierarchy usually (not
  // always -- see shouldComponentUpdate()) will reconcile children, reconcile
  // them before their children by sorting the array.

  dirtyComponents.sort(mountDepthComparator);

  for (var i = 0; i < dirtyComponents.length; i++) {
    // If a component is unmounted before pending changes apply, ignore them
    // TODO: Queue unmounts in the same list to avoid this happening at all
    var component = dirtyComponents[i];
    if (component.isMounted()) {
      // If performUpdateIfNecessary happens to enqueue any new updates, we
      // shouldn't execute the callbacks until the next render happens, so
      // stash the callbacks first
      var callbacks = component._pendingCallbacks;
      component._pendingCallbacks = null;
      component.performUpdateIfNecessary();
      if (callbacks) {
        for (var j = 0; j < callbacks.length; j++) {
          callbacks[j].call(component);
        }
      }
    }
  }
}

function clearDirtyComponents() {
  dirtyComponents.length = 0;
}

function flushBatchedUpdates() {
  // Run these in separate functions so the JIT can optimize
  try {
    runBatchedUpdates();
  } catch (e) {
    // IE 8 requires catch to use finally.
    throw e;
  } finally {
    clearDirtyComponents();
  }
}

/**
 * Mark a component as needing a rerender, adding an optional callback to a
 * list of functions which will be executed once the rerender occurs.
 */
function enqueueUpdate(component, callback) {
  ("production" !== process.env.NODE_ENV ? invariant(
    !callback || typeof callback === "function",
    'enqueueUpdate(...): You called `setProps`, `replaceProps`, ' +
    '`setState`, `replaceState`, or `forceUpdate` with a callback that ' +
    'isn\'t callable.'
  ) : invariant(!callback || typeof callback === "function"));
  ensureBatchingStrategy();

  if (!batchingStrategy.isBatchingUpdates) {
    component.performUpdateIfNecessary();
    callback && callback();
    return;
  }

  dirtyComponents.push(component);

  if (callback) {
    if (component._pendingCallbacks) {
      component._pendingCallbacks.push(callback);
    } else {
      component._pendingCallbacks = [callback];
    }
  }
}

var ReactUpdatesInjection = {
  injectBatchingStrategy: function(_batchingStrategy) {
    ("production" !== process.env.NODE_ENV ? invariant(
      _batchingStrategy,
      'ReactUpdates: must provide a batching strategy'
    ) : invariant(_batchingStrategy));
    ("production" !== process.env.NODE_ENV ? invariant(
      typeof _batchingStrategy.batchedUpdates === 'function',
      'ReactUpdates: must provide a batchedUpdates() function'
    ) : invariant(typeof _batchingStrategy.batchedUpdates === 'function'));
    ("production" !== process.env.NODE_ENV ? invariant(
      typeof _batchingStrategy.isBatchingUpdates === 'boolean',
      'ReactUpdates: must provide an isBatchingUpdates boolean attribute'
    ) : invariant(typeof _batchingStrategy.isBatchingUpdates === 'boolean'));
    batchingStrategy = _batchingStrategy;
  }
};

var ReactUpdates = {
  batchedUpdates: batchedUpdates,
  enqueueUpdate: enqueueUpdate,
  flushBatchedUpdates: flushBatchedUpdates,
  injection: ReactUpdatesInjection
};

module.exports = ReactUpdates;

},{"./invariant":156,"__browserify_process":35}],118:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactWithAddons
 */

/**
 * This module exists purely in the open source project, and is meant as a way
 * to create a separate standalone build of React. This build has "addons", or
 * functionality we've built and think might be useful but doesn't have a good
 * place to live inside React core.
 */

"use strict";

var LinkedStateMixin = require("./LinkedStateMixin");
var React = require("./React");
var ReactTransitionGroup = require("./ReactTransitionGroup");

var cx = require("./cx");

React.addons = {
  classSet: cx,
  LinkedStateMixin: LinkedStateMixin,
  TransitionGroup: ReactTransitionGroup
};

module.exports = React;


},{"./LinkedStateMixin":69,"./React":73,"./ReactTransitionGroup":114,"./cx":139}],119:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule SelectEventPlugin
 */

"use strict";

var EventConstants = require("./EventConstants");
var EventPluginHub = require("./EventPluginHub");
var EventPropagators = require("./EventPropagators");
var ExecutionEnvironment = require("./ExecutionEnvironment");
var ReactInputSelection = require("./ReactInputSelection");
var SyntheticEvent = require("./SyntheticEvent");

var getActiveElement = require("./getActiveElement");
var isTextInputElement = require("./isTextInputElement");
var keyOf = require("./keyOf");
var shallowEqual = require("./shallowEqual");

var topLevelTypes = EventConstants.topLevelTypes;

var eventTypes = {
  select: {
    phasedRegistrationNames: {
      bubbled: keyOf({onSelect: null}),
      captured: keyOf({onSelectCapture: null})
    }
  }
};

var useSelectionChange = false;

if (ExecutionEnvironment.canUseDOM) {
  useSelectionChange = 'onselectionchange' in document;
}

var activeElement = null;
var activeElementID = null;
var activeNativeEvent = null;
var lastSelection = null;
var mouseDown = false;

/**
 * Get an object which is a unique representation of the current selection.
 *
 * The return value will not be consistent across nodes or browsers, but
 * two identical selections on the same node will return identical objects.
 *
 * @param {DOMElement} node
 * @param {object}
 */
function getSelection(node) {
  if ('selectionStart' in node &&
      ReactInputSelection.hasSelectionCapabilities(node)) {
    return {
      start: node.selectionStart,
      end: node.selectionEnd
    };
  } else if (document.selection) {
    var range = document.selection.createRange();
    return {
      parentElement: range.parentElement(),
      text: range.text,
      top: range.boundingTop,
      left: range.boundingLeft
    };
  } else {
    var selection = window.getSelection();
    return {
      anchorNode: selection.anchorNode,
      anchorOffset: selection.anchorOffset,
      focusNode: selection.focusNode,
      focusOffset: selection.focusOffset
    };
  }
}

/**
 * Poll selection to see whether it's changed.
 *
 * @param {object} nativeEvent
 * @return {?SyntheticEvent}
 */
function constructSelectEvent(nativeEvent) {
  // Ensure we have the right element, and that the user is not dragging a
  // selection (this matches native `select` event behavior).
  if (mouseDown || activeElement != getActiveElement()) {
    return;
  }

  // Only fire when selection has actually changed.
  var currentSelection = getSelection(activeElement);
  if (!lastSelection || !shallowEqual(lastSelection, currentSelection)) {
    lastSelection = currentSelection;

    var syntheticEvent = SyntheticEvent.getPooled(
      eventTypes.select,
      activeElementID,
      nativeEvent
    );

    syntheticEvent.type = 'select';
    syntheticEvent.target = activeElement;

    EventPropagators.accumulateTwoPhaseDispatches(syntheticEvent);

    return syntheticEvent;
  }
}

/**
 * Handle deferred event. And manually dispatch synthetic events.
 */
function dispatchDeferredSelectEvent() {
  if (!activeNativeEvent) {
    return;
  }

  var syntheticEvent = constructSelectEvent(activeNativeEvent);
  activeNativeEvent = null;

  // Enqueue and process the abstract event manually.
  if (syntheticEvent) {
    EventPluginHub.enqueueEvents(syntheticEvent);
    EventPluginHub.processEventQueue();
  }
}

/**
 * This plugin creates an `onSelect` event that normalizes select events
 * across form elements.
 *
 * Supported elements are:
 * - input (see `isTextInputElement`)
 * - textarea
 * - contentEditable
 *
 * This differs from native browser implementations in the following ways:
 * - Fires on contentEditable fields as well as inputs.
 * - Fires for collapsed selection.
 * - Fires after user input.
 */
var SelectEventPlugin = {

  eventTypes: eventTypes,

  /**
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {DOMEventTarget} topLevelTarget The listening component root node.
   * @param {string} topLevelTargetID ID of `topLevelTarget`.
   * @param {object} nativeEvent Native browser event.
   * @return {*} An accumulation of synthetic events.
   * @see {EventPluginHub.extractEvents}
   */
  extractEvents: function(
      topLevelType,
      topLevelTarget,
      topLevelTargetID,
      nativeEvent) {

    switch (topLevelType) {
      // Track the input node that has focus.
      case topLevelTypes.topFocus:
        if (isTextInputElement(topLevelTarget) ||
            topLevelTarget.contentEditable === 'true') {
          activeElement = topLevelTarget;
          activeElementID = topLevelTargetID;
          lastSelection = null;
        }
        break;
      case topLevelTypes.topBlur:
        activeElement = null;
        activeElementID = null;
        lastSelection = null;
        break;

      // Don't fire the event while the user is dragging. This matches the
      // semantics of the native select event.
      case topLevelTypes.topMouseDown:
        mouseDown = true;
        break;
      case topLevelTypes.topContextMenu:
      case topLevelTypes.topMouseUp:
        mouseDown = false;
        return constructSelectEvent(nativeEvent);

      // Chrome and IE fire non-standard event when selection is changed (and
      // sometimes when it hasn't).
      case topLevelTypes.topSelectionChange:
        return constructSelectEvent(nativeEvent);

      // Firefox doesn't support selectionchange, so check selection status
      // after each key entry.
      case topLevelTypes.topKeyDown:
        if (!useSelectionChange) {
          activeNativeEvent = nativeEvent;
          setTimeout(dispatchDeferredSelectEvent, 0);
        }
        break;
    }
  }
};

module.exports = SelectEventPlugin;

},{"./EventConstants":62,"./EventPluginHub":64,"./EventPropagators":67,"./ExecutionEnvironment":68,"./ReactInputSelection":97,"./SyntheticEvent":123,"./getActiveElement":148,"./isTextInputElement":159,"./keyOf":163,"./shallowEqual":173}],120:[function(require,module,exports){
var process=require("__browserify_process");/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule SimpleEventPlugin
 */

"use strict";

var EventConstants = require("./EventConstants");
var EventPropagators = require("./EventPropagators");
var SyntheticClipboardEvent = require("./SyntheticClipboardEvent");
var SyntheticEvent = require("./SyntheticEvent");
var SyntheticFocusEvent = require("./SyntheticFocusEvent");
var SyntheticKeyboardEvent = require("./SyntheticKeyboardEvent");
var SyntheticMouseEvent = require("./SyntheticMouseEvent");
var SyntheticTouchEvent = require("./SyntheticTouchEvent");
var SyntheticUIEvent = require("./SyntheticUIEvent");
var SyntheticWheelEvent = require("./SyntheticWheelEvent");

var invariant = require("./invariant");
var keyOf = require("./keyOf");

var topLevelTypes = EventConstants.topLevelTypes;

var eventTypes = {
  blur: {
    phasedRegistrationNames: {
      bubbled: keyOf({onBlur: true}),
      captured: keyOf({onBlurCapture: true})
    }
  },
  click: {
    phasedRegistrationNames: {
      bubbled: keyOf({onClick: true}),
      captured: keyOf({onClickCapture: true})
    }
  },
  contextMenu: {
    phasedRegistrationNames: {
      bubbled: keyOf({onContextMenu: true}),
      captured: keyOf({onContextMenuCapture: true})
    }
  },
  copy: {
    phasedRegistrationNames: {
      bubbled: keyOf({onCopy: true}),
      captured: keyOf({onCopyCapture: true})
    }
  },
  cut: {
    phasedRegistrationNames: {
      bubbled: keyOf({onCut: true}),
      captured: keyOf({onCutCapture: true})
    }
  },
  doubleClick: {
    phasedRegistrationNames: {
      bubbled: keyOf({onDoubleClick: true}),
      captured: keyOf({onDoubleClickCapture: true})
    }
  },
  drag: {
    phasedRegistrationNames: {
      bubbled: keyOf({onDrag: true}),
      captured: keyOf({onDragCapture: true})
    }
  },
  dragEnd: {
    phasedRegistrationNames: {
      bubbled: keyOf({onDragEnd: true}),
      captured: keyOf({onDragEndCapture: true})
    }
  },
  dragEnter: {
    phasedRegistrationNames: {
      bubbled: keyOf({onDragEnter: true}),
      captured: keyOf({onDragEnterCapture: true})
    }
  },
  dragExit: {
    phasedRegistrationNames: {
      bubbled: keyOf({onDragExit: true}),
      captured: keyOf({onDragExitCapture: true})
    }
  },
  dragLeave: {
    phasedRegistrationNames: {
      bubbled: keyOf({onDragLeave: true}),
      captured: keyOf({onDragLeaveCapture: true})
    }
  },
  dragOver: {
    phasedRegistrationNames: {
      bubbled: keyOf({onDragOver: true}),
      captured: keyOf({onDragOverCapture: true})
    }
  },
  dragStart: {
    phasedRegistrationNames: {
      bubbled: keyOf({onDragStart: true}),
      captured: keyOf({onDragStartCapture: true})
    }
  },
  drop: {
    phasedRegistrationNames: {
      bubbled: keyOf({onDrop: true}),
      captured: keyOf({onDropCapture: true})
    }
  },
  focus: {
    phasedRegistrationNames: {
      bubbled: keyOf({onFocus: true}),
      captured: keyOf({onFocusCapture: true})
    }
  },
  input: {
    phasedRegistrationNames: {
      bubbled: keyOf({onInput: true}),
      captured: keyOf({onInputCapture: true})
    }
  },
  keyDown: {
    phasedRegistrationNames: {
      bubbled: keyOf({onKeyDown: true}),
      captured: keyOf({onKeyDownCapture: true})
    }
  },
  keyPress: {
    phasedRegistrationNames: {
      bubbled: keyOf({onKeyPress: true}),
      captured: keyOf({onKeyPressCapture: true})
    }
  },
  keyUp: {
    phasedRegistrationNames: {
      bubbled: keyOf({onKeyUp: true}),
      captured: keyOf({onKeyUpCapture: true})
    }
  },
  // Note: We do not allow listening to mouseOver events. Instead, use the
  // onMouseEnter/onMouseLeave created by `EnterLeaveEventPlugin`.
  mouseDown: {
    phasedRegistrationNames: {
      bubbled: keyOf({onMouseDown: true}),
      captured: keyOf({onMouseDownCapture: true})
    }
  },
  mouseMove: {
    phasedRegistrationNames: {
      bubbled: keyOf({onMouseMove: true}),
      captured: keyOf({onMouseMoveCapture: true})
    }
  },
  mouseUp: {
    phasedRegistrationNames: {
      bubbled: keyOf({onMouseUp: true}),
      captured: keyOf({onMouseUpCapture: true})
    }
  },
  paste: {
    phasedRegistrationNames: {
      bubbled: keyOf({onPaste: true}),
      captured: keyOf({onPasteCapture: true})
    }
  },
  scroll: {
    phasedRegistrationNames: {
      bubbled: keyOf({onScroll: true}),
      captured: keyOf({onScrollCapture: true})
    }
  },
  submit: {
    phasedRegistrationNames: {
      bubbled: keyOf({onSubmit: true}),
      captured: keyOf({onSubmitCapture: true})
    }
  },
  touchCancel: {
    phasedRegistrationNames: {
      bubbled: keyOf({onTouchCancel: true}),
      captured: keyOf({onTouchCancelCapture: true})
    }
  },
  touchEnd: {
    phasedRegistrationNames: {
      bubbled: keyOf({onTouchEnd: true}),
      captured: keyOf({onTouchEndCapture: true})
    }
  },
  touchMove: {
    phasedRegistrationNames: {
      bubbled: keyOf({onTouchMove: true}),
      captured: keyOf({onTouchMoveCapture: true})
    }
  },
  touchStart: {
    phasedRegistrationNames: {
      bubbled: keyOf({onTouchStart: true}),
      captured: keyOf({onTouchStartCapture: true})
    }
  },
  wheel: {
    phasedRegistrationNames: {
      bubbled: keyOf({onWheel: true}),
      captured: keyOf({onWheelCapture: true})
    }
  }
};

var topLevelEventsToDispatchConfig = {
  topBlur:        eventTypes.blur,
  topClick:       eventTypes.click,
  topContextMenu: eventTypes.contextMenu,
  topCopy:        eventTypes.copy,
  topCut:         eventTypes.cut,
  topDoubleClick: eventTypes.doubleClick,
  topDrag:        eventTypes.drag,
  topDragEnd:     eventTypes.dragEnd,
  topDragEnter:   eventTypes.dragEnter,
  topDragExit:    eventTypes.dragExit,
  topDragLeave:   eventTypes.dragLeave,
  topDragOver:    eventTypes.dragOver,
  topDragStart:   eventTypes.dragStart,
  topDrop:        eventTypes.drop,
  topFocus:       eventTypes.focus,
  topInput:       eventTypes.input,
  topKeyDown:     eventTypes.keyDown,
  topKeyPress:    eventTypes.keyPress,
  topKeyUp:       eventTypes.keyUp,
  topMouseDown:   eventTypes.mouseDown,
  topMouseMove:   eventTypes.mouseMove,
  topMouseUp:     eventTypes.mouseUp,
  topPaste:       eventTypes.paste,
  topScroll:      eventTypes.scroll,
  topSubmit:      eventTypes.submit,
  topTouchCancel: eventTypes.touchCancel,
  topTouchEnd:    eventTypes.touchEnd,
  topTouchMove:   eventTypes.touchMove,
  topTouchStart:  eventTypes.touchStart,
  topWheel:       eventTypes.wheel
};

var SimpleEventPlugin = {

  eventTypes: eventTypes,

  /**
   * Same as the default implementation, except cancels the event when return
   * value is false.
   *
   * @param {object} Event to be dispatched.
   * @param {function} Application-level callback.
   * @param {string} domID DOM ID to pass to the callback.
   */
  executeDispatch: function(event, listener, domID) {
    var returnValue = listener(event, domID);
    if (returnValue === false) {
      event.stopPropagation();
      event.preventDefault();
    }
  },

  /**
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {DOMEventTarget} topLevelTarget The listening component root node.
   * @param {string} topLevelTargetID ID of `topLevelTarget`.
   * @param {object} nativeEvent Native browser event.
   * @return {*} An accumulation of synthetic events.
   * @see {EventPluginHub.extractEvents}
   */
  extractEvents: function(
      topLevelType,
      topLevelTarget,
      topLevelTargetID,
      nativeEvent) {
    var dispatchConfig = topLevelEventsToDispatchConfig[topLevelType];
    if (!dispatchConfig) {
      return null;
    }
    var EventConstructor;
    switch(topLevelType) {
      case topLevelTypes.topInput:
      case topLevelTypes.topSubmit:
        // HTML Events
        // @see http://www.w3.org/TR/html5/index.html#events-0
        EventConstructor = SyntheticEvent;
        break;
      case topLevelTypes.topKeyDown:
      case topLevelTypes.topKeyPress:
      case topLevelTypes.topKeyUp:
        EventConstructor = SyntheticKeyboardEvent;
        break;
      case topLevelTypes.topBlur:
      case topLevelTypes.topFocus:
        EventConstructor = SyntheticFocusEvent;
        break;
      case topLevelTypes.topClick:
        // Firefox creates a click event on right mouse clicks. This removes the
        // unwanted click events.
        if (nativeEvent.button === 2) {
          return null;
        }
        /* falls through */
      case topLevelTypes.topContextMenu:
      case topLevelTypes.topDoubleClick:
      case topLevelTypes.topDrag:
      case topLevelTypes.topDragEnd:
      case topLevelTypes.topDragEnter:
      case topLevelTypes.topDragExit:
      case topLevelTypes.topDragLeave:
      case topLevelTypes.topDragOver:
      case topLevelTypes.topDragStart:
      case topLevelTypes.topDrop:
      case topLevelTypes.topMouseDown:
      case topLevelTypes.topMouseMove:
      case topLevelTypes.topMouseUp:
        EventConstructor = SyntheticMouseEvent;
        break;
      case topLevelTypes.topTouchCancel:
      case topLevelTypes.topTouchEnd:
      case topLevelTypes.topTouchMove:
      case topLevelTypes.topTouchStart:
        EventConstructor = SyntheticTouchEvent;
        break;
      case topLevelTypes.topScroll:
        EventConstructor = SyntheticUIEvent;
        break;
      case topLevelTypes.topWheel:
        EventConstructor = SyntheticWheelEvent;
        break;
      case topLevelTypes.topCopy:
      case topLevelTypes.topCut:
      case topLevelTypes.topPaste:
        EventConstructor = SyntheticClipboardEvent;
        break;
    }
    ("production" !== process.env.NODE_ENV ? invariant(
      EventConstructor,
      'SimpleEventPlugin: Unhandled event type, `%s`.',
      topLevelType
    ) : invariant(EventConstructor));
    var event = EventConstructor.getPooled(
      dispatchConfig,
      topLevelTargetID,
      nativeEvent
    );
    EventPropagators.accumulateTwoPhaseDispatches(event);
    return event;
  }

};

module.exports = SimpleEventPlugin;

},{"./EventConstants":62,"./EventPropagators":67,"./SyntheticClipboardEvent":121,"./SyntheticEvent":123,"./SyntheticFocusEvent":124,"./SyntheticKeyboardEvent":125,"./SyntheticMouseEvent":126,"./SyntheticTouchEvent":127,"./SyntheticUIEvent":128,"./SyntheticWheelEvent":129,"./invariant":156,"./keyOf":163,"__browserify_process":35}],121:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule SyntheticClipboardEvent
 * @typechecks static-only
 */

"use strict";

var SyntheticEvent = require("./SyntheticEvent");

/**
 * @interface Event
 * @see http://www.w3.org/TR/clipboard-apis/
 */
var ClipboardEventInterface = {
  clipboardData: null
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticClipboardEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  SyntheticEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}

SyntheticEvent.augmentClass(SyntheticClipboardEvent, ClipboardEventInterface);

module.exports = SyntheticClipboardEvent;


},{"./SyntheticEvent":123}],122:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule SyntheticCompositionEvent
 * @typechecks static-only
 */

"use strict";

var SyntheticEvent = require("./SyntheticEvent");

/**
 * @interface Event
 * @see http://www.w3.org/TR/DOM-Level-3-Events/#events-compositionevents
 */
var CompositionEventInterface = {
  data: null
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticCompositionEvent(
  dispatchConfig,
  dispatchMarker,
  nativeEvent) {
  SyntheticEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}

SyntheticEvent.augmentClass(
  SyntheticCompositionEvent,
  CompositionEventInterface
);

module.exports = SyntheticCompositionEvent;


},{"./SyntheticEvent":123}],123:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule SyntheticEvent
 * @typechecks static-only
 */

"use strict";

var PooledClass = require("./PooledClass");

var emptyFunction = require("./emptyFunction");
var getEventTarget = require("./getEventTarget");
var merge = require("./merge");
var mergeInto = require("./mergeInto");

/**
 * @interface Event
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var EventInterface = {
  type: null,
  target: getEventTarget,
  currentTarget: null,
  eventPhase: null,
  bubbles: null,
  cancelable: null,
  timeStamp: function(event) {
    return event.timeStamp || Date.now();
  },
  defaultPrevented: null,
  isTrusted: null
};

/**
 * Synthetic events are dispatched by event plugins, typically in response to a
 * top-level event delegation handler.
 *
 * These systems should generally use pooling to reduce the frequency of garbage
 * collection. The system should check `isPersistent` to determine whether the
 * event should be released into the pool after being dispatched. Users that
 * need a persisted event should invoke `persist`.
 *
 * Synthetic events (and subclasses) implement the DOM Level 3 Events API by
 * normalizing browser quirks. Subclasses do not necessarily have to implement a
 * DOM interface; custom application-specific events can also subclass this.
 *
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 */
function SyntheticEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  this.dispatchConfig = dispatchConfig;
  this.dispatchMarker = dispatchMarker;
  this.nativeEvent = nativeEvent;

  var Interface = this.constructor.Interface;
  for (var propName in Interface) {
    if (!Interface.hasOwnProperty(propName)) {
      continue;
    }
    var normalize = Interface[propName];
    if (normalize) {
      this[propName] = normalize(nativeEvent);
    } else {
      this[propName] = nativeEvent[propName];
    }
  }

  var defaultPrevented = nativeEvent.defaultPrevented != null ?
    nativeEvent.defaultPrevented :
    nativeEvent.returnValue === false;
  if (defaultPrevented) {
    this.isDefaultPrevented = emptyFunction.thatReturnsTrue;
  } else {
    this.isDefaultPrevented = emptyFunction.thatReturnsFalse;
  }
  this.isPropagationStopped = emptyFunction.thatReturnsFalse;
}

mergeInto(SyntheticEvent.prototype, {

  preventDefault: function() {
    this.defaultPrevented = true;
    var event = this.nativeEvent;
    event.preventDefault ? event.preventDefault() : event.returnValue = false;
    this.isDefaultPrevented = emptyFunction.thatReturnsTrue;
  },

  stopPropagation: function() {
    var event = this.nativeEvent;
    event.stopPropagation ? event.stopPropagation() : event.cancelBubble = true;
    this.isPropagationStopped = emptyFunction.thatReturnsTrue;
  },

  /**
   * We release all dispatched `SyntheticEvent`s after each event loop, adding
   * them back into the pool. This allows a way to hold onto a reference that
   * won't be added back into the pool.
   */
  persist: function() {
    this.isPersistent = emptyFunction.thatReturnsTrue;
  },

  /**
   * Checks if this event should be released back into the pool.
   *
   * @return {boolean} True if this should not be released, false otherwise.
   */
  isPersistent: emptyFunction.thatReturnsFalse,

  /**
   * `PooledClass` looks for `destructor` on each instance it releases.
   */
  destructor: function() {
    var Interface = this.constructor.Interface;
    for (var propName in Interface) {
      this[propName] = null;
    }
    this.dispatchConfig = null;
    this.dispatchMarker = null;
    this.nativeEvent = null;
  }

});

SyntheticEvent.Interface = EventInterface;

/**
 * Helper to reduce boilerplate when creating subclasses.
 *
 * @param {function} Class
 * @param {?object} Interface
 */
SyntheticEvent.augmentClass = function(Class, Interface) {
  var Super = this;

  var prototype = Object.create(Super.prototype);
  mergeInto(prototype, Class.prototype);
  Class.prototype = prototype;
  Class.prototype.constructor = Class;

  Class.Interface = merge(Super.Interface, Interface);
  Class.augmentClass = Super.augmentClass;

  PooledClass.addPoolingTo(Class, PooledClass.threeArgumentPooler);
};

PooledClass.addPoolingTo(SyntheticEvent, PooledClass.threeArgumentPooler);

module.exports = SyntheticEvent;

},{"./PooledClass":72,"./emptyFunction":141,"./getEventTarget":149,"./merge":165,"./mergeInto":167}],124:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule SyntheticFocusEvent
 * @typechecks static-only
 */

"use strict";

var SyntheticUIEvent = require("./SyntheticUIEvent");

/**
 * @interface FocusEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var FocusEventInterface = {
  relatedTarget: null
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticFocusEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  SyntheticUIEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}

SyntheticUIEvent.augmentClass(SyntheticFocusEvent, FocusEventInterface);

module.exports = SyntheticFocusEvent;

},{"./SyntheticUIEvent":128}],125:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule SyntheticKeyboardEvent
 * @typechecks static-only
 */

"use strict";

var SyntheticUIEvent = require("./SyntheticUIEvent");

/**
 * @interface KeyboardEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var KeyboardEventInterface = {
  'char': null,
  key: null,
  location: null,
  ctrlKey: null,
  shiftKey: null,
  altKey: null,
  metaKey: null,
  repeat: null,
  locale: null,
  // Legacy Interface
  charCode: null,
  keyCode: null,
  which: null
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticKeyboardEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  SyntheticUIEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}

SyntheticUIEvent.augmentClass(SyntheticKeyboardEvent, KeyboardEventInterface);

module.exports = SyntheticKeyboardEvent;

},{"./SyntheticUIEvent":128}],126:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule SyntheticMouseEvent
 * @typechecks static-only
 */

"use strict";

var SyntheticUIEvent = require("./SyntheticUIEvent");
var ViewportMetrics = require("./ViewportMetrics");

/**
 * @interface MouseEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var MouseEventInterface = {
  screenX: null,
  screenY: null,
  clientX: null,
  clientY: null,
  ctrlKey: null,
  shiftKey: null,
  altKey: null,
  metaKey: null,
  button: function(event) {
    // Webkit, Firefox, IE9+
    // which:  1 2 3
    // button: 0 1 2 (standard)
    var button = event.button;
    if ('which' in event) {
      return button;
    }
    // IE<9
    // which:  undefined
    // button: 0 0 0
    // button: 1 4 2 (onmouseup)
    return button === 2 ? 2 : button === 4 ? 1 : 0;
  },
  buttons: null,
  relatedTarget: function(event) {
    return event.relatedTarget || (
      event.fromElement === event.srcElement ?
        event.toElement :
        event.fromElement
    );
  },
  // "Proprietary" Interface.
  pageX: function(event) {
    return 'pageX' in event ?
      event.pageX :
      event.clientX + ViewportMetrics.currentScrollLeft;
  },
  pageY: function(event) {
    return 'pageY' in event ?
      event.pageY :
      event.clientY + ViewportMetrics.currentScrollTop;
  }
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticMouseEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  SyntheticUIEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}

SyntheticUIEvent.augmentClass(SyntheticMouseEvent, MouseEventInterface);

module.exports = SyntheticMouseEvent;

},{"./SyntheticUIEvent":128,"./ViewportMetrics":131}],127:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule SyntheticTouchEvent
 * @typechecks static-only
 */

"use strict";

var SyntheticUIEvent = require("./SyntheticUIEvent");

/**
 * @interface TouchEvent
 * @see http://www.w3.org/TR/touch-events/
 */
var TouchEventInterface = {
  touches: null,
  targetTouches: null,
  changedTouches: null,
  altKey: null,
  metaKey: null,
  ctrlKey: null,
  shiftKey: null
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticTouchEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  SyntheticUIEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}

SyntheticUIEvent.augmentClass(SyntheticTouchEvent, TouchEventInterface);

module.exports = SyntheticTouchEvent;

},{"./SyntheticUIEvent":128}],128:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule SyntheticUIEvent
 * @typechecks static-only
 */

"use strict";

var SyntheticEvent = require("./SyntheticEvent");

/**
 * @interface UIEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var UIEventInterface = {
  view: null,
  detail: null
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticEvent}
 */
function SyntheticUIEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  SyntheticEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}

SyntheticEvent.augmentClass(SyntheticUIEvent, UIEventInterface);

module.exports = SyntheticUIEvent;

},{"./SyntheticEvent":123}],129:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule SyntheticWheelEvent
 * @typechecks static-only
 */

"use strict";

var SyntheticMouseEvent = require("./SyntheticMouseEvent");

/**
 * @interface WheelEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var WheelEventInterface = {
  deltaX: function(event) {
    // NOTE: IE<9 does not support x-axis delta.
    return (
      'deltaX' in event ? event.deltaX :
      // Fallback to `wheelDeltaX` for Webkit and normalize (right is positive).
      'wheelDeltaX' in event ? -event.wheelDeltaX : 0
    );
  },
  deltaY: function(event) {
    return (
      // Normalize (up is positive).
      'deltaY' in event ? -event.deltaY :
      // Fallback to `wheelDeltaY` for Webkit.
      'wheelDeltaY' in event ? event.wheelDeltaY :
      // Fallback to `wheelDelta` for IE<9.
      'wheelDelta' in event ? event.wheelDelta : 0
    );
  },
  deltaZ: null,
  deltaMode: null
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticMouseEvent}
 */
function SyntheticWheelEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  SyntheticMouseEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}

SyntheticMouseEvent.augmentClass(SyntheticWheelEvent, WheelEventInterface);

module.exports = SyntheticWheelEvent;

},{"./SyntheticMouseEvent":126}],130:[function(require,module,exports){
var process=require("__browserify_process");/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule Transaction
 */

"use strict";

var invariant = require("./invariant");

/**
 * `Transaction` creates a black box that is able to wrap any method such that
 * certain invariants are maintained before and after the method is invoked
 * (Even if an exception is thrown while invoking the wrapped method). Whoever
 * instantiates a transaction can provide enforcers of the invariants at
 * creation time. The `Transaction` class itself will supply one additional
 * automatic invariant for you - the invariant that any transaction instance
 * should not be ran while it is already being ran. You would typically create a
 * single instance of a `Transaction` for reuse multiple times, that potentially
 * is used to wrap several different methods. Wrappers are extremely simple -
 * they only require implementing two methods.
 *
 * <pre>
 *                       wrappers (injected at creation time)
 *                                      +        +
 *                                      |        |
 *                    +-----------------|--------|--------------+
 *                    |                 v        |              |
 *                    |      +---------------+   |              |
 *                    |   +--|    wrapper1   |---|----+         |
 *                    |   |  +---------------+   v    |         |
 *                    |   |          +-------------+  |         |
 *                    |   |     +----|   wrapper2  |--------+   |
 *                    |   |     |    +-------------+  |     |   |
 *                    |   |     |                     |     |   |
 *                    |   v     v                     v     v   | wrapper
 *                    | +---+ +---+   +---------+   +---+ +---+ | invariants
 * perform(anyMethod) | |   | |   |   |         |   |   | |   | | maintained
 * +----------------->|-|---|-|---|-->|anyMethod|---|---|-|---|-|-------->
 *                    | |   | |   |   |         |   |   | |   | |
 *                    | |   | |   |   |         |   |   | |   | |
 *                    | |   | |   |   |         |   |   | |   | |
 *                    | +---+ +---+   +---------+   +---+ +---+ |
 *                    |  initialize                    close    |
 *                    +-----------------------------------------+
 * </pre>
 *
 * Bonus:
 * - Reports timing metrics by method name and wrapper index.
 *
 * Use cases:
 * - Preserving the input selection ranges before/after reconciliation.
 *   Restoring selection even in the event of an unexpected error.
 * - Deactivating events while rearranging the DOM, preventing blurs/focuses,
 *   while guaranteeing that afterwards, the event system is reactivated.
 * - Flushing a queue of collected DOM mutations to the main UI thread after a
 *   reconciliation takes place in a worker thread.
 * - Invoking any collected `componentDidRender` callbacks after rendering new
 *   content.
 * - (Future use case): Wrapping particular flushes of the `ReactWorker` queue
 *   to preserve the `scrollTop` (an automatic scroll aware DOM).
 * - (Future use case): Layout calculations before and after DOM upates.
 *
 * Transactional plugin API:
 * - A module that has an `initialize` method that returns any precomputation.
 * - and a `close` method that accepts the precomputation. `close` is invoked
 *   when the wrapped process is completed, or has failed.
 *
 * @param {Array<TransactionalWrapper>} transactionWrapper Wrapper modules
 * that implement `initialize` and `close`.
 * @return {Transaction} Single transaction for reuse in thread.
 *
 * @class Transaction
 */
var Mixin = {
  /**
   * Sets up this instance so that it is prepared for collecting metrics. Does
   * so such that this setup method may be used on an instance that is already
   * initialized, in a way that does not consume additional memory upon reuse.
   * That can be useful if you decide to make your subclass of this mixin a
   * "PooledClass".
   */
  reinitializeTransaction: function() {
    this.transactionWrappers = this.getTransactionWrappers();
    if (!this.wrapperInitData) {
      this.wrapperInitData = [];
    } else {
      this.wrapperInitData.length = 0;
    }
    if (!this.timingMetrics) {
      this.timingMetrics = {};
    }
    this.timingMetrics.methodInvocationTime = 0;
    if (!this.timingMetrics.wrapperInitTimes) {
      this.timingMetrics.wrapperInitTimes = [];
    } else {
      this.timingMetrics.wrapperInitTimes.length = 0;
    }
    if (!this.timingMetrics.wrapperCloseTimes) {
      this.timingMetrics.wrapperCloseTimes = [];
    } else {
      this.timingMetrics.wrapperCloseTimes.length = 0;
    }
    this._isInTransaction = false;
  },

  _isInTransaction: false,

  /**
   * @abstract
   * @return {Array<TransactionWrapper>} Array of transaction wrappers.
   */
  getTransactionWrappers: null,

  isInTransaction: function() {
    return !!this._isInTransaction;
  },

  /**
   * Executes the function within a safety window. Use this for the top level
   * methods that result in large amounts of computation/mutations that would
   * need to be safety checked.
   *
   * @param {function} method Member of scope to call.
   * @param {Object} scope Scope to invoke from.
   * @param {Object?=} args... Arguments to pass to the method (optional).
   *                           Helps prevent need to bind in many cases.
   * @return Return value from `method`.
   */
  perform: function(method, scope, a, b, c, d, e, f) {
    ("production" !== process.env.NODE_ENV ? invariant(
      !this.isInTransaction(),
      'Transaction.perform(...): Cannot initialize a transaction when there ' +
      'is already an outstanding transaction.'
    ) : invariant(!this.isInTransaction()));
    var memberStart = Date.now();
    var errorToThrow = null;
    var ret;
    try {
      this.initializeAll();
      ret = method.call(scope, a, b, c, d, e, f);
    } catch (error) {
      // IE8 requires `catch` in order to use `finally`.
      errorToThrow = error;
    } finally {
      var memberEnd = Date.now();
      this.methodInvocationTime += (memberEnd - memberStart);
      try {
        this.closeAll();
      } catch (closeError) {
        // If `method` throws, prefer to show that stack trace over any thrown
        // by invoking `closeAll`.
        errorToThrow = errorToThrow || closeError;
      }
    }
    if (errorToThrow) {
      throw errorToThrow;
    }
    return ret;
  },

  initializeAll: function() {
    this._isInTransaction = true;
    var transactionWrappers = this.transactionWrappers;
    var wrapperInitTimes = this.timingMetrics.wrapperInitTimes;
    var errorToThrow = null;
    for (var i = 0; i < transactionWrappers.length; i++) {
      var initStart = Date.now();
      var wrapper = transactionWrappers[i];
      try {
        this.wrapperInitData[i] = wrapper.initialize ?
          wrapper.initialize.call(this) :
          null;
      } catch (initError) {
        // Prefer to show the stack trace of the first error.
        errorToThrow = errorToThrow || initError;
        this.wrapperInitData[i] = Transaction.OBSERVED_ERROR;
      } finally {
        var curInitTime = wrapperInitTimes[i];
        var initEnd = Date.now();
        wrapperInitTimes[i] = (curInitTime || 0) + (initEnd - initStart);
      }
    }
    if (errorToThrow) {
      throw errorToThrow;
    }
  },

  /**
   * Invokes each of `this.transactionWrappers.close[i]` functions, passing into
   * them the respective return values of `this.transactionWrappers.init[i]`
   * (`close`rs that correspond to initializers that failed will not be
   * invoked).
   */
  closeAll: function() {
    ("production" !== process.env.NODE_ENV ? invariant(
      this.isInTransaction(),
      'Transaction.closeAll(): Cannot close transaction when none are open.'
    ) : invariant(this.isInTransaction()));
    var transactionWrappers = this.transactionWrappers;
    var wrapperCloseTimes = this.timingMetrics.wrapperCloseTimes;
    var errorToThrow = null;
    for (var i = 0; i < transactionWrappers.length; i++) {
      var wrapper = transactionWrappers[i];
      var closeStart = Date.now();
      var initData = this.wrapperInitData[i];
      try {
        if (initData !== Transaction.OBSERVED_ERROR) {
          wrapper.close && wrapper.close.call(this, initData);
        }
      } catch (closeError) {
        // Prefer to show the stack trace of the first error.
        errorToThrow = errorToThrow || closeError;
      } finally {
        var closeEnd = Date.now();
        var curCloseTime = wrapperCloseTimes[i];
        wrapperCloseTimes[i] = (curCloseTime || 0) + (closeEnd - closeStart);
      }
    }
    this.wrapperInitData.length = 0;
    this._isInTransaction = false;
    if (errorToThrow) {
      throw errorToThrow;
    }
  }
};

var Transaction = {

  Mixin: Mixin,

  /**
   * Token to look for to determine if an error occured.
   */
  OBSERVED_ERROR: {}

};

module.exports = Transaction;

},{"./invariant":156,"__browserify_process":35}],131:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ViewportMetrics
 */

"use strict";

var getUnboundedScrollPosition = require("./getUnboundedScrollPosition");

var ViewportMetrics = {

  currentScrollLeft: 0,

  currentScrollTop: 0,

  refreshScrollValues: function() {
    var scrollPosition = getUnboundedScrollPosition(window);
    ViewportMetrics.currentScrollLeft = scrollPosition.x;
    ViewportMetrics.currentScrollTop = scrollPosition.y;
  }

};

module.exports = ViewportMetrics;

},{"./getUnboundedScrollPosition":154}],132:[function(require,module,exports){
var process=require("__browserify_process");/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule accumulate
 */

"use strict";

var invariant = require("./invariant");

/**
 * Accumulates items that must not be null or undefined.
 *
 * This is used to conserve memory by avoiding array allocations.
 *
 * @return {*|array<*>} An accumulation of items.
 */
function accumulate(current, next) {
  ("production" !== process.env.NODE_ENV ? invariant(
    next != null,
    'accumulate(...): Accumulated items must be not be null or undefined.'
  ) : invariant(next != null));
  if (current == null) {
    return next;
  } else {
    // Both are not empty. Warning: Never call x.concat(y) when you are not
    // certain that x is an Array (x could be a string with concat method).
    var currentIsArray = Array.isArray(current);
    var nextIsArray = Array.isArray(next);
    if (currentIsArray) {
      return current.concat(next);
    } else {
      if (nextIsArray) {
        return [current].concat(next);
      } else {
        return [current, next];
      }
    }
  }
}

module.exports = accumulate;

},{"./invariant":156,"__browserify_process":35}],133:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule adler32
 */

/* jslint bitwise:true */

"use strict";

var MOD = 65521;

// This is a clean-room implementation of adler32 designed for detecting
// if markup is not what we expect it to be. It does not need to be
// cryptographically strong, only reasonable good at detecting if markup
// generated on the server is different than that on the client.
function adler32(data) {
  var a = 1;
  var b = 0;
  for (var i = 0; i < data.length; i++) {
    a = (a + data.charCodeAt(i)) % MOD;
    b = (b + a) % MOD;
  }
  return a | (b << 16);
}

module.exports = adler32;

},{}],134:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule containsNode
 * @typechecks
 */

var isTextNode = require("./isTextNode");

/*jslint bitwise:true */

/**
 * Checks if a given DOM node contains or is another DOM node.
 *
 * @param {?DOMNode} outerNode Outer DOM node.
 * @param {?DOMNode} innerNode Inner DOM node.
 * @return {boolean} True if `outerNode` contains or is `innerNode`.
 */
function containsNode(outerNode, innerNode) {
  if (!outerNode || !innerNode) {
    return false;
  } else if (outerNode === innerNode) {
    return true;
  } else if (isTextNode(outerNode)) {
    return false;
  } else if (isTextNode(innerNode)) {
    return containsNode(outerNode, innerNode.parentNode);
  } else if (outerNode.contains) {
    return outerNode.contains(innerNode);
  } else if (outerNode.compareDocumentPosition) {
    return !!(outerNode.compareDocumentPosition(innerNode) & 16);
  } else {
    return false;
  }
}

module.exports = containsNode;

},{"./isTextNode":160}],135:[function(require,module,exports){
var process=require("__browserify_process");/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule copyProperties
 */

/**
 * Copy properties from one or more objects (up to 5) into the first object.
 * This is a shallow copy. It mutates the first object and also returns it.
 *
 * NOTE: `arguments` has a very significant performance penalty, which is why
 * we don't support unlimited arguments.
 */
function copyProperties(obj, a, b, c, d, e, f) {
  obj = obj || {};

  if ("production" !== process.env.NODE_ENV) {
    if (f) {
      throw new Error('Too many arguments passed to copyProperties');
    }
  }

  var args = [a, b, c, d, e];
  var ii = 0, v;
  while (args[ii]) {
    v = args[ii++];
    for (var k in v) {
      obj[k] = v[k];
    }

    // IE ignores toString in object iteration.. See:
    // webreflection.blogspot.com/2007/07/quick-fix-internet-explorer-and.html
    if (v.hasOwnProperty && v.hasOwnProperty('toString') &&
        (typeof v.toString != 'undefined') && (obj.toString !== v.toString)) {
      obj.toString = v.toString;
    }
  }

  return obj;
}

module.exports = copyProperties;

},{"__browserify_process":35}],136:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule createArrayFrom
 * @typechecks
 */

/**
 * NOTE: if you are a previous user of this function, it has been considered
 * unsafe because it's inconsistent across browsers for some inputs.
 * Instead use `Array.isArray()`.
 *
 * Perform a heuristic test to determine if an object is "array-like".
 *
 *   A monk asked Joshu, a Zen master, "Has a dog Buddha nature?"
 *   Joshu replied: "Mu."
 *
 * This function determines if its argument has "array nature": it returns
 * true if the argument is an actual array, an `arguments' object, or an
 * HTMLCollection (e.g. node.childNodes or node.getElementsByTagName()).
 *
 * @param {*} obj
 * @return {boolean}
 */
function hasArrayNature(obj) {
  return (
    // not null/false
    !!obj &&
    // arrays are objects, NodeLists are functions in Safari
    (typeof obj == 'object' || typeof obj == 'function') &&
    // quacks like an array
    ('length' in obj) &&
    // not window
    !('setInterval' in obj) &&
    // no DOM node should be considered an array-like
    // a 'select' element has 'length' and 'item' properties on IE8
    (typeof obj.nodeType != 'number') &&
    (
      // a real array
      (// HTMLCollection/NodeList
      (Array.isArray(obj) ||
      // arguments
      ('callee' in obj) || 'item' in obj))
    )
  );
}

/**
 * Ensure that the argument is an array by wrapping it in an array if it is not.
 * Creates a copy of the argument if it is already an array.
 *
 * This is mostly useful idiomatically:
 *
 *   var createArrayFrom = require('createArrayFrom');
 *
 *   function takesOneOrMoreThings(things) {
 *     things = createArrayFrom(things);
 *     ...
 *   }
 *
 * This allows you to treat `things' as an array, but accept scalars in the API.
 *
 * This is also good for converting certain pseudo-arrays, like `arguments` or
 * HTMLCollections, into arrays.
 *
 * @param {*} obj
 * @return {array}
 */
function createArrayFrom(obj) {
  if (!hasArrayNature(obj)) {
    return [obj];
  }
  if (obj.item) {
    // IE does not support Array#slice on HTMLCollections
    var l = obj.length, ret = new Array(l);
    while (l--) { ret[l] = obj[l]; }
    return ret;
  }
  return Array.prototype.slice.call(obj);
}

module.exports = createArrayFrom;

},{}],137:[function(require,module,exports){
var process=require("__browserify_process");/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule createNodesFromMarkup
 * @typechecks
 */

/*jslint evil: true, sub: true */

var ExecutionEnvironment = require("./ExecutionEnvironment");

var createArrayFrom = require("./createArrayFrom");
var getMarkupWrap = require("./getMarkupWrap");
var invariant = require("./invariant");

/**
 * Dummy container used to render all markup.
 */
var dummyNode =
  ExecutionEnvironment.canUseDOM ? document.createElement('div') : null;

/**
 * Pattern used by `getNodeName`.
 */
var nodeNamePattern = /^\s*<(\w+)/;

/**
 * Extracts the `nodeName` of the first element in a string of markup.
 *
 * @param {string} markup String of markup.
 * @return {?string} Node name of the supplied markup.
 */
function getNodeName(markup) {
  var nodeNameMatch = markup.match(nodeNamePattern);
  return nodeNameMatch && nodeNameMatch[1].toLowerCase();
}

/**
 * Creates an array containing the nodes rendered from the supplied markup. The
 * optionally supplied `handleScript` function will be invoked once for each
 * <script> element that is rendered. If no `handleScript` function is supplied,
 * an exception is thrown if any <script> elements are rendered.
 *
 * @param {string} markup A string of valid HTML markup.
 * @param {?function} handleScript Invoked once for each rendered <script>.
 * @return {array<DOMElement|DOMTextNode>} An array of rendered nodes.
 */
function createNodesFromMarkup(markup, handleScript) {
  var node = dummyNode;
  ("production" !== process.env.NODE_ENV ? invariant(!!dummyNode, 'createNodesFromMarkup dummy not initialized') : invariant(!!dummyNode));
  var nodeName = getNodeName(markup);

  var wrap = nodeName && getMarkupWrap(nodeName);
  if (wrap) {
    node.innerHTML = wrap[1] + markup + wrap[2];

    var wrapDepth = wrap[0];
    while (wrapDepth--) {
      node = node.lastChild;
    }
  } else {
    node.innerHTML = markup;
  }

  var scripts = node.getElementsByTagName('script');
  if (scripts.length) {
    ("production" !== process.env.NODE_ENV ? invariant(
      handleScript,
      'createNodesFromMarkup(...): Unexpected <script> element rendered.'
    ) : invariant(handleScript));
    createArrayFrom(scripts).forEach(handleScript);
  }

  var nodes = createArrayFrom(node.childNodes);
  while (node.lastChild) {
    node.removeChild(node.lastChild);
  }
  return nodes;
}

module.exports = createNodesFromMarkup;

},{"./ExecutionEnvironment":68,"./createArrayFrom":136,"./getMarkupWrap":150,"./invariant":156,"__browserify_process":35}],138:[function(require,module,exports){
var process=require("__browserify_process");/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule createObjectFrom
 */

/**
 * Construct an object from an array of keys
 * and optionally specified value or list of values.
 *
 *  >>> createObjectFrom(['a','b','c']);
 *  {a: true, b: true, c: true}
 *
 *  >>> createObjectFrom(['a','b','c'], false);
 *  {a: false, b: false, c: false}
 *
 *  >>> createObjectFrom(['a','b','c'], 'monkey');
 *  {c:'monkey', b:'monkey' c:'monkey'}
 *
 *  >>> createObjectFrom(['a','b','c'], [1,2,3]);
 *  {a: 1, b: 2, c: 3}
 *
 *  >>> createObjectFrom(['women', 'men'], [true, false]);
 *  {women: true, men: false}
 *
 * @param   Array   list of keys
 * @param   mixed   optional value or value array.  defaults true.
 * @returns object
 */
function createObjectFrom(keys, values /* = true */) {
  if ("production" !== process.env.NODE_ENV) {
    if (!Array.isArray(keys)) {
      throw new TypeError('Must pass an array of keys.');
    }
  }

  var object = {};
  var isArray = Array.isArray(values);
  if (typeof values == 'undefined') {
    values = true;
  }

  for (var ii = keys.length; ii--;) {
    object[keys[ii]] = isArray ? values[ii] : values;
  }
  return object;
}

module.exports = createObjectFrom;

},{"__browserify_process":35}],139:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule cx
 */

/**
 * This function is used to mark string literals representing CSS class names
 * so that they can be transformed statically. This allows for modularization
 * and minification of CSS class names.
 *
 * In static_upstream, this function is actually implemented, but it should
 * eventually be replaced with something more descriptive, and the transform
 * that is used in the main stack should be ported for use elsewhere.
 *
 * @param string|object className to modularize, or an object of key/values.
 *                      In the object case, the values are conditions that
 *                      determine if the className keys should be included.
 * @param [string ...]  Variable list of classNames in the string case.
 * @return string       Renderable space-separated CSS className.
 */
function cx(classNames) {
  if (typeof classNames == 'object') {
    return Object.keys(classNames).map(function(className) {
      return classNames[className] ? className : '';
    }).join(' ');
  } else {
    return Array.prototype.join.call(arguments, ' ');
  }
}

module.exports = cx;

},{}],140:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule dangerousStyleValue
 * @typechecks static-only
 */

"use strict";

var CSSProperty = require("./CSSProperty");

/**
 * Convert a value into the proper css writable value. The `styleName` name
 * name should be logical (no hyphens), as specified
 * in `CSSProperty.isUnitlessNumber`.
 *
 * @param {string} styleName CSS property name such as `topMargin`.
 * @param {*} value CSS property value such as `10px`.
 * @return {string} Normalized style value with dimensions applied.
 */
function dangerousStyleValue(styleName, value) {
  // Note that we've removed escapeTextForBrowser() calls here since the
  // whole string will be escaped when the attribute is injected into
  // the markup. If you provide unsafe user data here they can inject
  // arbitrary CSS which may be problematic (I couldn't repro this):
  // https://www.owasp.org/index.php/XSS_Filter_Evasion_Cheat_Sheet
  // http://www.thespanner.co.uk/2007/11/26/ultimate-xss-css-injection/
  // This is not an XSS hole but instead a potential CSS injection issue
  // which has lead to a greater discussion about how we're going to
  // trust URLs moving forward. See #2115901

  var isEmpty = value == null || typeof value === 'boolean' || value === '';
  if (isEmpty) {
    return '';
  }

  var isNonNumeric = isNaN(value);
  if (isNonNumeric || value === 0 || CSSProperty.isUnitlessNumber[styleName]) {
    return '' + value; // cast to string
  }

  return value + 'px';
}

module.exports = dangerousStyleValue;

},{"./CSSProperty":50}],141:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule emptyFunction
 */

var copyProperties = require("./copyProperties");

function makeEmptyFunction(arg) {
  return function() {
    return arg;
  };
}

/**
 * This function accepts and discards inputs; it has no side effects. This is
 * primarily useful idiomatically for overridable function endpoints which
 * always need to be callable, since JS lacks a null-call idiom ala Cocoa.
 */
function emptyFunction() {}

copyProperties(emptyFunction, {
  thatReturns: makeEmptyFunction,
  thatReturnsFalse: makeEmptyFunction(false),
  thatReturnsTrue: makeEmptyFunction(true),
  thatReturnsNull: makeEmptyFunction(null),
  thatReturnsThis: function() { return this; },
  thatReturnsArgument: function(arg) { return arg; }
});

module.exports = emptyFunction;

},{"./copyProperties":135}],142:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule escapeTextForBrowser
 * @typechecks static-only
 */

"use strict";

var ESCAPE_LOOKUP = {
  "&": "&amp;",
  ">": "&gt;",
  "<": "&lt;",
  "\"": "&quot;",
  "'": "&#x27;",
  "/": "&#x2f;"
};

var ESCAPE_REGEX = /[&><"'\/]/g;

function escaper(match) {
  return ESCAPE_LOOKUP[match];
}

/**
 * Escapes text to prevent scripting attacks.
 *
 * @param {*} text Text value to escape.
 * @return {string} An escaped string.
 */
function escapeTextForBrowser(text) {
  return ('' + text).replace(ESCAPE_REGEX, escaper);
}

module.exports = escapeTextForBrowser;

},{}],143:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ex
 * @typechecks
 * @nostacktrace
 */

/**
 * This function transforms error message with arguments into plain text error
 * message, so that it can be passed to window.onerror without losing anything.
 * It can then be transformed back by `erx()` function.
 *
 * Usage:
 *   throw new Error(ex('Error %s from %s', errorCode, userID));
 *
 * @param {string} errorMessage
 */

var ex = function(errorMessage/*, arg1, arg2, ...*/) {
  var args = Array.prototype.slice.call(arguments).map(function(arg) {
    return String(arg);
  });
  var expectedLength = errorMessage.split('%s').length - 1;

  if (expectedLength !== args.length - 1) {
    // something wrong with the formatting string
    return ex('ex args number mismatch: %s', JSON.stringify(args));
  }

  return ex._prefix + JSON.stringify(args) + ex._suffix;
};

ex._prefix = '<![EX[';
ex._suffix = ']]>';

module.exports = ex;

},{}],144:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule filterAttributes
 * @typechecks static-only
 */

/*jslint evil: true */

'use strict';

/**
 * Like filter(), but for a DOM nodes attributes. Returns an array of
 * the filter DOMAttribute objects. Does some perf related this like
 * caching attributes.length.
 *
 * @param {DOMElement} node Node whose attributes you want to filter
 * @return {array} array of DOM attribute objects.
 */
function filterAttributes(node, func, context) {
  var attributes = node.attributes;
  var numAttributes = attributes.length;
  var accumulator = [];
  for (var i = 0; i < numAttributes; i++) {
    var attr = attributes.item(i);
    if (func.call(context, attr)) {
      accumulator.push(attr);
    }
  }
  return accumulator;
}

module.exports = filterAttributes;

},{}],145:[function(require,module,exports){
var process=require("__browserify_process");/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule flattenChildren
 */

"use strict";

var invariant = require("./invariant");
var traverseAllChildren = require("./traverseAllChildren");

/**
 * @param {function} traverseContext Context passed through traversal.
 * @param {?ReactComponent} child React child component.
 * @param {!string} name String name of key path to child.
 */
function flattenSingleChildIntoContext(traverseContext, child, name) {
  // We found a component instance.
  var result = traverseContext;
  ("production" !== process.env.NODE_ENV ? invariant(
    !result.hasOwnProperty(name),
    'flattenChildren(...): Encountered two children with the same key, `%s`. ' +
    'Children keys must be unique.',
    name
  ) : invariant(!result.hasOwnProperty(name)));
  result[name] = child;
}

/**
 * Flattens children that are typically specified as `props.children`.
 * @return {!object} flattened children keyed by name.
 */
function flattenChildren(children) {
  if (children == null) {
    return children;
  }
  var result = {};
  traverseAllChildren(children, flattenSingleChildIntoContext, result);
  return result;
}

module.exports = flattenChildren;

},{"./invariant":156,"./traverseAllChildren":174,"__browserify_process":35}],146:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule forEachAccumulated
 */

"use strict";

/**
 * @param {array} an "accumulation" of items which is either an Array or
 * a single item. Useful when paired with the `accumulate` module. This is a
 * simple utility that allows us to reason about a collection of items, but
 * handling the case when there is exactly one item (and we do not need to
 * allocate an array).
 */
var forEachAccumulated = function(arr, cb, scope) {
  if (Array.isArray(arr)) {
    arr.forEach(cb, scope);
  } else if (arr) {
    cb.call(scope, arr);
  }
};

module.exports = forEachAccumulated;

},{}],147:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ge
 */

/**
 * Find a node by ID.  Optionally search a sub-tree outside of the document
 *
 * Use ge if you're not sure whether or not the element exists. You can test
 * for existence yourself in your application code.
 *
 * If your application code depends on the existence of the element, use $
 * instead, which will throw in DEV if the element doesn't exist.
 */
function ge(arg, root, tag) {
  return typeof arg != 'string' ? arg :
    !root ? document.getElementById(arg) :
    _geFromSubtree(arg, root, tag);
}

function _geFromSubtree(id, root, tag) {
  var elem, children, ii;

  if (_getNodeID(root) == id) {
    return root;
  } else if (root.getElementsByTagName) {
    // All Elements implement this, which does an iterative DFS, which is
    // faster than recursion and doesn't run into stack depth issues.
    children = root.getElementsByTagName(tag || '*');
    for (ii = 0; ii < children.length; ii++) {
      if (_getNodeID(children[ii]) == id) {
        return children[ii];
      }
    }
  } else {
    // DocumentFragment does not implement getElementsByTagName, so
    // recurse over its children. Its children must be Elements, so
    // each child will use the getElementsByTagName case instead.
    children = root.childNodes;
    for (ii = 0; ii < children.length; ii++) {
      elem = _geFromSubtree(id, children[ii]);
      if (elem) {
        return elem;
      }
    }
  }

  return null;
}

/**
 * Return the ID value for a given node. This allows us to avoid issues
 * with forms that contain inputs with name="id".
 *
 * @return string (null if attribute not set)
 */
function _getNodeID(node) {
  // #document and #document-fragment do not have getAttributeNode.
  var id = node.getAttributeNode && node.getAttributeNode('id');
  return id ? id.value : null;
}

module.exports = ge;

},{}],148:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule getActiveElement
 * @typechecks
 */

/**
 * Same as document.activeElement but wraps in a try-catch block. In IE it is
 * not safe to call document.activeElement if there is nothing focused.
 */
function getActiveElement() /*?DOMElement*/ {
  try {
    return document.activeElement;
  } catch (e) {
    return null;
  }
}

module.exports = getActiveElement;


},{}],149:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule getEventTarget
 * @typechecks static-only
 */

"use strict";

/**
 * Gets the target node from a native browser event by accounting for
 * inconsistencies in browser DOM APIs.
 *
 * @param {object} nativeEvent Native browser event.
 * @return {DOMEventTarget} Target node.
 */
function getEventTarget(nativeEvent) {
  var target = nativeEvent.target || nativeEvent.srcElement || window;
  // Safari may fire events on text nodes (Node.TEXT_NODE is 3).
  // @see http://www.quirksmode.org/js/events_properties.html
  return target.nodeType === 3 ? target.parentNode : target;
}

module.exports = getEventTarget;

},{}],150:[function(require,module,exports){
var process=require("__browserify_process");/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule getMarkupWrap
 */

var ExecutionEnvironment = require("./ExecutionEnvironment");

var invariant = require("./invariant");

/**
 * Dummy container used to detect which wraps are necessary.
 */
var dummyNode =
  ExecutionEnvironment.canUseDOM ? document.createElement('div') : null;

/**
 * Some browsers cannot use `innerHTML` to render certain elements standalone,
 * so we wrap them, render the wrapped nodes, then extract the desired node.
 *
 * In IE8, certain elements cannot render alone, so wrap all elements ('*').
 */
var shouldWrap = {
  // Force wrapping for SVG elements because if they get created inside a <div>,
  // they will be initialized in the wrong namespace (and will not display).
  'circle': true,
  'g': true,
  'line': true,
  'path': true,
  'polyline': true,
  'rect': true,
  'text': true
};

var selectWrap = [1, '<select multiple="true">', '</select>'];
var tableWrap = [1, '<table>', '</table>'];
var trWrap = [3, '<table><tbody><tr>', '</tr></tbody></table>'];

var svgWrap = [1, '<svg>', '</svg>'];

var markupWrap = {
  '*': [1, '?<div>', '</div>'],

  'area': [1, '<map>', '</map>'],
  'col': [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  'legend': [1, '<fieldset>', '</fieldset>'],
  'param': [1, '<object>', '</object>'],
  'tr': [2, '<table><tbody>', '</tbody></table>'],

  'optgroup': selectWrap,
  'option': selectWrap,

  'caption': tableWrap,
  'colgroup': tableWrap,
  'tbody': tableWrap,
  'tfoot': tableWrap,
  'thead': tableWrap,

  'td': trWrap,
  'th': trWrap,

  'circle': svgWrap,
  'g': svgWrap,
  'line': svgWrap,
  'path': svgWrap,
  'polyline': svgWrap,
  'rect': svgWrap,
  'text': svgWrap
};

/**
 * Gets the markup wrap configuration for the supplied `nodeName`.
 *
 * NOTE: This lazily detects which wraps are necessary for the current browser.
 *
 * @param {string} nodeName Lowercase `nodeName`.
 * @return {?array} Markup wrap configuration, if applicable.
 */
function getMarkupWrap(nodeName) {
  ("production" !== process.env.NODE_ENV ? invariant(!!dummyNode, 'Markup wrapping node not initialized') : invariant(!!dummyNode));
  if (!markupWrap.hasOwnProperty(nodeName)) {
    nodeName = '*';
  }
  if (!shouldWrap.hasOwnProperty(nodeName)) {
    if (nodeName === '*') {
      dummyNode.innerHTML = '<link />';
    } else {
      dummyNode.innerHTML = '<' + nodeName + '></' + nodeName + '>';
    }
    shouldWrap[nodeName] = !dummyNode.firstChild;
  }
  return shouldWrap[nodeName] ? markupWrap[nodeName] : null;
}


module.exports = getMarkupWrap;

},{"./ExecutionEnvironment":68,"./invariant":156,"__browserify_process":35}],151:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule getNodeForCharacterOffset
 */

"use strict";

/**
 * Given any node return the first leaf node without children.
 *
 * @param {DOMElement|DOMTextNode} node
 * @return {DOMElement|DOMTextNode}
 */
function getLeafNode(node) {
  while (node && node.firstChild) {
    node = node.firstChild;
  }
  return node;
}

/**
 * Get the next sibling within a container. This will walk up the
 * DOM if a node's siblings have been exhausted.
 *
 * @param {DOMElement|DOMTextNode} node
 * @return {?DOMElement|DOMTextNode}
 */
function getSiblingNode(node) {
  while (node) {
    if (node.nextSibling) {
      return node.nextSibling;
    }
    node = node.parentNode;
  }
}

/**
 * Get object describing the nodes which contain characters at offset.
 *
 * @param {DOMElement|DOMTextNode} root
 * @param {number} offset
 * @return {?object}
 */
function getNodeForCharacterOffset(root, offset) {
  var node = getLeafNode(root);
  var nodeStart = 0;
  var nodeEnd = 0;

  while (node) {
    if (node.nodeType == 3) {
      nodeEnd = nodeStart + node.textContent.length;

      if (nodeStart <= offset && nodeEnd >= offset) {
        return {
          node: node,
          offset: offset - nodeStart
        };
      }

      nodeStart = nodeEnd;
    }

    node = getLeafNode(getSiblingNode(node));
  }
}

module.exports = getNodeForCharacterOffset;

},{}],152:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule getReactRootElementInContainer
 */

"use strict";

var DOC_NODE_TYPE = 9;

/**
 * @param {DOMElement|DOMDocument} container DOM element that may contain
 *                                           a React component
 * @return {?*} DOM element that may have the reactRoot ID, or null.
 */
function getReactRootElementInContainer(container) {
  if (!container) {
    return null;
  }

  if (container.nodeType === DOC_NODE_TYPE) {
    return container.documentElement;
  } else {
    return container.firstChild;
  }
}

module.exports = getReactRootElementInContainer;

},{}],153:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule getTextContentAccessor
 */

"use strict";

var ExecutionEnvironment = require("./ExecutionEnvironment");

var contentKey = null;

/**
 * Gets the key used to access text content on a DOM node.
 *
 * @return {?string} Key used to access text content.
 * @internal
 */
function getTextContentAccessor() {
  if (!contentKey && ExecutionEnvironment.canUseDOM) {
    contentKey = 'innerText' in document.createElement('div') ?
      'innerText' :
      'textContent';
  }
  return contentKey;
}

module.exports = getTextContentAccessor;

},{"./ExecutionEnvironment":68}],154:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule getUnboundedScrollPosition
 * @typechecks
 */

"use strict";

/**
 * Gets the scroll position of the supplied element or window.
 *
 * The return values are unbounded, unlike `getScrollPosition`. This means they
 * may be negative or exceed the element boundaries (which is possible using
 * inertial scrolling).
 *
 * @param {DOMWindow|DOMElement} scrollable
 * @return {object} Map with `x` and `y` keys.
 */
function getUnboundedScrollPosition(scrollable) {
  if (scrollable === window) {
    return {
      x: document.documentElement.scrollLeft || document.body.scrollLeft,
      y: document.documentElement.scrollTop  || document.body.scrollTop
    };
  }
  return {
    x: scrollable.scrollLeft,
    y: scrollable.scrollTop
  };
}

module.exports = getUnboundedScrollPosition;

},{}],155:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule hyphenate
 * @typechecks
 */

var _uppercasePattern = /([A-Z])/g;

/**
 * Hyphenates a camelcased string, for example:
 *
 *   > hyphenate('backgroundColor')
 *   < "background-color"
 *
 * @param {string} string
 * @return {string}
 */
function hyphenate(string) {
  return string.replace(_uppercasePattern, '-$1').toLowerCase();
}

module.exports = hyphenate;

},{}],156:[function(require,module,exports){
var process=require("__browserify_process");/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule invariant
 */

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf style format and arguments to provide information about
 * what broke and what you were expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

function invariant(condition) {
  if (!condition) {
    throw new Error('Invariant Violation');
  }
}

module.exports = invariant;

if ("production" !== process.env.NODE_ENV) {
  var invariantDev = function(condition, format, a, b, c, d, e, f) {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }

    if (!condition) {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      throw new Error(
        'Invariant Violation: ' +
        format.replace(/%s/g, function() { return args[argIndex++]; })
      );
    }
  };

  module.exports = invariantDev;
}

},{"__browserify_process":35}],157:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule isEventSupported
 */

"use strict";

var ExecutionEnvironment = require("./ExecutionEnvironment");

var testNode, useHasFeature;
if (ExecutionEnvironment.canUseDOM) {
  testNode = document.createElement('div');
  useHasFeature =
    document.implementation &&
    document.implementation.hasFeature &&
    // `hasFeature` always returns true in Firefox 19+.
    document.implementation.hasFeature('', '') !== true;
}

/**
 * Checks if an event is supported in the current execution environment.
 *
 * NOTE: This will not work correctly for non-generic events such as `change`,
 * `reset`, `load`, `error`, and `select`.
 *
 * Borrows from Modernizr.
 *
 * @param {string} eventNameSuffix Event name, e.g. "click".
 * @param {?boolean} capture Check if the capture phase is supported.
 * @return {boolean} True if the event is supported.
 * @internal
 * @license Modernizr 3.0.0pre (Custom Build) | MIT
 */
function isEventSupported(eventNameSuffix, capture) {
  if (!testNode || (capture && !testNode.addEventListener)) {
    return false;
  }
  var element = document.createElement('div');

  var eventName = 'on' + eventNameSuffix;
  var isSupported = eventName in element;

  if (!isSupported) {
    element.setAttribute(eventName, 'return;');
    isSupported = typeof element[eventName] === 'function';
    if (typeof element[eventName] !== 'undefined') {
      element[eventName] = undefined;
    }
    element.removeAttribute(eventName);
  }

  if (!isSupported && useHasFeature && eventNameSuffix === 'wheel') {
    // This is the only way to test support for the `wheel` event in IE9+.
    isSupported = document.implementation.hasFeature('Events.wheel', '3.0');
  }

  element = null;
  return isSupported;
}

module.exports = isEventSupported;

},{"./ExecutionEnvironment":68}],158:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule isNode
 * @typechecks
 */

/**
 * @param {*} object The object to check.
 * @return {boolean} Whether or not the object is a DOM node.
 */
function isNode(object) {
  return !!(object && (
    typeof Node !== 'undefined' ? object instanceof Node :
      typeof object === 'object' &&
      typeof object.nodeType === 'number' &&
      typeof object.nodeName === 'string'
  ));
}

module.exports = isNode;

},{}],159:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule isTextInputElement
 */

"use strict";

/**
 * @see http://www.whatwg.org/specs/web-apps/current-work/multipage/the-input-element.html#input-type-attr-summary
 */
var supportedInputTypes = {
  'color': true,
  'date': true,
  'datetime': true,
  'datetime-local': true,
  'email': true,
  'month': true,
  'number': true,
  'password': true,
  'range': true,
  'search': true,
  'tel': true,
  'text': true,
  'time': true,
  'url': true,
  'week': true
};

function isTextInputElement(elem) {
  return elem && (
    (elem.nodeName === 'INPUT' && supportedInputTypes[elem.type]) ||
    elem.nodeName === 'TEXTAREA'
  );
}

module.exports = isTextInputElement;

},{}],160:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule isTextNode
 * @typechecks
 */

var isNode = require("./isNode");

/**
 * @param {*} object The object to check.
 * @return {boolean} Whether or not the object is a DOM text node.
 */
function isTextNode(object) {
  return isNode(object) && object.nodeType == 3;
}

module.exports = isTextNode;

},{"./isNode":158}],161:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule joinClasses
 * @typechecks static-only
 */

"use strict";

/**
 * Combines multiple className strings into one.
 * http://jsperf.com/joinclasses-args-vs-array
 *
 * @param {...?string} classes
 * @return {string}
 */
function joinClasses(className/*, ... */) {
  if (!className) {
    className = '';
  }
  var nextClass;
  var argLength = arguments.length;
  if (argLength > 1) {
    for (var ii = 1; ii < argLength; ii++) {
      nextClass = arguments[ii];
      nextClass && (className += ' ' + nextClass);
    }
  }
  return className;
}

module.exports = joinClasses;

},{}],162:[function(require,module,exports){
var process=require("__browserify_process");/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule keyMirror
 * @typechecks static-only
 */

"use strict";

var invariant = require("./invariant");

/**
 * Constructs an enumeration with keys equal to their value.
 *
 * For example:
 *
 *   var COLORS = keyMirror({blue: null, red: null});
 *   var myColor = COLORS.blue;
 *   var isColorValid = !!COLORS[myColor];
 *
 * The last line could not be performed if the values of the generated enum were
 * not equal to their keys.
 *
 *   Input:  {key1: val1, key2: val2}
 *   Output: {key1: key1, key2: key2}
 *
 * @param {object} obj
 * @return {object}
 */
var keyMirror = function(obj) {
  var ret = {};
  var key;
  ("production" !== process.env.NODE_ENV ? invariant(
    obj instanceof Object && !Array.isArray(obj),
    'keyMirror(...): Argument must be an object.'
  ) : invariant(obj instanceof Object && !Array.isArray(obj)));
  for (key in obj) {
    if (!obj.hasOwnProperty(key)) {
      continue;
    }
    ret[key] = key;
  }
  return ret;
};

module.exports = keyMirror;

},{"./invariant":156,"__browserify_process":35}],163:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule keyOf
 */

/**
 * Allows extraction of a minified key. Let's the build system minify keys
 * without loosing the ability to dynamically use key strings as values
 * themselves. Pass in an object with a single key/val pair and it will return
 * you the string key of that single record. Suppose you want to grab the
 * value for a key 'className' inside of an object. Key/val minification may
 * have aliased that key to be 'xa12'. keyOf({className: null}) will return
 * 'xa12' in that case. Resolve keys you want to use once at startup time, then
 * reuse those resolutions.
 */
var keyOf = function(oneKeyObj) {
  var key;
  for (key in oneKeyObj) {
    if (!oneKeyObj.hasOwnProperty(key)) {
      continue;
    }
    return key;
  }
  return null;
};


module.exports = keyOf;

},{}],164:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule memoizeStringOnly
 * @typechecks static-only
 */

"use strict";

/**
 * Memoizes the return value of a function that accepts one string argument.
 *
 * @param {function} callback
 * @return {function}
 */
function memoizeStringOnly(callback) {
  var cache = {};
  return function(string) {
    if (cache.hasOwnProperty(string)) {
      return cache[string];
    } else {
      return cache[string] = callback.call(this, string);
    }
  };
}

module.exports = memoizeStringOnly;

},{}],165:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule merge
 */

"use strict";

var mergeInto = require("./mergeInto");

/**
 * Shallow merges two structures into a return value, without mutating either.
 *
 * @param {?object} one Optional object with properties to merge from.
 * @param {?object} two Optional object with properties to merge from.
 * @return {object} The shallow extension of one by two.
 */
var merge = function(one, two) {
  var result = {};
  mergeInto(result, one);
  mergeInto(result, two);
  return result;
};

module.exports = merge;

},{"./mergeInto":167}],166:[function(require,module,exports){
var process=require("__browserify_process");/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule mergeHelpers
 *
 * requiresPolyfills: Array.isArray
 */

"use strict";

var invariant = require("./invariant");
var keyMirror = require("./keyMirror");

/**
 * Maximum number of levels to traverse. Will catch circular structures.
 * @const
 */
var MAX_MERGE_DEPTH = 36;

/**
 * We won't worry about edge cases like new String('x') or new Boolean(true).
 * Functions are considered terminals, and arrays are not.
 * @param {*} o The item/object/value to test.
 * @return {boolean} true iff the argument is a terminal.
 */
var isTerminal = function(o) {
  return typeof o !== 'object' || o === null;
};

var mergeHelpers = {

  MAX_MERGE_DEPTH: MAX_MERGE_DEPTH,

  isTerminal: isTerminal,

  /**
   * Converts null/undefined values into empty object.
   *
   * @param {?Object=} arg Argument to be normalized (nullable optional)
   * @return {!Object}
   */
  normalizeMergeArg: function(arg) {
    return arg === undefined || arg === null ? {} : arg;
  },

  /**
   * If merging Arrays, a merge strategy *must* be supplied. If not, it is
   * likely the caller's fault. If this function is ever called with anything
   * but `one` and `two` being `Array`s, it is the fault of the merge utilities.
   *
   * @param {*} one Array to merge into.
   * @param {*} two Array to merge from.
   */
  checkMergeArrayArgs: function(one, two) {
    ("production" !== process.env.NODE_ENV ? invariant(
      Array.isArray(one) && Array.isArray(two),
      'Critical assumptions about the merge functions have been violated. ' +
      'This is the fault of the merge functions themselves, not necessarily ' +
      'the callers.'
    ) : invariant(Array.isArray(one) && Array.isArray(two)));
  },

  /**
   * @param {*} one Object to merge into.
   * @param {*} two Object to merge from.
   */
  checkMergeObjectArgs: function(one, two) {
    mergeHelpers.checkMergeObjectArg(one);
    mergeHelpers.checkMergeObjectArg(two);
  },

  /**
   * @param {*} arg
   */
  checkMergeObjectArg: function(arg) {
    ("production" !== process.env.NODE_ENV ? invariant(
      !isTerminal(arg) && !Array.isArray(arg),
      'Critical assumptions about the merge functions have been violated. ' +
      'This is the fault of the merge functions themselves, not necessarily ' +
      'the callers.'
    ) : invariant(!isTerminal(arg) && !Array.isArray(arg)));
  },

  /**
   * Checks that a merge was not given a circular object or an object that had
   * too great of depth.
   *
   * @param {number} Level of recursion to validate against maximum.
   */
  checkMergeLevel: function(level) {
    ("production" !== process.env.NODE_ENV ? invariant(
      level < MAX_MERGE_DEPTH,
      'Maximum deep merge depth exceeded. You may be attempting to merge ' +
      'circular structures in an unsupported way.'
    ) : invariant(level < MAX_MERGE_DEPTH));
  },

  /**
   * Checks that the supplied merge strategy is valid.
   *
   * @param {string} Array merge strategy.
   */
  checkArrayStrategy: function(strategy) {
    ("production" !== process.env.NODE_ENV ? invariant(
      strategy === undefined || strategy in mergeHelpers.ArrayStrategies,
      'You must provide an array strategy to deep merge functions to ' +
      'instruct the deep merge how to resolve merging two arrays.'
    ) : invariant(strategy === undefined || strategy in mergeHelpers.ArrayStrategies));
  },

  /**
   * Set of possible behaviors of merge algorithms when encountering two Arrays
   * that must be merged together.
   * - `clobber`: The left `Array` is ignored.
   * - `indexByIndex`: The result is achieved by recursively deep merging at
   *   each index. (not yet supported.)
   */
  ArrayStrategies: keyMirror({
    Clobber: true,
    IndexByIndex: true
  })

};

module.exports = mergeHelpers;

},{"./invariant":156,"./keyMirror":162,"__browserify_process":35}],167:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule mergeInto
 * @typechecks static-only
 */

"use strict";

var mergeHelpers = require("./mergeHelpers");

var checkMergeObjectArg = mergeHelpers.checkMergeObjectArg;

/**
 * Shallow merges two structures by mutating the first parameter.
 *
 * @param {object} one Object to be merged into.
 * @param {?object} two Optional object with properties to merge from.
 */
function mergeInto(one, two) {
  checkMergeObjectArg(one);
  if (two != null) {
    checkMergeObjectArg(two);
    for (var key in two) {
      if (!two.hasOwnProperty(key)) {
        continue;
      }
      one[key] = two[key];
    }
  }
}

module.exports = mergeInto;

},{"./mergeHelpers":166}],168:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule mixInto
 */

"use strict";

/**
 * Simply copies properties to the prototype.
 */
var mixInto = function(constructor, methodBag) {
  var methodName;
  for (methodName in methodBag) {
    if (!methodBag.hasOwnProperty(methodName)) {
      continue;
    }
    constructor.prototype[methodName] = methodBag[methodName];
  }
};

module.exports = mixInto;

},{}],169:[function(require,module,exports){
var process=require("__browserify_process");/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule mutateHTMLNodeWithMarkup
 * @typechecks static-only
 */

/*jslint evil: true */

'use strict';

var createNodesFromMarkup = require("./createNodesFromMarkup");
var filterAttributes = require("./filterAttributes");
var invariant = require("./invariant");

/**
 * You can't set the innerHTML of a document. Unless you have
 * this function.
 *
 * @param {DOMElement} node with tagName == 'html'
 * @param {string} markup markup string including <html>.
 */
function mutateHTMLNodeWithMarkup(node, markup) {
  ("production" !== process.env.NODE_ENV ? invariant(
    node.tagName.toLowerCase() === 'html',
    'mutateHTMLNodeWithMarkup(): node must have tagName of "html", got %s',
    node.tagName
  ) : invariant(node.tagName.toLowerCase() === 'html'));

  markup = markup.trim();
  ("production" !== process.env.NODE_ENV ? invariant(
    markup.toLowerCase().indexOf('<html') === 0,
    'mutateHTMLNodeWithMarkup(): markup must start with <html'
  ) : invariant(markup.toLowerCase().indexOf('<html') === 0));

  // First let's extract the various pieces of markup.
  var htmlOpenTagEnd = markup.indexOf('>') + 1;
  var htmlCloseTagStart = markup.lastIndexOf('<');
  var htmlOpenTag = markup.substring(0, htmlOpenTagEnd);
  var innerHTML = markup.substring(htmlOpenTagEnd, htmlCloseTagStart);

  // Now for the fun stuff. Pass through both sets of attributes and
  // bring them up-to-date. We get the new set by creating a markup
  // fragment.
  var shouldExtractAttributes = htmlOpenTag.indexOf(' ') > -1;
  var attributeHolder = null;

  if (shouldExtractAttributes) {
    // We extract the attributes by creating a <span> and evaluating
    // the node.
    attributeHolder = createNodesFromMarkup(
      htmlOpenTag.replace('html ', 'span ') + '</span>'
    )[0];

    // Add all attributes present in attributeHolder
    var attributesToSet = filterAttributes(
      attributeHolder,
      function(attr) {
        return node.getAttributeNS(attr.namespaceURI, attr.name) !== attr.value;
      }
    );
    attributesToSet.forEach(function(attr) {
      node.setAttributeNS(attr.namespaceURI, attr.name, attr.value);
    });
  }

  // Remove all attributes not present in attributeHolder
  var attributesToRemove = filterAttributes(
    node,
    function(attr) {
      // Remove all attributes if attributeHolder is null or if it does not have
      // the desired attribute.
      return !(
        attributeHolder &&
          attributeHolder.hasAttributeNS(attr.namespaceURI, attr.name)
      );
    }
  );
  attributesToRemove.forEach(function(attr) {
    node.removeAttributeNS(attr.namespaceURI, attr.name);
  });

  // Finally, set the inner HTML. No tricks needed. Do this last to
  // minimize likelihood of triggering reflows.
  node.innerHTML = innerHTML;
}

module.exports = mutateHTMLNodeWithMarkup;

},{"./createNodesFromMarkup":137,"./filterAttributes":144,"./invariant":156,"__browserify_process":35}],170:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule objMap
 */

"use strict";

/**
 * For each key/value pair, invokes callback func and constructs a resulting
 * object which contains, for every key in obj, values that are the result of
 * of invoking the function:
 *
 *   func(value, key, iteration)
 *
 * @param {?object} obj Object to map keys over
 * @param {function} func Invoked for each key/val pair.
 * @param {?*} context
 * @return {?object} Result of mapping or null if obj is falsey
 */
function objMap(obj, func, context) {
  if (!obj) {
    return null;
  }
  var i = 0;
  var ret = {};
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      ret[key] = func.call(context, obj[key], key, i++);
    }
  }
  return ret;
}

module.exports = objMap;

},{}],171:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule objMapKeyVal
 */

"use strict";

/**
 * Behaves the same as `objMap` but invokes func with the key first, and value
 * second. Use `objMap` unless you need this special case.
 * Invokes func as:
 *
 *   func(key, value, iteration)
 *
 * @param {?object} obj Object to map keys over
 * @param {!function} func Invoked for each key/val pair.
 * @param {?*} context
 * @return {?object} Result of mapping or null if obj is falsey
 */
function objMapKeyVal(obj, func, context) {
  if (!obj) {
    return null;
  }
  var i = 0;
  var ret = {};
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      ret[key] = func.call(context, key, obj[key], i++);
    }
  }
  return ret;
}

module.exports = objMapKeyVal;

},{}],172:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule performanceNow
 * @typechecks static-only
 */

"use strict";

var ExecutionEnvironment = require("./ExecutionEnvironment");

/**
 * Detect if we can use window.performance.now() and gracefully
 * fallback to Date.now() if it doesn't exist.
 * We need to support Firefox < 15 for now due to Facebook's webdriver
 * infrastructure.
 */
var performance = null;

if (ExecutionEnvironment.canUseDOM) {
  performance = window.performance || window.webkitPerformance;
}

if (!performance || !performance.now) {
  performance = Date;
}

var performanceNow = performance.now.bind(performance);

module.exports = performanceNow;

},{"./ExecutionEnvironment":68}],173:[function(require,module,exports){
/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule shallowEqual
 */

"use strict";

/**
 * Performs equality by iterating through keys on an object and returning
 * false when any key has values which are not strictly equal between
 * objA and objB. Returns true when the values of all keys are strictly equal.
 *
 * @return {boolean}
 */
function shallowEqual(objA, objB) {
  if (objA === objB) {
    return true;
  }
  var key;
  // Test for A's keys different from B.
  for (key in objA) {
    if (objA.hasOwnProperty(key) &&
        (!objB.hasOwnProperty(key) || objA[key] !== objB[key])) {
      return false;
    }
  }
  // Test for B'a keys missing from A.
  for (key in objB) {
    if (objB.hasOwnProperty(key) && !objA.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}

module.exports = shallowEqual;

},{}],174:[function(require,module,exports){
var process=require("__browserify_process");/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule traverseAllChildren
 */

"use strict";

var ReactComponent = require("./ReactComponent");
var ReactTextComponent = require("./ReactTextComponent");

var invariant = require("./invariant");

/**
 * TODO: Test that:
 * 1. `mapChildren` transforms strings and numbers into `ReactTextComponent`.
 * 2. it('should fail when supplied duplicate key', function() {
 * 3. That a single child and an array with one item have the same key pattern.
 * });
 */

/**
 * @param {?*} children Children tree container.
 * @param {!string} nameSoFar Name of the key path so far.
 * @param {!number} indexSoFar Number of children encountered until this point.
 * @param {!function} callback Callback to invoke with each child found.
 * @param {?*} traverseContext Used to pass information throughout the traversal
 * process.
 * @return {!number} The number of children in this subtree.
 */
var traverseAllChildrenImpl =
  function(children, nameSoFar, indexSoFar, callback, traverseContext) {
    var subtreeCount = 0;  // Count of children found in the current subtree.
    if (Array.isArray(children)) {
      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        var nextName = nameSoFar + ReactComponent.getKey(child, i);
        var nextIndex = indexSoFar + subtreeCount;
        subtreeCount += traverseAllChildrenImpl(
          child,
          nextName,
          nextIndex,
          callback,
          traverseContext
        );
      }
    } else {
      var type = typeof children;
      var isOnlyChild = nameSoFar === '';
      // If it's the only child, treat the name as if it was wrapped in an array
      // so that it's consistent if the number of children grows
      var storageName = isOnlyChild ?
        ReactComponent.getKey(children, 0):
        nameSoFar;
      if (children === null || children === undefined || type === 'boolean') {
        // All of the above are perceived as null.
        callback(traverseContext, null, storageName, indexSoFar);
        subtreeCount = 1;
      } else if (children.mountComponentIntoNode) {
        callback(traverseContext, children, storageName, indexSoFar);
        subtreeCount = 1;
      } else {
        if (type === 'object') {
          ("production" !== process.env.NODE_ENV ? invariant(
            !children || children.nodeType !== 1,
            'traverseAllChildren(...): Encountered an invalid child; DOM ' +
            'elements are not valid children of React components.'
          ) : invariant(!children || children.nodeType !== 1));
          for (var key in children) {
            if (children.hasOwnProperty(key)) {
              subtreeCount += traverseAllChildrenImpl(
                children[key],
                nameSoFar + '{' + key + '}',
                indexSoFar + subtreeCount,
                callback,
                traverseContext
              );
            }
          }
        } else if (type === 'string') {
          var normalizedText = new ReactTextComponent(children);
          callback(traverseContext, normalizedText, storageName, indexSoFar);
          subtreeCount += 1;
        } else if (type === 'number') {
          var normalizedNumber = new ReactTextComponent('' + children);
          callback(traverseContext, normalizedNumber, storageName, indexSoFar);
          subtreeCount += 1;
        }
      }
    }
    return subtreeCount;
  };

/**
 * Traverses children that are typically specified as `props.children`, but
 * might also be specified through attributes:
 *
 * - `traverseAllChildren(this.props.children, ...)`
 * - `traverseAllChildren(this.props.leftPanelChildren, ...)`
 *
 * The `traverseContext` is an optional argument that is passed through the
 * entire traversal. It can be used to store accumulations or anything else that
 * the callback might find relevant.
 *
 * @param {?*} children Children tree object.
 * @param {!function} callback To invoke upon traversing each child.
 * @param {?*} traverseContext Context for traversal.
 */
function traverseAllChildren(children, callback, traverseContext) {
  if (children !== null && children !== undefined) {
    traverseAllChildrenImpl(children, '', 0, callback, traverseContext);
  }
}

module.exports = traverseAllChildren;

},{"./ReactComponent":75,"./ReactTextComponent":112,"./invariant":156,"__browserify_process":35}],175:[function(require,module,exports){
var process=require("__browserify_process");module.exports = require('./lib/React');
if ('production' !== process.env.NODE_ENV) {
  module.exports = require('./ReactJSErrors').wrap(module.exports);
}

},{"./ReactJSErrors":46,"./lib/React":73,"__browserify_process":35}],176:[function(require,module,exports){
//     Underscore.js 1.5.2
//     http://underscorejs.org
//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.5.2';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, length = obj.length; i < length; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      var keys = _.keys(obj);
      for (var i = 0, length = keys.length; i < length; i++) {
        if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results.push(iterator.call(context, value, index, list));
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    return _.filter(obj, function(value, index, list) {
      return !iterator.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function(value) {
      return value === target;
    });
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs, first) {
    if (_.isEmpty(attrs)) return first ? void 0 : [];
    return _[first ? 'find' : 'filter'](obj, function(value) {
      for (var key in attrs) {
        if (attrs[key] !== value[key]) return false;
      }
      return true;
    });
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.where(obj, attrs, true);
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity, value: -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed > result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity, value: Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array, using the modern version of the 
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // Sample **n** random values from an array.
  // If **n** is not specified, returns a single random element from the array.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (arguments.length < 2 || guard) {
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    return _.isFunction(value) ? value : function(obj){ return obj[value]; };
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, value, context) {
    var iterator = lookupIterator(value);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, value, context) {
      var result = {};
      var iterator = value == null ? _.identity : lookupIterator(value);
      each(obj, function(value, index) {
        var key = iterator.call(context, value, index, obj);
        behavior(result, key, value);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, key, value) {
    (_.has(result, key) ? result[key] : (result[key] = [])).push(value);
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, key, value) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, key) {
    _.has(result, key) ? result[key]++ : result[key] = 1;
  });

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = iterator == null ? _.identity : lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    return (n == null) || guard ? array[0] : slice.call(array, 0, n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n == null) || guard) {
      return array[array.length - 1];
    } else {
      return slice.call(array, Math.max(array.length - n, 0));
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    if (shallow && _.every(input, _.isArray)) {
      return concat.apply(output, input);
    }
    each(input, function(value) {
      if (_.isArray(value) || _.isArguments(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var length = _.max(_.pluck(arguments, "length").concat(0));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, '' + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, length = list.length; i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, length = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < length; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(length);

    while(idx < length) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context.
  _.partial = function(func) {
    var args = slice.call(arguments, 1);
    return function() {
      return func.apply(this, args.concat(slice.call(arguments)));
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) throw new Error("bindAll must be passed function names");
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    options || (options = {});
    var later = function() {
      previous = options.leading === false ? 0 : new Date;
      timeout = null;
      result = func.apply(context, args);
    };
    return function() {
      var now = new Date;
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;
    return function() {
      context = this;
      args = arguments;
      timestamp = new Date();
      var later = function() {
        var last = (new Date()) - timestamp;
        if (last < wait) {
          timeout = setTimeout(later, wait - last);
        } else {
          timeout = null;
          if (!immediate) result = func.apply(context, args);
        }
      };
      var callNow = immediate && !timeout;
      if (!timeout) {
        timeout = setTimeout(later, wait);
      }
      if (callNow) result = func.apply(context, args);
      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func];
      push.apply(args, arguments);
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = new Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = new Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] === void 0) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                             _.isFunction(bCtor) && (bCtor instanceof bCtor))) {
      return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(Math.max(0, n));
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

}).call(this);

},{}]},{},[1])
;
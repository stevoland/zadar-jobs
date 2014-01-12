var React          = require('react/addons');

var CollapsePanel  = require('./bootstrap/CollapsePanel.jsx');
var JobList        = require('./JobList.jsx');


var JobsAccordion = React.createClass({
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
      <CollapsePanel
        headingChildren={headingChildren}
        key={disciplineId}
        bsStyle="default"
        className="z-job-panel"
        isStateful={true}
        isOpen={true}>
          <JobList
            jobs={this.state.trees[disciplineId]}
            checkedIds={this.props.checkedIds}
            onChecked={this.props.onChecked}
            selectedJob={this.props.selectedJob}
            addNewJob={hasNewJob}
            onJobNameChange={this.props.onJobNameChange}
            onNewJobSave={this.props.onNewJobSave}
            onNewJobCancel={this.props.onNewJobCancel}
          />
      </CollapsePanel>
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
      <div className="panel-group">
        {accordions}
      </div>
    );
  }
});

module.exports = JobsAccordion;
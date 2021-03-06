import React, { Component } from "react";
import axios from 'axios';
import { Breadcrumb, Table, Button, Tabs, Tab, Modal } from 'react-bootstrap';
import DataDetailsRow from './data-details-row';
import BootstrapTable from 'react-bootstrap-table-next';

export default class DataDetails extends Component {

  constructor(props) {
    super(props)
    this.state = {
        projectName: this.props.match.params.project_name,
        mapName: this.props.match.params.map_name,
        sha: this.props.match.params.sha,
        dataDetails: [],
        projectDetails: [],
        shaLink: '',
        showConfirmationDialog: false
    };

    this.deleteEntry = this.deleteEntry.bind(this);
    this.closeConfirmationDialog = this.closeConfirmationDialog.bind(this)
    this.showConfirmationDialog = this.showConfirmationDialog.bind( this )
  }

  closeConfirmationDialog() {
    this.setState( {
      showConfirmationDialog: false
    })
  }

  showConfirmationDialog() {
    this.setState( {
        showConfirmationDialog: true
      })
  }

  componentDidMount() {
    axios.get( `/api/data-details/${this.state.projectName}/${this.state.mapName}/${this.state.sha}`)
      .then(res => {
        this.setState({
          dataDetails: res.data.data_details,
          projectDetails: res.data.project,
          shaLink: `${res.data.project.repository}/commit/${res.data.data_details.sha}`
        });
      })
      .catch((error) => {
        console.log(error);
      })
  }

  renderStatsHeader() {
    return [ "map", "date", "sha" ].map((title, index) => {
        return <DataDetailsRow title={title} value={this.state?.dataDetails[ title ]} key={index} />;
      });
  }

  renderStats( data ) {
    const columns = [
      {
        dataField: 'name',
        text: 'Product Name'
      },
      {
        dataField: 'value',
        text: 'Value'
      }
    ];

    let stats = [];

    if ( data ) {
      stats = Object.keys( data ).map( (title, index) => {
        return { name: title, value: data[ title ] };
      } );
    }

    return <BootstrapTable keyField='id' data={ stats } columns={ columns } />
  }

  renderHitches() {
    const hitchesData = this.state.dataDetails.hitches;
    let columns = []
    let data = []

    if ( hitchesData ) {
      columns = Object.keys( hitchesData[ 0 ] ).map( ( title, index ) => {
        return { dataField: title, text: title }
      });

      hitchesData.forEach( element => {
        let obj = {};
        Object.keys( element ).forEach( title => {
          obj[ title ] = element[ title ];
        });
        data.push( obj );
      })

      return <BootstrapTable keyField='id' data={ data } columns={ columns } />
    }
  }

  async deleteEntry() {
    try {
      await axios.delete( `/api/delete-data-entry/${this.state.dataDetails._id}` )
      this.props.history.push( `/project-map/${this.state.projectName}/${this.state.mapName}` );
    }
    catch ( err ) {
      console.log(err)
    }
    finally {
      this.closeConfirmationDialog();
    }
  }

  render() {
    return (<div className="table-wrapper">
        <Breadcrumb>
            <Breadcrumb.Item href={"/project/" + this.state.projectName}>{this.state.projectName}</Breadcrumb.Item>
            <Breadcrumb.Item href={"/project-map/" + this.state.projectName + "/" + this.state.mapName}>{this.state.mapName}</Breadcrumb.Item>
        </Breadcrumb>
        <h1>Data details for commit {this.state.sha}</h1>
        <Button variant="outline-secondary" href={`/reports/${this.state.projectName}_${this.state.mapName}_${this.state.sha}.html`} target="_blank">View Graph Report</Button>
        <Button variant="danger" onClick={this.showConfirmationDialog}>Delete database entry</Button>
        <Table striped bordered hover>
            <tbody>
              <DataDetailsRow title="Project" value={this.state.projectName} key="project" />
              <DataDetailsRow title="Map" value={this.state?.dataDetails.map} key="map" />
              <DataDetailsRow title="Date" value={this.state?.dataDetails.date} key="date" />
              <DataDetailsRow title="SHA" value={this.state?.dataDetails.sha} link={this.state.shaLink} key="sha" />
            </tbody>
        </Table>
        <Tabs defaultActiveKey="stats" id="uncontrolled-tab-example" className="mb-3">
          <Tab eventKey="stats" title="Stats">
            { this.renderStats( this.state.dataDetails.stats ) }
          </Tab>
          <Tab eventKey="metrics" title="Metrics">
            { this.renderStats( this.state.dataDetails.metrics ) }
          </Tab>
          <Tab eventKey="hitches" title="Hitches">
          { this.renderHitches() }
          </Tab>
        </Tabs>
        <Modal 
          show={this.state.showConfirmationDialog} 
          onHide={this.closeConfirmationDialog}
          aria-labelledby="contained-modal-title-vcenter"
          centered
          >
          <Modal.Header closeButton>
            <Modal.Title>Delete Data Item</Modal.Title>
          </Modal.Header>
          <Modal.Body>Are you sure you want to delete this data item?</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.closeConfirmationDialog}>
              No
            </Button>
            <Button variant="primary" onClick={this.deleteEntry}>
              Yes
            </Button>
          </Modal.Footer>
      </Modal>
    </div>);
  }
}
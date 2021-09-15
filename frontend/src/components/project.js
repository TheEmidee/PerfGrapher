import React, { Component } from "react";
import axios from 'axios';
import { Table, Breadcrumb, Button, Modal } from 'react-bootstrap';
import MapTableRow from './map-table-row';

export default class Project extends Component {

  constructor(props) {
    super(props);

    this.state = {
      projectName: this.props.match.params.name,
      maps: [],
      showConfirmationDialog: false
    };

    this.deleteProject = this.deleteProject.bind(this);
    this.closeConfirmationDialog = this.closeConfirmationDialog.bind(this)
    this.showConfirmationDialog = this.showConfirmationDialog.bind( this )  
  }

  componentDidMount() {
    axios.get( `/api/get-maps/${this.state.projectName}` )
      .then(res => {
        this.setState({
          maps: res.data
        });
      })
      .catch((error) => {
        console.log(error);
      })
  }

  DataTable() {
    return this.state.maps.map((res, i) => {
      const mapInfos = {
        project: this.state.projectName,
        map: res
      }
      return <MapTableRow infos={mapInfos} project={this.state.projectName} map_name={res} key={i} />;
    });
  }

  deleteProject() {
    axios.delete('/api/delete-project/' + this.state.projectName)
      .then((res) => {
          this.props.history.push( '/' );
      }).catch((error) => {
          console.log(error)
      })

    this.closeConfirmationDialog();
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

  render() {
    return (<div className="table-wrapper">
      <Breadcrumb>
        <Breadcrumb.Item>{this.state.projectName}</Breadcrumb.Item>
      </Breadcrumb>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Map</th>
          </tr>
        </thead>
        <tbody>
          {this.DataTable()}
        </tbody>
      </Table>
      <Button size="sm" variant="danger" onClick={this.showConfirmationDialog}>Delete Project</Button>
      <Modal 
        show={this.state.showConfirmationDialog} 
        onHide={this.closeConfirmationDialog}
        aria-labelledby="contained-modal-title-vcenter"
        centered
        >
        <Modal.Header closeButton>
          <Modal.Title>Delete Project</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this project and all its data?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.closeConfirmationDialog}>
            No
          </Button>
          <Button variant="primary" onClick={this.deleteProject}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>);
  }
}
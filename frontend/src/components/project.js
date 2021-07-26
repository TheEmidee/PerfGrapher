import React, { Component } from "react";
import axios from 'axios';
import { Table, Breadcrumb, Button } from 'react-bootstrap';
import MapTableRow from './map-table-row';

export default class Project extends Component {

  constructor(props) {
    super(props);

    this.state = {
      projectName: this.props.match.params.name,
      maps: []
    };

    this.deleteProject = this.deleteProject.bind(this);
  }

  componentDidMount() {
    axios.get('http://localhost:4000/projects/get-maps/' + this.state.projectName )
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
    axios.delete('http://localhost:4000/projects/delete-project/' + this.state.projectName)
        .then((res) => {
            console.log('Project successfully deleted!')
        }).catch((error) => {
            console.log(error)
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
      <Button onClick={this.deleteProject} size="sm" variant="danger">Delete Project</Button>
    </div>);
  }
}
import React, { Component } from "react";
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import ProjectTableRow from './project-table-row';

export default class ProjectList extends Component {

  constructor(props) {
    super(props)
    this.state = {
      projects: []
    };
  }

  componentDidMount() {
    axios.get('/projects/')
      .then(res => {
        this.setState({
            projects: res.data
        });
      })
      .catch((error) => {
        console.log(error);
      })
  }

  DataTable() {
    return this.state.projects.map((res, i) => {
      return <ProjectTableRow obj={res} key={i} />;
    });
  }


  render() {
    return (<div className="table-wrapper">
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Projects</th>
          </tr>
        </thead>
        <tbody>
          {this.DataTable()}
        </tbody>
      </Table>
    </div>);
  }
}
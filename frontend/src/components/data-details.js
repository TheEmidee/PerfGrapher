import React, { Component } from "react";
import axios from 'axios';
import { Breadcrumb, Table } from 'react-bootstrap';
import DataDetailsRow from './data-details-row';

export default class DataDetails extends Component {

  constructor(props) {
    super(props)
    this.state = {
        projectName: this.props.match.params.project_name,
        mapName: this.props.match.params.map_name,
        sha: this.props.match.params.sha,
        data: []
    };
  }

  componentDidMount() {
    axios.get( `http://localhost:4000/projects/data-details/${this.state.projectName}/${this.state.mapName}/${this.state.sha}`)
      .then(res => {
        this.setState({
            data: res.data
        });
      })
      .catch((error) => {
        console.log(error);
      })
  }

  renderStatsHeader() {
    return [ "project", "map", "date", "sha" ].map((title, index) => {
        return <DataDetailsRow title={title} value={this.state?.data[ title ]} key={index} />;
      });
  }

  renderStatsBody() {
    if ( this.state.data && this.state.data.stats ) {
        return Object.keys( this.state.data.stats ).map( (title, index) => {
            return <DataDetailsRow title={title} value={this.state.data.stats[ title ]} key={index} />;
        });
    } else {
        return <DataDetailsRow title="" value="" key="0" />;
    }
  }

  render() {
    return (<div className="table-wrapper">
        <Breadcrumb>
            <Breadcrumb.Item href={"/project/" + this.state.projectName}>{this.state.projectName}</Breadcrumb.Item>
            <Breadcrumb.Item href={"/project-map/" + this.state.projectName + "/" + this.state.mapName}>{this.state.mapName}</Breadcrumb.Item>
        </Breadcrumb>
        <h1>Data details for commit {this.state.sha}</h1>
        <a href={"/files/" + this.state.data.ReportName}> Report </a>
        <Table striped bordered hover>
            <tbody>
                { this.renderStatsHeader() }
                { this.renderStatsBody() }
            </tbody>
        </Table>
    </div>);
  }
}
import React, { Component } from "react";
import axios from 'axios';
import { Breadcrumb, Table, Button, Tabs, Tab } from 'react-bootstrap';
import DataDetailsRow from './data-details-row';
import BootstrapTable from 'react-bootstrap-table-next';

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
    axios.get( `/api/data-details/${this.state.projectName}/${this.state.mapName}/${this.state.sha}`)
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
    const hitchesData = this.state.data.hitches;
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

  render() {
    return (<div className="table-wrapper">
        <Breadcrumb>
            <Breadcrumb.Item href={"/project/" + this.state.projectName}>{this.state.projectName}</Breadcrumb.Item>
            <Breadcrumb.Item href={"/project-map/" + this.state.projectName + "/" + this.state.mapName}>{this.state.mapName}</Breadcrumb.Item>
        </Breadcrumb>
        <h1>Data details for commit {this.state.sha}</h1>
        <Button variant="outline-secondary" href={"/files/" + this.state.data.ReportName}>View Graph Report</Button>
        <Table striped bordered hover>
            <tbody>
                { this.renderStatsHeader() }
            </tbody>
        </Table>
        <Tabs defaultActiveKey="stats" id="uncontrolled-tab-example" className="mb-3">
          <Tab eventKey="stats" title="Stats">
            { this.renderStats( this.state.data.stats ) }
          </Tab>
          <Tab eventKey="metrics" title="Metrics">
            { this.renderStats( this.state.data.metrics ) }
          </Tab>
          <Tab eventKey="hitches" title="Hitches">
          { this.renderHitches() }
          </Tab>
        </Tabs>
    </div>);
  }
}
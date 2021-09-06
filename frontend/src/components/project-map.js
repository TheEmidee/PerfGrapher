import React, { Component } from "react";
import axios from 'axios';
import { Breadcrumb, Row, Col, Container, Button, Form } from "react-bootstrap";
import { Line } from 'react-chartjs-2';

export default class ProjectMap extends Component {

  constructor(props) {
    super(props);

    this.state = {
      projectName: this.props.match.params.project_name,
      mapName: this.props.match.params.map_name,
      counterNames: [],
      data: [],
      chartData: []
    };

    this.deleteMap = this.deleteMap.bind(this);
    this.handleChange = this.handleChange.bind( this );
    this.onChartItemClicked = this.onChartItemClicked.bind( this );
  }

  getCounterNames( data ) {
    // data is sorted by date descending
    const latestData = data[ 0 ];
    const stats = latestData.stats;

    return Object.keys( stats );
  }

  createChartData( selected_stat = "" ) {

    if ( selected_stat === "" ) {
      selected_stat = this.state.counterNames[ 0 ];
    }

    var labels = []
    var counter_data = []

    for ( var i = 0; i < this.state.data.length; i++ ) {
        labels.push( this.state.data[ i ].sha )
        counter_data.push( this.state.data[ i ].stats[ selected_stat ] )
    }

    const data = {
        labels: labels,
        datasets: [
            {
                label: selected_stat,
                data: counter_data,
                fill: false,
                backgroundColor: 'rgb(0, 99, 132)',
                borderColor: 'rgba(0, 99, 132, 0.2)',
            }
        ] };

    this.setState( { chartData: data } );
  }

  componentDidMount() {
    axios.get('/projects/get-map-stats/' + this.state.projectName + "/" + this.state.mapName)
      .then(res => {
        this.setState({
            data: res.data,
            counterNames: this.getCounterNames( res.data ),
        });

        this.createChartData();
      })
      .catch((error) => {
        console.log(error);
      })
  }
  
  deleteMap() {
    axios.delete('/projects/delete-map/' + this.state.projectName + "/" + this.state.mapName)
        .then((res) => {
            console.log('Map successfully deleted!')
        }).catch((error) => {
            console.log(error)
        })
  }

  handleChange(e ) {
    e.persist();

    var selected_stat = e.target.value.substring( "stat-".length )

    this.createChartData( selected_stat );
  }

  onChartItemClicked( element ) {
    if ( element.length > 0 ) {
      const index = element[ 0 ].index
      const sha = this.state.chartData.labels[ index ]

      this.props.history.push( `/data-details/${this.state.projectName}/${this.state.mapName}/${sha}`)
    }
  }

  render() {
    return (
      <Container fluid>
        <Row>
            <Col>
                <Breadcrumb>
                    <Breadcrumb.Item href={"/project/" + this.state.projectName}>{this.state.projectName}</Breadcrumb.Item>
                </Breadcrumb>
            </Col>
        </Row>
        <Row>
            <Col>
                <Form>
                    <Form.Control
                      as="select"
                      custom
                      onChange={this.handleChange}
                    >
                      {this.state.counterNames.map( ( name, i ) => (
                        <option value={`stat-${name}`} key={name}>{name} </option>
                      ) )}
                    </Form.Control>
                </Form>
            </Col>
        </Row>
        <Row>
          <Col>
            <Col>
              <Line 
                data={this.state.chartData} 
                getElementAtEvent={(data) => {
                  this.onChartItemClicked( data )
              }}
                onElementsClick={elem => {
                  console.log( elem )
                }}
                options={{
                  scales: {
                      // xAxis: {
                      // // The axis for this scale is determined from the first letter of the id as `'x'`
                      // // It is recommended to specify `position` and / or `axis` explicitly.
                      // type: 'time',
                      // },
                      yAxes: [
                      {
                          ticks: {
                              beginAtZero: true,
                          },
                      },
                      ],
                  }
                }} /></Col>
          </Col>
        </Row>
        <Row>
            <Col>
            <Button onClick={this.deleteMap} size="sm" variant="danger">Delete Map</Button>
            </Col>
        </Row>
      </Container>);
    }
}
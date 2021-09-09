import React, { Component } from "react";
import axios from 'axios';
import { Breadcrumb, Row, Col, Container, Button, Form } from "react-bootstrap";
import { Line } from 'react-chartjs-2';
 
const options = {
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
    },
};

const counterNames = [
    "fps", "trianglecount"
]

export default class ProjectMapLocation extends Component {

  constructor(props) {
    super(props);

    this.state = {
      projectName: this.props.match.params.project_name,
      mapName: this.props.match.params.map_name,
      locationName: this.props.match.params.location_name,
      locationData: [],
      chartData: [],
    };

    this.deleteLocation = this.deleteLocation.bind(this);
    this.handleChange = this.handleChange.bind( this );
  }

  CreateChartData( counters_data, selected_counter ) {

    counters_data = counters_data.sort( function( left, right ) {
        if ( left.date < right.date ) {
            return -1;
        }
        if ( left.date > right.date ) {
            return 1;
        }
        return 0;
    })

    var labels = []
    var counter_data = []

    for ( var i = 0; i < counters_data.length; i++ ) {
        labels.push( counters_data[ i ].sha )
        counter_data.push( counters_data[ i ][ selected_counter ] )
    }

    const data = {
        labels: labels,
        datasets: [
            {
                label: selected_counter,
                data: counter_data,
                fill: false,
                backgroundColor: 'rgb(0, 99, 132)',
                borderColor: 'rgba(0, 99, 132, 0.2)',
            }
        ] };

    return data
  }

  componentDidMount() {
    axios.get('/api/get-location-data/' + this.state.projectName + "/" + this.state.mapName + "/" + this.state.locationName)
      .then(res => {
        this.setState( { 
            locationData: res.data,
            chartData: this.CreateChartData( res.data.counters, "fps" )
        });
      })
      .catch((error) => {
        console.log(error);
      })
  }
  
  deleteLocation() {
    axios.delete('/api/delete-map-location/' + this.state.projectName + "/" + this.state.mapName + "/" + this.state.locationName)
        .then((res) => {
            console.log('Location successfully deleted!')
        }).catch((error) => {
            console.log(error)
        })
    }

    handleChange(e ) {
        e.persist();

        var selected_counter = e.target.id.substring( "counter-".length )

        this.setState({
            chartData: this.CreateChartData( this.state.locationData.counters, selected_counter )
        })
      }

  render() {
    return (<Container fluid>
            <Row>
                <Col>
                    <Breadcrumb>
                        <Breadcrumb.Item href={"/project/" + this.state.projectName}>{this.state.projectName}</Breadcrumb.Item>
                        <Breadcrumb.Item href={"/project-map/" + this.state.projectName + "/" + this.state.mapName}>{this.state.mapName}</Breadcrumb.Item>
                        <Breadcrumb.Item>{this.state.locationName}</Breadcrumb.Item>
                    </Breadcrumb>
                </Col>
            </Row>
            <Row>
                <Col><h5>BugItGoLocation</h5></Col>
                <Col>{this.state.locationData?.bugitgolocation}</Col>
            </Row>
            <Row>
                <Col sm={2}>
                    <Form>
                        {counterNames.map( ( name, i ) => (
                            <Form.Check 
                                type="radio" 
                                key={`counter-${name}`} 
                                id={`counter-${name}`} 
                                name="selected-counter" 
                                onChange={this.handleChange}
                                label={name} 
                                />
                        ) )}
                    </Form>
                </Col>
                <Col sm={10}><Line data={this.state.chartData} options={options} /></Col>
            </Row>
            <Row>
                <Col>
                    <Button onClick={this.deleteLocation} size="sm" variant="danger">Delete Location</Button>
                </Col>
            </Row>
        </Container>);
  }
}
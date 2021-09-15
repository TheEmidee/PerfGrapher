import React, { Component } from "react";
import axios from 'axios';
import { Breadcrumb, Row, Col, Container, Button, Form, Modal } from "react-bootstrap";
import { Line } from 'react-chartjs-2';
import ItemSelector from './item-selector';

export default class ProjectMap extends Component {

  constructor(props) {
    super(props);

    this.state = {
      projectName: this.props.match.params.project_name,
      mapName: this.props.match.params.map_name,
      categories: [ 'stats', 'metrics' ],
      selectedCategory: "stats",
      selectedCategoryStatNames: [],
      selectedStat: "",
      data: [],
      chartData: [],
      showConfirmationDialog: false
    };

    this.deleteMap = this.deleteMap.bind(this);
    this.onSelectedCategoryChanged = this.onSelectedCategoryChanged.bind( this );
    this.onSelectedStatChanged = this.onSelectedStatChanged.bind( this );
    this.onChartItemClicked = this.onChartItemClicked.bind( this );
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

  createChartData( selected_category, selected_stat = '' ) {

    if ( selected_stat === "" ) {
      selected_stat = this.state.selectedCategoryStatNames[ 0 ];
    }

    var labels = []
    var counter_data = []

    for ( var i = 0; i < this.state.data.length; i++ ) {
        labels.push( this.state.data[ i ].sha )
        counter_data.push( this.state.data[ i ][ selected_category ][ selected_stat ] )
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

    return data;
  }

  componentDidMount() {
    axios.get( `/api/get-map-stats/${this.state.projectName}/${this.state.mapName}` )
      .then(res => {
        this.setState( {
          data: res.data
        });

        this.selectCategory( "stats" )
      })
      .catch((error) => {
        console.log(error);
      })
  }
  
  deleteMap() {
    axios.delete('/api/delete-map/' + this.state.projectName + "/" + this.state.mapName)
        .then((res) => {
          this.props.history.push( `/project/${this.state.projectName}` );
        }).catch((error) => {
            console.log(error)
        })

    this.closeConfirmationDialog();
  }

  selectStat( stat_name ) {
    this.setState( {
      selectedStat: stat_name,
      chartData: this.createChartData( this.state.selectedCategory, stat_name )
    })
  }

  onSelectedStatChanged(e ) {
    e.persist();
    var selectedStat = e.target.value.substring( "stat-".length )
    this.selectStat( selectedStat )
  }

  getCategoryStatNames( category_name ) {
    if ( this.state.data ) {
      const latestData = this.state.data[ 0 ];

      if ( latestData ) {
        const data = category_name === "metrics"
          ? latestData.metrics
          : latestData.stats;

        if ( data ) {
          return Object.keys( data );
        }
      }
    }
    
    return [];
  }

  selectCategory( category_name ) {
    const categoryStatNames = this.getCategoryStatNames( category_name );
    const selectedStat = categoryStatNames[ 0 ];

    this.setState( {
      selectedCategory: category_name,
      selectedCategoryStatNames: categoryStatNames,
      selectedStat: selectedStat,
      chartData: this.createChartData( category_name, selectedStat )
    } );
  }

  onSelectedCategoryChanged( e ) {
    e.persist();

    const selectedCategoryName = e.target.value.substring( "category-".length );

    this.selectCategory( selectedCategoryName );
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
                  <ItemSelector 
                    items={this.state.categories} 
                    onSelectedItemChanged={this.onSelectedCategoryChanged} 
                    itemKeyPrefix="category" />
                  <ItemSelector 
                    items={this.state.selectedCategoryStatNames} 
                    onSelectedItemChanged={this.onSelectedStatChanged} 
                    itemKeyPrefix="stat" />
                </Form>
            </Col>
        </Row>
        <Row>
          <Col>
            <Col>
            {
              <Line 
                data={this.state.chartData} 
                getElementAtEvent={(data) => {
                  this.onChartItemClicked( data )
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
                }} />
              }
              </Col>
          </Col>
        </Row>
        <Row>
            <Col>
              <Button onClick={this.showConfirmationDialog} size="sm" variant="danger">Delete Map</Button>
            </Col>
        </Row>
        <Modal 
          show={this.state.showConfirmationDialog} 
          onHide={this.closeConfirmationDialog}
          aria-labelledby="contained-modal-title-vcenter"
          centered
          >
          <Modal.Header closeButton>
            <Modal.Title>Delete Map</Modal.Title>
          </Modal.Header>
          <Modal.Body>Are you sure you want to delete this map and all its data?</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.closeConfirmationDialog}>
              No
            </Button>
            <Button variant="primary" onClick={this.deleteMap}>
              Yes
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>);
    }
}
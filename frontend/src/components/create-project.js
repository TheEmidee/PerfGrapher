import React, {Component} from "react";
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button';
import axios from 'axios';

export default class CreateProject extends Component {
  constructor(props) {
    super(props)

    // Setting up functions
    this.onChangeProjectName = this.onChangeProjectName.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    // Setting up state
    this.state = {
      name: ''
    }
  }

  onChangeProjectName(e) {
    this.setState({name: e.target.value})
  }

  onSubmit(e) {
    e.preventDefault()

    const projectObject = {
      name: this.state.name,
      repository: "https://github.com/FishingCactus/swarms",
    };

    axios.post('/api/create-project', projectObject)
      .then( res => {
        this.props.history.push( '/home' );
      });

    this.setState({name: ''})
  }

  render() {
    return (<div className="form-wrapper">
      <Form onSubmit={this.onSubmit}>
        <Form.Group controlId="Name">
          <Form.Label>Name</Form.Label>
          <Form.Control type="text" value={this.state.name} onChange={this.onChangeProjectName}/>
        </Form.Group>

        <Button variant="danger" size="lg" block="block" type="submit">
          Create Project
        </Button>
      </Form>
    </div>);
  }
}
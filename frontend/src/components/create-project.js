import React, {Component} from "react";
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button';
import axios from 'axios';

export default class CreateProject extends Component {
  constructor(props) {
    super(props)

    // Setting up functions
    this.onChangeProjectName = this.onChangeProjectName.bind(this);
    this.onChangeRepositoryUri = this.onChangeRepositoryUri.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    // Setting up state
    this.state = {
      name: '',
      repositoryUri: '',
      errors: []
    }
  }

  findFormErrors() {
    const newErrors = {}
    if ( !this.state.name || this.state.name === '' ) newErrors.name = 'cannot be blank!'
    if ( !this.state.repositoryUri || this.state.repositoryUri === '' ) newErrors.repositoryUri = 'cannot be blank!'

    return newErrors
  }

  onChangeProjectName(e) {
    this.setState({name: e.target.value})
  }

  onChangeRepositoryUri(e) {
    this.setState({repositoryUri: e.target.value})
  }

  onSubmit(e) {
    e.preventDefault()

    const newErrors = this.findFormErrors()

    if ( Object.keys( newErrors ).length > 0 ) {
      this.setState( {
        errors: newErrors
      })
    } else {
      const projectObject = {
        name: this.state.name,
        repository: this.state.repositoryUri,
      };
  
      axios.post('/api/create-project', projectObject)
        .then( res => {
          this.props.history.push( '/home' );
        });
    }
  }

  render() {
    return (<div className="form-wrapper">
      <Form onSubmit={this.onSubmit}>
        <Form.Group className="mb-3" controlId="formProjectName">
          <Form.Label>Name</Form.Label>
          <Form.Control 
            type="text" 
            value={this.state.name} 
            onChange={this.onChangeProjectName} 
            placeholder="Your project name" 
            isInvalid={ !!this.state.errors.name }
            />
            <Form.Control.Feedback type='invalid'>{ this.state.errors.name }</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formRepositoryUri">
          <Form.Label>Repository Url</Form.Label>
          <Form.Control 
            type="text" 
            value={this.state.repositoryUri} 
            onChange={this.onChangeRepositoryUri} 
            placeholder="https://github.com/FishingCactus/swarms/" 
            isInvalid={ !!this.state.errors.repositoryUri }
            />
          <Form.Control.Feedback type='invalid'>{ this.state.errors.repositoryUri }</Form.Control.Feedback>
        </Form.Group>

        <Button variant="primary" size="lg" block="block" type="submit">
          Create Project
        </Button>
      </Form>
    </div>);
  }
}
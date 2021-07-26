import React from "react";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import "bootstrap/dist/css/bootstrap.css";
import "./App.css";

import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

import ProjectList from './components/project-list';
import CreateProject from './components/create-project';
import Project from './components/project';
import ProjectMap from './components/project-map';
import ProjectMapLocation from './components/project-map-location';
import DataDetails from './components/data-details';
import GenericNotFound from './components/generic-not-found';

function App() {
  return (<Router>
      <div className="App">
        <Navbar bg="dark" variant="dark">
          <Container>
            <Navbar.Brand>
              <Link to={'/'} className="nav-link">Perf Grapher</Link>
            </Navbar.Brand>
            <Nav className="me-auto">
              <Link to="/home">Home</Link>
            </Nav>
            <Nav>
              <Link to="/create-project">Create Project</Link>
            </Nav>
          </Container>
        </Navbar>
        <Container>
          <Switch>
            <Route exact path='/' component={ProjectList} />
            <Route path='/home' component={ProjectList} />
            <Route path='/create-project' component={CreateProject} />
            <Route path='/project/:name' component={Project} />
            <Route path='/project-map/:project_name/:map_name' component={ProjectMap} />
            <Route path='/project-map-location/:project_name/:map_name/:location_name' component={ProjectMapLocation} />
            <Route path='/data-details/:project_name/:map_name/:sha' component={DataDetails} />
            <Route component={GenericNotFound} />
          </Switch>
        </Container>
      </div>
    </Router>
  );
}

export default App;
import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export default class ProjectTableRow extends Component {
    render() {
        return (
            <tr>
                <td><Link className="link" to={"/project/" + this.props.obj.name}>{this.props.obj.name}</Link></td>
            </tr>
        );
    }
}
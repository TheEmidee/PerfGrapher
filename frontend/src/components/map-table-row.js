import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export default class MapTableRow extends Component {
    render() {
        return (
            <tr>
                <td><Link className="link" to={"/project-map/" + this.props.infos.project + "/" + this.props.infos.map}>{this.props.infos.map}</Link></td>
            </tr>
        );
    }
}
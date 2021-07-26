import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import CountersInfos from './counters-infos';

export default class MapLocationTableRow extends Component {
    render() {
        return (
            <tr>
                <td>
                    <Link className="link" to={"/project-map-location/" + this.props.locationInfos.project + "/" + this.props.locationInfos.map + "/" + this.props.locationInfos.location}>
                        {this.props.locationInfos.location}
                    </Link>
                </td>
                <td>
                    <CountersInfos countersInfos={this.props.locationInfos.lastcounters} />
                </td>
            </tr>
        );
    }
}
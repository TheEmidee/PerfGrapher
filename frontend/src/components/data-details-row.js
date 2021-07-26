import React, { Component } from 'react';

export default class DataDetailsRow extends Component {
    render() {
        return (
            <tr>
                <td>{this.props.title}</td>
                <td>{this.props.value}</td>
            </tr>
        );
    }
}
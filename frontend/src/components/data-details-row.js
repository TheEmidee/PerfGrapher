import React, { Component } from 'react';

export default class DataDetailsRow extends Component {

    renderValue() {
        if ( this.props.link ) {
            return <a href={this.props.link}>{this.props.value}</a>
        }
        return this.props.value
    }

    render() {
        return (
            <tr>
                <td>{this.props.title}</td>
                <td>{this.renderValue()}</td>
            </tr>
        );
    }
}
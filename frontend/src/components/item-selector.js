import React, { Component } from "react";
import { Form } from "react-bootstrap";

export default class ItemSelector extends Component {
    render() {
        return (
            <Form.Control
                as="select"
                custom
                onChange={this.props.onSelectedItemChanged}
            >
                {
                    this.props.items.map( ( name, i ) => (
                        <option value={`${this.props.itemKeyPrefix}-${name}`} key={`${this.props.itemKeyPrefix}-${name}`}>{name}</option>
                    )) 
                }
            </Form.Control>
        );
    }
}
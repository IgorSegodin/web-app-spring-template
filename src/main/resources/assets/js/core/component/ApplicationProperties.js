import React from 'react';
import PropTypes from 'prop-types';

/**
 * Puts it's properties to context, for other components to be able to use this properties on their need.
 */

class ApplicationProperties extends React.Component {

    getChildContext() {
        return {
            properties: this.props || {}
        }
    }

    render() {
        if (this.props.children) {
            if (Array.isArray(this.props.children)) {
                return (
                    <span>
                        {this.props.children}
                    </span>
                )
            } else {
                return React.Children.only(this.props.children);
            }
        } else {
            throw new Error(`Component ${this.constructor.name} should have children.`);
        }
    }
}

ApplicationProperties.childContextTypes = {
    properties: PropTypes.object.isRequired
};

export default ApplicationProperties;

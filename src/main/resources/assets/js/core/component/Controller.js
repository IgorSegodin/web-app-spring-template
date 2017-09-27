import React from 'react';
import PropTypes from 'prop-types';

import generateId from 'js/core/util/generateId';

/**
 * Frame for controller view, which manages presentational layers.
 * Should dispatch and reduce actions.
 * */
class Controller extends React.Component {

    constructor(props, context) {
        super(props, context);
        // Each controller should have unique Identifier
        // Can be useful, when have multiple Controllers of the same type, with same actions, which use same Store
        this.cid = generateId();
        this.messageManager = context.messageManager;
        this.notificationManager = context.notificationManager;
        this.properties = context.properties;
        /**
         * @Deprecated instead use {@link StandaloneControllerView#statePath} or {@link StandaloneControllerView#componentName}
         * Name of components data in global state object. This property name will be used when state is changed.
         * */
        this.rootStateProperty = null;
    }

    dispatch(action) {
        let dispatched = this.context.store.dispatch(action);
        return dispatched;
    }

    /**
     * Each Controller should know how to render it's presentational layer.
     * */
    render() {
        throw new Error("Component " + this.constructor.name + " should override function 'render'.");
    }

    /**
     * Every time, when global State (Store) changes, this method is being invoked.
     * Each controller should compare it's local state with new global state, and update itself if needed.
     * */
    onStateChange(newState) {
        if (this.rootStateProperty ) {
            if (newState && newState[this.rootStateProperty]) {
                if (this.state != newState[this.rootStateProperty]) {
                    this.setState(Object.assign({}, this.state, newState[this.rootStateProperty]));
                }
            }
        } else {
            throw new Error("Component " + this.constructor.name + " should override function 'onStateChange' or specify property 'rootStateProperty'.");
        }
    }

    /**
     * Links action type to it's handler function (reducer).
     * Each reducer should know how to put data from action to global State (Store).
     * @return {Object} where key is action type, and value is a function(state, action)
     * */
    getReducerMap() {
        throw new Error("Component " + this.constructor.name + " should override function 'getReducerMap'.");
    }

    /**
     * Can help to avoid action name clash within single Store.
     * @param type {String} constant action type.
     * @return {String} action type with unique controller identifier.
     * */
    actionType(type) {
        return this.cid + "_" + type;
    }

    /**
     * @param path {String} path to be copied. Example: 'data.field' in this case result will be new object, with deeply copied fields 'data' and field
     * */
    getStateCopy(path) {
        const newState = Object.assign({}, this.state);
        if (path) {
            const pathParts = path.split(".");

            let currentObject = newState;

            pathParts.forEach(function(part) {
                currentObject[part] = Object.assign({}, currentObject[part]);
                currentObject = currentObject[part];
            });
        }
        return newState;
    }

    componentWillMount() {
        this.unregisterReducerMap = this.context.store.registerReducerMap(this.getReducerMap());
        this.unregisterStateListener = this.context.store.registerStateListener(this.onStateChange.bind(this));
    }

    componentWillUnmount() {
        this.unregisterReducerMap();
        this.unregisterReducerMap = null;

        this.unregisterStateListener();
        this.unregisterStateListener = null;
    }
}

Controller.contextTypes = {
    store: PropTypes.shape({
        getState: PropTypes.func.isRequired,
        dispatch: PropTypes.func.isRequired,
        registerReducerMap: PropTypes.func.isRequired,
        registerStateListener: PropTypes.func.isRequired
    }).isRequired,
    muiTheme: PropTypes.object,
    properties : PropTypes.object
};

export default Controller;
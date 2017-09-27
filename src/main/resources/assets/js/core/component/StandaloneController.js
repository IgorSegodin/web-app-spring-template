import React from 'react';
import PropTypes from 'prop-types';

import Controller from "js/core/component/Controller";
import ObjectUtil from "js/core/util/ObjectUtil";

const COMPONENTS_PATH = "components";

/**
 * Controller which simplifies operations with global state.
 * Component reducers should return only component local state and controller
 * will automatically put local state in the right place of global state.
 */

class StandaloneController extends Controller {

    components = {};

    constructor(props, context) {
        super(props, context);

        this.componentName = props.componentName
            || this.cid + "_" + this.constructor.name;

        this.state = ObjectUtil.getObjectProperty(this.context.store.getState(), this.getStatePath());
    }

    getChildContext() {
        return {
            parentStatePath: this.getStatePath() + "." + COMPONENTS_PATH,
            registerComponent: this.registerComponent.bind(this)
        }
    }

    registerComponent(component) {
        if (!(component instanceof StandaloneController)) {
            throw new Error("Component should be of type StandaloneController, but was found: " + component.constructor.name);
        }
        this.components[component.componentName] = component;
        return () => {
            delete this.components[component.componentName];
        };
    }

    getStatePath() {
        return this.props.statePath
            || (this.context.parentStatePath ? this.context.parentStatePath + "." + this.componentName : this.componentName);
    }

    /**
     * NullPointer - safe getter.
     * @param path {string}
     * @return {Object}
     */
    getStateProperty(path) {
        return ObjectUtil.getObjectProperty(this.state, path);
    }

    /**
     * Global state overrides local.
     * */
    onStateChange(newState, callback) {
        const componentState = ObjectUtil.getObjectProperty(newState, this.getStatePath());
        if (componentState && !ObjectUtil.isEquals(this.state, componentState)) {
            this.setState(componentState, callback);
        }
    }

    getStateCopy() {
        throw new Error(`Standalone controller ${this.constructor.name} should not invoke method getStateCopy.`);
    }

    getReducerMap() {
        const reducerMap = {};
        const actionMap = this.getActionMap();
        for (let key in actionMap) {
            if (actionMap.hasOwnProperty(key)) {
                reducerMap[this.actionType(key)] = function (state, action) {
                    const reduceFunction = actionMap[key];
                    const newStateKeys = reduceFunction(state, action);
                    const newLocalState = Object.assign({}, ObjectUtil.getObjectProperty(state, this.getStatePath()));
                    for (let key in newStateKeys) {
                        if (newStateKeys.hasOwnProperty(key)) {
                            ObjectUtil.setObjectProperty(newLocalState, key, newStateKeys[key]);
                        }
                    }
                    const newGlobalState = Object.assign({}, state);
                    ObjectUtil.setObjectProperty(newGlobalState, this.getStatePath(), newLocalState);
                    return newGlobalState;
                }.bind(this);
            }
        }

        return reducerMap;
    }

    /**
     * Should return object, where keys - action type,
     * and values - functions which receive two arguments (state, action).
     * Each callback should return new component state.
     * Example:
     *      getActionMap() {
     *          return {
     *              [MY_ACTION_CONSTANT]: (state, action) => {here extract new data from action logic...}
     *          }
     *      }
     */
    getActionMap() {
        throw new Error("Component " + this.constructor.name + " should override function 'getActionMap'.");
    }

    /**
     * Can help to avoid action name clash within single Store.
     * @param type {String} constant action type.
     * @return {String} action type with unique controller identifier.
     * */
    actionType(type) {
        return this.props.componentName ?
            `${this.cid}_${this.componentName}_${type}`
            : `${this.componentName}_${type}`;
    }

    /**
     * If first param is object, then old dispatch method is used.
     * If first param is string, then
     *      it will be automatically wrapped in {@link StandaloneController#actionType} .
     * @param type Can be {string} or {object}
     * @param data {object} optional
     */
    dispatch(type, data) {
        if (ObjectUtil.isObject(type)) {
            if (!type.type) {
                throw new Error("Invalid action was passed to dispatch method: " + JSON.stringify(type) + ', ' + this.constructor.name);
            }
            return super.dispatch(type);
        } else if (type) {
            return super.dispatch(Object.assign({}, data, {type: this.actionType(type)}));
        } else {
            throw new Error('Invalid dispatch arguments, ' + this.constructor.name);
        }
    }

    componentWillMount() {
        super.componentWillMount();
        if (this.props.componentName && this.context.registerComponent) {
            this.unregisterComponent = this.context.registerComponent(this);
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        if (this.unregisterComponent) {
            this.unregisterComponent();
            this.unregisterComponent = null;
        }
    }

}

StandaloneController.childContextTypes = Object.assign({}, StandaloneController.childContextTypes, {
    parentStatePath: PropTypes.string,
    registerComponent: PropTypes.func
});

StandaloneController.contextTypes = Object.assign({}, StandaloneController.contextTypes, {
    parentStatePath: PropTypes.string,
    registerComponent: PropTypes.func
});

StandaloneController.propTypes = Object.assign({}, StandaloneController.propTypes, {
    /**
     * Optional, will be used as part of statePath if {@link #statePath} is not specified
     */
    componentName: PropTypes.string,

    /**
     * Optional, absolute state path, where component state will be placed (ignores {@link #componentName} if specified)
     */
    statePath: PropTypes.string
});

export default StandaloneController;
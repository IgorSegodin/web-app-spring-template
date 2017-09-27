import React from 'react';
import PropTypes from 'prop-types';

import StoreHolder from "js/core/StoreHolder";
import TimeoutUtil from "js/core/util/TimeoutUtil";

/**
 * State (Store) holder for all child components.
 * */
class StoreView extends React.Component {

    constructor(props) {
        super(props);

        // all subscribed child state listeners
        this.internalStateListeners = [];

        this.storeHolder = props.storeHolder || new StoreHolder();

        this.store = this.storeHolder.getStore();

        // all subscribed child reducer functions, for all child action types
        this.internalReduceMap = this.storeHolder.getInternalReduceMap();

    }

    /**
     * Common context for all children
     * */
    getChildContext() {
        return {
            store: {
                getState: this.getStoreState.bind(this),
                dispatch: this.dispatch.bind(this),
                registerReducerMap: this.registerReducerMap.bind(this),
                registerStateListener: this.registerStateListener.bind(this)
            }
        }
    }

    componentDidMount() {
        if (!this.unsubscribe) {
            this.unsubscribe = this.store.subscribe(this.handleStateChange.bind(this));
        }
    }

    componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null
        }
    }

    getStoreState() {
        return this.store.getState();
    }

    dispatch(action) {
        return TimeoutUtil.waitCondition({
            actionCallback: () => {
                if (process.env.NODE_ENV !== 'production') {
                    if(application.property.showConsole){
                        console.log("dispatch");
                        console.log(action);
                    }
                }
                this.storeHolder.onReducerStart();
                this.store.dispatch(action);
            },

            conditionCallback: () => {
                return !this.storeHolder.isReducerInProgress() && !this.stateChangeInProgress;
            },

            timeoutCallback: () => {
                throw new Error("StoreView: Failed to dispatch action, because of too long processing of 'handleStateChange' or 'reduce'");
            },

            timeoutInterval: 50,
            millisToWait: 2000
        });

    }

    /**
     * Add reducer handlers (functions) mapped to action types.
     * @param reduceMap reduce map
     * @returns {function(this:{reduceMap: *, internalReduceMap: ({}|*)})} reduce map unregister method
     */
    registerReducerMap(reduceMap) {
        Object.assign(this.internalReduceMap, reduceMap);
        return function () {
            for (var actionType in this.reduceMap) {
                delete this.internalReduceMap[actionType];
            }
        }.bind({reduceMap: reduceMap, internalReduceMap: this.internalReduceMap});
    }

    /**
     * Add state change listener
     * @param {function} listener
     * @returns {function(this:{listener: *, internalStateListeners: Array})} state listener unregister method
     */
    registerStateListener(listener) {
        this.internalStateListeners.push(listener);
        return function () {
            const listeners = this.internalStateListeners;
            listeners.splice(listeners.indexOf(this.listener), 1);
        }.bind({listener: listener, internalStateListeners: this.internalStateListeners});
    }

    /**
     * Subscribes to store state changes, notifies subscribed children.
     * */
    handleStateChange() {
        this.stateChangeInProgress = true;

        this.internalStateListeners.forEach(function (listener) {
            listener(this.store.getState());
        }.bind(this));

        this.stateChangeInProgress = false;
    }

    /**
     * Can have multiple children
     * */
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
            throw new Error("Component " + this.props.children + " should have children.");
        }
    }
}

StoreView.childContextTypes = {
    store: PropTypes.shape({
        getState: PropTypes.func.isRequired,
        dispatch: PropTypes.func.isRequired,
        registerReducerMap: PropTypes.func.isRequired,
        registerStateListener: PropTypes.func.isRequired
    }).isRequired
};

export default StoreView;
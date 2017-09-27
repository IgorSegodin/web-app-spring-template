import {createStore, applyMiddleware} from "redux";
import thunkMiddleware from "redux-thunk";

/**
 * State (Store) holder for all child components.
 * */
class StoreHolder {

    constructor() {
        this.store = createStore(
            this.reduce.bind(this),
            {},
            applyMiddleware(thunkMiddleware)
        );
        this.internalReduceMap = {};
    }

    reduce(state, action) {
        var result = state;

        switch (action.type) {
            case "@@redux/INIT" :
                break;
            default : {
                const reducer = this.internalReduceMap[action.type];
                if (reducer) {
                    result = Object.assign({}, state, reducer(state, action));
                    break;
                } else {
                    console.warn("Unmapped action '" + action.type + "'.");
                }
            }
        }

        this.onReducerStop();
        if (process.env.NODE_ENV !== 'production' && result) {
            console.log("reduced state");
            console.log(result);
        }

        return result;
    }

    getStore(){
        return this.store;
    }

    getInternalReduceMap(){
        return this.internalReduceMap;
    }

    onReducerStart(){
        this.reduceInProgress = true;
    }

    onReducerStop(){
        this.reduceInProgress = false;
    }

    isReducerInProgress(){
        return this.reduceInProgress;
    }
}


export default StoreHolder;
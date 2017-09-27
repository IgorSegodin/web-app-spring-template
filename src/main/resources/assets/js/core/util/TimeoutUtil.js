import Promise from "promise-polyfill";

function waitCondition(props) {
    try {
        if (props.conditionCallback()) {
            props.actionCallback();
            props.resolve();
        } else if (new Date().getTime() - props.startTime > props.millisToWait) {
            props.timeoutCallback();
            props.reject();
        } else {
            setTimeout(function () {
                waitCondition(props);
            }, props.timeoutInterval);
        }
    } catch (e) {
        props.reject(e);
    }
}


export default {

    /**
     * Clears previous timeout and starts new one.
     * @param container {Object} container for timer property
     * @param name {String} name of a timer, will be used as property name.
     * @param delay {Number} timeout delay
     * @param func {Function} callback
     * */
    applyTimeout: function (container, name, delay, func) {
        if (container[name]) {
            clearTimeout(container[name]);
        }

        container[name] = setTimeout(func.bind(container), delay);
    },

    /**
     * Waits until condition = true or time is over.
     * @param actionCallback {function} will be invoked if condition = true
     * @param conditionCallback {function} will be invoked each time when timeout is over.
     * @param timeoutCallback {function} will be invoked when waiting time is over
     * @param timeoutInterval {number} how frequently condition should be invoked
     * @param millisToWait {number} how many milliseconds should pass until condition is treated as unreachable
     * @return {Promise}
     * */
    waitCondition: function ({actionCallback, conditionCallback, timeoutCallback, timeoutInterval, millisToWait}) {
        return new Promise((resolve, reject) => {
            waitCondition({
                actionCallback,
                conditionCallback,
                timeoutCallback,
                timeoutInterval,
                millisToWait,
                startTime: new Date().getTime(),
                resolve,
                reject
            });
        });
    }
}
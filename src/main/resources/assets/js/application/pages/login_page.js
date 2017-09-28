import ReactDOM from 'react-dom';
import React from 'react';

import AppGlobals from 'js/core/AppGlobals';

document.addEventListener('DOMContentLoaded', function() {
    ReactDOM.render(
        <div>
            <form action={`${AppGlobals.url.contextPath}/process-login`} method="POST">
                <label htmlFor="email">Email</label>
                <input id="email" name="email"/>
                <br/>
                <label htmlFor="password">Password</label>
                <input id="password" name="password" type="password"/>
                <br/>
                <button type="submit" title="Login">Login</button>
            </form>
        </div>,
        document.getElementById("loginPanel")
    );
});

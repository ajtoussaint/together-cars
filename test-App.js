import React, { Component } from "react"

const { render } = require("sass");

class testApp extends Component {
    constructor(props){
        super(props);
    }

    render(){
        return(
            <div className="App">
                Hello React!
            </div>
        )
    }
}

export default testApp;
import React, { Component } from 'react';
import axios from 'axios';

export default class Red extends Component{
    constructor(props){
        super(props);

        this.state = {members: ["Sarge"]}
    }

    componentDidMount(){
        console.log("Axios called");
        axios.get('http://localhost:5000/red')
            .then(res => {
                this.setState({ members: res.data});
            })
            .catch(err => {
                console.log(err);
            })
    }

    render(){
        return(
            <div className='redContainer'> 
                <h1>RED Team</h1>
                <ul>
                    {this.state.members.map( (i, index) => <li key={index}>{i}</li>)}
                </ul>
            </div>
        )
    }
}
import React, { Component } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';

export default class Red extends Component{
    constructor(props){
        super(props);

        this.state = {members: ["Sarge"]}
    }

    componentDidMount(){
        console.log("Red Axios called");
        console.log("Props", this.props);
        axios.get('http://localhost:5000/red')
            .then(res => {
                if(this.props.user){
                    this.setState({ members: res.data.push(this.props.user)});
                }
                this.setState({ members: res.data});
            })
            .catch(err => {
                console.log(err);
            })
    }

    render(){
        if(this.props.loggedIn){
            return(
                <div className='redContainer'> 
                    <h1>Top Secret RED Team Roster</h1>
                    <ul>
                        {this.state.members.map( (i, index) => <li key={index}>{i}</li>)}
                    </ul>
                </div>
            )
        }else{
            console.log("Must be logged in to see red roster");
            return(
                <Navigate to="/" replace={false} />
            )
        }
    }
}
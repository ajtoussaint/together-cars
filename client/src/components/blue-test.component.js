import React, { Component } from 'react';
import axios from 'axios';

//axios setup
const axiosInstance = axios.create({
    withCredentials: true,
    baseURL: "http://localhost:5000/"
  })

export default class Blue extends Component{
    constructor(props){
        super(props);

        this.state = {members: ["Sarge"]}
    }

    componentDidMount(){
        console.log("Blue Axios called");
        axiosInstance.get('blue')
            .then(res => {
                this.setState({ members: res.data});
            })
            .catch(err => {
                console.log(err);
            })
    }

    render(){
        return(
            <div className='blueContainer'> 
                <h1>Top Secret Blue Team Roster</h1>
                <ul>
                    {this.state.members.map( (i, index) => <li key={index}>{i}</li>)}
                </ul>
            </div>
        )
    }
}
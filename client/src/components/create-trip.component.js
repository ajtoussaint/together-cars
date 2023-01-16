import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import axiosInstance from "../modules/axiosInstance"

export default class CreateTrip extends Component{
    constructor(props){
        super(props);

        this.state={
            title:"",
            destination:"",
            description:"",
            arrivalTime:"",
            participants:"",
            processing:false,
            processingCompleted:false
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(e){
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    handleSubmit(e){
        e.preventDefault();
        console.log("Create Trip form submitted");
        this.setState({
            processing:true
        });
        axiosInstance.post("createTrip",{
            title: this.state.title,
            destination: this.state.destination,
            description: this.state.description,
            arrivalTime: this.state.arrivalTime,
            participants: this.state.participants
        })
        .then( res => {
            //save trip ID to state for redirect
            if(res.status === 200){
                console.log("Finished creating Trip: ")
                console.log(res.data);
                this.setState({
                    /*this will permanently lock up the component 
                    if I have it navigate away and don't change the state back*/
                    processingCompleted:true
                });
            }
        })
    }

    //!!polish: I'd like to make the participant portion of the form more dynamic
    render(){
        if(this.props.loggedIn){
            return(
                <div id="createTripWrapper">
                    <form>
                        <label htmlFor='title'>
                            Title:
                            <input
                            type='text'
                            name='title'
                            id='tripTitleInput'
                            value={this.state.title}
                            onChange={this.handleChange}/>
                        </label>
                        <br></br>
                        <label htmlFor='destination'>
                            Destination:
                            <input
                            type='text'
                            name='destination'
                            id='tripDestinationInput'
                            value={this.state.destination}
                            onChange={this.handleChange}/>
                        </label>
                        <br></br>
                        <label htmlFor='description'>
                            Description:
                            <input
                            type='text'
                            name='description'
                            id='tripDescriptionInput'
                            value={this.state.description}
                            onChange={this.handleChange}/>
                        </label>
                        <br></br>
                        <label htmlFor='arrivalTime'>
                            Arrival Time:
                            <input
                            type='datetime-local'
                            name='arrivalTime'
                            id='tripArrivaltimeInput'
                            value={this.state.arrivalTime}
                            onChange={this.handleChange}/>
                        </label>
                        <br></br>
                        <label htmlFor='participants'>
                            Input participant usernames separated by commas
                            (You will have the opportunity to add more later):
                            <input
                            type='text'
                            name='participants'
                            id='tripParticipantsInput'
                            value={this.state.participants}
                            onChange={this.handleChange}/>
                        </label>
                        <br></br>
                        <button type='submit' onClick={this.handleSubmit}>Create my trip!</button>
                    </form>
                </div>
            )
        }else{
            return(
                <Navigate to="/" replace={false} />
            )
        }
    }
}
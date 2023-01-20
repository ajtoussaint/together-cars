import axios from 'axios';
import React, { Component, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axiosInstance from "../modules/axiosInstance"

export default class CreateTrip extends Component{
    constructor(props){
        super(props);
        //!! 01/18/23 Make participants an object that maps keys to status of driving/passenger/null
        this.state={
            title:"",
            destination:"",
            description:"",
            arrivalTime:"",
            participants:[],
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
                    processing:false,
                    processingCompleted:true
                });
            }
        })
    }

    setParticipants(partyArray){
        console.log("set participants called in create-trip class", partyArray)
        this.setState({
            participants:partyArray
        });
    }

    //!!polish: I'd like to make the participant portion of the form more dynamic
    render(){
        if(this.props.loggedIn){
            if(this.state.processing){
                return(
                    <h1>Creating your trip...</h1>
                )
            }else if(this.state.processingCompleted){
                return(
                    //!!01/16 This will go to the trip once that is a thing
                    <Navigate to="/" replace={false} />
                )
            }else{
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
                        </form>
                        <ParticipantForm
                            participants={this.state.participants}
                            setParticipants={(partyArray)=>this.setParticipants(partyArray)}/>
                            <br></br>
                        <button type='submit' onClick={this.handleSubmit}>Create my trip!</button>
                        
                    </div>
                )
            }
        }else{
            return(
                <Navigate to="/" replace={false} />
            )
        }
    }
}

function ParticipantForm(props){
    const [participantName, setParticipantName] = useState("");
    const [loading, setLoading] = useState(false)
    const listOfParticipants = props.participants

    function handleChange(e){
        e.persist();
        setParticipantName(e.target.value);
    }

    function handleSubmit(e){
        e.preventDefault();
        //show loading symbol
        setLoading(true);
        //check if this is a valid username
        axiosInstance.post("validateUsername",{username:participantName})
         .then( res => {
            if(res.data.validUser){
                console.log("found user");
                //add the object to the state
                props.setParticipants([...listOfParticipants,{
                    name:participantName,
                    status:null,
                }])
            }else{
                console.log("no such user");
                //show error
            }
            //close loading symbol
            setLoading(false);
            //reset the form
             setParticipantName("");
         }) 
    }

    function removeParticipant(participantIndex){
        console.log("removing participant #" + participantIndex);
        props.setParticipants([...listOfParticipants.slice(0,participantIndex),
        ...listOfParticipants.slice(participantIndex+1,listOfParticipants.length)])
    }

    return(
        <div>
            <form id="participant">
                Enter a participants together cars username:
                <input
                type="text"
                name="participantName"
                value={participantName}
                onChange={handleChange}/>
                {loading && "..."}
                <button onClick={handleSubmit}>Add participant</button>
            </form>

            <div id="pending participantList">
                {props.participants.map( (party,i) => {
                    return(
                        <div key={i} className='stagedParticipant'>
                            {party.name}
                            <button onClick={() => removeParticipant(i)}>X</button>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
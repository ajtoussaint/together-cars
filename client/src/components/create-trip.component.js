import React, { Component, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axiosInstance from "../modules/axiosInstance"
import Loading from "./loading.component"

export default class CreateTrip extends Component{
    constructor(props){
        super(props);
        this.state={
            title:"",
            destination:"",
            description:"",
            arrivalTime:"",
            participants:[],
            processing:false,
            processingCompleted:false,
            tripUrl:"/",
            error:false,
            formError:null
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleError = this.handleError.bind(this);
    }

    handleChange(e){
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    handleSubmit(e){
        if(!this.state.title){
            this.setState({
                formError:'Title is required'
            })
        }else if(!this.state.destination){
            this.setState({
                formError:'Destination is required'
            })
        }
        else if(!this.state.arrivalTime){
            this.setState({
                formError:'Arrival Time is required'
            })
        }else if(!this.state.description){
            this.setState({
                formError:'Description is required'
            })
        }else{
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
                if(res.status === 200){
                    console.log("Finished creating Trip: ")
                    console.log(res.data);
                    this.setState({
                        processing:false,
                        processingCompleted:true,
                        tripUrl:"/trips/" + res.data._id
                    });
                }
            }).catch( err => {
                this.handleError({text:null, link:'/createTrip'});
            })
        }  
    }

    setParticipants(partyArray){
        console.log("set participants called in create-trip class", partyArray)
        this.setState({
            participants:partyArray
        });
    }

    handleError(error){
        console.log("Create-trip component handled an error!")
        this.setState({error:true});
        this.props.setError(error);
    }

    render(){
        if(this.state.error){
            return(
                <Navigate to='/error' replace={false} />
            )
        }else{
            if(this.props.loading){
                return(
                    <Loading />
                )
            }else if(this.props.loggedIn){
                if(this.state.processing){
                    return(
                        <h1>Creating your trip...</h1>
                    )
                }else if(this.state.processingCompleted){
                    return(
                        <Navigate to={this.state.tripUrl} replace={false} />
                    )
                }else{
                    return(
                        <div id="createTripOuterWrapper">
                            <div id="createTripWrapper">
                                <h1>Create A Trip:</h1>
                                <form>
                                    <label htmlFor='title'>
                                        Trip Title:
                                        <br></br>
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
                                        <br></br>
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
                                        <br></br>
                                        <textarea
                                        name='description'
                                        id='tripDescriptionInput'
                                        value={this.state.description}
                                        onChange={this.handleChange}></textarea>
                                    </label>
                                    <br></br>
                                    <label htmlFor='arrivalTime'>
                                        Arrival Time:
                                        <br></br>
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
                                    setParticipants={(partyArray)=>this.setParticipants(partyArray)}
                                    handleError={(e)=>this.handleError(e)}/>
                                    <br></br>
                                <button type='submit' onClick={this.handleSubmit}>Create my trip!</button>
                                <p>{this.state.formError}</p>
                            </div>
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
                props.setParticipants([...listOfParticipants,participantName])
            }else{
                console.log("no such user");
                //!!show error to user
            }
            //close loading symbol
            setLoading(false);
            //reset the form
             setParticipantName("");
         }).catch( err => {
            this.props.handleError({text:null, link:'/createTrip'});
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
                Enter a participant's Together Cars username:
                <input
                type="text"
                name="participantName"
                value={participantName}
                onChange={handleChange}/>
                {loading && "..."}
                <button onClick={handleSubmit}>Add participant</button>
            </form>

            <div id="pendingParticipantList">
                {props.participants.map( (party,i) => {
                    return(
                        <div key={i} className='stagedParticipant'>
                            {party}
                            <button onClick={() => removeParticipant(i)}>X</button>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
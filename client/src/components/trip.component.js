import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import axiosInstance from "../modules/axiosInstance"
import Loading from "./loading.component"


//use effect hook to axios call and get the trip data

export default function Trip(props){
    const params = useParams();

    //initially loading is true
    const [loading, setLoading] = useState(true);
    const [trip, setTrip] = useState(null);
    const [participants, setParticipants] = useState([])

    useEffect(() =>{
        console.log("getting data on trip ID:" + params.tripId);
        axiosInstance.get("/trip/" + params.tripId)
        .then( res => {
            console.log("got data on trip ID:" + params.tripId);
            console.log(res.data);
            setTrip(res.data);
            /*!! 02/03 Another axios call for participants here*/
            console.log("Second axios call to get the trips");
            axiosInstance.get('/participants/' + params.tripId)
             .then( partyRes => {
                //array of all participant objects
                console.log("got participants in the main: " + res.data)
                setParticipants(partyRes.data);
                setLoading(false);
             })
            
        })
    }, [params])

    function participantsAreSame(party1, party2){
        if(party1.name !== party2.name){
            console.log('name error', party1, party2)
            return false;
        }else if(party1.status !== party2.status){
            console.log('status error', party1, party2)
            return false;
        }else if(party1.driverId !== party2.driverId){
            console.log('driver error', party1, party2)
            return false;
        }else{
            return true;
        }
    }

    function updatePartipants(newPartyArray){
        //update the state
        setParticipants(newPartyArray);
        //ensure state is consistent with DB
        axiosInstance.get('/participants/' + params.tripId)
            .then( res => {
                console.log("got participants for comparison");
                let updateRequired = false;
                res.data.forEach( (party, i) => {
                    if(!participantsAreSame(party,participants[i])){
                        updateRequired = true;
                    }
                })
                if(updateRequired){
                    console.error("!!Do an error or something");
                    //update the participants to be correct
                    setParticipants(res.data);
                }
            })
    }



    //!! what if we use effect to get participants here and pass a reload function down!!

    if(loading){
        return(
            <Loading />
        )
    }else if(!props.loggedIn){
        return(
            <Navigate to="/" replace={false} />
        )
    }else if(!trip){
        return(
            <h1>The trip does not exist</h1>
        )
    }else{
        //valid trip and user
        if(props.username === trip.organizer){
            return(
                <OrganizerView 
                trip={trip}
                username={props.username}/>
            )
        }else{
            return(
                <ParticipantView
                trip={trip}
                username={props.username}
                isOrganizer={props.username === trip.organizer}
                participants={participants}
                updatePartipants={(newParticipants)=>updatePartipants(newParticipants)}/>
            )
        }
    }
}

//make different components for organiser view and participant view
function OrganizerView(props) {
    const trip = props.trip;
    const username = props.username;

    return (
        <div id="organizerViewWrapper" className='tripViewWrapper'>
            <h1>{trip.title}</h1>
            <p>Destination: {trip.destination}</p>
            <p>by:{trip.organizer}</p>
            <p>Target Arrival Time: {trip.arrivalTime}</p>
            <p>Description: {trip.description}</p>
            <Participants tripId={trip._id}/>
            <OrganizerParticipants tripId={trip._id}/>
            <Drivers tripId={trip._id} username={username}/>
         </div>
    )
}

function OrganizerParticipants(props) {
    const [participantName, setParticipantName] = useState("");
    const [loading, setLoading] = useState(false)
    const tripId = props.tripId;
    const [participantArray, setPartArr] = useState([]);

    //use effect to get all of the participants in an array
    useEffect(() => {
        console.log("getting participants for trip:", tripId);
        axiosInstance.get("/participants/"+tripId)
         .then( res => {
            //response will be an array of all the participant objects
            console.log("got the participants: " + res.data);
            setPartArr(res.data);
         })
    }, [tripId]);

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
                //check if participant is already in
                if(participantArray.map(party => party.name).indexOf(participantName) < 0){
                    //Create a participant in DB and reload
                    console.log("creating participant");
                    axiosInstance.post("/addParticipant/" + tripId, {name:participantName})
                     .then( res => {
                        console.log("Created new participant: ", res.data);
                        //cause a reload with new participant
                        setPartArr([...participantArray, res.data]);
                     })
                }else{
                    console.log("user is already a participant");
                    //!!show error to user
                }
            }else{
                console.log("no such user");
                //!!show error to user
            }
            //close loading symbol
            setLoading(false);
            //reset the form
             setParticipantName("");
         }) 
    }

    function removeParticipant(participantName){
        console.log("removing participant " + participantName);
        //!!delete participant in DB and reload
        axiosInstance.post('/removeParticipant/' + tripId, {name:participantName})
         .then( res => {
            console.log("removed: ", participantName ,' from the trip');
            setPartArr(participantArray.filter( party => party.name !== participantName));
         })
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

            <div id="participantList">
                {participantArray.map( (party,i) => {
                    return(
                        <div key={i} className='stagedParticipant'>
                            {party.name}
                            <br></br>
                            {party.status}
                            {party.organizer || <button onClick={() => removeParticipant(party.name)}>X</button>}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

function ParticipantView(props){
    const { trip, username, isOrganizer, participants, updatePartipants } = props;

    return (
        <div id='participantViewWrapper' className='tripViewWrapper'>
            <div id='tripInformation'>
                <h1>{trip.title}</h1>
                <div id='tripDetails'>
                    <div className='detailWrapper'>Destination:{" " + trip.destination}</div>
                    <div className='detailWrapper'>Organizer:{" " + trip.organizer}</div>
                    <div className='detailWrapper'>Target Arrival Time: <br></br>{trip.arrivalTime.slice(11,16) + " on "}
                                {trip.arrivalTime.slice(0,10)}</div>
                </div>
                <div id='tripDescription'>Description: {trip.description}</div>
            </div>
            <Participants 
            tripId={trip._id}
            isOrganizer={isOrganizer}
            participants={participants}/>
            <Drivers
            tripId={trip._id}
            username={username}
            participants={participants}
            updatePartipants={(newParticipants) => updatePartipants(newParticipants)}/>
         </div>
    )
}

function Participants(props){

    //const [participantArray, setPartArr] = useState([]);
    const [loading, setLoading] = useState(true);
    //declare this so it causes an error if I don't give it 
    const {tripId , participants, isOrganizer} = props;

    //update loading based on participants
    useEffect(() => {
        if(participants.length > 0){
            setLoading(false);
        }
    }, [ participants ]);

    //return all of the participants and their status
    if(loading){
        return(
            <Loading />
        )
    }else{
        return(
            <div id='participantsWrapper'>
                <h2 id='participantsHeader'>Participants</h2>
                <div id='participantKey'> (D):driver, (P):passenger, (U):unassigned, *:organizer</div>
                    {participants.map( (party,i) => {
                        return(
                            <div className='singleParticipant' id={party.organizer && "organizerParticipant"} key={i}>
                                {party.name}
                                ({party.status === "driver" ? "D" : party.status === "passenger" ? "P" : "U"})
                                {party.organizer && "*"}
                            </div>
                        )
                    })}
            </div>
        )
    }
}

function Drivers(props){
    const [driverFormVisible, setDriverFormVisible] = useState(false);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showButton, setShowButton] = useState(true);
    //expect props to contain tripId
    const {tripId, username, participants, updatePartipants} = props;


    function toggleDriverForm(){
        setDriverFormVisible( (driverFormVisible) => {
            return !driverFormVisible
        });
    }

    //get all of the drivers in the DB based on the trip ID
    const getDrivers = () => {
        console.log("getting drivers");
        setLoading(true);
        axiosInstance.get("/driver/" + tripId,)
         .then( res => {
            console.log("got the drivers", res.data);
            setDrivers(res.data);
            setLoading(false);
         })
         .catch( err => {
            console.log(err);
            setLoading(false);
            //!! display an error for the user
         })
    }

    useEffect(getDrivers, [tripId]);

    const removeDriver = (driverId) =>{
        console.log("Removing Driver: ", driverId);
        setLoading(true);
        axios.post('/removeDriver/' + driverId)
         .then( res => {
            console.log("Driver removed");
            //update participants
            let newParticipants = [...participants];
            newParticipants.forEach(party => {
                if(party.name === res.data.name){
                    party.status = null;
                }
            });
            updatePartipants(newParticipants);
            getDrivers();
         })
    }

    //checks if the user is unassigned => able to start a car
    useEffect( () => {
        var partyArr = drivers.reduce((arr, driver) => {
            arr.push(driver.name);
            if(driver.passengers){
                Object.values(driver.passengers).forEach( passenger => {
                    if(passenger){
                        arr.push(passenger);
                    }
                })
            }
            return arr
        },[]);
        console.log(partyArr);
        if(partyArr.indexOf(username) < 0){
            setShowButton(true);
        }else{
            setShowButton(false);
        }
    }, [ drivers, username ])

    //display the drivers in the return
    if(loading){
        return(
            <Loading />
        )
    }else{
        return(
            <div id="driversWrapper">
                <h2>Drivers</h2>
                <div id="driversBlock">
                    {drivers.map((driver,i) => {
                            return(
                                <SingleDriver
                                key={i}
                                driver={driver}
                                tripId={tripId}
                                username={username}
                                removeDriver={() => removeDriver(driver._id)}
                                updateDrivers={() => getDrivers()}
                                participants={participants}
                                updatePartipants={(newParticipants) => updatePartipants(newParticipants)}
                                />
                            )
                        })}
                {/* Only show this if user is status null */}
                {showButton && (<button id='driverFormButton' onClick={() => toggleDriverForm()}>I can Drive!</button>)}
                </div>

                {driverFormVisible &&
                 <DriverForm 
                 closeMe={() => toggleDriverForm()} 
                 tripId={tripId} 
                 refresh={() => getDrivers()}
                 participants={participants}
                 updatePartipants={(newParticipants) => updatePartipants(newParticipants)}/>}
            </div> 
        )
    }
}

function DriverForm(props){
    const {tripId, refresh, participants, updatePartipants} = props;

    const [values, setValues] = useState({
        departureLocation:'',
        pickingUpSelection:"notPickingUp",
        notes:'',
        numberOfPassengers:"0",
    })

    const handleChange = (e) => {
        e.persist();
        setValues((values) => ({
            ...values,
            [e.target.name]:e.target.value,
        }));
        console.log("Driver form values: ", values);
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        //add the passenger array to the driver object
        let passengers = []

        for(let i=0; i<values.numberOfPassengers; i++){
            passengers.push(null);
        }

        console.log("Posting new driver");

        //send axios request to create the driver object
        axiosInstance.post("/driver", {
            tripId: tripId,
            departureLocation: values.departureLocation,
            pickingUpSelection: values.pickingUpSelection,
            notes: values.notes,
            passengers: passengers,
        })
         .then( res => {
            //response will be the driver data
            console.log("created new driver:", res.data.name);
            //update the participants list:
            let newParticipants = [...participants];
            newParticipants.forEach(party => {
                if(party.name === res.data.name){
                    party.status = "driver";
                }
            });
            updatePartipants(newParticipants);
            //refresh the "Drivers" component to get the new driver
            refresh();
         })


        props.closeMe();
        setValues({
            departureLocation:'',
            numberOfPassengers:"0",
            pickingUpSelection:"notPickingUp",
            notes:'',
        })
    }

    return(
        <div id='driverFormBack'>
            <div id='driverFormWrapper'>
                <button id='closeDriverForm' onClick={() => props.closeMe()}>X</button>
                <h1>Driver Form</h1>
                <form>
                    <input type='hidden' name='name' value={props.username}/>
                    <label htmlFor='departureLocation'>
                        Where are you leaving from?
                        <br></br>
                        <input 
                        type='text'
                        name='departureLocation'
                        id='departureLocation'
                        value={values.departureLocation}
                        onChange={handleChange}/>
                    </label>
                    <br></br>
                    <label htmlFor='numberOfPassengers'>
                        How many passengers can you take? (not including yourself)
                        <br></br>
                        <input 
                        type='number'
                        name='numberOfPassengers'
                        id='numberOfPassengers'
                        value={values.numberOfPassengers || ""}
                        onChange={handleChange}/>
                    </label>
                    <br></br>
                    <div>Are you willing to pick others up at their desired location?</div>
                    <label htmlFor='pickingUp'>
                        <input 
                        type='radio'
                        name='pickingUpSelection'
                        id='pickingUp'
                        value="pickingUp"
                        checked={values.pickingUpSelection === "pickingUp"}
                        onChange={handleChange}/>
                        I can pick people up
                    </label>
                    <br></br>
                    <label htmlFor='notPickingUp'>
                        <input 
                        type='radio'
                        name='pickingUpSelection'
                        id='notPickingUp'
                        value="notPickingUp"
                        checked={values.pickingUpSelection === "notPickingUp"}
                        onChange={handleChange}/>
                        People should meet me at my location
                    </label>
                    <br></br>
                    <label htmlFor='notes'>
                        Anything else your passengers should know?:
                        <br></br>
                        <input 
                        type='text'
                        name='notes'
                        id='notes'
                        value={values.notes}
                        onChange={handleChange}/>
                    </label>
                    <br></br>
                    <button onClick={handleSubmit}>Submit</button>
                </form>
                
            </div>
        </div>
    )
}

function SingleDriver(props){
    const [passengers, setPassengers] = useState(props.driver.passengers);

    const {
        departureLocation,
        pickingUpSelection,
        notes,
        name,} = props.driver
    
    const {tripId,
        username,
        updateDrivers,
        participants,
        updatePartipants } = props

    const driverId = props.driver._id;




    useEffect( () => {
        setPassengers(props.driver.passengers);
    }, [props]);

    const addPassenger = (passengerIndex) => {
        console.log("Adding passenger #", passengerIndex, " to driver:", name);
        //send trip Id from driver and passenger Index
        axiosInstance.post("/passenger/" + driverId, {tripId:tripId, passengerIndex: passengerIndex})
         .then( res =>{
            if(res.data.error){
                console.log(res.data.error);
            }else{
                //recieve {driver:...,participant:...}
                console.log("Passenger add was a success!", res.data.driver.passengers);
                //setPassengers(res.data.driver.passengers);
                //update the participants list:
                let newParticipants = [...participants];
                newParticipants.forEach(party => {
                    if(party.name === res.data.participant.name){
                        party.status = "passenger";
                        party.driverId = res.data.driver._id;
                    }
                });
                updatePartipants(newParticipants);
                updateDrivers();
            }
         })
    }

    const removePassenger = (passengerIndex) => {
        console.log("Removing passenger #", passengerIndex, " to driver:", name);
        axiosInstance.post("/removePassenger/" + driverId, {tripId:tripId, passengerIndex: passengerIndex})
         .then( res => {
            if(res.data.error){
                console.log(res.data.error);
            }else{
                console.log("Successfull passenger removal! ", res.data.driver);
                //update the participants list:
                let newParticipants = [...participants];
                newParticipants.forEach(party => {
                    if(party.name === res.data.participant.name){
                        party.status = null;
                        party.driverId = null;
                    }
                });
                updatePartipants(newParticipants);
                updateDrivers();
            }
         })
    }



    //!! add buttons and functions to remove driver and passengers
    return(
        <div className="singleDriverWrapper">
            <div className='singleDriverHeader'>
                <div className='sdhSide'></div>
                <h2 className='sdhCenter'>{name}</h2>
                <div className='sdhSide'>{name === username ?
                 (<button onClick={() => props.removeDriver()}>Stop Driving</button>) :
                  ""}</div>
            </div>
            <div className='singleDriverBody'>
            <div>Leaving from: {departureLocation}</div>
            <div>
                {!passengers ? "Not taking Passengers" :
                pickingUpSelection==="pickingUp" ?
                "Will pick you up at your location" :
                "You will need to meet them at their location"}
            </div>
            <div>Notes: {notes}</div>
            </div>
            <div className='singleDriverSeats'>
                {//an array of numbers 0 => # of passengers
                    (passengers ? Object.keys(passengers) : []).sort().map( (index) => {
                        if(passengers[index]){
                            return(
                                <div className='singleSeatTaken' key={index}>
                                    <div className='seatName'>
                                    {passengers[index]}
                                    </div>
                                    {passengers[index] === username ?
                                    (<button onClick={() => removePassenger(index)}>X</button>) :
                                    ""}
                                </div>
                                )
                        }else{
                            return(
                                <button 
                                className='singleSeatEmpty' 
                                key={index} 
                                onClick={() => addPassenger(index)}>
                                    Ride with {name}
                                </button>
                            )
                        }
                    })
                }
            </div>
        </div>
    )
}

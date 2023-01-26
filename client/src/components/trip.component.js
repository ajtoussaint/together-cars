import { set } from 'mongoose';
import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import axiosInstance from "../modules/axiosInstance"
import Loading from "./loading.component"


//!!use effect hook to axios call and get the trip data

export default function Trip(props){
    const params = useParams();

    //initially loading is true
    const [loading, setLoading] = useState(true);
    const [trip, setTrip] = useState(null);

    useEffect(() =>{
        console.log("getting data on trip ID:" + params.tripId);
        axiosInstance.get("/trip/" + params.tripId)
        .then( res => {
            console.log("got data on trip ID:" + params.tripId);
            console.log(res.data);
            setTrip(res.data);
            setLoading(false);
        })
    }, [params])

    const updateDrivers = (driverObject) => {
        //!! totally redo this
        console.log("ADDING DRIVER TO ARRAY",driverObject);
        //update the state to be responsive
        setTrip((trip) => ({
            ...trip,
            drivers:[...trip.drivers, driverObject],
        }));
        //post data to the db
        axiosInstance.post("/trip/" + params.tripId + "/drivers", {newDriver: driverObject})
         .then( res => {
            console.log("DB response from driver update: ", res.data);
            //if fail return a message and reload

            //if success check that state has not changed

            //if it has update/reload
            setTrip(res.data)
         })
    }

    const updatePassengers = (driverIndex , passengerIndex) =>{
        //!! 01/23/23 totally redo this
        
        //passenger name is username
        console.log("Adding passenger: " + props.username 
        + " to driver index: " + driverIndex 
        + " as passenger #" + passengerIndex)

    }
    if(!props.loggedIn){
        return(
            <Navigate to="/" replace={false} />
        )
    }else{
        if(loading){
            return(
                <Loading />
            )
        }else if(!trip){
            return(
                <h1>The trip does not exist</h1>
            )
        }else{
            //3 render options redirect, organiser, participant
            return(
                <ParticipantView
                trip={trip}
                updateDrivers={updateDrivers}
                updatePassengers={updatePassengers}
                username={props.username}/>
            )
        }
}
}

//make different components for organiser view and participant view
function OrganizerView() {
    const trip = this.props.trip;

    return (
        <div>
            <h1>{trip.title}</h1>
            <p>by:{trip.organizer}</p>
            <p>{trip.description}</p>
            <h2>Participants:</h2>
            {trip.participants.map((party,i) => {
            return(
                <li key={i}>
                    {party}
                </li>
            )})}
         </div>
    )
}

function ParticipantView(props){
    const trip = props.trip;
    const username = props.username;

    //const [driverFormVisible, setDriverFormVisible] = useState(false);

    return (
        <div>
            <h1>{trip.title}</h1>
            <p>Destination: {trip.destination}</p>
            <p>by:{trip.organizer}</p>
            <p>Target Arrival Time: {trip.arrivalTime}</p>
            <p>Description: {trip.description}</p>
            <Participants tripId={trip._id}/>
            <Drivers tripId={trip._id} username={username}/>
         </div>
    )
}

function Participants(props){
    //expect props to contain trip id
    const [participantArray, setPartArr] = useState([]);
    const [loading, setLoading] = useState(true);
    //declare this so it causes an error if I don't give it 
    const tripId = props.tripId;
    //use effect to get all of the participants as an array by searching the tripId field
    useEffect(() => {
        console.log("getting participants for trip:", tripId);
        axiosInstance.get("/participants/"+tripId)
         .then( res => {
            //response will be an array of all the participant objects
            console.log("got the participants: " + res.data);
            setPartArr(res.data);
            setLoading(false);
         })
    }, [tripId]);
    //return all of the participants and their status
    if(loading){
        return(
            <Loading />
        )
    }else{
        return(
            <div id='participantsWrapper'>
                <h2>Participants:</h2>
                <ul>
                    {participantArray.map( (party,i) => {
                        return(
                            <li key={i}>
                                <div>{party.name}</div>
                                <div>Status: {party.status || "Unassigned"}</div>
                                <div>{party.organizer && "Organizer"}</div>
                            </li>
                        )
                    })}
                </ul>
            </div>
        )
    }
}

function Drivers(props){
    const [driverFormVisible, setDriverFormVisible] = useState(false);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(false);
    //expect props to contain tripId
    const tripId = props.tripId
    const username = props.username;

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

    //display the drivers in the return
    if(loading){
        return(
            <Loading />
        )
    }else{
        //if the user is not already a driver display the driver form button
        //update the Driver Form and routes to create driver objects rather than try to add them to the trip
        return(
            <div id="driversWrapper">
                <ul>
                    {drivers.map((driver,i) => {
                            return(
                                <li key={i}>
                                    <SingleDriver
                                    driver={driver}
                                    tripId={tripId}
                                    username={username}
                                    />
                                </li>
                            )
                        })}
                </ul>
                
                <button onClick={() => toggleDriverForm()}>I can Drive!</button>
                {driverFormVisible && <DriverForm closeMe={() => toggleDriverForm()} tripId={tripId} refresh={() => getDrivers()}/>}

            </div> 
        )
    }
}

function DriverForm(props){
    const tripId = props.tripId;
    const refresh = props.refresh;

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
        <div id='driverFormWrapper'>
            <form>
                <h1>Driver Form</h1>
                <input type='hidden' name='name' value={props.username}/>
                <label htmlFor='departureLocation'>
                    Where are you leaving from?
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
            <button onClick={() => props.closeMe()}>close</button>
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
    
    const driverId = props.driver._id;

    const tripId = props.tripId;

    const username = props.username;

    useEffect( () => {
        setPassengers(props.driver.passengers);
    }, [props]);

    const addPassenger = (passengerIndex) => {
        //!!may need to update the passengers state before hand and rollback due to slowness
        console.log("Adding passenger #", passengerIndex, " to driver:", name);
        //send trip Id from driver and passenger Index
        axiosInstance.post("/passenger/" + driverId, {tripId:tripId, passengerIndex: passengerIndex})
         .then( res =>{
            if(res.data.error){
                console.log(res.data.error);
            }else{
                //recieve {driver:...,passenger:...}
                console.log("Passenger add was a success!", res.data.driver.passengers);
                setPassengers(res.data.driver.passengers);
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
                setPassengers(res.data.driver.passengers);
            }
         })
    }



    //!! add buttons and functions to remove driver and passengers
    return(
        <div className="singleDriverWrapper">
            <h2>Driver: {name}</h2>
            <div>Leaving from: {departureLocation}</div>
            <div>
                {pickingUpSelection==="pickingUp" ?
                "Will pick you up at your location" :
                "You will need to meet them at their location"}
            </div>
            <div>Notes: {notes}</div>
            <ul>
                {//an array of numbers 0 => # of passengers
                    Object.keys(passengers).sort().map( (index) => {
                        if(passengers[index]){
                            if(passengers[index] === username){
                                return(
                                    <li key={index}>
                                        {passengers[index]}
                                        <button onClick={() => removePassenger(index)}>Leave Driver</button>
                                    </li>)
                            }else{
                                return(
                                    <li key={index}>
                                        {passengers[index]}
                                    </li>)
                            }
                        }else{
                            return(
                                <li key={index}>
                                    <button onClick={() => addPassenger(index)}>
                                        Ride with {name}
                                    </button>
                                </li>
                            )
                        }
                    })
                }
            </ul>
        </div>
    )
}

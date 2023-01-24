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
        //!! 01/23/23 make this do the thing
        
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

    const [driverFormVisible, setDriverFormVisible] = useState(false);

    return (
        <div>
            <h1>{trip.title}</h1>
            <p>Destination: {trip.destination}</p>
            <p>by:{trip.organizer}</p>
            <p>Target Arrival Time: {trip.arrivalTime}</p>
            <p>{trip.description}</p>
            <h2>Participants:</h2>
            {trip.participants.map((party,i) => {
            return(
                <li key={i}>
                    {party.name}
                    {party.status}
                </li>
            )})}
            <div id="driverAssign">
            <h2>Drivers:</h2>
                <ul>
                    {trip.drivers.map((driver,i) => {
                        return(
                            <li key={i}>
                                <SingleDriver driver={driver} index={i} updatePassengers={props.updatePassengers}/>
                            </li>
                        )
                    })}
                    <li>
                        <button onClick={() => setDriverFormVisible(true)}>I can Drive!</button>
                    </li>
                </ul>
            </div>
            {driverFormVisible && <DriverForm closeMe={() => setDriverFormVisible(false)} updateDrivers={props.updateDrivers} username={props.username}/>}
         </div>
    )
}

function DriverForm(props){

    const [values, setValues] = useState({
        departureLocation:'',
        pickingUpSelection:"notPickingUp",
        notes:'',
        name:props.username,
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

        //!! 01/18/22 Add the driver to the array, be sure they can't drive twice
        console.log("driver form submitted", values);
        //add the passenger array to the driver object
        let passengers = []

        for(let i=0; i<values.numberOfPassengers; i++){
            passengers.push(null);
        }

        //pass the driver object up
        props.updateDrivers({
            ...values,
            passengers:passengers,
        });

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
    const {
        departureLocation,
        pickingUpSelection,
        notes,
        name,
        passengers} = props.driver

    const addPassenger = (passengerIndex) => {
        props.updatePassengers(props.index,passengerIndex)
    }




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
                {passengers.map((passenger,i) => {
                    if(passenger){
                        return(
                        <li key={i}>
                            {passenger}
                        </li>)
                    }else{
                        return(
                            <li key={i}>
                                <button onClick={() => addPassenger(i)}>
                                    Ride with {name}
                                </button>
                            </li>
                        )
                    }
                })}
            </ul>
        </div>
    )
}
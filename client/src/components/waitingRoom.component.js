import { useParams, Link, Navigate} from 'react-router-dom';
import { useEffect, useState} from 'react';
import axiosInstance from "../modules/axiosInstance"
import Loading from "./loading.component";


export default function WaitingRoom(props){
    const params = useParams();
    const tripId = params.tripId;
    const {username, handleError, loadingUser} = props;

    const [trip,setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newParty, setNewParty] = useState(false);
    const [error, setError] = useState(false)

    //wait for app.js to finish loading before this
    useEffect(() =>{
        console.log("user in waiting room is trying to join the trip!", username);
        console.log("User loading status:" , loadingUser, "User:", username);
        axiosInstance.get("/trip/" + tripId)
        .then( res => {
            setTrip(res.data);
            // Another axios call for participants here
            axiosInstance.get('/participants/' + tripId)
             .then( partyRes => {
                //array of all participant objects
                const participantNames = partyRes.data.map(i => i.name);
                console.log("waiting room found existing participants:", participantNames);
                if(participantNames.indexOf(username) < 0 && username){
                    //display the new user before the DB adds them
                    //update the Database
                    console.log("Adding participant for", username)
                    axiosInstance.post("/addParticipant/" + tripId, {name:username})
                     .then(res => {
                        console.log("Created new participant: ", res.data);
                        setNewParty(true);
                        setLoading(false);
                     }).catch(err => {
                        setError(true);
                     })

                }else{
                    if(!loadingUser){
                        setLoading(false);
                    }
                }
                
             }).catch( err => {
                //handle error is written out to avoid using callback
                console.log("Waiting Room component handled an error!");
                handleError({text:null,link:'/'});
                setError(true);
            })
            
        }).catch( err => {
            console.log("Waiting Room component handled an error!");
            handleError({text:null,link:'/'});
            setError(true);
        })
    }, [params, username, tripId, setError, handleError, loadingUser])

    if(loading || loadingUser){
        return(
            <Loading />
        )
    }else if(error){
        return(
            <Navigate to='/error' replace={false} />
        )
    }else{
        return(
            <div id='waitingRoomWrapper'>
                <h1>{newParty ?
                 "You have been added to" :
                  "You are already a part of"} the following Trip. Click on it to view details.</h1>
                    <Link to={'/trips/' + tripId}>
                        <div className='tripContainer'>
                            <h2>{trip.title}</h2>
                            <p>Trip Description: {trip.description}</p>
                            <p>Planned Arrival Time: {trip.arrivalTime.slice(11,16) + " on "}
                                {trip.arrivalTime.slice(0,10)}</p>
                        </div>
                        <br></br>
                    </Link>
            </div>
        )
    }
}
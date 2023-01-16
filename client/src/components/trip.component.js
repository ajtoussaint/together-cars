import { useParams } from 'react-router-dom';
import axiosInstance from "../modules/axiosInstance"

//!!use effect hook to axios call and get the trip data

export default function Trip(){
    const params = useParams();
    return(
        <div>
            <h1>Single Trip</h1>
            <p> Trip ID: {params.tripId}</p>
        </div>
    )
}

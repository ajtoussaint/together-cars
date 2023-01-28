import React, { Component, useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import axiosInstance from "../modules/axiosInstance";
import Loading from "./loading.component";


//This will be the "My Trips Component"
export default class Home extends Component{
    constructor(props){
        super(props);

        this.state={
            username:"",
            password:"",
            loading:true,
            trips:[]
        }

        this.getUsersTrips = this.getUsersTrips.bind(this);
    }

    componentDidMount(){
        this.getUsersTrips();
    }

    componentDidUpdate(prevProps){
        if(prevProps.username !== this.props.username){
            console.log("getting trips for newly updated user");
            this.getUsersTrips();
        }
    }

    getUsersTrips(){
        //only get the trips if there is a user
        if(this.props.username){
            console.log("getting user's trips...");
            axiosInstance.get('trips/' + this.props.username)
            .then( res => {
                console.log("got the user's trip data");
                console.log(res.data);
    
                //let state know that it has the data
                this.setState({
                    loading:false,
                    trips: res.data.userTrips
                })
            })
        }
    }

    //Wait until app is done loading to render here
    render(){
        if(this.props.loadingUser){
            return(<Loading />)
        }else{
            if(this.props.loggedIn){
                return(
                    <div id="homeComponentWrapper">
                        <h1>Welcome to Together Cars, {this.props.username}!</h1>
                        <ParticipatingTrips
                        username={this.props.username}/>
                    </div>
                )
            }else{
                return(
                    <div id="homeComponentWrapper"> 
                        <Login updateUser={this.props.updateUser}/>
                        <Register updateUser={this.props.updateUser}/>
                    </div>
                )
            }
        }
    }
}

class Login extends Component{
    constructor(props){
        super(props);

        this.state={
            username:"",
            password:""
        }

        this.handleLogin = this.handleLogin.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e){
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    handleLogin(e){
        e.preventDefault();
        console.log("Handling login...");
        axiosInstance.post("login", {
            username: this.state.username,
            password: this.state.password
        })
        .then(res => {
            //res .data contains the response of the "/login" post route
            console.log("login res: " + JSON.stringify(res.data));
            if (res.status === 200){
                //Pass a function from App.js into here so that the higher level state can be updated
                this.props.updateUser(res.data.username);
            }
        })
    }

    render(){
        return(
            <div>
                <h1>Login</h1>
                <form>
                    <label htmlFor='username'>
                        Username:
                        <input 
                         type='text'
                         name='username'
                         id='usernameLogin'
                         value={this.state.username}
                         onChange={this.handleChange}/>
                    </label>
                    <br></br>
                    <label htmlFor='password'>
                        Password:
                        <input 
                         type='password'
                         name='password'
                         id='passwordLogin'
                         value={this.state.password}
                         onChange={this.handleChange}/>
                    </label>
                    <br></br>
                    <button type='submit' onClick={this.handleLogin}>Login</button>
                </form>
            </div>
        )
    }
}

class Register extends Component{
    constructor(props){
        super(props);

        this.state={
            username:"",
            password:"",
            confirmPassword:""
        }

        this.handleRegister = this.handleRegister.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e){
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    handleRegister(e){
        e.preventDefault();
        console.log("Handling Register...");
        axiosInstance.post("register", {
            username: this.state.username,
            password: this.state.password,
            confirmPassword:this.state.confirmPassword
        })
        .then( res => {
            if(res.status === 200){
                //work like login
                console.log("Register Response:", res.data);
                this.props.updateUser(res.data.username);
            }
        })
    }

    render(){
        return(
            <div>
                <h1>Register</h1>
                <form>
                    <label htmlFor='username'>
                        Username:
                        <input 
                         type='text'
                         name='username'
                         id='usernameRegister'
                         value={this.state.username}
                         onChange={this.handleChange}/>
                    </label>
                    <br></br>
                    <label htmlFor='password'>
                        Password:
                        <input 
                         type='password'
                         name='password'
                         id='passwordRegister'
                         value={this.state.password}
                         onChange={this.handleChange}/>
                    </label>
                    <br></br>
                    <label htmlFor='confirmPassword'>
                        Confirm Password:
                        <input 
                         type='password'
                         name='confirmPassword'
                         id='confirmPassword'
                         value={this.state.confirmPassword}
                         onChange={this.handleChange}/>
                    </label>
                    <br></br>
                    <button type='submit' onClick={this.handleRegister}>Register</button>
                </form>
            </div>
        )
    }
}


function ParticipatingTrips(props){
    const [loading,setLoading] = useState(true);
    const [trips,setTrips] = useState([]);

    useEffect(() => {
        //will run whenever username is changed
        console.log("getting data for participant trips");
        axiosInstance.get("/participantTrips")
         .then( res => {
            console.log("got the participant trip data");
            setTrips(res.data);
            setLoading(false);
         })
    }, [props.username])



    if(loading){
        return(<Loading />)
    }else{
        //!!if user is organizer change appearance somehow
        return(
            <div id="participatingTripsWrapper">
                <h2>Your Trips:</h2>
                {trips.length < 1 ? (<h2>No trips to display</h2>) : 
                trips.map( (trip, i) => (
                        <div className='tripContainer' key={i}>
                            <h2>{trip.title}</h2>
                            <p>{trip.description}</p>
                            <p>{trip.arrivalTime}</p>
                            <Link to={"/trips/" + trip._id}>View Trip</Link>
                        </div>
                    ))}
            </div>
        )
    }
}

import './App.css';
import React, { Component } from 'react';
import { Routes, Route, Link, Outlet, redirect} from "react-router-dom";
import axiosInstance from "./modules/axiosInstance";
import Home from "./components/home.component";
import CreateTrip from './components/create-trip.component';
import Trip from './components/trip.component';
import Error from './components/error.component';
import WaitingRoom from './components/waitingRoom.component';
import Demo from './components/demo.component';



export default class App extends Component {
  constructor(props){
    super(props);
    this.state={
      loggedIn: false,
      loading: true,
      username: null,
      error: {text:null, link:null}
    }

    this.updateUser = this.updateUser.bind(this);
    this.getCurrentUser = this.getCurrentUser.bind(this);
    this.setError = this.setError.bind(this);
  }

  updateUser( username ){
    console.log("Updating User")
    if( username ){
      console.log("state recognizes " + username);
      this.setState( state => ({
        loggedIn: true,
        username: username
      }));
    }else{
      console.log("setting to no user logged in")
      this.setState({
        loggedIn: false,
        username: null
      });
    }
    
  }


  componentDidMount(){
    this.getCurrentUser();
  }

  getCurrentUser(){
    console.log("getting current user...");
    //a note. Proxy in package.js appears to be the default route for axios
    axiosInstance.get('user')
    .then( res => {
      console.log("get current user response: ");
      console.log(res.data);
      //returns user object under res.data.user if a user has an open session
      //otherwise res.data.user is returned as null
      //user object contains everything in the model (username,id)
      if(res.data.user){
        console.log("Got user: " , res.data.user);
        this.setState({
          loggedIn: true,
          loading: false,
          username: res.data.user.username
        })
      }else{
        console.log("no current user");
        this.setState({
          loggedIn: false,
          loading: false,
          username: null
        })
      }
        

    }).catch(error => {
      console.log("Error! ", error);
      this.setState({
        loggedIn: false,
        loading: false,
        username: null
      });
    })
  }

  setError(errorObj){
    console.log("Setting error", errorObj);
    this.setState({
      error:errorObj
    });
  }


  render(){
    return (
      <div id="appWrapper">
       
        <Routes>
          <Route path="/" element={<Navbar 
          loggedIn={this.state.loggedIn} 
          updateUser={this.updateUser}
          username={this.state.username}
          loading={this.state.loading}/>}>

            <Route index element={<Home
            updateUser={this.updateUser}
            loggedIn={this.state.loggedIn}
            username={this.state.username}
            loadingUser={this.state.loading}
            setError={(errorObj)=>this.setError(errorObj)}/>} />

            <Route path="/createTrip" element={<CreateTrip
            loggedIn={this.state.loggedIn}
            loading={this.state.loading} 
            setError={(errorObj)=>this.setError(errorObj)}/>} />

            <Route path="trips/:tripId" element={<Trip
            loggedIn={this.state.loggedIn}
            username={this.state.username}
            setError={(errorObj)=>this.setError(errorObj)}/>}/>

            <Route path="/join/:tripId" element={<WaitingRoom
            username={this.state.username}
            handleError={(errorObj)=>this.setError(errorObj)}
            loadingUser={this.state.loading}/>}/>

            <Route path="/error" element={<Error
             text={this.state.error.text}
             link={this.state.error.link}
             setError={(errorObj)=>this.setError(errorObj)}/>}/>

             <Route path="/demo" element={<Demo />} />
          </Route>
        </Routes>
      </div>
    );
  }
}


class Navbar extends Component{
  constructor(props){
    super(props);

    this.logoutUser = this.logoutUser.bind(this);
  }

  logoutUser(){
    console.log("Logout button pressed");
    axiosInstance.get("logout")
    .then( res => {
      console.log("Logout Res: ", res);
      this.props.updateUser(null);
      return redirect(res.data.redirect);
    }).catch(error => {
      console.log("There was an error loggin out: ", error);
    })
  }

  render(){
    return(
      <div id="navbarTotalWrapper">
        <div id="navbarWrapper">
          <div id="leftNavbar" className='navbarSection'>
            {this.props.loggedIn &&(
              <Link to="/" className='navbarLink'>
                  Your Trips
              </Link>)}
              {this.props.loggedIn &&(
              <Link to="/createTrip" className='navbarLink'>
                Create a Trip
              </Link>)}
          </div>
          <div id="centerNavbar" className='navbarSection'>
            <h1>Together Cars</h1>
          </div>
          <div id="rightNavbar" className='navbarSection'>
          <Link to="/demo" className='navbarLink'>
                How to use
              </Link>
            {this.props.loggedIn && (
              <div id="rightNavInnerWrap">
                <h2>{this.props.username}</h2>
                <button onClick={this.logoutUser}>Logout</button>
              </div>
            )}
          </div>
        </div>
        <Outlet />
        <div id='footer'>by Andrew Toussaint</div>
      </div>
    );
  }
}



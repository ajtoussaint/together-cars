import './App.css';
import React, { Component } from 'react';
import { Routes, Route, Link, Outlet, redirect} from "react-router-dom";
import axiosInstance from "./modules/axiosInstance";
import Red from "./components/red-test.component";
import Blue from './components/blue-test.component';
import Home from "./components/home.component";
import CreateTrip from './components/create-trip.component';
import Trip from './components/trip.component';



export default class App extends Component {
  constructor(props){
    super(props);
    this.state={
      loggedIn: false,
      loading: true,
      username: null
    }

    this.updateUser = this.updateUser.bind(this);
    this.getCurrentUser = this.getCurrentUser.bind(this);
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
        

    })
  }

  //!!polish: return secure pages only if the user is logged in
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
            loadingUser={this.state.loading}/>} />

            <Route path="/createTrip" element={<CreateTrip
            loggedIn={this.state.loggedIn}
            loading={this.state.loading} />} />

            <Route path="trips/:tripId" element={<Trip
            loggedIn={this.state.loggedIn}
            username={this.state.username}/>}/>

            <Route path="/red" element={<Red
             user={this.state.username}
              loggedIn={this.state.loggedIn}/>} />

            <Route path="/blue" element={<Blue />} />
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
    })
  }

  render(){
    //Nothing in the navbar will require loading in final product, just testing
    return(
      <div id="navbarTotalWrapper">
        <div id="navbarWrapper">
        <h1>
          { this.props.loading ? "Loading..." : this.props.username || "No User Currently Logged In" }
        </h1>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/createTrip">Create a Trip</Link>
            </li>
            <li>
              {this.props.loggedIn && <button onClick={this.logoutUser}>Logout</button>}
            </li>
          </ul>
        </div>
        <Outlet />
      </div>
    );
  }
}



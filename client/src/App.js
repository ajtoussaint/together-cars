import './App.css';
import React, { Component } from 'react';
import { Routes, Route, Link, Outlet, redirect} from "react-router-dom";
import axios from 'axios';

import Red from "./components/red-test.component";
import Blue from './components/blue-test.component';
import Home from "./components/home.component";

//axios setup
const axiosInstance = axios.create({
  withCredentials: true,
  baseURL: "http://localhost:5000/"
})


export default class App extends Component {
  constructor(props){
    super(props);
    this.state={
      loggedIn: false,
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
          username: res.data.user.username
        })
      }else{
        console.log("no current user");
        this.setState({
          loggedIn: false,
          username: null
        })
      }
        

    })
  }

  //!!polish: show a loading page until it is determined if a session is open or not
  render(){
    return (
      <div>
        <h1>
          { this.state.username || "No User Currently Logged In" }
        </h1>
        <Routes>
          <Route path="/" element={<Navbar 
          loggedIn={this.state.loggedIn} 
          updateUser={this.updateUser}/>}>
            <Route index element={<Home updateUser={this.updateUser}/>} />
            <Route path="/red" element={<Red user={this.state.username} loggedIn={this.state.loggedIn}/>} />
            <Route path="/blue" element={<Blue />} />
          </Route>
        </Routes>
      </div>
    );
  }
}

//logout here needs to be a button that sends a get to "/logout" 
//!!01/10/23 and then updates the state to be false and null
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
    return(
      <div>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/red">Red</Link>
          </li>
          <li>
            <Link to="/blue">Blue</Link>
          </li>
          <li>
            {this.props.loggedIn && <button onClick={this.logoutUser}>Logout</button>}
          </li>
        </ul>
        <Outlet />
      </div>
    );
  }
}

import './App.css';
import React, { Component } from 'react';
import { Routes, Route, Link, Outlet} from "react-router-dom";
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
    this.logout = this.logout.bind(this);
  }

  updateUser( username ){
    console.log("Updating User")
    this.setState( state => ({
      loggedIn: true,
      username: username
    }));
  }

  logout(){
    console.log("Loggin out app state")
    this.setState({
      loggedIn: false,
      username: null
    })
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
      if(res.data.user){
        console.log("Got user: " , res.data.user);
        this.setState({
          loggedIn: true,
          username: res.data.user
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

  render(){
    return (
      <div>
        <h1>
          { this.state.username || "Testing..." }
        </h1>
        <Routes>
          <Route path="/" element={<Navbar loggedIn={this.state.loggedIn} logout={this.logout}/>}>
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
//01/10/23 and then updates the state to be false and null
class Navbar extends Component{
  constructor(props){
    super(props);

    this.logoutUser = this.logoutUser.bind(this);
  }

  logoutUser(){
    console.log("Logout button pressed");
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
            {this.props.loggedIn && <Link to="/logout">Logout</Link>}
          </li>
        </ul>
        <Outlet />
      </div>
    );
  }
}

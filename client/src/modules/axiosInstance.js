//const axios = require("axios");
import axios from "axios";

export default axios.create({
    withCredentials: true,
    baseURL: process.env.NODE_ENV === 'production' ?
    "http://ec2-18-116-234-49.us-east-2.compute.amazonaws.com:5000":
    "http://localhost:5000/" 

  })


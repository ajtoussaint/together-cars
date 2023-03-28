//const axios = require("axios");
import axios from "axios";

export default axios.create({
    withCredentials: true,
    baseURL: process.env.NODE_ENV === 'production' ?
    "https://togethercars.dev/api":
    "http://localhost:5000/" 

  })


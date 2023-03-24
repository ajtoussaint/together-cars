//const axios = require("axios");
import axios from "axios";

export default axios.create({
    withCredentials: true,
    baseURL: process.env.NODE_ENV === 'production' ?
    "http://3.132.211.26:5000":
    "http://localhost:5000/" 

  })


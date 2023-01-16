//const axios = require("axios");
import axios from "axios";

export default axios.create({
    withCredentials: true,
    baseURL: "http://localhost:5000/"
  })

  //this is not exporting what I think it is
//export default axiosInstance;
import axios from "axios";

const api = axios.create({
  baseURL: `https://9570bkhayd.execute-api.us-east-1.amazonaws.com/dev`,
});

export default api;

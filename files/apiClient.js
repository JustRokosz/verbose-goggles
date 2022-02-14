import axios from "axios";
import batchInterceptor from "./interceptor.js";
const client = () => {
  const config = {
    host:  'https://europe-west1-quickstart-1573558070219.cloudfunctions.net',
    baseURL: 'https://europe-west1-quickstart-1573558070219.cloudfunctions.net',
    headers: { },
    delayed: true,
  };
  
  const instance = axios.create(config);
  
  batchInterceptor(instance);
  return instance;
};
  
export default client;

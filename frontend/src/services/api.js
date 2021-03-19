import axios from 'axios';
import { base_url } from '../config/api_links';

const api = axios.create({
  baseURL: base_url,
})

export default api;
import axios from 'axios';

const API_URL = 'http://localhost:7096/Point';

export const getData = () => axios.get(`${API_URL}/GetAll`);
export const addData = (data) => axios.post(`${API_URL}/Add`, data);
export const updateLocation = (data) => axios.put(`${API_URL}/Update/${data.id}`, data);
export const deleteLocation = (id) => axios.delete(`${API_URL}/Delete/${id}`);
export const getOptimizedPoints = (polygonWkt, minCoverCount = 5) =>
    axios.post(
        `http://localhost:7096/api/TrashBin/optimize?cellSize=0.0009&newBinCount=${minCoverCount}&minDistance=0.00027`,
        JSON.stringify(polygonWkt),
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
export const addRange = (points) =>
    axios.post(`${API_URL}/AddRange/range`, points, {
        headers: {
            'Content-Type': 'application/json'
        }
    });

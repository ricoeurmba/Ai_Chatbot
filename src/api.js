    // src/api.js
    import axios from "axios";
    const API_URL = "http://localhost:5001";

    export const loginRequest = (username, password) =>
      axios.post(`${API_URL}/auth/login`, { username, password });

    export const registerRequest = (data) =>
      axios.post(`${API_URL}/auth/register`, data);



    export const sendMessageRequest = (message) =>
      axios.post(`${API_URL}/chat`, { message });

    export const deleteUser = (email) =>
      axios.delete(`${API_URL}/admin/users/${encodeURIComponent(email)}`, {
        headers: {
          Authorization: sessionStorage.getItem("authToken")
        }
      });
    export const addUser = (data) =>
      axios.post(`${API_URL}/admin/users`, data, {
        headers: {
          Authorization: sessionStorage.getItem("authToken")
        }
      });
      export const searchUsers = async (query, token) => {
      const response = await axios.get(
        `http://localhost:5001/admin/users/search/${query}`,
        {
          headers: { Authorization: token }
        }
      );
      return response.data;
    };

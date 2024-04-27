import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState(""); // Initialize message state

  useEffect(() => {
    axios
      .get("http://localhost:3001/authToken", {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data?.valid) {
          setMessage(res.data.message);
        } else {
          navigate("/login");
        }
      })
      .catch((err) => console.error(err));
  }, []); // Add an empty dependency array to run the effect only once

  return <div>Dashboard {message}</div>;
};

export default Dashboard;

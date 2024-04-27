import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [registerData, setRegisterData] = useState({
    name: "Name",
    email: "Email",
    password: "Password",
  });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission, you can access form data from registerData state
    console.log(registerData);
    axios
      .post("http://localhost:3001/login", registerData, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data?.Login) {
          navigate("/dashboard");
        } else {
          navigate("/");
        }
      })
      .catch((err) => console.error(err));
  };

  return (
    <div>
      <div className="d-flex justify-content-center align-items-center bg-secondary vh-100">
        <div className="bg-white p-3 rounded w-25">
          <h2>Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email">
                <strong>Name</strong>
              </label>
              <input
                type="text"
                name="name"
                autoComplete="off"
                className="form-control rounded-0"
                onChange={(e) =>
                  setRegisterData({ ...registerData, name: e.target.value })
                }
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email">
                <strong>Email</strong>
              </label>
              <input
                type="email"
                name="Email"
                autoComplete="off"
                className="form-control rounded-0"
                onChange={(e) =>
                  setRegisterData({ ...registerData, email: e.target.value })
                }
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email">
                <strong>Password</strong>
              </label>
              <input
                type="password"
                name="Password"
                autoComplete="off"
                className="form-control rounded-0"
                onChange={(e) =>
                  setRegisterData({ ...registerData, password: e.target.value })
                }
              />
            </div>
            <button type="submit" className="btn btn-success w-100 rounded-0">
              Login
            </button>
          </form>
          <p>Don't Have an Account?</p>
          <button
            className="btn btn-default border w-100 rounded-0 text-decoration-none"
            href="/register"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

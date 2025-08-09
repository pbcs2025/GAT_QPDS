import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import validateLogin from "./validateLogin";
import "./Main.css";

function FacultyLogin() {
  const navigate = useNavigate();
  const initialValues = { username: "", password: "" };
  const [formValues, setFormValues] = useState(initialValues);
  const [formErrors, setFormErrors] = useState({});
  const [loginMessage, setLoginMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   const errors = validateLogin(formValues);
  //   setFormErrors(errors);

  //   if (Object.keys(errors).length === 0) {
  //     const { username, password } = formValues;
  //     if (username === "faculty" && password === "faculty123") {
  //       navigate("/faculty-dashboard");
  //     } else {
  //       setLoginMessage("❌ Invalid credentials.");
  //     }
  //   }
  // };

  const handleSubmit = async (e) => {
  e.preventDefault();
  const errors = validateLogin(formValues);
  console.log("formValues====");
  console.log(formValues);
  setFormErrors(errors);

  if (Object.keys(errors).length === 0) {
    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formValues),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("faculty_username",formValues.username);
        navigate("/faculty-dashboard");
      } else {
        setLoginMessage("❌ " + data.error);
      }
    } catch (error) {
      console.error("Login failed:", error);
      setLoginMessage("❌ Server error. Please try again later.");
    }
  }
};


  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <h1>Faculty Login</h1>
        <div className="ui form">
          <div className="field">
            <label>Username</label>
            <input type="text" name="username" value={formValues.username} onChange={handleChange} />
            <p>{formErrors.username}</p>
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" name="password" value={formValues.password} onChange={handleChange} />
            <p>{formErrors.password}</p>
          </div>
          <button className="fluid ui button blue">Login</button>
        </div>
      </form>
      {loginMessage && <div className="ui message error">{loginMessage}</div>}
      <div className="text">
        <p>Don't have an account? <Link to="/register">Register here</Link>
</p>
      </div>
    </div>
  );
}

export default FacultyLogin;

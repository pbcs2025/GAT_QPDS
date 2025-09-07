import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";   // ✅ Import axios
import validateLogin from "../../common/validateLogin";
import "../../common/Main.css";

function PaperSetterLogin() {
  const navigate = useNavigate();
  const initialValues = { username: "", password: "" };
  const [formValues, setFormValues] = useState(initialValues);
  const [formErrors, setFormErrors] = useState({});
  const [loginMessage, setLoginMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateLogin(formValues);
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      try {
        // ✅ Call backend API
        const response = await axios.post("http://localhost:5000/api/verifier/login", {
          username: formValues.username,
          password: formValues.password,
        });

        if (response.data.success) {
          setLoginMessage("✅ Login successful!");
          // redirect to dashboard with user info
          navigate("/paper-setter-dashboard", { state: { user: response.data.user } });
        } else {
          setLoginMessage("❌ " + response.data.message);
        }
      } catch (error) {
        console.error(error);
        setLoginMessage("Wrong username or password.");
      }
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <h1>Paper Setter Login</h1>
        <div className="ui form">
          <div className="field">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formValues.username}
              onChange={handleChange}
            />
            <p>{formErrors.username}</p>
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formValues.password}
              onChange={handleChange}
            />
            <p>{formErrors.password}</p>
          </div>
          <button className="fluid ui button blue">Login</button>
        </div>
      </form>
      {loginMessage && <div className="ui message error">{loginMessage}</div>}
    </div>
  );
}

export default PaperSetterLogin;

import "./App.css";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="body">
      <div className="outer-container">
        <h2>
          Welcome to Online Complaint Portal and Feedback Management System
        </h2>

        <div className="inner-container">
          <p>If you don't have an account click below!</p>
          <Link to="/signup">
            <button>Go to Signup Page</button>
          </Link>

          <p>If you already have an account click below!</p>
          <Link to="/login">
            <button>Go to Login Page</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;

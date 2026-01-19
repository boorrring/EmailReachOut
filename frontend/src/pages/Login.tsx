import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { User } from "../types/auth";
import { useAuth } from "../auth/AuthContext";
import "../styles/login.css";

interface GoogleJwtPayload {
  name: string;
  email: string;
  picture: string;
}

const Login = () => {
  const { login } = useAuth();

  return (
    <div className="loginWrap">
      <div className="card">
        <h1 className="title">Login</h1>

        <div className="googleBtnWrap">
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              if (!credentialResponse.credential) return;

              const decoded = jwtDecode<GoogleJwtPayload>(
                credentialResponse.credential
              );

              const user: User = {
                name: decoded.name,
                email: decoded.email,
                picture: decoded.picture,
              };

              login(user);
            }}
            onError={() => {
              console.log("Login failed");
            }}
          />
        </div>

        <div className="divider">or sign up through email</div>

        <input className="field" placeholder="Email ID" disabled />
        <input className="field" placeholder="Password" type="password" disabled />
        <button className="primary" type="button" disabled>
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;

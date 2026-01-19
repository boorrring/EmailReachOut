import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { User } from "./types/auth";
import { useAuth } from "./auth/AuthContext";

interface GoogleJwtPayload {
  name: string;
  email: string;
  picture: string;
}

const Login = () => {
  const { login } = useAuth();

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
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
          console.log("User stored in context:", user);
        }}
        onError={() => {
          console.log("Login failed");
        }}
      />
    </div>
  );
};

export default Login;

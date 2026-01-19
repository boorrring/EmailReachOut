import Login from "./Login";
import { useAuth } from "./auth/AuthContext";

const App = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return <Login />;
  }

  return (
    <div style={{ padding: 40 }}>
      <img src={user.picture} width={60} />
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default App;

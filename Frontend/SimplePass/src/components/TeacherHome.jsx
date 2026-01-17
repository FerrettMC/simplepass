import { logoutUser } from "../backendCalls";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../backendCalls";
import { useNavigate } from "react-router-dom";

export default function TeacherHome({ setAuthenticated }) {
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState("");
  const [welcomeMessage, setwelcomeMessage] = useState("Teacher Home Page");
  async function logout() {
    const res = await logoutUser();
    console.log(res.message);
    setAuthenticated(false);
    navigate("/login");
  }
  useEffect(() => {
    async function currentUser() {
      const currentUser = await getCurrentUser();
      setTeacher(currentUser);
      console.log(currentUser);
      setwelcomeMessage(`Hello, ${currentUser.firstName}!`);
    }
    currentUser();
  }, []);

  return (
    <div>
      <h1>{welcomeMessage}</h1>
      <button id="logoutButton" onClick={logout}>
        Log out
      </button>
    </div>
  );
}

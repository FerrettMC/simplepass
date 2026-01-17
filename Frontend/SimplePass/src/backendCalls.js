import axios from "axios";

export async function getCurrentUser() {
  try {
    const res = await axios.get("http://localhost:3000/users/current", {
      withCredentials: true,
    });
    return res.data.user;
  } catch (err) {
    console.error("Could not get current user");
    return null;
  }
}

export async function registerSchool(school) {
  try {
    const res = await axios.post(
      "http://localhost:3000/register-school",
      school,
      { withCredentials: true }
    );

    return res.data;
  } catch (err) {
    console.error("Registration error:", err);

    return null; // prevent undefined crashes
  }
}

export async function loginUser(email, password) {
  try {
    const res = await axios.post(
      "http://localhost:3000/users/login",
      { email, password },
      { withCredentials: true }
    );

    console.log(res.data.message);
    return res.data;
  } catch (err) {
    console.log(err.response.data);
    return { message: err.response.data };
  }
}

export async function loginWithGoogle(token) {
  try {
    const res = await axios.post(
      "http://localhost:3000/auth/google",
      { token },
      { withCredentials: true }
    );

    return res.data;
  } catch (err) {
    console.log(err.response?.data);
    return { message: err.response?.data };
  }
}

export async function getUsers() {
  const res = await axios.get("http://localhost:3000/users", {
    withCredentials: true,
  });
  return res.data;
}

export async function authenticateUser() {
  try {
    const res = await axios.get("http://localhost:3000/auth/me", {
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    return null;
  }
}

export async function createStudent(user) {
  try {
    const res = await axios.post("http://localhost:3000/student/create", user, {
      withCredentials: true,
    });
    console.log(res.data.message);
    return res.data;
  } catch (err) {
    console.log(err);
  }
}

export async function createTeacher(user) {
  try {
    const res = await axios.post("http://localhost:3000/teacher/create", user, {
      withCredentials: true,
    });
    console.log(res.data.message);
    return res.data;
  } catch (err) {
    console.log(err);
  }
}

export async function createPass(destination, fromTeacher, purpose) {
  try {
    if (!destination || !fromTeacher) {
      return { message: "Necessary fields not filled" };
    }

    const res = await axios.post(
      "http://localhost:3000/pass/create",
      {
        destination,
        fromTeacher,
        purpose,
      },
      {
        withCredentials: true,
      }
    );

    return res.data;
  } catch (err) {
    console.log(err);
  }
}

export async function startPass(passID) {
  try {
    const res = await axios.post(
      "http://localhost:3000/pass/start",
      { passID }, // body
      { withCredentials: true } // config
    );

    console.log(res.data.message);
    return res.data;
  } catch (err) {
    console.log(err);
  }
}

export async function endPass() {
  try {
    const res = await axios.post(
      "http://localhost:3000/pass/end",
      {},
      { withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.log(err);
  }
}

export async function cancelPass() {
  try {
    const res = await axios.post(
      "http://localhost:3000/pass/cancel",
      {},
      { withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.log(err);
  }
}

export async function getStudentTeachers() {
  try {
    const res = await axios.get("http://localhost:3000/school/teachers", {
      withCredentials: true,
    });
    console.log(res.data.teachers);
    return res.data;
  } catch (err) {
    console.log(err);
  }
}

export async function getSchoolDestinations() {
  try {
    const res = await axios.get("http://localhost:3000/school/destinations", {
      withCredentials: true,
    });
    console.log(res.data);
    return res.data;
  } catch (err) {
    console.log(err);
  }
}

export async function logoutUser() {
  try {
    const res = await axios.post(
      "http://localhost:3000/logout",
      {},
      {
        withCredentials: true,
      }
    );
    return res.data;
  } catch (err) {
    console.log(err.response.data);
  }
}

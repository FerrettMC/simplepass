import axios from "axios";

export async function getCurrentUser() {
  try {
    const res = await axios.get("http://localhost:3000/auth/me", {
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
      "http://localhost:3000/school/register",
      school,
      { withCredentials: true },
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
      "http://localhost:3000/auth/login",
      { email, password },
      { withCredentials: true },
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
      { withCredentials: true },
    );

    return res.data;
  } catch (err) {
    console.log(err.response?.data);
    return { message: err.response?.data };
  }
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
    const res = await axios.post(
      "http://localhost:3000/students/create",
      user,
      { withCredentials: true },
    );

    return {
      error: false,
      message: res.data.message,
      data: res.data,
    };
  } catch (err) {
    const msg =
      err.response?.data?.message ||
      err.response?.data ||
      err.message ||
      "Unknown error";

    return {
      error: true,
      message: msg,
    };
  }
}

export async function createTeacher(user) {
  try {
    const res = await axios.post(
      "http://localhost:3000/teachers/create",
      user,
      { withCredentials: true },
    );

    return {
      error: false,
      message: res.data.message,
      data: res.data,
    };
  } catch (err) {
    const msg =
      err.response?.data?.message ||
      err.response?.data ||
      err.message ||
      "Unknown error";

    return {
      error: true,
      message: msg,
    };
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
      },
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
      { withCredentials: true }, // config
    );

    console.log(res.data.message);
    return res.data;
  } catch (err) {
    console.log(err);
  }
}

export async function endPass(passID) {
  try {
    const res = await axios.post(
      "http://localhost:3000/pass/end",
      { passID },
      { withCredentials: true },
    );
    return res.data;
  } catch (err) {
    console.log(err);
  }
}

export async function cancelPass(passID) {
  try {
    const res = await axios.post(
      "http://localhost:3000/pass/cancel",
      { passID },
      { withCredentials: true },
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

export async function getSchool() {
  try {
    const res = await axios.get("http://localhost:3000/school/user", {
      withCredentials: true,
    });
    console.log(res.data);
    return res.data.school;
  } catch (err) {
    console.log(err);
  }
}

export async function getTeacherPasses() {
  try {
    const res = await axios.get("http://localhost:3000/teachers/passes", {
      withCredentials: true,
    });
    console.log(res.data);
    return res.data;
  } catch (err) {
    console.log(err);
  }
}

export async function addTeacherAutopassLocation({ location }) {
  try {
    const res = await axios.post(
      "http://localhost:3000/teachers/add-autopass-location",
      { location },
      { withCredentials: true },
    );
    return res.data;
  } catch (err) {
    console.log(err);
  }
}

export async function removeTeacherAutopassLocation({ location }) {
  try {
    const res = await axios.post(
      "http://localhost:3000/teachers/remove-autopass-location",
      { location },
      { withCredentials: true },
    );
    return res.data;
  } catch (err) {
    console.log(err);
  }
}

export async function logoutUser() {
  try {
    const res = await axios.post(
      "http://localhost:3000/auth/logout",
      {},
      {
        withCredentials: true,
      },
    );
    return res.data;
  } catch (err) {
    console.log(err.response.data);
  }
}

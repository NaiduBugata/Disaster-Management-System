// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import Courses from "../pages/modules/Courses"; // Ensure this path is correct
// import {
//   Container,
//   Typography,
//   Box,
//   Paper,
//   Button,
//   CircularProgress,
//   Divider,
//   Grid,
// } from "@mui/material";
// import LogoutIcon from '@mui/icons-material/Logout';

// function StudentDashboard() {
//   const { id } = useParams(); // student_id from route
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const token = localStorage.getItem("student_token");
//     if (!token) {
//       navigate("/student/login");
//       return;
//     }

//     axios
//       .get(`http://localhost:8000/students/dashboard/${id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       })
//       .then((res) => setData(res.data))
//       .catch((err) => {
//         console.error("Dashboard fetch error:", err);
//         if (err.response?.status === 401 || err.response?.status === 403) {
//           localStorage.clear();
//           navigate("/student/login");
//         }
//       })
//       .finally(() => setLoading(false));
//   }, [id, navigate]);

//   const handleLogout = () => {
//     localStorage.clear();
//     navigate("/student/login");
//   };

//   if (loading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
//         <CircularProgress />
//         <Typography sx={{ ml: 2 }}>Loading Dashboard...</Typography>
//       </Box>
//     );
//   }

//   if (!data) return <p>Could not load dashboard data.</p>;

//   return (
//     <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
//       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
//         <Typography variant="h4" component="h1">
//           Welcome, {data.student.name}!
//         </Typography>
//         <Button
//           variant="contained"
//           color="error"
//           startIcon={<LogoutIcon />}
//           onClick={handleLogout}
//         >
//           Logout
//         </Button>
//       </Box>

//       {/* Student Details */}
//       <Paper elevation={3} sx={{ p: 3, mb: 4, backgroundColor: '#f9f9f9', borderRadius: '12px' }}>
//         <Typography variant="h6" gutterBottom>
//           Your Profile
//         </Typography>
//         <Grid container spacing={2}>
//           <Grid item xs={12} sm={6}>
//             <Typography><strong>Email:</strong> {data.student.email}</Typography>
//           </Grid>
//           <Grid item xs={12} sm={6}>
//             <Typography><strong>Username:</strong> {data.student.username}</Typography>
//           </Grid>
//           <Grid item xs={12} sm={6}>
//             <Typography><strong>School:</strong> {data.school?.school_name}</Typography>
//           </Grid>
//           <Grid item xs={12} sm={6}>
//             <Typography><strong>Region:</strong> {data.stats.region_state}</Typography>
//           </Grid>
//         </Grid>
//       </Paper>

//       <Divider sx={{ mb: 4 }} />

//       {/* Courses Component */}
//       <Box>
//         <Courses studentId={id} />
//       </Box>
//     </Container>
//   );
// }

// export default StudentDashboard;
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Courses from "../pages/modules/Courses"; // Ensure this path is correct
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress,
  Divider,
} from "@mui/material";
import Grid from "@mui/material/Grid"; // ✅ Use classic Grid
import LogoutIcon from "@mui/icons-material/Logout";

function StudentDashboard() {
  const { id } = useParams(); // student_id from route
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("student_token");
    if (!token) {
      navigate("/student/login");
      return;
    }

    axios
      .get(`http://localhost:8000/students/dashboard/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error("Dashboard fetch error:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.clear();
          navigate("/student/login");
        }
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/student/login");
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading Dashboard...</Typography>
      </Box>
    );
  }

  if (!data) return <p>Could not load dashboard data.</p>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h4" component="h1">
          Welcome, {data.student.name}!
        </Typography>
        <Button
          variant="contained"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>

      {/* Student Details */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 4,
          backgroundColor: "#f9f9f9",
          borderRadius: "12px",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Your Profile
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography>
              <strong>Email:</strong> {data.student.email}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <strong>Username:</strong> {data.student.username}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <strong>School:</strong> {data.school?.school_name}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <strong>Region:</strong> {data.stats.region_state}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Divider sx={{ mb: 4 }} />

      {/* Courses Component */}
      <Box>
        <Courses studentId={id} />
      </Box>
    </Container>
  );
}

export default StudentDashboard;

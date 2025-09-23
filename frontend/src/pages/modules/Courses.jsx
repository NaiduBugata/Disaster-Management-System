// // import React, { useState, useEffect } from 'react';
// // import { getCourses } from '../../api/api';

// // import {
// //   Container,
// //   Typography,
// //   Card,
// //   CardContent,
// //   CardActions,
// //   Button,
// //   TextField,
// //   Box,
// //   CircularProgress
// // } from '@mui/material';
// // import Grid2 from '@mui/material/Unstable_Grid2'; // use Grid2 for MUI v6
// // import { Link as RouterLink } from 'react-router-dom';

// // const Courses = () => {
// //   const [courses, setCourses] = useState([]);
// //   const [filteredCourses, setFilteredCourses] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState(null);

// //   useEffect(() => {
// //     getCourses()
// //       .then(response => {
// //         setCourses(response.data);
// //         setFilteredCourses(response.data);
// //       })
// //       .catch(err => {
// //         console.error("Failed to fetch courses:", err);
// //         setError("Could not load courses. Please ensure the backend server is running.");
// //       })
// //       .finally(() => {
// //         setLoading(false);
// //       });
// //   }, []);

// //   const handleSearch = (event) => {
// //     const searchTerm = event.target.value.toLowerCase();
// //     const filtered = courses.filter(course =>
// //       course.title.toLowerCase().includes(searchTerm)
// //     );
// //     setFilteredCourses(filtered);
// //   };

// //   if (loading) {
// //     return (
// //       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
// //         <CircularProgress />
// //       </Box>
// //     );
// //   }

// //   if (error) {
// //     return <Typography color="error">{error}</Typography>;
// //   }

// //   return (
// //     <Container>
// //       <Typography variant="h4" component="h1" gutterBottom>
// //         Available Courses
// //       </Typography>
// //       <TextField
// //         label="Search Courses"
// //         variant="outlined"
// //         fullWidth
// //         onChange={handleSearch}
// //         sx={{ mb: 4 }}
// //       />
// //       <Grid2 container spacing={4}>
// //         {filteredCourses.map((course) => (
// //           <Grid2 item key={course.id} xs={12} sm={6} md={4}>
// //             <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
// //               <CardContent sx={{ flexGrow: 1 }}>
// //                 <Typography gutterBottom variant="h5" component="h2">
// //                   {course.title}
// //                 </Typography>
// //                 <Typography>
// //                   {course.description}
// //                 </Typography>
// //               </CardContent>
// //               <CardActions>
// //                 {/* Navigate to course details */}
// //                 <Button component={RouterLink} to={`/courses/${course.id}`} size="small">
// //                   View Course
// //                 </Button>
// //                 {/* Navigate to course player */}
// //                 <Button component={RouterLink} to={`/courses/${course.id}/player`} size="small">
// //                   Play Course
// //                 </Button>
// //               </CardActions>
// //             </Card>
// //           </Grid2>
// //         ))}
// //       </Grid2>
// //     </Container>
// //   );
// // };

// // export default Courses;
// import React, { useState, useEffect } from 'react';
// import { getCourses } from '../../api/api';
// import {
//   Container,
//   Typography,
//   Card,
//   CardContent,
//   CardActions,
//   Button,
//   TextField,
//   Box,
//   CircularProgress,
//   Grid
// } from '@mui/material';
// import { Link as RouterLink } from 'react-router-dom';

// const Courses = () => {
//   const [courses, setCourses] = useState([]);
//   const [filteredCourses, setFilteredCourses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     getCourses()
//       .then(response => {
//         setCourses(response.data);
//         setFilteredCourses(response.data);
//       })
//       .catch(err => {
//         console.error("Failed to fetch courses:", err);
//         setError("Could not load courses. Please ensure the backend server is running.");
//       })
//       .finally(() => setLoading(false));
//   }, []);

//   const handleSearch = (event) => {
//     const searchTerm = event.target.value.toLowerCase();
//     const filtered = courses.filter(course =>
//       course.title.toLowerCase().includes(searchTerm)
//     );
//     setFilteredCourses(filtered);
//   };

//   if (loading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   if (error) {
//     return <Typography color="error">{error}</Typography>;
//   }

//   return (
//     <Container>
//       <Typography variant="h4" component="h1" gutterBottom>
//         Available Courses
//       </Typography>
//       <TextField
//         label="Search Courses"
//         variant="outlined"
//         fullWidth
//         onChange={handleSearch}
//         sx={{ mb: 4 }}
//       />
//       <Grid container spacing={4}>
//         {filteredCourses.map((course) => (
//           <Grid item key={course.id} xs={12} sm={6} md={4}>
//             <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
//               <CardContent sx={{ flexGrow: 1 }}>
//                 <Typography gutterBottom variant="h5" component="h2">
//                   {course.title}
//                 </Typography>
//                 <Typography>
//                   {course.description}
//                 </Typography>
//               </CardContent>
//               <CardActions>
//                 <Button component={RouterLink} to={`/courses/${course.id}`} size="small">
//                   View Course
//                 </Button>
//                 <Button component={RouterLink} to={`/courses/${course.id}/player`} size="small">
//                   Play Course
//                 </Button>
//               </CardActions>
//             </Card>
//           </Grid>
//         ))}
//       </Grid>
//     </Container>
//   );
// };

// export default Courses;
import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Box, CircularProgress, Alert, Grid } from '@mui/material';
import CourseCard from '../../components/CourseCard';
import { getCourses } from '../../api/api';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCourses()
      .then(response => {
        setCourses(response.data);
        setFilteredCourses(response.data);
      })
      .catch(err => {
        console.error("Failed to fetch courses:", err);
        setError("Could not load courses. Ensure the backend server is running.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (event) => {
    const searchTerm = event.target.value.toLowerCase();
    setFilteredCourses(
      courses.filter(course => course.title.toLowerCase().includes(searchTerm))
    );
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!filteredCourses.length) return <Alert severity="info">No courses found.</Alert>;

  return (
    <Container sx={{ mt: 3 }}>
      <Typography variant="h4" gutterBottom>Available Courses</Typography>
      <TextField
        label="Search Courses"
        variant="outlined"
        fullWidth
        sx={{ mb: 3 }}
        onChange={handleSearch}
      />
      <Grid container spacing={2}>
        {filteredCourses.map(course => (
          <Grid item xs={12} sm={6} md={4} key={course.id}>
            <CourseCard course={course} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Courses;

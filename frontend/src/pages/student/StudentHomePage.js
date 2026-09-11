// Student Home Page with Academic Alerts and Upcoming Classes
import React, { useEffect, useState } from 'react';
import { Container, Grid, Paper, Typography, Box, Alert, AlertTitle, CircularProgress } from '@mui/material';

import { useDispatch, useSelector } from 'react-redux';
import { calculateOverallAttendancePercentage } from '../../components/attendanceCalculator';
import CustomPieChart from '../../components/CustomPieChart';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import styled from 'styled-components';
import { calculateGpa } from '../../utils/calculateGpa';
import SeeNotice from '../../components/SeeNotice';
import CountUp from 'react-countup';
import Subject from "../../assets/subjects.svg";
import Assignment from "../../assets/assignment.svg";
import { getSubjectList } from '../../redux/sclassRelated/sclassHandle';
import { calculateAttendanceSummary } from '../../utils/calculateAttendance';
import { getUpcomingClasses } from '../../utils/getUpcomingClasses';
import { getAcademicAlerts } from '../../utils/getAcademicAlerts';

const StudentHomePage = () => {
  const dispatch = useDispatch();
  const { userDetails, currentUser, loading, response } = useSelector(state => state.user);
  const { subjectsList } = useSelector(state => state.sclass);

  const [subjectAttendance, setSubjectAttendance] = useState([]);

  // Fetch user details and subjects when component mounts / dependencies change
  useEffect(() => {
    if (currentUser && currentUser._id) {
      dispatch(getUserDetails(currentUser._id, "Student"));
    }
    if (currentUser && currentUser.sclassName && currentUser.sclassName._id) {
      dispatch(getSubjectList(currentUser.sclassName._id, "ClassSubjects"));
    }
  }, [dispatch, currentUser]);

  // Populate attendance array when userDetails are loaded
  useEffect(() => {
    if (userDetails && Array.isArray(userDetails.attendance)) {
      setSubjectAttendance(userDetails.attendance);
    }
  }, [userDetails]);

  const numberOfSubjects = subjectsList?.length || 0;
  const [gpa, setGpa] = useState(null);

  useEffect(() => {
    if (userDetails) {
      const val = calculateGpa(userDetails.examResult);
      setGpa(val);
    }
  }, [userDetails]);

  const overallAttendancePercentage = calculateOverallAttendancePercentage(subjectAttendance);
  const overallAbsentPercentage = 100 - overallAttendancePercentage;
  const attendanceSummary = calculateAttendanceSummary(userDetails?.attendance);
  const chartData = [
    { name: 'Present', value: overallAttendancePercentage },
    { name: 'Absent', value: overallAbsentPercentage },
  ];

  // Compute upcoming classes and academic alerts using existing utilities
  const upcomingClasses = getUpcomingClasses(subjectsList || []);
  const academicAlerts = getAcademicAlerts(userDetails || {});

  return (
    <>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Academic Alerts Card */}
          <Grid item xs={12} md={4} lg={3}>
            <StyledPaper>
              <Typography variant="subtitle1" component="p">Academic Alerts</Typography>
              {academicAlerts && academicAlerts.length > 0 ? (
                academicAlerts.map((alert, idx) => (
                  <Alert key={idx} severity={alert.type} sx={{ mt: 1 }}>
                    <AlertTitle>{alert.title}</AlertTitle>
                    {alert.message}
                  </Alert>
                ))
              ) : (
                <Typography variant="subtitle2" component="p">No academic alerts</Typography>
              )}
            </StyledPaper>
          </Grid>
          {/* Total Courses Card */}
          <Grid item xs={12} md={3} lg={3}>
            <StyledPaper>
              <img src={Subject} alt="Courses" />
              <Title>Total Courses</Title>
              <Data start={0} end={numberOfSubjects} duration={2.5} />
            </StyledPaper>
          </Grid>
          {/* Total Assignments Card */}
          <Grid item xs={12} md={3} lg={3}>
            <StyledPaper>
              <img src={Assignment} alt="Assignments" />
              <Title>Total Assignments</Title>
              <Data start={0} end={15} duration={4} />
            </StyledPaper>
          </Grid>
          {/* Academic Info Card */}
          <Grid item xs={12} md={4} lg={3}>
            <StyledPaper>
              <Typography variant="subtitle1" component="p">Academic Info</Typography>
              <Typography variant="subtitle2" component="p">Department: {currentUser?.department ?? 'Not Set'}</Typography>
              <Typography variant="subtitle2" component="p">Semester: {currentUser?.semester ?? 'Not Set'}</Typography>
              <Typography variant="subtitle2" component="p">Section: {currentUser?.sclassName?.sclassName ?? ''}</Typography>
              <Typography variant="subtitle2" component="p">GPA: {gpa !== null ? gpa : 'Not Available'}</Typography>
            </StyledPaper>
          </Grid>
          {/* Attendance Summary Card */}
          <Grid item xs={12} md={4} lg={3}>
            <StyledPaper>
              <Typography variant="subtitle1" component="p">Attendance Summary</Typography>
              {attendanceSummary ? (
                <>
                  <Typography variant="subtitle2" component="p">Present: {attendanceSummary.present}</Typography>
                  <Typography variant="subtitle2" component="p">Total: {attendanceSummary.total}</Typography>
                  <Typography variant="subtitle2" component="p">Percentage: {attendanceSummary.percentage}%</Typography>
                  {attendanceSummary.status === 'Low Attendance' && (
                    <Typography variant="body2" color="error">Your attendance is below 75%. Please maintain regular attendance.</Typography>
                  )}
                </>
              ) : (
                <Typography variant="subtitle2" component="p">Attendance data not available</Typography>
              )}
            </StyledPaper>
          </Grid>
          {/* Attendance Pie Chart */}
          <Grid item xs={12} md={4} lg={3}>
            <ChartContainer>
              {response ? (
                <Typography variant="h6">No Attendance Found</Typography>
              ) : (
                loading ? (
                  <Typography variant="h6">Loading...</Typography>
                ) : (
                  subjectAttendance && subjectAttendance.length > 0 ? (
                    <CustomPieChart data={chartData} />
                  ) : (
                    <Typography variant="h6">No Attendance Found</Typography>
                  )
                )
              )}
            </ChartContainer>
          </Grid>
          {/* Upcoming Classes Card */}
          <Grid item xs={12} md={4} lg={3}>
            <StyledPaper>
              <Typography variant="subtitle1" component="p">Upcoming Classes</Typography>
              {upcomingClasses && upcomingClasses.length > 0 ? (
                upcomingClasses.map((cls, idx) => (
                  <Box key={idx} sx={{ textAlign: 'left', mb: 1 }}>
                    <Typography variant="subtitle2" component="p">{cls.statusLabel}</Typography>
                    <Typography variant="body2" component="p">{cls.startTime} - {cls.endTime || 'Not Set'}</Typography>
                    <Typography variant="body2" component="p">{cls.subName || 'Not Set'}</Typography>
                    <Typography variant="body2" component="p">{cls.subCode || 'Not Set'}</Typography>
                    <Typography variant="body2" component="p">Room: {cls.room || 'Not Set'}</Typography>
                    {cls.teacher && cls.teacher.name && (
                      <Typography variant="body2" component="p">Faculty: {cls.teacher.name}</Typography>
                    )}
                  </Box>
                ))
              ) : (
                <Typography variant="subtitle2" component="p">No upcoming classes</Typography>
              )}
            </StyledPaper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

const ChartContainer = styled.div`
  padding: 2px;
  display: flex;
  flex-direction: column;
  height: 240px;
  justify-content: center;
  align-items: center;
  text-align: center;
`;

const StyledPaper = styled(Paper)`
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 200px;
  justify-content: space-between;
  align-items: center;
  text-align: center;
`;

const Title = styled.p`
  font-size: 1.25rem;
`;

const Data = styled(CountUp)`
  font-size: calc(1.3rem + .6vw);
  color: green;
`;

export default StudentHomePage;
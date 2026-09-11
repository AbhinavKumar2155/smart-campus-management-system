// Academic Report page for students
// Path: frontend/src/pages/studentRelated/AcademicReport.js
import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Grid, Paper, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Chip } from '@mui/material';
import { calculateGpa } from '../../utils/calculateGpa';
import { calculateAttendanceSummary } from '../../utils/calculateAttendance';

const AcademicReport = () => {
  // Student data from Redux
  const { userDetails } = useSelector(state => state.user);
  const { subjectsList } = useSelector(state => state.sclass);

  const examResults = userDetails?.examResult || [];
  const attendanceData = userDetails?.attendance || [];

  // Helper to find subject metadata for a given subName (id or object)
  const getCourseInfo = (subName) => {
    if (!subjectsList) return null;
    const id = typeof subName === 'object' && subName !== null && subName._id ? subName._id : subName;
    return subjectsList.find(sub => sub._id === id || sub.subName === id);
  };

  // ---------- GPA calculation (weighted by credits) ----------
  let totalWeighted = 0,
    totalCredits = 0,
    simpleSum = 0,
    simpleCount = 0;

  examResults.forEach((res) => {
    const gp = calculateGpa([res]); // returns a number or null
    const gpVal = gp !== null ? gp : 0;
    const course = getCourseInfo(res.subName);
    const credits = Number(course?.credits);
    if (!isNaN(credits) && credits > 0) {
      totalWeighted += gpVal * credits;
      totalCredits += credits;
    } else {
      simpleSum += gpVal;
      simpleCount += 1;
    }
  });

  const overallGpa = totalCredits
    ? (totalWeighted / totalCredits).toFixed(2)
    : simpleCount
    ? (simpleSum / simpleCount).toFixed(2)
    : 'Not Available';

  // ---------- Attendance ----------
  const attendanceSummary = calculateAttendanceSummary(attendanceData);
  const attendancePct = attendanceSummary?.percentage ?? null;
  const attendanceStatus = attendancePct !== null && attendancePct < 75 ? 'Low Attendance' : 'Attendance Good';

  // ---------- Academic Status ----------
  let academicStatus = 'Not Available';
  if (overallGpa !== 'Not Available') {
    const gpaNum = parseFloat(overallGpa);
    if (gpaNum >= 7) academicStatus = 'Good';
    else if (gpaNum >= 5) academicStatus = 'Average';
    else academicStatus = 'Needs Improvement';
  }

  return (
    <Box sx={{ p: 3 }} className="report-content">
      {/* Print CSS */}
      <style>{`\n        @media print {\n          .no-print { display: none !important; }\n          .report-content { margin: 0; width: 100%; }\n        }\n      `}</style>

      {/* Header */}
      <Box className="no-print" sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">Academic Report</Typography>
        <Button variant="outlined" onClick={() => window.print()}>Print Report</Button>
      </Box>
      <Typography variant="h6" gutterBottom>Smart Campus Management System</Typography>

      {/* Student Info */}
      <Box sx={{ mb: 3 }}>
        <Typography><strong>Student Name:</strong> {userDetails?.name ?? 'Not Set'}</Typography>
        <Typography><strong>Roll Number:</strong> {userDetails?.rollNum ?? 'Not Set'}</Typography>
        <Typography><strong>Department:</strong> {userDetails?.department ?? 'Not Set'}</Typography>
        <Typography><strong>Semester:</strong> {userDetails?.semester ?? 'Not Set'}</Typography>
        <Typography><strong>Section:</strong> {userDetails?.sclassName?.sclassName ?? 'Not Set'}</Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle2">Overall GPA</Typography>
            <Typography variant="h5">{overallGpa}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle2">Courses</Typography>
            <Typography variant="h5">{examResults.length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle2">Attendance</Typography>
            <Typography variant="h5">{attendancePct !== null ? `${attendancePct}%` : 'Not Available'}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle2">Academic Status</Typography>
            <Typography variant="h5">{academicStatus}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Attendance Alert */}
      {attendancePct !== null && attendancePct < 75 && (
        <Chip label="Low Attendance" color="error" sx={{ mb: 2 }} />
      )}

      {/* Course Performance Table */}
      {examResults.length > 0 ? (
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Course</TableCell>
                <TableCell>Course Code</TableCell>
                <TableCell>Credits</TableCell>
                <TableCell>Marks</TableCell>
                <TableCell>Grade Point</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {examResults.map((res, idx) => {
                const course = getCourseInfo(res.subName);
                const grade = calculateGpa([res]);
                return (
                  <TableRow key={idx}>
                    <TableCell>{course?.subName ?? 'Unknown Course'}</TableCell>
                    <TableCell>{course?.subCode ?? 'Not Set'}</TableCell>
                    <TableCell>{course?.credits ?? 'Not Set'}</TableCell>
                    <TableCell>{res.marksObtained ?? 'Not Set'}</TableCell>
                    <TableCell>{grade !== null ? grade : 'Not Available'}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography>No academic performance data available.</Typography>
      )}
    </Box>
  );
};

export default AcademicReport;

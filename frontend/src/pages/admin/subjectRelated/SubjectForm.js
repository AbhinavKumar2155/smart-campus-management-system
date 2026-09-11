import React, { useEffect, useState } from "react";
import { Button, TextField, Grid, Box, Typography, CircularProgress, Select, MenuItem } from "@mui/material";
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addStuff } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import Popup from '../../../components/Popup';

const SubjectForm = () => {
    const [subjects, setSubjects] = useState([{ subName: "", subCode: "", sessions: "", credits: "", day: "", startTime: "", endTime: "", room: "" }]);

            const handleSessionsChange = (index) => (event) => {
            const newSubjects = [...subjects];
            newSubjects[index].sessions = event.target.value;
            setSubjects(newSubjects);
        };


// Removed duplicate fields definition earlier

    const handleCreditsChange = (index) => (event) => {
        const newSubjects = [...subjects];
        newSubjects[index].credits = event.target.value || '';
        setSubjects(newSubjects);
    };

    const handleAddSubject = () => {
        setSubjects([...subjects, { subName: "", subCode: "", sessions: "", credits: "", day: "", startTime: "", endTime: "", room: "" }]);
    };

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const params = useParams();

    // Retrieve necessary state from Redux
    const { status, response, error, currentUser } = useSelector((state) => state.user);
    const adminID = currentUser ? currentUser._id : null;
    const sclassName = currentUser ? currentUser.sclassName : null;
    const address = params.address; // expected route parameter

    const fields = {
        sclassName,
        subjects: subjects.map((subject) => ({
            subName: subject.subName,
            subCode: subject.subCode,
            sessions: subject.sessions,
            credits: subject.credits,
            day: subject.day,
            startTime: subject.startTime,
            endTime: subject.endTime,
            room: subject.room,
        })),
        adminID,
    };

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false)

    const handleSubjectNameChange = (index) => (event) => {
        const newSubjects = [...subjects];
        newSubjects[index].subName = event.target.value;
        setSubjects(newSubjects);
    };

    const handleSubjectCodeChange = (index) => (event) => {
        const newSubjects = [...subjects];
        newSubjects[index].subCode = event.target.value;
        setSubjects(newSubjects);
    };

    const handleDayChange = (index) => (event) => {
        const newSubjects = [...subjects];
        newSubjects[index].day = event.target.value;
        setSubjects(newSubjects);
    };
    const handleStartTimeChange = (index) => (event) => {
        const newSubjects = [...subjects];
        newSubjects[index].startTime = event.target.value;
        setSubjects(newSubjects);
    };
    const handleEndTimeChange = (index) => (event) => {
        const newSubjects = [...subjects];
        newSubjects[index].endTime = event.target.value;
        setSubjects(newSubjects);
    };
    const handleRoomChange = (index) => (event) => {
        const newSubjects = [...subjects];
        newSubjects[index].room = event.target.value;
        setSubjects(newSubjects);
    };
    const handleRemoveSubject = (index) => () => {
        const newSubjects = [...subjects];
        newSubjects.splice(index, 1);
        setSubjects(newSubjects);
    };



    const submitHandler = (event) => {
        event.preventDefault();
        setLoader(true)
        dispatch(addStuff(fields, address))
    };

    useEffect(() => {
        if (status === 'added') {
            navigate("/Admin/subjects");
            dispatch(underControl())
            setLoader(false)
        }
        else if (status === 'failed') {
            setMessage(response)
            setShowPopup(true)
            setLoader(false)
        }
        else if (status === 'error') {
            setMessage("Network Error")
            setShowPopup(true)
            setLoader(false)
        }
    }, [status, navigate, error, response, dispatch]);

    return (
        <form onSubmit={submitHandler}>
            <Box mb={2}>
                <Typography variant="h6" >Add Subjects</Typography>
            </Box>
            <Grid container spacing={2}>
                {subjects.map((subject, index) => (
                    <React.Fragment key={index}>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Subject Name"
                                variant="outlined"
                                value={subject.subName}
                                onChange={handleSubjectNameChange(index)}
                                sx={styles.inputField}
                                required
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                label="Subject Code"
                                variant="outlined"
                                value={subject.subCode}
                                onChange={handleSubjectCodeChange(index)}
                                sx={styles.inputField}
                                required
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                label="Sessions"
                                variant="outlined"
                                value={subject.sessions}
                                onChange={handleSessionsChange(index)}
                                sx={styles.inputField}
                                required
                            />
                                                </Grid>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                label="Credits"
                                variant="outlined"
                                type="number"
                                inputProps={{ min: 1, max: 6 }}
                                value={subject.credits}
                                onChange={handleCreditsChange(index)}
                                sx={styles.inputField}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <Select
                                fullWidth
                                label="Day"
                                value={subject.day}
                                onChange={handleDayChange(index)}
                                displayEmpty
                                sx={styles.inputField}
                            >
                                <MenuItem value=""><em>None</em></MenuItem>
                                <MenuItem value="Monday">Monday</MenuItem>
                                <MenuItem value="Tuesday">Tuesday</MenuItem>
                                <MenuItem value="Wednesday">Wednesday</MenuItem>
                                <MenuItem value="Thursday">Thursday</MenuItem>
                                <MenuItem value="Friday">Friday</MenuItem>
                                <MenuItem value="Saturday">Saturday</MenuItem>
                            </Select>
                        </Grid>
                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                type="time"
                                label="Start Time"
                                variant="outlined"
                                value={subject.startTime}
                                onChange={handleStartTimeChange(index)}
                                sx={styles.inputField}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                type="time"
                                label="End Time"
                                variant="outlined"
                                value={subject.endTime}
                                onChange={handleEndTimeChange(index)}
                                sx={styles.inputField}
                            />
                        </Grid>
                        <Grid item xs={2}>
                            <TextField
                                fullWidth
                                label="Room"
                                variant="outlined"
                                value={subject.room}
                                onChange={handleRoomChange(index)}
                                sx={styles.inputField}
                            />
                        </Grid>
                        <Grid item xs={1}>
                            <Box display="flex" alignItems="flex-end">
                                {index === 0 ? (
                                    <Button variant="outlined" color="primary" onClick={handleAddSubject}>
                                        Add Subject
                                    </Button>
                                ) : (
                                    <Button variant="outlined" color="error" onClick={handleRemoveSubject(index)}>
                                        Remove
                                    </Button>
                                )}
                            </Box>
                        </Grid>
                    </React.Fragment>
                ))}
                <Grid item xs={12}>
                    <Box display="flex" justifyContent="flex-end">
                        <Button variant="contained" color="primary" type="submit" disabled={loader}>
                            {loader ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                'Save'
                            )}
                        </Button>
                    </Box>
                </Grid>
                <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
            </Grid>
        </form>
    );
}

export default SubjectForm

const styles = {
    inputField: {
        '& .MuiInputLabel-root': {
            color: '#838080',
        },
        '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#838080',
        },
    },
};
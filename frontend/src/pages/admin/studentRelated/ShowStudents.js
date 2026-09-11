// ShowStudents component with search and filters
import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { getAllStudents } from '../../../redux/studentRelated/studentHandle';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import {
    Paper, Box, IconButton, TextField, FormControl, InputLabel, Select, MenuItem, Button, ButtonGroup, Stack, Typography
} from '@mui/material';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { BlackButton, BlueButton, GreenButton } from '../../../components/buttonStyles';
import TableTemplate from '../../../components/TableTemplate';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import * as React from 'react';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Popper from '@mui/material/Popper';

import MenuList from '@mui/material/MenuList';
import Popup from '../../../components/Popup';
import { KeyboardArrowUp, KeyboardArrowDown } from '@mui/icons-material';

const ShowStudents = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { studentsList, loading, error, response } = useSelector((state) => state.student);
    const { currentUser } = useSelector(state => state.user);

    // UI state for filters
    const [searchTerm, setSearchTerm] = useState('');
    const [deptFilter, setDeptFilter] = useState('All');
    const [semFilter, setSemFilter] = useState('All');
    const [sectionFilter, setSectionFilter] = useState('All');
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState('');

    // fetch students list once component mounts
    useEffect(() => {
        if (currentUser && currentUser._id) {
            dispatch(getAllStudents(currentUser._id));
        }
    }, [currentUser._id, dispatch]);

    const deleteHandler = (deleteID, address) => {
        setMessage('Sorry the delete function has been disabled for now.');
        setShowPopup(true);
    };

    // distinct sections for the Section dropdown (safe handling of missing data)
    const sectionOptions = useMemo(() => {
        if (!Array.isArray(studentsList)) return [];
        const sections = studentsList
            .map(s => s.sclassName && s.sclassName.sclassName)
            .filter(Boolean);
        return Array.from(new Set(sections));
    }, [studentsList]);

    // Filtering logic – combines search and all dropdowns (AND behavior)
    const filteredStudents = useMemo(() => {
        if (!Array.isArray(studentsList)) return [];
        const term = searchTerm.trim().toLowerCase();
        return studentsList.filter(student => {
            // search on name or roll number
            const nameMatch = student.name && student.name.toLowerCase().includes(term);
            const rollMatch = student.rollNum && String(student.rollNum).toLowerCase().includes(term);
            const searchPass = term === '' || nameMatch || rollMatch;

            // department filter
            const deptPass = deptFilter === 'All' || (student.department && student.department === deptFilter);

            // semester filter – treat both numbers and strings
            const semPass = semFilter === 'All' || (student.semester && String(student.semester) === semFilter);

            // section filter – compare with nested sclassName.sclassName
            const section = student.sclassName && student.sclassName.sclassName;
            const sectionPass = sectionFilter === 'All' || (section && section === sectionFilter);

            return searchPass && deptPass && semPass && sectionPass;
        });
    }, [studentsList, searchTerm, deptFilter, semFilter, sectionFilter]);

    const studentColumns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'rollNum', label: 'Roll Number', minWidth: 100 },
        { id: 'sclassName', label: 'Class', minWidth: 170 },
    ];

    const studentRows = filteredStudents.map(student => ({
        name: student.name,
        rollNum: student.rollNum,
        sclassName: student.sclassName ? student.sclassName.sclassName : 'N/A',
        id: student._id,
    }));

    const clearFilters = () => {
        setSearchTerm('');
        setDeptFilter('All');
        setSemFilter('All');
        setSectionFilter('All');
    };

    const StudentButtonHaver = ({ row }) => {
        const options = ['Take Attendance', 'Provide Marks'];
        const [open, setOpen] = React.useState(false);
        const anchorRef = React.useRef(null);
        const [selectedIndex, setSelectedIndex] = React.useState(0);

        const handleClick = () => {
            if (selectedIndex === 0) {
                navigate(`/Admin/students/student/attendance/${row.id}`);
            } else if (selectedIndex === 1) {
                navigate(`/Admin/students/student/marks/${row.id}`);
            }
        };

        const handleMenuItemClick = (event, index) => {
            setSelectedIndex(index);
            setOpen(false);
        };
        const handleToggle = () => setOpen(prev => !prev);
        const handleClose = (event) => {
            if (anchorRef.current && anchorRef.current.contains(event.target)) return;
            setOpen(false);
        };

        return (
            <>
                <IconButton onClick={() => deleteHandler(row.id, "Student")}> <PersonRemoveIcon color="error" /> </IconButton>
                <BlueButton variant="contained" onClick={() => navigate(`/Admin/students/student/${row.id}`)}>View</BlueButton>
                <React.Fragment>
                    <ButtonGroup variant="contained" ref={anchorRef} aria-label="split button">
                        <Button onClick={handleClick}>{options[selectedIndex]}</Button>
                        <BlackButton
                            size="small"
                            aria-controls={open ? 'split-button-menu' : undefined}
                            aria-expanded={open ? 'true' : undefined}
                            aria-label="select merge strategy"
                            aria-haspopup="menu"
                            onClick={handleToggle}
                        >
                            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                        </BlackButton>
                    </ButtonGroup>
                    <Popper sx={{ zIndex: 1 }} open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
                        {({ TransitionProps, placement }) => (
                            <Grow
                                {...TransitionProps}
                                style={{
                                    transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
                                }}
                            >
                                <Paper>
                                    <ClickAwayListener onClickAway={handleClose}>
                                        <MenuList id="split-button-menu" autoFocusItem>
                                            {options.map((option, index) => (
                                                <MenuItem
                                                    key={option}
                                                    selected={index === selectedIndex}
                                                    onClick={(event) => handleMenuItemClick(event, index)}
                                                >{option}</MenuItem>
                                            ))}
                                        </MenuList>
                                    </ClickAwayListener>
                                </Paper>
                            </Grow>
                        )}
                    </Popper>
                </React.Fragment>
            </>
        );
    };

    const actions = [
        { icon: <PersonAddAlt1Icon color="primary" />, name: 'Add New Student', action: () => navigate("/Admin/addstudents") },
        { icon: <PersonRemoveIcon color="error" />, name: 'Delete All Students', action: () => deleteHandler(currentUser._id, "Students") },
    ];

    // Result count text
    const resultText = filteredStudents.length === 0
        ? 'No students found'
        : `Showing ${filteredStudents.length} of ${studentsList ? studentsList.length : 0} students`;

    return (
        <>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <Box sx={{ p: 2 }}>
                    {/* Filter controls */}
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" mb={2}>
                        <TextField
                            label="Search by name or roll number"
                            variant="outlined"
                            size="small"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            sx={{ minWidth: 200 }}
                        />
                        <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Department</InputLabel>
                            <Select label="Department" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
                                <MenuItem value="All">All Departments</MenuItem>
                                <MenuItem value="CSE">CSE</MenuItem>
                                <MenuItem value="IT">IT</MenuItem>
                                <MenuItem value="ECE">ECE</MenuItem>
                                <MenuItem value="Mechanical">Mechanical</MenuItem>
                                <MenuItem value="Civil">Civil</MenuItem>
                                <MenuItem value="Other">Other</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Semester</InputLabel>
                            <Select label="Semester" value={semFilter} onChange={e => setSemFilter(e.target.value)}>
                                <MenuItem value="All">All Semesters</MenuItem>
                                {[...Array(8)].map((_, i) => (
                                    <MenuItem key={i + 1} value={`${i + 1}`}>Semester {i + 1}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Section</InputLabel>
                            <Select label="Section" value={sectionFilter} onChange={e => setSectionFilter(e.target.value)}>
                                <MenuItem value="All">All Sections</MenuItem>
                                {sectionOptions.map(sec => (
                                    <MenuItem key={sec} value={sec}>{sec}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button variant="contained" color="secondary" onClick={clearFilters}>Clear Filters</Button>
                    </Stack>
                    <Typography variant="subtitle2" gutterBottom>{resultText}</Typography>
                    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                        {Array.isArray(filteredStudents) && filteredStudents.length > 0 ? (
                            <TableTemplate buttonHaver={StudentButtonHaver} columns={studentColumns} rows={studentRows} />
                        ) : (
                            <Typography variant="body1" sx={{ p: 2 }}>No students to display.</Typography>
                        )}
                        <SpeedDialTemplate actions={actions} />
                    </Paper>
                </Box>
            )}
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    );
};

export default ShowStudents;
import React from 'react';

import {
  Table,
  Box,
  TableBody,
  TableContainer,
  TableHead,
  Paper,
  Chip,
  Button,
} from '@material-ui/core';

import Pagination from '@material-ui/lab/Pagination';
import { Search, DeleteRounded } from '@material-ui/icons';
import { useTheme } from '@material-ui/core/styles';

import {
  StyledTableCell,
  StyledTableRow,
  CaptionTypography,
  SearchBar,
  useStyles,
} from './AssessmentGridStyle';

export default function AssessmentGrid(props) {
  const { submission, userName, handleDelete } = props;
  const classes = useStyles();
  const theme = useTheme();

  function createData(name, status, assessmentType, risk, date, action) {
    return { name, status, assessmentType, risk, date, action };
  }

  const rowTitle = [
    'Project Name',
    'Product Owner',
    'Risk Level',
    'Status',
    'Action',
  ];

  const handleChipColor = (riskLevel) => {
    switch (riskLevel) {
      case 'Low Risk':
        return classes.lowRisk;
      case 'Medium Risk':
        return classes.mediumRisk;
      case 'High Risk':
        return classes.highRisk;
      default:
    }
  };

  return (
    <div>
      <TableContainer
        className={classes.tableContainer}
        component={Paper}
        elevation={4}
      >
        <div className={classes.searchPadding}>
          <SearchBar
            variant="outlined"
            placeholder="Search resources"
            InputProps={{
              startAdornment: <Search />,
            }}
          />
        </div>

        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            {rowTitle.map((title, i) => (
              <StyledTableCell>{title}</StyledTableCell>
            ))}
          </TableHead>
          <TableBody>
            {submission.map((submissions, i) => (
              <StyledTableRow stripedRows key={i}>
                <StyledTableCell className={classes.anthemBlue}>
                  {submissions.projectName}
                </StyledTableCell>
                <StyledTableCell>{userName}</StyledTableCell>

                <StyledTableCell>
                  {/* <Chip
                  color="success"
                  label={data.risk}
                  className={handleChipColor(data.risk)}
                  ></Chip> */}
                </StyledTableCell>
                {/* <StyledTableCell>{data.actionDate}</StyledTableCell> */}
                <StyledTableCell>
                  {submissions.completed ? 'Completed' : 'In Progress'}
                  <CaptionTypography>
                    {' '}
                    {new Date(submissions.date).toLocaleString('en-US', {
                      timeZone:
                        Intl?.DateTimeFormat()?.resolvedOptions()?.timeZone ??
                        'UTC',
                    })}
                  </CaptionTypography>
                </StyledTableCell>
                <StyledTableCell>
                  {!submissions.completed && (
                    <div>
                      <DeleteRounded
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          handleDelete();
                        }}
                      />
                    </div>
                  )}
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box mt={10} />
      <div style={{ display: 'flex', justifyContent: 'end' }}>
        <Pagination />
      </div>
    </div>
  );
}

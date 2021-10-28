import React from 'react';
import Box from '@material-ui/core/Box';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import Paper from '@material-ui/core/Paper';
import Chip from '@material-ui/core/Chip';
import Pagination from '@material-ui/lab/Pagination';
import Search from '@material-ui/icons/Search';
import FileCopyRounded from '@material-ui/icons/FileCopyRounded';
import DeleteRounded from '@material-ui/icons/DeleteRounded';
import { useTheme } from '@material-ui/core/styles';

import systemInventoryData from '../assets/data/systemInventoryData.json';

import {
  StyledTableCell,
  StyledTableRow,
  CaptionTypography,
  SearchBar,
  useStyles,
} from './SystemInventoryStyle';

export default function SystemInventoryGrid(props) {
  const { expandButton } = props;
  const classes = useStyles();
  const theme = useTheme();

  function createData(name, status, assessmentType, risk, date, action) {
    return { name, status, assessmentType, risk, date, action };
  }

  const rowTitle = [
    'System Name',
    'Business Owner',
    'Technical Owner',
    'Impact Rating',
    'LOD 1',
    'LOD 2',
    'LOD 3',
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
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: '80%',
        }}
      >
        <TableContainer component={Paper} elevation={4}>
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
              {systemInventoryData.map((data, i) => (
                <StyledTableRow stripedRows key={i}>
                  <StyledTableCell className={classes.anthemBlue}>
                    {data.name}
                  </StyledTableCell>
                  <StyledTableCell>{data.businessOwner}</StyledTableCell>

                  <StyledTableCell>{data.technicalOwner}</StyledTableCell>
                  <StyledTableCell>
                    <Chip
                      color="success"
                      label={data.risk}
                      className={handleChipColor(data.risk)}
                    ></Chip>
                  </StyledTableCell>
                  <StyledTableCell>
                    {data.lodOne}
                    <CaptionTypography>{data.technicalOwner}</CaptionTypography>
                  </StyledTableCell>
                  <StyledTableCell>
                    {data.lodTwo}
                    <CaptionTypography>{data.businessOwner}</CaptionTypography>
                  </StyledTableCell>
                  <StyledTableCell>
                    {data.lodThree}
                    <CaptionTypography>{data.technicalOwner}</CaptionTypography>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box mt={10} />
        <div style={{ display: 'flex', justifyContent: 'end' }}>
          <Pagination count={10} />
        </div>
      </div>
    </div>
  );
}

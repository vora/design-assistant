import React from 'react';
import Box from '@material-ui/core/Box';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import Paper from '@material-ui/core/Paper';
import Chip from '@material-ui/core/Chip';

import Search from '@material-ui/icons/Search';
import FileCopyRounded from '@material-ui/icons/FileCopyRounded';
import DeleteRounded from '@material-ui/icons/DeleteRounded';
import { useTheme } from '@material-ui/core/styles';
import SystemInventoryGrid from '../Components/SystemInventoryGrid';

export default function SystemInventory(props) {
  const { expandButton } = props;
  const classes = useStyles();
  const theme = useTheme();

  function createData(name, status, assessmentType, risk, date, action) {
    return { name, status, assessmentType, risk, date, action };
  }

  const rowTitle = [
    'Project Name',
    'Status',
    'Assessment Type',
    'Risk Flag',
    'Action Date',
    'Action',
    '',
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
      yo
      <SystemInventoryGrid></SystemInventoryGrid>
    </div>
  );
}

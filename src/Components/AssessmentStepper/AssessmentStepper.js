import React, { useState, useEffect } from 'react';
import { Step, StepContent, StepButton, Typography } from '@material-ui/core';
import {
  DimensionProgress,
  OverallProgress,
  Label,
  DimensionProgressPercent,
  Stepper,
} from './styles';

export const AssessmentStepper = ({ dimArray, onStepClick, pages, model }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  useEffect(() => {
    let answeredCount = 0;
    const questionCount = pages?.reduce((acc, page) => {
      acc += page.elements.length;
      page.elements.map((question, index) => {
        if (model.data[question.name]) {
          answeredCount++;
        }
      });
      return acc;
    }, 0);

    setOverallProgress((answeredCount / questionCount) * 100);
  });
  const getFirstPageOfDimension = (dimension) => {
    const index = pages.findIndex(
      (page) =>
        page.name === dimension.replace(/ /g, '') ||
        page.name === dimension.replace(/ /g, '') + '1'
    );
    return index === -1 ? 0 : index;
  };

  const handleStepClick = (index, pageIndex) => {
    setActiveStep(index);
    onStepClick(pageIndex);
  };

  const dimensionProgress = (dimension) => {
    let answeredCount = 0;
    const questionCount = pages?.reduce((acc, page) => {
      if (
        page.name
          .toLowerCase()
          .includes(dimension.substring(0, 4).toLowerCase())
      ) {
        acc += page.elements.length;
        page.elements.map((question, index) => {
          if (model.data[question.name]) {
            answeredCount++;
          }
        });
      }
      return acc;
    }, 0);

    const progress = (answeredCount / questionCount) * 100;

    return (
      <div>
        <DimensionProgressPercent variant="subtitle1">
          {Math.round(progress)}% Complete
        </DimensionProgressPercent>
        <DimensionProgress variant="determinate" value={progress} />
      </div>
    );
  };

  return (
    <>
      <Stepper nonLinear activeStep={activeStep} orientation="vertical">
        {dimArray.map((dimension, index) => {
          const pageIndex = getFirstPageOfDimension(dimension);
          return (
            <Step key={dimension}>
              <StepButton onClick={() => handleStepClick(index, pageIndex)}>
                <Label variant="subtitle1">{dimension}</Label>
              </StepButton>
              <StepContent>{dimensionProgress(dimension)}</StepContent>
            </Step>
          );
        })}
      </Stepper>
      <div>
        <Label variant="subtitle1">Overall Completion</Label>
        <OverallProgress variant="determinate" value={overallProgress} />
        <Typography variant="subtitle1">
          {Math.round(overallProgress)}% Complete
        </Typography>
      </div>
    </>
  );
};

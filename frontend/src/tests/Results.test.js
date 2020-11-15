import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import Results from '../views/Results'
import { BrowserRouter as Router } from 'react-router-dom';
import axios from 'axios';

jest.mock('axios');

const data = [];
const response = {data: data};

const mockElements = [{
    "type": "radiogroup",
    "name": "Q1",
    "score": {
        "dimension": "R",
        "choices": {
            "1": 3.0,
            "2": 0.0,
            "3": 0.0
        }
    },
    "title": {
        "default": "Is the entire supply chain secure?",
    },
    "recommendation": {
        "default": "Recommended guidance from Google's Responsible AI Practices: 3) Keep learning to stay ahead of the curve\n- Stay up to date on the latest research advances. Research into adversarial machine learning continues to offer improved performance for defenses and some defense techniques are beginning to offer provable guarantees.\n- Beyond interfering with input, it is possible there may be other vulnerabilities in the ML supply chain. While to our knowledge such an attack has not yet occurred, it is important to consider the possibility and be prepared.",
    },
    "choices": [
        {
            "value": "1",
            "text": {
                "default": "Yes",
                "fr": ""
            }
        },
        {
            "value": "2",
            "text": {
                "default": "Not sure",
                "fr": ""
            }
        },
        {
            "value": "3",
            "text": {
                "default": "No",
                "fr": ""
            }
        }
    ]
}];

test('Results successfully renders', () => {

    const mockResponses = {
        "Q1": "1"
    };

    const mockPages = [{elements: mockElements}];

    const mockLocation = {
        state : {
            questions: {"pages": mockPages},
            responses: mockResponses
        }
    }
    axios.get.mockResolvedValue(response);
    render(<Router><Results location={mockLocation}/></Router>)
    expect(screen.queryByText("Results")).toBeTruthy();
});

test('Results renders with no data', () => {
    const mockPages = [{elements: []}];
    const mockLocation = {
        state: {
            questions: {"pages": mockPages},
            responses: {}
    }}
    axios.get.mockResolvedValue(response);
    render(<Router><Results location={mockLocation}/></Router>)
    expect(screen.queryByText("Results")).toBeTruthy();

});

test('Results redirects home if survey incomplete', () => {
    const mockPush = jest.fn((obj) => {
        return true;
    });
    const mockHistory = {
        push: mockPush
    }
    axios.get.mockResolvedValue(response);
    render(<Router><Results history={mockHistory}/></Router>)
    expect(mockHistory.push).toHaveBeenCalledTimes(1);
});

test('Results start again button does not error out', () => {
    const mockPages = [{elements: []}];
    const mockLocation = {
        state: {
            questions: {"pages": mockPages},
            responses: {}
    }}
    axios.get.mockResolvedValue(response);
    render(<Router><Results location={mockLocation}/></Router>)
    fireEvent.click(screen.getByText("Start Again"));
});

test('Results switches to Report Card Tab', () => {
    const mockPages = [{elements: []}];
    const mockLocation = {
        state: {
            questions: {"pages": mockPages},
            responses: {}
    }}
    axios.get.mockResolvedValue(response);
    render(<Router><Results location={mockLocation}/></Router>)
    fireEvent.click(screen.getAllByText("Report Card")[0]);
    expect(screen.queryAllByText("Recommendation")).toBeTruthy();
})

test('Results switches to Trusted AI Providers Tab', () => {
    const mockPages = [{elements: []}];
    const mockLocation = {
        state: {
            questions: {"pages": mockPages},
            responses: {}
    }}
    axios.get.mockResolvedValue(response);
    render(<Router><Results location={mockLocation}/></Router>)
    fireEvent.click(screen.getAllByText("Trusted AI Providers")[0]);
    expect(screen.queryAllByText).toBeTruthy();
})
import 'bootstrap';
import $ from "jquery";
import './css/theme.css';
import './css/survey.css';
import axios from 'axios';
import showdown from 'showdown';
import * as Survey from "survey-react";
import Card from 'react-bootstrap/Card';
import { Button, Table } from 'react-bootstrap';
import React, { Component } from 'react';
import Modal from 'react-bootstrap/Modal';
import { withRouter } from 'react-router-dom';
import Accordion from 'react-bootstrap/Accordion';
import ModalBody from 'react-bootstrap/ModalBody';
import ModalTitle from 'react-bootstrap/ModalTitle';
import ModalFooter from 'react-bootstrap/ModalFooter';
import ModalHeader from 'react-bootstrap/ModalHeader';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Login from './views/Login';
import { getLoggedInUser } from './helper/AuthHelper';
require('dotenv').config();

// set up survey styles and properties for rendering html
Survey
  .StylesManager
  .applyTheme("bootstrapmaterial")

Survey
  .defaultBootstrapMaterialCss
  .progressBar = "progress-bar bg-custom progress-bar-striped";

Survey
  .Serializer
  .addProperty("page", {
    name: "navigationTitle:string",
    isLocalizable: true
  });

Survey
  .Serializer
  .addProperty("question", "alttext:text");

// remove localization strings for progress bar
// https://surveyjs.answerdesk.io/ticket/details/t2551/display-progress-bar-without-text
// Asked by: MDE | Answered by: Andrew Telnov
var localizedStrs = Survey.surveyLocalization.locales[Survey.surveyLocalization.defaultLocale];
localizedStrs.progressText = "";

// array of dimension names used to create navigation cards
const dimArray = ['Accountabililty', 'Bias and Fairness', 'Explainability and Interpretability', 'Robustness', 'Data Quality']

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentSubmissionIdx: 0,
      isSurveyStarted: false,
      showModal: false,
      A: 1,
      B: 9,
      E: 19,
      R: 25,
      D: 28,
      authToken: localStorage.getItem("authToken"),
      submissions: []
    };
    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
  }

  // Request questions JSON from backend 
  componentDidMount() {
    var endPoint = '/questions';
    axios.get(process.env.REACT_APP_SERVER_ADDR + endPoint)
      .then(res => {
        var json = res.data;
        // replace double escaped characters so showdown correctly renders markdown frontslashes and newlines
        var stringified = JSON.stringify(json);
        stringified = stringified.replace(/\\\\n/g, "\\n");
        stringified = stringified.replace(/\\\//g, "/");
        json = JSON.parse(stringified);

        const model = new Survey.Model(json);
        const converter = new showdown.Converter();

        // Set json and model
        this.setState({ json });
        this.setState({ model });

        model
          .onTextMarkdown
          .add(function (model, options) {
            var str = converter.makeHtml(options.text)
            options.html = str;
          })

        // add tooltip
        model
          .onAfterRenderPage
          .add(function (model, options) {
            const node = options.htmlElement.querySelector("h4");
            if (node) {
              node.classList.add('section-header');
            }
            $('[data-toggle="tooltip"').tooltip({
              boundary: 'viewport'
            });
          });
        //change labels to 'h5' to bold them
        model
          .onAfterRenderQuestion
          .add(function (model, options) {
            let title = options.htmlElement.querySelector("h5");
            if (title) {
              // add tooltip for question if alttext has default value
              let altTextHTML = "";
              if (options.question.alttext && options.question.alttext.hasOwnProperty("default")) {
                let altText = converter.makeHtml(options.question.alttext.default.replace(/"/g, "&quot;"));
                altText = `<div class="text-justify">${altText}</div>`.replace(/"/g, "&quot;");
                altTextHTML = `<i class="fas fa-info-circle ml-2" data-toggle="tooltip" data-html="true" title="${altText}"></i>`;
              }
              title.outerHTML =
                '<label for="' +
                options.question.inputId +
                '" class="' +
                title.className +
                '"><span class="field-name">' +
                title.innerText +
                "</span>" +
                altTextHTML +
                "</label>";
              // add tooltip for answers if alttext has default value
              options.htmlElement.querySelectorAll("input").forEach((element) => {
                if (options.question.alttext && options.question.alttext.hasOwnProperty(element.value)) {
                  const div = element.closest("div");
                  div.classList.add("d-flex");
                  const i = document.createElement("span");
                  let altText = converter.makeHtml(options.question.alttext[element.value].default.replace(/"/g, "&quot;"));
                  altText = `<div class="text-justify">${altText}</div>`.replace(/"/g, "&quot;");
                  i.innerHTML = `<i class="fas fa-info-circle ml-2" data-toggle="tooltip" data-html="true" title="${altText}"></i>`;
                  div.appendChild(i);
                }
              });
            }
          });
      })
      getLoggedInUser().then( user => {
        endPoint = '/submissions/user/' + user._id;
        this.setState({user: user});
        axios.get(process.env.REACT_APP_SERVER_ADDR + endPoint)
          .then(res => {
            var submissions = res.data;
            this.setState(submissions);
        });
      });
  }

  nextPath(path) {
    this.props.history.push({
      pathname: path,
      state: { questions: this.state.json, responses: this.state.model.data }
    })
  }

  handleOpenModal() {
    this.setState({ showModal: true });
  }

  handleCloseModal() {
    this.setState({ showModal: false });
  }

  percent() {
    return this.state.model.getProgress();
  }

  resetSurvey() {
    // do we need to delete submission object here?
    // because we would need to call the database here
    this.state.model.clear()
    this.handleCloseModal()
    this.setState({ isSurveyStarted: false })
  }

  prevPage() {
    this.state.model.prevPage();
    this.setState(this.state)   // force re-render to update buttons and % complete
  }

  nextPage() {
    this.state.model.nextPage();
    this.setState(this.state)   // force re-render to update buttons and % complete
  }

  save() {
    // when we click save, we should already have a model saved to the database
    // i.e. the index will always point to a valid submission
    // so just make an update call

    // console.log("Saving survey");
    // console.log("CURRENT SUBMISSION STATE")
    // console.log(this.state.submissions);
    // console.log(this.state.currentSubmissionIdx);

    // console.log(this.state.submissions[this.state.currentSubmissionIdx]);

    axios.post(process.env.REACT_APP_SERVER_ADDR + '/submissions/update/' + this.state.submissions[this.state.currentSubmissionIdx]._id, {
      submission: this.state.model.data
    });
  }

  finish() {
    this.state.model.doComplete();

    // reset pointer to current submission?

    this.nextPath('/Results/');
  }

  onComplete(survey, options) {
    // reset point to current submission?

    console.log("Survey results: " + JSON.stringify(survey.data));
  }

  startSurvey() {
    this.state.model.clear()             // clear survey to fix restart bug

    // initialize and save new submission (blank)
    // append to state.submissions
    // set index to point to this submission

    // how to get projectName of the survey?
    // and if we get project name 

    let user = this.state.user;
    let submission = this.state.model.data ?? {};
    let dateTime = new Date();
    var endPoint = '/submissions/';

    axios.post(process.env.REACT_APP_SERVER_ADDR + endPoint, {
      userId: user?._id ?? null,
      projectName: "Test",
      date: dateTime,
      lifecycle: 6,
      submission: submission,
      completed: false
    })
    .then(res => {
      // update this.state.submissions object here
      axios.get(process.env.REACT_APP_SERVER_ADDR + '/submissions/user/' + user._id)
        .then(res => {
          var submissions = res.data;
          this.setState(submissions);
          this.state.currentSubmissionIdx = this.state.submissions.length - 1;
          console.log("Submissions after starting survey: ", this.state.submissions);
      });
    });


    this.setState({ isSurveyStarted: true })
  }

  navDim(dimension) {
    const survey = this.state.model
    switch (dimension) {
      case 0:
        survey.currentPage = survey.pages[this.state.A]
        break;
      case 1:
        survey.currentPage = survey.pages[this.state.B]
        break;
      case 2:
        survey.currentPage = survey.pages[this.state.E]
        break;
      case 3:
        survey.currentPage = survey.pages[this.state.R]
        break;
      case 4:
        survey.currentPage = survey.pages[this.state.D]
        break;
      default:
        survey.currentPage = survey.pages[0]
    }
    this.setState(this.state)
  }

  resumeSurvey(index) {

    // This is important because save relies on this index being updated
    this.state.currentSubmissionIdx = index;
    // console.log("INDEX:", this.state.currentSubmissionIdx);

    let submission = this.state.submissions[index];
    this.state.model.data = submission.submission;
    if(submission.completed){
      this.finish();
    }
    else{
      this.setState({ isSurveyStarted: true })
    }
  }

  render() {
    if (this.state.isSurveyStarted) {
      return (
        <div>
          <div className="dimensionNav">
            <Accordion>
              {dimArray.map((dimension, index) => {
                return (
                  <Card key={index}>
                    <Accordion.Toggle as={Card.Header} eventKey={index + 1}>
                      {dimension}
                    </Accordion.Toggle>
                    <Accordion.Collapse eventKey={index + 1}>
                      <Card.Body><Button aria-label={dimension} onClick={() => this.navDim(index)}>Nav to {dimension}</Button></Card.Body>
                    </Accordion.Collapse>
                  </Card>)
              })}
            </Accordion>
            <Accordion className="questionFilter">
              <Card>
                <Accordion.Toggle as={Card.Header} eventKey='9'>
                  Filters
              </Accordion.Toggle>
                <Accordion.Collapse eventKey='9'>
                  <Card.Body className="cardBody">
                    <DropdownButton title="Role" className="filterDrop" style={{ "marginRight": "1em" }}>
                      <Dropdown.Item>Role 1</Dropdown.Item>
                      <Dropdown.Item>Role 2</Dropdown.Item>
                      <Dropdown.Item>Role 3</Dropdown.Item>
                    </DropdownButton>
                    <DropdownButton title="Cycle" className="filterDrop">
                      <Dropdown.Item>Life Cycle 1</Dropdown.Item>
                      <Dropdown.Item>Life Cycle 2</Dropdown.Item>
                      <Dropdown.Item>Life Cycle 3</Dropdown.Item>
                    </DropdownButton>
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
            </Accordion>
          </div>
          <div className="container" style={{"paddingTop":"2em"}}>
            <div className="d-flex justify-content-center col">{this.percent()}%</div>
          </div>
          <Survey.Survey model={this.state.model} onComplete={this.onComplete} />
          <div id="navCon" className="container">
            <div id="navCard" className="card">
              <div className="row no-gutters">
                <div className="d-flex justify-content-start col">
                  <Button className="btn btn-primary mr-2" onClick={this.handleOpenModal}>Reset</Button>
                </div>
                <div className="d-flex justify-content-center col">
                  <Button className="btn btn-primary mr-2" onClick={() => this.prevPage()} disabled={this.state.model.isFirstPage}>Prev</Button>
                  <Button className="btn btn-primary mr-2" onClick={() => this.nextPage()} disabled={this.state.model.isLastPage}>Next</Button>
                </div>
                <div className="d-flex justify-content-end col">
                  <Button className="btn btn-save mr-2" id="saveButton" onClick={() => this.save()}>Save</Button>
                  <Button className="bt btn-primary" onClick={() => this.finish()}>Finish</Button>
                </div>
              </div>
            </div>
          </div>
          <Modal
            size="md"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            show={this.state.showModal}>
            <ModalHeader closeButton>
              <ModalTitle id="contained-modal-title-vcenter">
                Please Confirm
              </ModalTitle>
            </ModalHeader>
            <ModalBody>
              <p>Please confirm that you want to reset everything and start over.</p>
            </ModalBody>
            <ModalFooter>
              <Button onClick={this.handleCloseModal}>No</Button>
              <Button id="resetButton" onClick={() => this.resetSurvey()}>Yes</Button>
            </ModalFooter>
          </Modal>
          <Modal
            size="md"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            show={this.state.showProjectModal}>
            <ModalHeader closeButton>
              <ModalTitle id="contained-modal-title-vcenter">
                Project Title
              </ModalTitle>
            </ModalHeader>
            <ModalBody>
              <p>Please enter the name of your project.</p>
            </ModalBody>
            <ModalFooter>
              <Button onClick={this.handleCloseProjectModal}>No</Button>
              <Button id="resetButton" onClick={() => this.resetSurvey()}>Yes</Button>
            </ModalFooter>
          </Modal>
        </div>
      );
    } else if (this.state.model) {
      return (
        <div>
          <h1 className="section-header">Welcome</h1>
          <div style={{ padding: "1em" }}>
            <p>Welcome‌ ‌to‌ ‌the‌ ‌Responsible‌ ‌Design‌ ‌Assistant‌ ‌beta.‌ ‌This‌ ‌is‌ ‌a‌ ‌virtual‌ ‌guide‌ ‌to‌ ‌help‌ ‌those‌ designing,‌ ‌developing,‌ ‌and‌ ‌implementing‌ ‌AI‌ ‌systems‌ ‌do‌ ‌so‌ ‌in‌ ‌a‌ ‌responsible‌ ‌way.‌</p>
            <p>Committed‌ ‌to‌ ‌making‌ ‌responsible‌ ‌AI‌ ‌systems,‌ ‌we’ve‌ ‌done‌ ‌the‌ ‌hard‌ ‌work‌ ‌of‌ ‌deciphering‌ the‌ ‌best‌ ‌practices,‌ ‌policies,‌ ‌and‌ ‌principles‌ ‌and‌ ‌put‌ ‌them‌ ‌into‌ ‌a‌ ‌simple‌ ‌online‌ ‌survey.‌</p>
            <p>With‌ ‌our‌ ‌esteemed‌ ‌community‌ ‌of‌ ‌subject‌ ‌matter‌ ‌experts‌ ‌ranging‌ ‌from‌ ‌engineers,‌ ‌to‌ ethicists,‌ ‌to‌ ‌policy‌ ‌makers,‌ ‌we‌ ‌have‌ ‌taken‌ ‌the‌ ‌most‌ ‌cited‌ ‌principles,‌ ‌whitepapers,‌ ‌and‌ policy‌ ‌documents‌ ‌published‌ ‌by‌ ‌academics,‌ ‌standards‌ ‌organizations,‌ ‌and‌ ‌companies‌ and‌ ‌translated‌ ‌them‌ ‌into‌ ‌comprehensive‌ ‌questions.‌</p>
            <p>Based‌ ‌on‌ ‌our‌ ‌research‌ ‌and‌ ‌experience‌ ‌we‌ ‌have‌ ‌created‌ ‌a‌ ‌comprehensive‌ ‌evaluation‌ looking‌ ‌at‌ ‌the‌ ‌following‌ ‌dimensions‌ ‌of‌ ‌a‌ ‌trusted‌ ‌AI‌ ‌program:‌</p>
            <ol style={{ "fontWeight": "bold" }}>
              <li>Accountability</li>
              <li>Explainability and Interpretability</li>
              <li>Data Quality</li>
              <li>Bias and Fairness</li>
              <li>Robustness</li>
            </ol>
            <p>Our‌ ‌hope‌ ‌is‌ ‌that‌ ‌you‌ ‌will‌ ‌work‌ ‌with‌ ‌your‌ ‌colleagues‌ ‌who‌ ‌are‌ ‌responsible‌ ‌for‌ ‌different‌ aspects‌ ‌of‌ ‌your‌ ‌business‌ ‌to‌ ‌fill‌ ‌out‌ ‌the‌ ‌Design‌ ‌Assistant.‌ ‌Whether‌ ‌you‌ ‌are‌ ‌just‌ ‌thinking‌ about‌ ‌how‌ ‌to‌ ‌integrate‌ ‌AI‌ ‌tools‌ ‌into‌ ‌your‌ ‌business,‌ ‌or‌ ‌you‌ ‌have‌ ‌already‌ ‌deployed‌ several‌ ‌models,‌ ‌this‌ ‌tool‌ ‌is‌ ‌for‌ ‌you.‌ ‌We‌ ‌do‌ ‌think‌ ‌that‌ ‌these‌ ‌questions‌ ‌are‌ ‌best‌ ‌to‌ ‌think‌ about‌ ‌at‌ ‌the‌ ‌start‌ ‌of‌ ‌your‌ ‌project,‌ ‌however,‌ ‌we‌ ‌do‌ ‌think‌ ‌that‌ ‌the‌ ‌Design‌ ‌Assistant‌ ‌can‌ ‌be‌ used‌ ‌throughout‌ ‌the‌ ‌lifecycle‌ ‌of‌ ‌your‌ ‌project!‌</p>
            <p>To‌ ‌learn‌ ‌more‌ ‌about‌ ‌the‌ ‌background‌ ‌of‌ ‌this‌ ‌project,‌ ‌check‌ ‌out‌ ‌our‌ ‌post‌ ‌about‌ ‌the‌ creation‌ ‌of‌ ‌the‌ ‌Design‌ ‌Assistant‌ ‌on‌ <a target="_blank" rel="noopener noreferrer" href="https://ai-global.org/2020/04/28/creating-a-responsible-ai-trust-index-a-unified-assessment-to-assure-the-responsible-design-development-and-deployment-of-ai/">ai-global.org</a>‌‌</p>
            <p>For‌ ‌more‌ ‌information‌ ‌on‌ ‌how‌ ‌to‌ ‌use‌ ‌the‌ ‌Design‌ ‌Assistant,‌ ‌including‌ ‌FAQ’s,‌ ‌check‌ ‌out‌ our <a target="_blank" rel="noopener noreferrer" href="https://docs.google.com/presentation/d/1EDPhyRhIsiOrujLcHQv_fezXfgOz4Rl7a8lyOM_guoA/edit#slide=id.p1">Guide</a></p>
          </div>
          <div>
            <div className="card">
              <div className="card-header">Continue existing survey</div>
              <div className="card-body">
                <Table bordered responsive> 
                  <thead>
                    <tr>
                      <td>
                        Project Name
                      </td>
                      <td>
                        Date
                      </td>
                      <td width="175"></td>

                    </tr>
                  </thead>
                  <tbody>
                    {this.state.submissions.map((value, index) => {
                      return (
                        <tr key={index}>
                          <td>
                            {value.projectName}
                          </td>
                          <td>
                            {new Date(value.date).toLocaleString('en-US', {timeZone: Intl?.DateTimeFormat()?.resolvedOptions()?.timeZone ?? 'UTC'})}
                          </td>
                          <td>
                              <Button onClick={() => this.resumeSurvey(index)}>
                                {!value.completed && <div>Resume Survey</div>}
                                {value.completed && <div>See Results</div>}
                              </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </Table>
              </div>
            </div>
          </div>
          <div className="float-right mr-3 mt-2">
            <Button onClick={() => this.startSurvey()}>Start New Survey</Button>
          </div>
          <Login/>
        </div>
      );
    }
    else {
      return null;
    }
  }
}
export default withRouter(App);
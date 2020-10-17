import 'bootstrap';
import $ from "jquery";
import './css/theme.css';
import './css/survey.css';
import showdown from 'showdown';
import styles from './App.module.css';
import * as Survey from "survey-react";
import Card from 'react-bootstrap/Card';
import { Button } from 'react-bootstrap';
import React, { Component } from 'react';
import Modal from 'react-bootstrap/Modal';
import { withRouter } from 'react-router-dom';
import Accordion from 'react-bootstrap/Accordion';
import ModalBody from 'react-bootstrap/ModalBody';
import ModalTitle from 'react-bootstrap/ModalTitle';
import ModalFooter from 'react-bootstrap/ModalFooter';
import ModalHeader from 'react-bootstrap/ModalHeader';

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

const json = require('./survey-enrf.json') // TODO: connect with backend to get surveyJSON from DB // 
const model = new Survey.Model(json)
const dimArray = ['Accountabililty', 'Bias and Fairness', 'Explainability and Interpretability', 'Robustness', 'Data Quality']
const converter = new showdown.Converter();

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

// remove localization strings for progress bar
// https://surveyjs.answerdesk.io/ticket/details/t2551/display-progress-bar-without-text
// Asked by: MDE | Answered by: Andrew Telnov
var localizedStrs = Survey.surveyLocalization.locales[Survey.surveyLocalization.defaultLocale];
localizedStrs.progressText = "";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSurveyStarted: false,
      showModal: false,
      questions: json,
      A: 1,
      B: 9,
      E: 19,
      R: 25,
      D: 28,
    };
    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
  }

  nextPath(path) {
    this.props.history.push({
      pathname: path,
      state: { questions: json, responses: model.data }
    })
  }

  handleOpenModal() {
    this.setState({ showModal: true });
  }

  handleCloseModal() {
    this.setState({ showModal: false });
  }

  percent() {
    return model.getProgress();
  }

  resetSurvey() {
    model.clear()
    this.handleCloseModal()
    this.setState({ isSurveyStarted: false })
  }

  prevPage() {
    model.prevPage();
    this.setState(this.state)   // force re-render to update buttons and % complete
  }

  nextPage() {
    model.nextPage();
    this.setState(this.state)   // force re-render to update buttons and % complete
  }

  save() {
    console.log('SAVE SURVEY');
  }

  finish() {
    model.doComplete();
    this.nextPath('/Results/');
  }

  onComplete(survey, options) {
    console.log("Survey results: " + JSON.stringify(survey.data));
  }

  startSurvey() {
    model.clear()             // clear survey to fix restart bug
    this.setState({ isSurveyStarted: true })
  }

  navDim(dimension) {
    switch (dimension) {
      case 0:
        model.currentPage = model.pages[this.state.A]
        break;
      case 1:
        model.currentPage = model.pages[this.state.B]
        break;
      case 2:
        model.currentPage = model.pages[this.state.E]
        break;
      case 3:
        model.currentPage = model.pages[this.state.R]
        break;
      case 4:
        model.currentPage = model.pages[this.state.D]
        break;
    }
    this.setState(this.state)
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
                      <Card.Body><Button onClick={() => this.navDim(index)}>{dimension}</Button></Card.Body>
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
                  <Card.Body>Filter</Card.Body>
                </Accordion.Collapse>
              </Card>
            </Accordion>
          </div>
          <div className="container">
            <div className="d-flex justify-content-center col">{this.percent()}%</div>
          </div>
          <Survey.Survey model={model} onComplete={this.onComplete} />
          <div id="navCon" className="container">
            <div id="navCard" className="card">
              <div className="row no-gutters">
                <div className="d-flex justify-content-start col">
                  <Button className="btn btn-primary mr-2" onClick={this.handleOpenModal}>Reset</Button>
                </div>
                <div className="d-flex justify-content-center col">
                  <Button className="btn btn-primary mr-2" onClick={() => this.prevPage()} disabled={model.isFirstPage}>Prev</Button>
                  <Button className="btn btn-primary mr-2" onClick={() => this.nextPage()} disabled={model.isLastPage}>Next</Button>
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
        </div>
      );
    } else {
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
          <div className="row" style={{ padding: "25px" }}>
            <div className="col-sm-6">
              <div className="card h-100">
                <div className="card-header">Design assistant</div>
                <div className="card-body d-flex justify-content-center h-100">
                  <div>
                    <Button onClick={() => this.startSurvey()}>Start measuring your AI Trust Index now!</Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="card h-100">
                <div className="card-header">Continue existing survey</div>
                <div className="card-body d-flex justify-content-center h-100">
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }
}
export default withRouter(App);
import React, { Component } from 'react';
import Display from './Display.js';
import SolvedSystem from './SolvedSystem.js';

const Matrix = require('./../../../complex-algebra/matrices.js');
const ComplexNum = require('./../../../complex-algebra/complex-plane.js');
const SystemParse = require('./../../../complex-algebra/equation-parser.js');

function getInitialState() {
  return {
    equationStrings: [],
    equationObjects: [],
    systemMatrix: null,
    rref: null,
    inEditMode: true
  };
}

class System extends Component {
  constructor(props) {
    super(props);
    this.state = getInitialState();
    this.submitEq = this.submitEq.bind(this);
    this.solveEq = this.solveEq.bind(this);
  }

  solveEq(){
    const eqStrings = this.state.equationStrings.slice();
    const eqObjs = [];
    eqStrings.forEach(string => {
      eqObjs.push(SystemParse.parseEq(string));
    });
    const sysMatrix = SystemParse.createSystem(eqObjs);
    const rref = sysMatrix.rref();
    rref.columnNames = sysMatrix.columnNames;

    console.log('system matrix:', sysMatrix.display);

    this.setState({
      equationObjects: eqObjs,
      systemMatrix: sysMatrix,
      rref: rref,
      inEditMode: false
    });

  }

  submitEq(e) {
    e.preventDefault();
    const eqStrs = this.state.equationStrings.slice();
    eqStrs.push(document.getElementById('eq-input').value);
    document.getElementById('eq-input').value = '';

    this.setState({equationStrings: eqStrs});

    // eqStrs.push(document.getElementById('#eq-input').value);
  }

  editEq() {
    this.setState({
      inEditMode: true
    });
  }

  removeEq(e) {
    const eq = e.target.innerHTML;
    const eqStrs = this.state.equationStrings.slice();
    console.log('eqStrs is:', eqStrs);
    const index = eqStrs.indexOf(eq);
    eqStrs.splice(index, 1);
    document.getElementById('eq-input').value = eq;

    this.setState({
      equationStrings: eqStrs
    });
  }

  render() {
    let jsxToRender;
    let button;
    let form;
    if (this.state.inEditMode && !this.state.equationStrings.length) {
      form = (
        <form id="eq-form" onSubmit={this.submitEq}>
          <input id="eq-input" type="text" placeholder="Add an equation..." />
          <input id="eq-submit-button" type="submit" value="Add"/>
        </form>
      );
      jsxToRender = (
        <p>Add an equation to begin a linear system. Click on an equation to edit it.</p>
      );
    }
    else if (this.state.inEditMode) {
      form = (
        <form id="eq-form" onSubmit={this.submitEq}>
          <input id="eq-input" type="text" placeholder="Add an equation..." />
          <input id="eq-submit-button" type="submit" value="Add"/>
        </form>
      );
      button = (
        <button id="solve-button" onClick={this.solveEq}>Solve</button>
      );
      jsxToRender = (
        <div id="Container">
          <Display className="edit-display" eqStrings={this.state.equationStrings} clickHandler={this.removeEq.bind(this)}/>
        </div>
      );
    } else {
      button = (
        <button id="edit-button" onClick={this.editEq.bind(this)}>Edit</button>
      );
      jsxToRender = (
        <div id="Container">
          <Display className="solved-display" eqStrings={this.state.equationStrings} />
          <img className="solved-display" id="arrow" src="./../../../arrow.jpg" />
          <SolvedSystem className="solved-display" displayMatrix={this.state.rref}/>
        </div>
      );
    }
    return (
      <div className="system-pad">
        <h3><span className="rolf">Rolf</span>Wam <span className="beta">Beta</span></h3>
        {form}
        {jsxToRender}
        {button}
      </div>
    );
  }
}

export default System;

import React, { Component } from 'react';
import Equation from './Equation.js';

const Matrix = require('./../../../complex-algebra/matrices.js');
const ComplexNum = require('./../../../complex-algebra/complex-plane.js');
const SystemParse = require('./../../../complex-algebra/equation-parser.js');

const SolvedSystem = (props) => {

  const rref = props.displayMatrix;
  const columnNames = rref.columnNames;

  console.log(rref.display);

  const eqArr = SystemParse.interpretRREF(rref);
  const display = eqArr.map((string, i) => <Equation key={eqArr.length + i} eq={string}/>);

  const imgStyle = {
    height: display.length ?  display.length * 15 + 5 : 0
  };

  const eqHolderStyle = {
    height: (display.length * 10) + 2
  }

  return(
    <div className="img-plus-eqs">
      <img id="brace" src='./../../../left-brace.png' style={imgStyle}/>
      <div id="eq-holder" style={eqHolderStyle}>
        {display}
      </div>
    </div>
  )
}




export default SolvedSystem;

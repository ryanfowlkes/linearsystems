import React, { Component } from 'react';
import Equation from './Equation.js';

const Display = (props) => {

  const imgStyle = {
    height: props.eqStrings.length ?  props.eqStrings.length * 15 + 5 : 0
  };

  const eqHolderStyle = {
    height: (props.eqStrings.length * 10) + 2
  }

  let equationsArr = [];

  for (let i = 0; i < props.eqStrings.length; i += 1) {
    equationsArr.push(<Equation key={i} eq={props.eqStrings[i]} clickHandler={props.clickHandler}/>)
  }

  return (
      <div className="img-plus-eqs">
        <img id="brace" src='./../../../left-brace.png' style={imgStyle}/>
        <div id="eq-holder" style={eqHolderStyle}>
          {equationsArr}
        </div>
      </div>
  )
}

export default Display;

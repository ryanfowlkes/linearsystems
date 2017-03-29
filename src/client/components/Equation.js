import React, { Component } from 'react';

const Equation = (props) => {


  return (
    <button className="eq-button" onClick={props.clickHandler}>{props.eq}</button>
  );
}

export default Equation;

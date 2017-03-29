const ComplexNum = require('./complex-plane.js');
const Matrix = require('./matrices.js');

// Can only parse real numbers in decimal notation, or
// complex numbers (a + bi) or (a - bi) where a and b are positive real numbers in decimal notation

const SystemParse = {

  parseReal: (str, i) => {
    let numStr = '';
    while (str[i] === ' ') i += 1;
    while (str[i].match(/[0-9.]/)) {
      numStr += str[i];
      i += 1;
      if (i >= str.length) break;
    }
    return [new ComplexNum(parseFloat(numStr, 10)), i];
  },
  parseComplex: (str, i) => {
    let ReStr = '';
    let ImStr = '';
    let scalar;

    while (str[i] === ' ') i += 1;
    if (str[i] === '(') i += 1;
    while (str[i] === ' ') i += 1;

    while (str[i].match(/[0-9.-]/)) {
      ReStr += str[i];
      i += 1;
    }
    let Re = parseFloat(ReStr, 10);

    while (str[i] === ' ') i += 1;

    if (str[i] === '+') scalar = 1;
    else if (str[i] === '-') scalar = -1;
    else throw new Error('Unexpected complex number format');
    i += 1;

    while (str[i] === ' ') i += 1;

    while (str[i].match(/[0-9.]/)) {
      ImStr += str[i];
      i += 1;
    }
    let Im = ImStr === '' ? 1 : parseFloat(ImStr, 10);

    while (str[i] === ' ' || str[i] === '*') i += 1;

    if(str[i] === 'i') i += 1;
    else throw new Error('Unexpected complex number format - please include "i"');

    while (str[i] === ' ') i += 1;

    if (str[i] === ')') i += 1;

    return [new ComplexNum(Re, Im*scalar), i];
  },
  parseUnknown: (str, i) => {
    let unknown = '';
    while (str[i] === ' ') i += 1;
    while (/[a-z]/.test(str[i].toLowerCase())) {
      unknown += str[i].toLowerCase();
      i += 1;
    }
    while (str[i] === ' ') i += 1;
    return [unknown, i];
  },

  //TODO: FIX PARSE TERM TO HANDLE *
  parseTerm: (str, i) => {
    //starts on a non-whitespace character;

    let isNegative = false;
    let endTerm = false;
    let termObj = {};
    let scalarInfo;

    if (str[i] === '+') {
      i += 1;
      termObj.scalar = new ComplexNum(1);
    } else if (/[a-z]/.test(str[i].toLowerCase())) termObj.scalar = new ComplexNum(1);
    else if (str[i] === '-') {
      isNegative = true;
      i += 1;
      termObj.scalar = new ComplexNum(-1);
    }

    while (str[i] === ' ') i += 1;

    while (!endTerm) {
      switch (true) {
        case (/\-/.test(str[i])) :
          i += 1;
          break;
        case (/[0-9]/.test(str[i])) :
          scalarInfo =  SystemParse.parseReal(str, i);
          termObj.scalar = isNegative ? scalarInfo[0].times(-1) : scalarInfo[0];
          i = scalarInfo[1];
          break;

        case (/\(/.test(str[i])) :
          i += 1;
          scalarInfo = SystemParse.parseComplex(str, i);
          termObj.scalar = isNegative ? scalarInfo[0].times(-1) : scalarInfo[0];
          i = scalarInfo[1];
          break;

        case (/[a-z]/.test(str[i].toLowerCase())) :
          let unknownInfo = SystemParse.parseUnknown(str, i);
          termObj.unknown = unknownInfo[0];
          i = unknownInfo[1];
          endTerm = true;
      }
      while (str[i] === ' ') i += 1;
    }

    return [termObj, i];
  },
  parseResult: (str, i) => {
    let result;
    i += 1;
    while (str[i] === ' ') i += 1;
    if (str[i] === '(') {
      i += 1;
      result = SystemParse.parseComplex(str, i)[0];
    } else if (/[0-9]/.test(str[i])) result = SystemParse.parseReal(str, i)[0];
    else if (/\-/.test(str[i])) {
      i += 1;
      result = SystemParse.parseReal(str, i)[0].times(-1);
    } else {
      console.log('string is:', str, 'str[i] is:', str[i]);
      throw new Error('Unexpected evaluation');
    }

    return result;
  },

  parseEq: (eqStr) => {
    const eqObj = {};
    let i = 0;
    while (i < eqStr.length) {
      switch (true) {
        case (eqStr[i] === ' '):
          while (eqStr[i] === ' ') i += 1;
          break;

        case (/[a-z\-+0-9\(]/.test(eqStr[i].toLowerCase())) :
          let termInfo = SystemParse.parseTerm(eqStr, i);
          eqObj[termInfo[0].unknown] = termInfo[0].scalar;
          i = termInfo[1];
          break;

        case (/\=/.test(eqStr[i])) :
          eqObj.evaluatesTo = SystemParse.parseResult(eqStr, i);
          i = eqStr.length;
          break;
      }
    }
    return eqObj;
  },
  createSystem: (sysArr) => {
    const columnNames = [];
    const rows = [];
    sysArr.forEach(eqObj => {
      Object.keys(eqObj).forEach(unknown => {
        if (unknown !== 'evaluatesTo' && !columnNames.includes(unknown)) columnNames.push(unknown);
      });
    });
    columnNames.push('evaluatesTo');
    sysArr.forEach(eqObj => {
      let row = [];
      columnNames.forEach(unknown => {
        if (eqObj[unknown]) row.push(eqObj[unknown]);
        else row.push(new ComplexNum(0));
      });
      rows.push(row);
    });
    let result = new Matrix(...rows);
    result.columnNames = columnNames;
    return result;
  },

  interpretRREF: (rref) => {
    const columnNames = rref.columnNames;
    let results = [];
    let solutionExists = true;

    rref.value.forEach((row, rowNum) => {
      let eqStr = '';
      row.forEach((compNum, colNum) => {
        //colNum === row.length - 1
        if (colNum === row.length - 1) eqStr += `= ${compNum.display}`
        //compNum.display === '0'
        else if (compNum.display === '0') return;
        //compNum.display === 1 && eqStr === ''
        else if (compNum.display === '1' && eqStr === '') eqStr += `${columnNames[colNum]} `;
        //compNum.display === 1
        else if (compNum.display === '1') eqStr += `+ ${columnNames[colNum]} `;
        //compNum.Im !== 0
        else if (compNum.Im !== 0) eqStr += `+ (${compNum.display})${columnNames[colNum]} `;
        //compNum.Re < 0
        else if (compNum.Re < 0 && Math.abs(compNum.Re + 1) > 10e-10) eqStr += `- ${compNum.times(-1).display}${columnNames[colNum]} `;
        else if (compNum.Re < 0) eqStr += `- ${columnNames[colNum]} `;
        else eqStr += `+ ${compNum.display}${columnNames[colNum]} `;
      });
      console.log('current eqString is:', eqStr);
      if (eqStr[0] === '=' && row[row.length - 1].display !== '0') solutionExists = false;
      if (eqStr[0] !== '=') results.push(eqStr);
    });
    return solutionExists ? results : ['No solution exists'];
  }
}


module.exports = SystemParse;

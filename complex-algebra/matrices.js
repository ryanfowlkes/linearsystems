const ComplexNum = require('./complex-plane.js');

const inputMatrixErr = new Error('Please pass a Matrix object as an argument!');
const inputArrErr = new Error('Please pass arrays as arguments!');
const wrongSize = new Error('Input matrix is the wrong size!');

function deepClone(value) {
  if (value instanceof ComplexNum) return value.copy();
  else if (typeof value !== 'object') return value;
  const clone = new value.constructor();
  if (Array.isArray(value)) value.forEach(element => {clone.push(deepClone(element))});
  else Object.keys(value).forEach(key => {clone[key] = value[key]});
  return clone;
}



function isComplex(value) {
  return value instanceof ComplexNum;
}

class Matrix {
  constructor(...rows) {
    if (!rows.length) throw inputArrErr;

    this.rows = rows.length;
    this.columns = rows[0].length;

    rows.forEach((row, i) => {
      if (!Array.isArray(row)) throw inputArrErr;
      if (row.length !== this.columns) throw new Error('Rows must be the same length!');
      row.forEach((el, ind) => {
        if ((typeof el !== 'number' && !(el instanceof ComplexNum)) || Number.isNaN(el)) throw new Error('Matrix elements must be real or complex numbers!');
        if (!isComplex(el)) {
          row[ind] = new ComplexNum(el);
        }
      });
    })
    this.value = [...rows];

    //Unary Matrix Operations
    this.transpose = () => {
      const columns = this.getColumns();
      const transpose = new Matrix(...columns);
      if (this.calculatedDet) {
        transpose.det = this.det;
        transpose.calculatedDet = true;
      }
      return transpose;
    }
    this.conjugate = () => {
      const newRows = [];
      this.value.forEach(row => {
        const newRow = [];
        row.forEach((el, colNum) => {
          newRow.push(el.conjugate());
        });
        newRows.push(newRow);
      });
      return new Matrix(...newRows);
    }
    this.adjoint = () => {
      return this.conjugate().transpose();
    }
    this.minor = (n,m) => {
      if (!Number.isInteger(n) || !Number.isInteger(m)) throw new Error('Please pass integers!');
      if (n < 0 || n > this.rows - 1 || m < 0 || m > this.columns) throw new Error('Input is not a valid matrix entry');

      const newRows = [];
      this.value.forEach((row, rowNum) => {
        if (rowNum !== n) {
          const newRow = [];
          row.forEach((el, colNum) => {
            if (colNum !== m) newRow.push(el);
          });
          newRows.push(newRow);
        }
      });
      return new Matrix(...newRows);
    }

    this.getColumns = () => {
      const columns = [];
      this.value[0].forEach((el, col) => {
        const column = [];
        this.value.forEach(row => {
          column.push(row[col]);
        });
        columns.push(column);
      });
      return columns;
    }
    this.getDisplay = () => {
      let disp = `\n`;
      let columnWidths = this.getColumns().map(column => column.map(el => el.display.length));
      columnWidths = columnWidths.map(col => Math.max(...col));

      rows.forEach((row, rowNum) => {
        let rowStr = `|`;
        row.forEach((el, colNum) => {
          rowStr += `(${el.display})`;
          for (let j = 0; j < columnWidths[colNum] - el.display.length + 1; j += 1) rowStr += ' ';
          if (colNum  === row.length - 1) rowStr += '|';
        })

        if (rowNum !== rows.length - 1) rowStr += '\n';
        disp += rowStr;
      });



      return disp;
    }
    this.display = this.getDisplay();



    //Basic Matrix Arithmetic Methods
    this.times = (matrix) => {
      if (!(matrix instanceof Matrix)) throw inputMatrixErr;
      if (matrix.rows !== this.columns) throw wrongSize;
      const columns = matrix.getColumns();
      const newRows = [];
      this.value.forEach(row => {
        const newRow = [];
        columns.forEach(column => {
          let product = new ComplexNum(0, 0);
          column.forEach((num, ind) => {
            product = product.plus(num.times(row[ind]));
          });
          newRow.push(product);
        });
        newRows.push(newRow);
      });
      const productMatrix = new Matrix(...newRows);
      if (matrix.calculatedDet && this.calculatedDet) {
        productMatrix.det = (matrix.det === undefined || this.det === undefined) ? undefined : matrix.det * this.det;
        productMatrix.calculatedDet = true;
      }
      return productMatrix;
    }
    this.scale = (scalar) => {
      if (!(scalar instanceof ComplexNum)) scalar = new ComplexNum(scalar);
      const newRows = [];
      this.value.forEach(row => {
        let newRow = row.map(el => el.times(scalar));
        newRows.push(newRow);
      });
      return new Matrix(...newRows);
    }
    this.plus = (matrix) => {
      if (!(matrix instanceof Matrix)) throw inputMatrixErr;
      if (matrix.rows !== this.rows || matrix.columns !== this.columns) throw wrongSize;
      const newRows = [];
      this.value.forEach((row, rowNum) => {
        const newRow = [];
        row.forEach((el, colNum) => {
          newRow.push(el.plus(matrix.value[rowNum][colNum]));
        });
        newRows.push(newRow);
      });
      return new Matrix(...newRows);
    }
    this.minus = (matrix) => {
      if (!(matrix instanceof Matrix)) throw inputMatrixErr;
      if (matrix.rows !== this.rows || matrix.columns !== this.columns) throw wrongSize;
      return matrix.scale(-1).plus(this);
    }

    //Determinants. Think about switching Determinant calculation to a method employing RREF
    this.calculatedDet = false;
    this.getDet = () => {
      if (this.calculatedDet) return this.det;
      this.calculatedDet = true;
      if (this.rows !== this.columns) return undefined;

      if (this.value.length === 1) return this.value[0][0];
      else {
        let altSum = new ComplexNum(0,0);
        this.value[0].forEach((el, colNum) => {
          let alt = (colNum % 2) ? new ComplexNum(-1) : new ComplexNum(1);
          altSum = altSum.plus(alt.times(el).times(this.minor(0,colNum).det));
        })
        return altSum;
      }
    }
    this.det = this.getDet();

    this.minors = () => {
      const newRows = [];
      this.value.forEach((row, rowNum) => {
        const newRow = [];
        row.forEach((el, colNum) => {
          newRow.push(this.minor(rowNum, colNum).det);
        });
        newRows.push(newRow);
      });
      return new Matrix(...newRows);
    }
    this.cofactor = () => {
      const negOne = new ComplexNum(-1);
      const minors = this.minors();
      const newRows = [];
      minors.value.forEach((row, rowNum) => {
        let newRow = [];
        row.forEach((el, colNum) => {
          colNum % 2 !== rowNum % 2 ? newRow.push(negOne.times(row[colNum])): newRow.push(row[colNum]);
        });
        newRows.push(newRow);
      });
      return new Matrix(...newRows);
    }
    this.inverse = () => {
      const det = this.det;
      if (det === 0) return undefined;
      const one = new ComplexNum(1);
      const scalar = one.dividedBy(det);

      //transpose or adjoint???
      return this.cofactor().adjoint().scale(scalar);
    }

    this.copy = () => {
      return new Matrix(...deepClone(this.value));
    }
    this.swapRows = (i, j) => {
      [ this.value[i] , this.value[j] ] =   [ this.value[j] , this.value[i] ];
    }
    this.concatRight = (matrix) => {
      if (!(matrix instanceof Matrix)) throw new Error('please input matrix into concatRight');
      if (matrix.rows !== this.rows) throw new Error('cannot concatRight matrices with diff number of rows');

      const newRows = [];
      this.value.forEach((leftRow, rowNum) => {
        newRows.push(leftRow.concat(matrix.value[rowNum]));
      });
      return new Matrix(...newRows);
    }
    this.concatUnder = (matrix) => {
      if (!(matrix instanceof Matrix)) throw new Error('please input matrix into concatUnder');
      if (matrix.columns !== this.columns) throw new Error('cannot concatUnder matrices with diff number of columns');

      const newRows = deepClone(this.value);
      const underRows = deepClone(matrix.value);
      underRows.forEach(newRow => {
        newRows.push(newRow);
      });
      return new Matrix(...newRows);
    }
    this.shiftCol = () => {
      const matrix = this.copy();
      matrix.value.forEach(row => {
        row.shift();
      });
      return new Matrix (...matrix.value.slice());
    }

    this.gaussScale = (rowNum, scalar) => {
      const newRows = deepClone(this.value);
      newRows[rowNum] = newRows[rowNum].map(num => num.times(scalar));
      return new Matrix(...newRows);
    }
    this.gaussAdd = (rowToChange, rowToAdd) => {
      const newRows = deepClone(this.value);
      newRows[rowToChange] = newRows[rowToChange].map((num, colNum) => {
        return num.plus(newRows[rowToAdd][colNum]);
      });
      return new Matrix(...newRows);
    }
    this.gaussMove = (rowToChange, rowToScaleAdd, scalar) => {
      const revertRow = this.value[rowToScaleAdd].slice();
      const incompleteMatrix = this.gaussScale(rowToScaleAdd, scalar).gaussAdd(rowToChange, rowToScaleAdd);
      const newRows = deepClone(incompleteMatrix.value);
      newRows[rowToScaleAdd] = revertRow;
      return new Matrix(...newRows);
    }

    this.ref = () => {
      //Base case: Matrix contains one row
      if (this.value.length === 1) {
        let i = 0;
        while(this.value[0][i] !== undefined && this.value[0][i].isZero()) i += 1;
        if (this.value[0][i]) {
          return this.gaussScale(0, this.value[0][i].recip());
        }
        return this.copy();
      }

      //Base case: Matrix contains one column
      if (this.columns === 1) {
        // check for nonzero entry
        let i = 0;
        while (this.value[i][0] !== undefined && this.value[i][0].isZero()) {
          i += 1;
          if (i > this.rows - 1) break;
        }
        // if it exists ruturn a column Matrix with a 1 at top
        if (i < this.rows) {
          const newRows = [[new ComplexNum(1)]]
          for (let j = 0; j < this.rows - 1; j += 1) {
            newRows.push([new ComplexNum(0, 0)]);
          }
          return new Matrix(...newRows);
        }else {
          return this.copy();
        }

      }


      let matrix = this.copy();
      const columns = matrix.getColumns();
      let i = 0;

      // 1. Check if first column has a nonzero entry
      while (columns[0][i] !== undefined && columns[0][i].isZero()) i += 1;
      if (i < matrix.rows) {
        //move row to the top and scale it for a leading 1
        if (i > 0) matrix.swapRows(i, 0);
        matrix = matrix.gaussScale(0, matrix.value[0][0].recip());
        // Eliminate nonzero entries in first column
        for (let rowNum = 1; rowNum < matrix.rows; rowNum += 1) {
          if (!matrix.value[rowNum][0].isZero()) {
            matrix = matrix.gaussMove(rowNum, i, matrix.value[rowNum][0].times(-1));
          }
        }
        // return value: ref of minor(0,0), with top left corner wrapped around
        const subMatrix = matrix.minor(0,0).ref();
        let zerosArray = [];
        for (let j = 0; j < matrix.rows - 1; j += 1) zerosArray.push([0]);
        const zerosMatrix = new Matrix(...zerosArray);
        const topRowMatrix = new Matrix(matrix.value[0].slice());
        return topRowMatrix.concatUnder(zerosMatrix.concatRight(subMatrix));
      } else {
        // 1. B. return rref of matrix with out first column, with first column concatenaed on
        let zerosArray = [];
        for (let j = 0; j < matrix.rows; j += 1) zerosArray.push([0]);
        let zerosMatrix = new Matrix(...zerosArray);
        let subMatrix = matrix.shiftCol();

        return zerosMatrix.concatRight(subMatrix.ref());
      }



    }
    this.rref = () => {
      let matrix = this.ref();

      //loop through rows
      for (let rowNum = 0; rowNum < matrix.rows; rowNum += 1) {
        let currRow = matrix.value[rowNum];
        //check row for leading value
        let colNum = 0;
        while (currRow[colNum] && currRow[colNum].isZero()) colNum += 1;
          // if it has a leading value, save the columnNum and then loop through all other rows again
        if (colNum < matrix.columns) {
          for (let tempRowNum = 0; tempRowNum < rowNum; tempRowNum += 1) {
            if (!matrix.value[tempRowNum][colNum].isZero()) {
              matrix = matrix.gaussMove(tempRowNum, rowNum, matrix.value[tempRowNum][colNum].times(-1));
            }
          }
        } else {
          return matrix;
        }
      }
      return matrix;
    }




    // QR DECOMPOSITION
    // LU DECOMPOSITION // preservesOrientation
    // EIGENVALUES // MUTIPLICITY OF EIGENVALUES // EIGENVECTORS // SINGULAR VALUES
    // fix display layout
    //adjugate
    // forEach and array-like methods
    // ensure methods that return a new matrix update the determinant if relevant

  }
}

// const A = new Matrix([4,3, -1, 1],[1,0,-1,new ComplexNum(0,1)], [0,0,1,3]);
//
// console.log(A.rref().value[1][3]);


module.exports = Matrix;

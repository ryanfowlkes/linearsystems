class ComplexNum {
  constructor(a, b = 0) {
    this.Re = a;
    this.Im = b;

    this.isZero = () => {
      return this.Re === 0 && this.Im === 0;
    }

    this.getDisplay = () => {
      let operator = this.Im > 0 ? '+' : '-';

      let re;
      if ( Math.abs(this.Re - Math.round(this.Re)) < 10e-10 ) re = Math.round(this.Re);
      else if (!Number.isInteger(this.Re*10000)) re = this.Re.toPrecision(4);
      else re = this.Re;

      let im;
      if (Math.abs(this.Im - 1) < 10e-10) {
        im = '';
      } else if (Math.abs(this.Im + 1) < 10e-10) {
        im = '';
      } else if ( Math.abs(this.Im - Math.round(this.Im)) <  10e-10) {
        im = Math.round(this.Im);
      } else if (!Number.isInteger(this.Im*10000)) im = this.Im.toPrecision(4);
      else im = this.Im;

      if (im < 0) im = -1*im;

      return im !== 0 ? `${re} ${operator} ${im}i` : `${re}`;
    }
    this.display = this.getDisplay();


    this.conjugate = () => new ComplexNum(this.Re, -this.Im);
    this.recip = () => {
      const one = new ComplexNum(1);
      return one.dividedBy(this);
    }

    this.copy = () => {
      return new ComplexNum(this.Re, this.Im);
    }

    this.plus = (num, im = 0) => {
      if (!(num instanceof ComplexNum)) {
        if (typeof num !== 'number' || Number.isNaN(num) || typeof im !== 'number' ||  Number.isNaN(num)) {
          throw new Error('invalid input to ComplexNum.plus method');
        }
        return new ComplexNum(this.Re + num, this.Im + im);
      }
      else {
        return new ComplexNum(this.Re + num.Re, this.Im + num.Im);
      }
    }
    this.minus = (num, im = 0) => {
      if (!(num instanceof ComplexNum)) {
        if (typeof num !== 'number' || Number.isNaN(num) || typeof im !== 'number' ||  Number.isNaN(num)) {
          throw new Error('invalid input to ComplexNum.plus method');
        }
        return new ComplexNum(this.Re - num, this.Im - im);
      } else {
        return new ComplexNum(this.Re - num.Re, this.Im - num.Im);
      }
    }
    this.times = (num, im = 0) => {
      let realPart, imPart;
      if (!(num instanceof ComplexNum)) {
        if (typeof num !== 'number' || Number.isNaN(num) || typeof im !== 'number' ||  Number.isNaN(num)) {
          throw new Error('invalid input to ComplexNum.plus method');
        }
        realPart = (this.Re * num) - (this.Im * im);
        imPart = (this.Re * im) + (this.Im * num);
      } else {
        realPart = (this.Re * num.Re) - (this.Im * num.Im);
        imPart = (this.Re * num.Im) + (this.Im * num.Re);
      }
      return new ComplexNum(realPart, imPart);
    }
    this.dividedBy = (num, im = 0) => {
      let conjugate, denom;
      if (!(num instanceof ComplexNum)) {
        if (typeof num !== 'number' || Number.isNaN(num) || typeof im !== 'number' ||  Number.isNaN(num)) {
          throw new Error('invalid input to ComplexNum.plus method');
        }
        conjugate = new ComplexNum(num, -im);
        denom = conjugate.times(num, im).Re;
      } else {
        conjugate = num.conjugate();
        denom = conjugate.times(num).Re;
      }
      const numerator = this.times(conjugate);
      return new ComplexNum(numerator.Re / denom, numerator.Im / denom);
    }
    this.pow = (num, im = 0) => {
      let c, d;
      if (!(num instanceof ComplexNum)) {
        if (typeof num !== 'number' || Number.isNaN(num) || typeof im !== 'number' ||  Number.isNaN(num)) {
          throw new Error('invalid input to ComplexNum.plus method');
        }
        c = num;
        d = im;
      } else {
        c = num.Re;
        d = num.Im;
      }
      let x;
      if (this.Re === 0 && this.Im === 0) return (c === 0 && d === 0) ? 1 : 0;

      if (this.Re === 0 && this.Im < 0) x = (3 * Math.PI) / 2;
      else if (this.Re === 0 && this.Im > 0) x = Math.PI / 2;
      else if (this.Re < 0 && this.Im === 0) x = Math.PI;
      else if (this.Re > 0 && this.Im === 0) x = 0;
      else x = Math.atan(this.Im / this.Re);

      const M = Math.sqrt(Math.pow(this.Re, 2) + Math.pow(this.Im, 2));
      const phi = (Math.log(M) * c) - (x * d);
      const theta = (Math.log(M) * d) + (x * c);

      const realPart = Math.cos(theta) * Math.pow(Math.E, phi);
      const imPart = Math.sin(theta) * Math.pow(Math.E, phi);

      return new ComplexNum(realPart, imPart);
    }
  }

  pow() {
    // move pow() function here!
  }

  isComplexNum(value) {
    return value instanceof ComplexNum;
  }

}


module.exports = ComplexNum;

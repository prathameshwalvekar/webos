import React, { useState } from 'react';
import { Delete } from 'lucide-react';

const CalculatorApp: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string) => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '*':
        return firstValue * secondValue;
      case '/':
        return firstValue / secondValue;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const performCalculation = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const buttons = [
    ['C', '±', '%', '/'],
    ['7', '8', '9', '*'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '=']
  ];

  const handleButtonClick = (value: string) => {
    if (value === 'C') {
      clear();
    } else if (value === '±') {
      setDisplay(String(parseFloat(display) * -1));
    } else if (value === '%') {
      setDisplay(String(parseFloat(display) / 100));
    } else if (['+', '-', '*', '/'].includes(value)) {
      inputOperation(value);
    } else if (value === '=') {
      performCalculation();
    } else if (value === '.') {
      if (display.indexOf('.') === -1) {
        inputNumber(value);
      }
    } else {
      inputNumber(value);
    }
  };

  return (
    <div className="h-full bg-gray-100 p-4">
      <div className="max-w-xs mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Display */}
        <div className="bg-gray-900 text-white p-4">
          <div className="text-right text-3xl font-light overflow-hidden">
            {display}
          </div>
        </div>

        {/* Buttons */}
        <div className="p-4">
          {buttons.map((row, rowIndex) => (
            <div key={rowIndex} className="flex mb-2 last:mb-0">
              {row.map((button) => (
                <button
                  key={button}
                  onClick={() => handleButtonClick(button)}
                  className={`
                    flex-1 h-12 mx-1 rounded-lg font-medium transition-colors
                    ${button === '0' ? 'flex-[2]' : ''}
                    ${['C', '±', '%'].includes(button) 
                      ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' 
                      : ['+', '-', '*', '/', '='].includes(button)
                        ? 'bg-orange-500 hover:bg-orange-600 text-white'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                    }
                  `}
                >
                  {button}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalculatorApp;
import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

const MathCaptcha = forwardRef(({ onValidate }, ref) => {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [error, setError] = useState(false);

  const generateChallenge = () => {
    setNum1(Math.floor(Math.random() * 9) + 1);
    setNum2(Math.floor(Math.random() * 9) + 1);
    setUserInput('');
    setError(false);
  };

  useEffect(() => {
    generateChallenge();
  }, []);

  useImperativeHandle(ref, () => ({
    validate: () => {
      if (!userInput) {
        toast.error('Please complete the security check');
        setError(true);
        return false;
      }
      const isCorrect = parseInt(userInput) === num1 + num2;
      if (!isCorrect) {
        toast.error('Security check failed. Please try again.');
        setError(true);
        generateChallenge();
      }
      return isCorrect;
    },
    reset: () => generateChallenge()
  }));

  return (
    <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-3">
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">Security Check</span>
      </div>
      
      <div className="flex flex-col gap-2">
        {/* Math Box - Row 1 */}
        <div className="flex items-center justify-center bg-white border border-brand-100 rounded-lg py-2 shadow-sm w-full">
          <span className="text-lg font-bold text-gray-800 tabular-nums">
            {num1} <span className="text-brand-500 mx-1">+</span> {num2}
          </span>
          <span className="text-lg font-bold text-gray-300 ml-2">=</span>
        </div>

        {/* Input & Refresh - Row 2 */}
        <div className="flex gap-2 w-full">
          <input
            type="number"
            value={userInput}
            onChange={(e) => {
              setUserInput(e.target.value);
              setError(false);
            }}
            placeholder="Answer"
            className={`flex-1 px-3 py-2 bg-white border ${error ? 'border-red-200 focus:border-red-500' : 'border-gray-100 focus:border-brand-500'} rounded-lg transition-all outline-none text-center text-base font-bold placeholder:text-gray-300 placeholder:text-xs placeholder:font-medium focus:ring-2 focus:ring-brand-500/10`}
          />
          <button
            type="button"
            onClick={generateChallenge}
            className="p-2 bg-white border border-gray-100 hover:border-brand-200 hover:bg-brand-50 text-gray-400 hover:text-brand-500 rounded-lg transition-all shadow-sm active:scale-95"
            title="Refresh Challenge"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
});

export default MathCaptcha;

/* import React, { useState } from 'react';
import { Home, ArrowLeft } from 'lucide-react';

// HomePage Component
const HomePage = ({ onNavigate }) => (
  <div className="min-h-screen bg-gray-100 p-8">
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-8">
        <h1 className="text-2xl font-bold text-center mb-8">Automata Tools</h1>
        <div className="space-y-4">
          <button
            onClick={() => onNavigate('dfa')}
            className="w-full p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            DFA Simulator
          </button>
          <button
            onClick={() => onNavigate('nfa')}
            className="w-full p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            NFA to DFA Converter
          </button>
        </div>
      </div>
    </div>
  </div>
);

// DFA Simulator Component
const DFASimulator = ({ onBack }) => {
  const [input, setInput] = useState('');
  const [states, setStates] = useState('');
  const [transitions, setTransitions] = useState('');
  const [result, setResult] = useState(null);

  const simulateDFA = () => {
    try {
      const stateList = states.split(',').map(s => s.trim());
      const transitionRules = {};
      
      transitions.split('\n').forEach(rule => {
        const [from, symbol, to] = rule.split(',').map(s => s.trim());
        if (!transitionRules[from]) transitionRules[from] = {};
        transitionRules[from][symbol] = to;
      });

      let currentState = stateList[0];
      const inputSymbols = input.split('');

      const steps = [{
        state: currentState,
        remaining: [...inputSymbols]
      }];

      for (const symbol of inputSymbols) {
        if (!transitionRules[currentState] || !transitionRules[currentState][symbol]) {
          setResult({
            accepted: false,
            steps,
            error: `No transition defined for state ${currentState} with symbol ${symbol}`
          });
          return;
        }
        currentState = transitionRules[currentState][symbol];
        steps.push({
          state: currentState,
          remaining: inputSymbols.slice(inputSymbols.indexOf(symbol) + 1)
        });
      }

      setResult({
        accepted: true,
        steps
      });
    } catch (error) {
      setResult({
        accepted: false,
        error: error.message
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">DFA Simulator</h2>
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
              Back
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                States (comma-separated)
              </label>
              <input
                type="text"
                value={states}
                onChange={(e) => setStates(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="q0,q1,q2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transitions (from,symbol,to - one per line)
              </label>
              <textarea
                value={transitions}
                onChange={(e) => setTransitions(e.target.value)}
                className="w-full p-2 border rounded"
                rows="4"
                placeholder="q0,0,q1&#10;q0,1,q0&#10;q1,0,q1&#10;q1,1,q0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input String
              </label>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="10101"
              />
            </div>

            <button
              onClick={simulateDFA}
              className="w-full p-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Simulate
            </button>

            {result && (
              <div className={`mt-4 p-4 rounded ${result.accepted ? 'bg-green-100' : 'bg-red-100'}`}>
                <h3 className="font-bold mb-2">
                  {result.accepted ? 'String Accepted' : 'String Rejected'}
                </h3>
                {result.error ? (
                  <p className="text-red-600">{result.error}</p>
                ) : (
                  <div className="space-y-2">
                    <h4 className="font-medium">Simulation Steps:</h4>
                    {result.steps.map((step, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <span className="font-mono">State: {step.state}</span>
                        <span className="font-mono">
                          Remaining Input: {step.remaining.join('')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// NFA to DFA Converter Component
const NFAConverter = ({ onBack }) => {
  const [states, setStates] = useState('');
  const [alphabet, setAlphabet] = useState('');
  const [transitions, setTransitions] = useState('');
  const [convertedDFA, setConvertedDFA] = useState(null);

  const convertToDFA = () => {
    try {
      const stateList = states.split(',').map(s => s.trim());
      const alphabetList = alphabet.split(',').map(s => s.trim());
      const nfaTransitions = {};
      
      // Parse NFA transitions
      transitions.split('\n').forEach(rule => {
        const [from, symbol, to] = rule.split(',').map(s => s.trim());
        if (!nfaTransitions[from]) nfaTransitions[from] = {};
        if (!nfaTransitions[from][symbol]) nfaTransitions[from][symbol] = new Set();
        nfaTransitions[from][symbol].add(to);
      });

      // Convert NFA to DFA
      const dfaStates = new Set([JSON.stringify([stateList[0]])]);
      const dfaTransitions = {};
      const unprocessedStates = [[stateList[0]]];

      while (unprocessedStates.length > 0) {
        const currentState = unprocessedStates.shift();
        const currentStateStr = JSON.stringify(currentState);

        alphabetList.forEach(symbol => {
          const nextStates = new Set();
          currentState.forEach(state => {
            if (nfaTransitions[state] && nfaTransitions[state][symbol]) {
              nfaTransitions[state][symbol].forEach(s => nextStates.add(s));
            }
          });

          const nextStatesArray = Array.from(nextStates).sort();
          const nextStatesStr = JSON.stringify(nextStatesArray);

          if (!dfaTransitions[currentStateStr]) dfaTransitions[currentStateStr] = {};
          dfaTransitions[currentStateStr][symbol] = nextStatesStr;

          if (!dfaStates.has(nextStatesStr) && nextStatesArray.length > 0) {
            dfaStates.add(nextStatesStr);
            unprocessedStates.push(nextStatesArray);
          }
        });
      }

      setConvertedDFA({
        states: Array.from(dfaStates),
        transitions: dfaTransitions
      });
    } catch (error) {
      setConvertedDFA({
        error: error.message
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">NFA to DFA Converter</h2>
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
              Back
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                States (comma-separated)
              </label>
              <input
                type="text"
                value={states}
                onChange={(e) => setStates(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="q0,q1,q2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alphabet (comma-separated)
              </label>
              <input
                type="text"
                value={alphabet}
                onChange={(e) => setAlphabet(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="0,1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NFA Transitions (from,symbol,to - one per line)
              </label>
              <textarea
                value={transitions}
                onChange={(e) => setTransitions(e.target.value)}
                className="w-full p-2 border rounded"
                rows="4"
                placeholder="q0,0,q0&#10;q0,0,q1&#10;q1,1,q2"
              />
            </div>

            <button
              onClick={convertToDFA}
              className="w-full p-3 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              Convert to DFA
            </button>

            {convertedDFA && (
              <div className="mt-4 p-4 rounded bg-gray-100">
                {convertedDFA.error ? (
                  <p className="text-red-600">{convertedDFA.error}</p>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold mb-2">DFA States:</h3>
                      <ul className="list-disc pl-5">
                        {convertedDFA.states.map((state, index) => (
                          <li key={index} className="font-mono">
                            {state}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-bold mb-2">DFA Transitions:</h3>
                      <div className="space-y-2">
                        {Object.entries(convertedDFA.transitions).map(([from, transitions], index) => (
                          <div key={index}>
                            <h4 className="font-medium">From {from}:</h4>
                            <ul className="list-disc pl-5">
                              {Object.entries(transitions).map(([symbol, to], subIndex) => (
                                <li key={subIndex} className="font-mono">
                                  {symbol} → {to}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const AutomataApp = () => {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'dfa':
        return <DFASimulator onBack={() => setCurrentPage('home')} />;
      case 'nfa':
        return <NFAConverter onBack={() => setCurrentPage('home')} />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return <div>{renderPage()}</div>;
};

export default AutomataApp; */

import React, { useState } from 'react';
import HomePage from './HomePage';
import DFASimulator from './DFASimulator';
import NFAtoDFAConverter from './NFAtoDFAConverter';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'dfa':
        return <DFASimulator onBack={() => setCurrentPage('home')} />;
      case 'nfa':
        return <NFAtoDFAConverter onBack={() => setCurrentPage('home')} />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return <div>{renderPage()}</div>;
};

export default App;

// HomePage Component
import React from 'react';

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

export default HomePage;

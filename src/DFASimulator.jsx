import React, { useState } from "react";
import Cytoscape from "cytoscape";
import { ArrowLeft } from "lucide-react";

const DFASimulator = ({ onBack }) => {
  const [states, setStates] = useState("");
  const [transitions, setTransitions] = useState("");
  const [startState, setStartState] = useState("");
  const [finalStates, setFinalStates] = useState("");
  const [inputString, setInputString] = useState("");
  const [result, setResult] = useState("");

  const simulateDFA = () => {
    try {
      const statesArray = states.replace(/[{}]/g, "").split(",").map((s) => s.trim());
      const finalStatesArray = finalStates.replace(/[{}]/g, "").split(",").map((s) => s.trim());
      const transitionArray = transitions
        .trim()
        .split("\n")
        .map((line) => {
          const [from, symbol, to] = line.split(",");
          return { from: from.trim(), symbol: symbol.trim(), to: to.trim() };
        });

      if (!statesArray.includes(startState.trim())) {
        setResult("Error: Start state is not in the list of states.");
        return;
      }

      const inputSymbols = inputString.trim().split("");
      let currentState = startState.trim();

      for (let symbol of inputSymbols) {
        const transition = transitionArray.find(
          (t) => t.from === currentState && t.symbol === symbol
        );

        if (!transition) {
          setResult(`String Rejected: No transition defined for state {${currentState}} with symbol ${symbol}`);
          return;
        }

        currentState = transition.to;
      }

      if (finalStatesArray.includes(currentState)) {
        setResult("String Accepted!");
      } else {
        setResult("String Rejected: Final state not reached.");
      }

      // Render DFA as SVG
      renderDFASVG(statesArray, transitionArray, startState, finalStatesArray);
    } catch (error) {
      setResult("Error: Invalid input format.");
    }
  };

  const renderDFASVG = (statesArray, transitions, startState, finalStatesArray) => {
    const elements = [];

    // Add nodes (states)
    statesArray.forEach((state) => {
      elements.push({
        data: {
          id: state,
          label: state,
          type: finalStatesArray.includes(state) ? "final" : "normal",
        },
      });
    });

    // Add edges (transitions)
    transitions.forEach(({ from, symbol, to }) => {
      elements.push({
        data: {
          source: from,
          target: to,
          label: symbol,
        },
      });
    });

    // Render using Cytoscape
    Cytoscape({
      container: document.getElementById("cy"), // Div ID to render the SVG
      elements: elements,
      style: [
        {
          selector: "node",
          style: {
            "background-color": "#3498db",
            label: "data(label)",
            "text-valign": "center",
            "text-halign": "center",
          },
        },
        {
          selector: "node[type='final']",
          style: {
            "border-color": "#e74c3c",
            "border-width": "2px",
          },
        },
        {
          selector: "edge",
          style: {
            "curve-style": "bezier",
            "target-arrow-shape": "triangle",
            "line-color": "#2ecc71",
            "target-arrow-color": "#2ecc71",
            label: "data(label)",
          },
        },
      ],
      layout: {
        name: "grid",
        rows: 1,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8">
          <button
            onClick={onBack}
            className="mb-4 flex items-center text-blue-500 hover:text-blue-700"
          >
            <ArrowLeft className="mr-2" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-center mb-8">DFA Simulator</h1>
          <div className="space-y-4">
            <textarea
              className="w-full p-2 border rounded"
              placeholder="States (comma-separated) e.g., {q0, q1, q2}"
              value={states}
              onChange={(e) => setStates(e.target.value)}
            />
            <textarea
              className="w-full p-2 border rounded"
              placeholder="Transitions (from,symbol,to - one per line) e.g., q0,0,q1"
              value={transitions}
              onChange={(e) => setTransitions(e.target.value)}
            />
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Start State e.g., q0"
              value={startState}
              onChange={(e) => setStartState(e.target.value)}
            />
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Final States (comma-separated) e.g., {q2}"
              value={finalStates}
              onChange={(e) => setFinalStates(e.target.value)}
            />
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Input String e.g., 10101"
              value={inputString}
              onChange={(e) => setInputString(e.target.value)}
            />
            <button
              onClick={simulateDFA}
              className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Simulate
            </button>
            {result && (
              <div
                className={`mt-4 p-2 rounded ${
                  result.startsWith("String Accepted")
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {result}
              </div>
            )}
          </div>
          <div id="cy" style={{ width: "100%", height: "400px", marginTop: "16px" }}></div>
        </div>
      </div>
    </div>
  );
};

export default DFASimulator;
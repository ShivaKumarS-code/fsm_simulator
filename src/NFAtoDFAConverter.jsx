import React, { useState } from "react";
import Cytoscape from "cytoscape";
import { ArrowLeft } from "lucide-react";

const NFAtoDFAConverter = ({ onBack }) => {
  const [nfaStates, setNFAStates] = useState("");
  const [nfaTransitions, setNFATransitions] = useState("");
  const [startState, setStartState] = useState("");
  const [finalStates, setFinalStates] = useState("");
  const [dfaResult, setDFAResult] = useState(null);

  const convertNFAtoDFA = () => {
    try {
      const stateList = nfaStates.split(",").map((s) => s.trim());
      const finalStateSet = new Set(finalStates.split(",").map((s) => s.trim()));
      const transitionRules = {};

      // Parse transitions
      nfaTransitions.split("\n").forEach((rule) => {
        const [from, symbol, to] = rule.split(",").map((s) => s.trim());
        if (!transitionRules[from]) transitionRules[from] = {};
        if (!transitionRules[from][symbol]) transitionRules[from][symbol] = new Set();
        transitionRules[from][symbol].add(to);
      });

      const dfaStates = new Set();
      const dfaTransitions = {};
      const queue = [new Set([startState])];
      const trapState = "TRAP";

      while (queue.length > 0) {
        const currentSet = queue.shift();
        const setName = Array.from(currentSet).sort().join(",");

        if (!dfaStates.has(setName)) {
          dfaStates.add(setName);

          Object.keys(transitionRules).forEach((fromState) => {
            Object.keys(transitionRules[fromState]).forEach((symbol) => {
              const reachableStates = Array.from(currentSet)
                .map((state) => transitionRules[state]?.[symbol] || new Set())
                .reduce((acc, curr) => new Set([...acc, ...curr]), new Set());

              const reachableSetName = Array.from(reachableStates).sort().join(",");
              if (reachableSetName) {
                if (!dfaStates.has(reachableSetName)) {
                  queue.push(reachableStates);
                }
                if (!dfaTransitions[setName]) dfaTransitions[setName] = {};
                dfaTransitions[setName][symbol] = reachableSetName;
              } else {
                // Add transition to the trap state
                if (!dfaTransitions[setName]) dfaTransitions[setName] = {};
                dfaTransitions[setName][symbol] = trapState;
              }
            });
          });
        }
      }

      // Add transitions for the trap state
      const allSymbols = new Set(
        Object.values(transitionRules)
          .flatMap((rule) => Object.keys(rule))
      );

      dfaStates.add(trapState);
      dfaTransitions[trapState] = {};
      allSymbols.forEach((symbol) => {
        dfaTransitions[trapState][symbol] = trapState;
      });

      // Determine new final states
      const dfaFinalStates = Array.from(dfaStates).filter((state) =>
        state.split(",").some((s) => finalStateSet.has(s))
      );

      const dfaData = {
        states: Array.from(dfaStates),
        startState,
        finalStates: dfaFinalStates,
        transitions: dfaTransitions,
      };

      setDFAResult(dfaData);

      // Render DFA Visualization
      renderDFASVG(dfaData.states, dfaData.transitions, dfaData.startState, dfaData.finalStates);
    } catch (error) {
      setDFAResult({ error: error.message });
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
    Object.keys(transitions).forEach((from) => {
      Object.keys(transitions[from]).forEach((symbol) => {
        elements.push({
          data: {
            source: from,
            target: transitions[from][symbol],
            label: symbol,
          },
        });
      });
    });

    // Render using Cytoscape with layout
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
        name: "breadthfirst", // Automatic layout for visibility
        directed: true,
        roots: ${startState}, // Start from the initial state
        padding: 30,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8">
          <button
            onClick={onBack}
            className="mb-4 flex items-center text-blue-500 hover:text-blue-700"
          >
            <ArrowLeft className="mr-2" />
            Back
          </button>
          <h2 className="text-2xl font-bold mb-6">NFA to DFA Converter</h2>
          <div className="space-y-4">
            <textarea
              className="w-full p-2 border rounded"
              placeholder="NFA States (comma-separated) e.g., q0,q1,q2"
              value={nfaStates}
              onChange={(e) => setNFAStates(e.target.value)}
            />
            <textarea
              className="w-full p-2 border rounded"
              placeholder="Transitions (from,symbol,to - one per line) e.g., q0,a,q1"
              value={nfaTransitions}
              onChange={(e) => setNFATransitions(e.target.value)}
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
              placeholder="Final States (comma-separated) e.g., q2"
              value={finalStates}
              onChange={(e) => setFinalStates(e.target.value)}
            />
            <button
              onClick={convertNFAtoDFA}
              className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              Convert to DFA
            </button>
            {dfaResult && (
              <div
                className={`mt-4 p-2 rounded ${
                  dfaResult.error ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                }`}
              >
                {dfaResult.error ? dfaResult.error : "Conversion Successful!"}
              </div>
            )}
          </div>
          <div id="cy" style={{ width: "100%", height: "400px", marginTop: "16px" }}></div>
        </div>
      </div>
    </div>
  );
};

export default NFAtoDFAConverter;

/* import React, { useState } from "react";
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
      const alphabet = new Set(); // Track all input symbols

      // Parse transitions and collect alphabet
      nfaTransitions.split("\n").forEach((rule) => {
        const [from, symbol, to] = rule.split(",").map((s) => s.trim());
        if (!transitionRules[from]) transitionRules[from] = {};
        if (!transitionRules[from][symbol]) transitionRules[from][symbol] = new Set();
        transitionRules[from][symbol].add(to);
        alphabet.add(symbol);
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

          // Process transitions for each symbol in the alphabet
          alphabet.forEach((symbol) => {
            const reachableStates = Array.from(currentSet)
              .map((state) => transitionRules[state]?.[symbol] || new Set())
              .reduce((acc, curr) => new Set([...acc, ...curr]), new Set());

            const reachableSetName = Array.from(reachableStates).sort().join(",");
            
            if (!dfaTransitions[setName]) dfaTransitions[setName] = {};
            
            if (reachableSetName) {
              if (!dfaStates.has(reachableSetName)) {
                queue.push(reachableStates);
              }
              dfaTransitions[setName][symbol] = reachableSetName;
            } else {
              dfaTransitions[setName][symbol] = trapState;
            }
          });
        }
      }

      // Add transitions for the trap state
      dfaStates.add(trapState);
      dfaTransitions[trapState] = {};
      alphabet.forEach((symbol) => {
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
    Object.entries(transitions).forEach(([from, transitionMap]) => {
      // Group transitions between the same states
      const edgeGroups = {};
      
      Object.entries(transitionMap).forEach(([symbol, to]) => {
        const edgeKey = `${from}-${to}`;
        if (!edgeGroups[edgeKey]) {
          edgeGroups[edgeKey] = [];
        }
        edgeGroups[edgeKey].push(symbol);
      });

      // Create edges with combined labels
      Object.entries(edgeGroups).forEach(([edgeKey, symbols]) => {
        const [source, target] = edgeKey.split('-');
        elements.push({
          data: {
            id: `${source}-${target}-${symbols.join(',')}`,
            source,
            target,
            label: symbols.join(','),
          },
        });
      });
    });

    // Configure and render Cytoscape
    const cy = Cytoscape({
      container: document.getElementById("cy"),
      elements: elements,
      style: [
        {
          selector: "node",
          style: {
            "background-color": "#3498db",
            label: "data(label)",
            "text-valign": "center",
            "text-halign": "center",
            width: "40px",
            height: "40px",
            "font-size": "14px",
          },
        },
        {
          selector: "node[type='final']",
          style: {
            "border-color": "#e74c3c",
            "border-width": "3px",
            "border-style": "double",
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
            // Label positioning and styling
            "text-background-color": "white",
            "text-background-opacity": 1,
            "text-background-padding": "3px",
            "text-rotation": "autorotate",
            "text-margin-y": -10,
            "text-events": "yes",
            "control-point-step-size": 40,
            "edge-text-rotation": "autorotate",
            "font-size": "14px",
            "text-outline-color": "white",
            "text-outline-width": 2,
          },
        },
      ],
      layout: {
        name: "circle",
        padding: 50,
        directed: true,
        spacingFactor: 1.5,
      },
    });

    // Handle self-loops specially
    cy.edges().forEach(edge => {
      if (edge.source().id() === edge.target().id()) {
        edge.style({
          'curve-style': 'bezier',
          'control-point-step-size': 40,
          'loop-direction': '45deg',
          'loop-sweep': '90deg',
          'text-margin-y': -20,
        });
      }
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
              placeholder="NFA States (comma-separated) e.g., s1,s2,s3"
              value={nfaStates}
              onChange={(e) => setNFAStates(e.target.value)}
            />
            <textarea
              className="w-full p-2 border rounded h-32"
              placeholder="Transitions (from,symbol,to - one per line) e.g., s1,0,s2"
              value={nfaTransitions}
              onChange={(e) => setNFATransitions(e.target.value)}
            />
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Start State e.g., s1"
              value={startState}
              onChange={(e) => setStartState(e.target.value)}
            />
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Final States (comma-separated) e.g., s3"
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

export default NFAtoDFAConverter; */

import React, { useState } from "react";
import Cytoscape from "cytoscape";
import { ArrowLeft } from "lucide-react";

const NFAtoDFAConverter = ({ onBack }) => {
  const [nfaStates, setNFAStates] = useState("");
  const [nfaTransitions, setNFATransitions] = useState("");
  const [startState, setStartState] = useState("");
  const [finalStates, setFinalStates] = useState("");
  const [dfaResult, setDFAResult] = useState(null);

  const getEpsilonClosure = (states, transitionRules) => {
    const closure = new Set(states);
    const stack = [...states];

    while (stack.length > 0) {
      const state = stack.pop();
      const epsilonTransitions = transitionRules[state]?.["ε"] || new Set();

      epsilonTransitions.forEach(nextState => {
        if (!closure.has(nextState)) {
          closure.add(nextState);
          stack.push(nextState);
        }
      });
    }

    return closure;
  };

  const getNextStates = (states, symbol, transitionRules) => {
    const nextStates = new Set();

    states.forEach(state => {
      const transitions = transitionRules[state]?.[symbol] || new Set();
      transitions.forEach(nextState => nextStates.add(nextState));
    });

    return nextStates;
  };

  const convertNFAtoDFA = () => {
    try {
      const stateList = nfaStates.split(",").map((s) => s.trim());
      const finalStateSet = new Set(finalStates.split(",").map((s) => s.trim()));
      const transitionRules = {};
      const alphabet = new Set();

      nfaTransitions.split("\n").forEach((rule) => {
        const [from, symbol, to] = rule.split(",").map((s) => s.trim());
        if (!transitionRules[from]) transitionRules[from] = {};
        if (!transitionRules[from][symbol]) transitionRules[from][symbol] = new Set();
        transitionRules[from][symbol].add(to);
        if (symbol !== "ε") alphabet.add(symbol);
      });

      const dfaStates = new Set();
      const dfaTransitions = {};
      
      const initialClosure = getEpsilonClosure([startState], transitionRules);
      const queue = [initialClosure];
      const trapState = "TRAP";

      while (queue.length > 0) {
        const currentSet = queue.shift();
        const setName = Array.from(currentSet).sort().join(",");

        if (!dfaStates.has(setName)) {
          dfaStates.add(setName);

          alphabet.forEach((symbol) => {
            const symbolStates = getNextStates(currentSet, symbol, transitionRules);
            const reachableStates = getEpsilonClosure(Array.from(symbolStates), transitionRules);
            const reachableSetName = Array.from(reachableStates).sort().join(",");
            
            if (!dfaTransitions[setName]) dfaTransitions[setName] = {};
            
            if (reachableStates.size > 0) {
              if (!dfaStates.has(reachableSetName)) {
                queue.push(reachableStates);
              }
              dfaTransitions[setName][symbol] = reachableSetName;
            } else {
              dfaTransitions[setName][symbol] = trapState;
            }
          });
        }
      }

      if (Object.values(dfaTransitions).some(trans => 
        Object.values(trans).includes(trapState))) {
        dfaStates.add(trapState);
        dfaTransitions[trapState] = {};
        alphabet.forEach((symbol) => {
          dfaTransitions[trapState][symbol] = trapState;
        });
      }

      const dfaFinalStates = Array.from(dfaStates).filter((state) =>
        state.split(",").some((s) => finalStateSet.has(s))
      );

      const dfaData = {
        states: Array.from(dfaStates),
        startState: Array.from(initialClosure).sort().join(","),
        finalStates: dfaFinalStates,
        transitions: dfaTransitions,
      };

      setDFAResult(dfaData);
      renderDFASVG(dfaData.states, dfaData.transitions, dfaData.startState, dfaData.finalStates);
    } catch (error) {
      setDFAResult({ error: error.message });
    }
  };

  const renderDFASVG = (statesArray, transitions, startState, finalStatesArray) => {
    const elements = [];

    statesArray.forEach((state) => {
      elements.push({
        data: {
          id: state,
          label: state,
          type: finalStatesArray.includes(state) ? "final" : "normal",
        },
      });
    });

    Object.entries(transitions).forEach(([from, transitionMap]) => {
      const edgeGroups = {};
      
      Object.entries(transitionMap).forEach(([symbol, to]) => {
        const edgeKey = `${from}-${to}`;
        if (!edgeGroups[edgeKey]) {
          edgeGroups[edgeKey] = [];
        }
        edgeGroups[edgeKey].push(symbol);
      });

      Object.entries(edgeGroups).forEach(([edgeKey, symbols]) => {
        const [source, target] = edgeKey.split('-');
        elements.push({
          data: {
            id: `${source}-${target}-${symbols.join(',')}`,
            source,
            target,
            label: symbols.join(','),
          },
        });
      });
    });

    const cy = Cytoscape({
      container: document.getElementById("cy"),
      elements: elements,
      style: [
        {
          selector: "node",
          style: {
            "background-color": "#3498db",
            label: "data(label)",
            "text-valign": "center",
            "text-halign": "center",
            width: "40px",
            height: "40px",
            "font-size": "14px",
          },
        },
        {
          selector: "node[type='final']",
          style: {
            "border-color": "#e74c3c",
            "border-width": "3px",
            "border-style": "double",
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
            "text-background-color": "white",
            "text-background-opacity": 1,
            "text-background-padding": "3px",
            "text-rotation": "autorotate",
            "text-margin-y": -10,
            "text-events": "yes",
            "control-point-step-size": 40,
            "edge-text-rotation": "autorotate",
            "font-size": "14px",
            "text-outline-color": "white",
            "text-outline-width": 2,
          },
        },
      ],
      layout: {
        name: "circle",
        padding: 50,
        directed: true,
        spacingFactor: 1.5,
      },
    });

    cy.edges().forEach(edge => {
      if (edge.source().id() === edge.target().id()) {
        edge.style({
          'curve-style': 'bezier',
          'control-point-step-size': 40,
          'loop-direction': '45deg',
          'loop-sweep': '90deg',
          'text-margin-y': -20,
        });
      }
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
          <h2 className="text-2xl font-bold mb-6">NFA to DFA Converter (with ε-transitions)</h2>
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-2">
              Use "ε" (or "e") for epsilon transitions
            </div>
            <textarea
              className="w-full p-2 border rounded"
              placeholder="NFA States (comma-separated) e.g., s1,s2,s3"
              value={nfaStates}
              onChange={(e) => setNFAStates(e.target.value)}
            />
            <textarea
              className="w-full p-2 border rounded h-32"
              placeholder="Transitions (from,symbol,to - one per line) e.g., s1,0,s2 or s1,ε,s2"
              value={nfaTransitions}
              onChange={(e) => setNFATransitions(e.target.value.replace(/e/g, "ε"))}
            />
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Start State e.g., s1"
              value={startState}
              onChange={(e) => setStartState(e.target.value)}
            />
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Final States (comma-separated) e.g., s3"
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



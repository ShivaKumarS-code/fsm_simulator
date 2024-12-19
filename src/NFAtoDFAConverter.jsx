import React, { useState } from "react";
import dagre from "dagre";
import * as d3 from "d3";
import { ArrowLeft } from "lucide-react";

const NFAtoDFAConverter = ({ onBack }) => {
  const [nfaStates, setNFAStates] = useState("");
  const [nfaTransitions, setNFATransitions] = useState("");
  const [startState, setStartState] = useState("");
  const [finalStates, setFinalStates] = useState("");
  const [inputAlphabets, setInputAlphabets] = useState("");
  const [dfaResult, setDFAResult] = useState(null);

  const convertNFAtoDFA = () => {
    try {
      const stateList = nfaStates.split(",").map((s) => s.trim());
      const finalStateSet = new Set(
        finalStates.split(",").map((s) => s.trim())
      );
      const alphabets = inputAlphabets.split(",").map((s) => s.trim());
      const transitionRules = {};

      // Parse transitions
      nfaTransitions.split("\n").forEach((rule) => {
        const [from, symbol, to] = rule.split(",").map((s) => s.trim());
        const displaySymbol = symbol === "" ? "ε" : symbol; // If the symbol is empty, display epsilon (ε)

        // Check if the symbol is valid (either part of the alphabet or epsilon)
        if (alphabets.includes(symbol) || symbol === "") {
          if (!transitionRules[from]) transitionRules[from] = {};
          if (!transitionRules[from][displaySymbol])
            transitionRules[from][displaySymbol] = new Set();
          transitionRules[from][displaySymbol].add(to);
        }
      });

      // Add trap state for undefined transitions
      const trapState = "trap";
      stateList.push(trapState);
      transitionRules[trapState] = {};
      alphabets.forEach((symbol) => {
        transitionRules[trapState][symbol] = new Set([trapState]);
      });

      stateList.forEach((state) => {
        if (!transitionRules[state]) transitionRules[state] = {};
        alphabets.forEach((symbol) => {
          if (!transitionRules[state][symbol]) {
            transitionRules[state][symbol] = new Set([trapState]);
          }
        });
      });

      // Convert NFA to DFA logic here...

      // Layout and render the DFA graph
      const g = new dagre.graphlib.Graph();
      g.setGraph({});
      g.setDefaultEdgeLabel(() => ({}));

      // Add nodes and edges to the graph
      stateList.forEach((state) => {
        g.setNode(state, { label: state });
      });

      Object.keys(transitionRules).forEach((from) => {
        Object.keys(transitionRules[from]).forEach((symbol) => {
          transitionRules[from][symbol].forEach((to) => {
            g.setEdge(from, to, { label: symbol });
          });
        });
      });

      dagre.layout(g);

      // Manually set the position of the trap state
      if (g.hasNode(trapState)) {
        const maxY = Math.max(...g.nodes().map((v) => g.node(v).y));
        g.node(trapState).y = maxY + 100; // Position it 100 units below the lowest state
      }

      // Render the graph using d3
      const svg = d3.select("svg");
      svg.selectAll("*").remove(); // Clear previous graph
      const inner = svg.append("g");

      g.nodes().forEach((v) => {
        const node = g.node(v);
        inner
          .append("circle")
          .attr("cx", node.x)
          .attr("cy", node.y)
          .attr("r", 20)
          .attr("fill", "white")
          .attr("stroke", "black");
        inner
          .append("text")
          .attr("x", node.x)
          .attr("y", node.y)
          .attr("dy", ".35em")
          .attr("text-anchor", "middle")
          .text(v);
      });

      g.edges().forEach((e) => {
        const edge = g.edge(e);
        inner
          .append("line")
          .attr("x1", g.node(e.v).x)
          .attr("y1", g.node(e.v).y)
          .attr("x2", g.node(e.w).x)
          .attr("y2", g.node(e.w).y)
          .attr("stroke", "black");
        inner
          .append("text")
          .attr("x", (g.node(e.v).x + g.node(e.w).x) / 2)
          .attr("y", (g.node(e.v).y + g.node(e.w).y) / 2)
          .attr("dy", ".35em")
          .attr("text-anchor", "middle")
          .text(edge.label === "undefined" ? "ε" : edge.label); // Replace "undefined" with "ε"
      });

      setDFAResult(g);
    } catch (error) {
      console.error("Error converting NFA to DFA:", error);
    }
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
              placeholder="NFA Transitions (one per line, format: from,symbol,to)"
              value={nfaTransitions}
              onChange={(e) => setNFATransitions(e.target.value)}
            />
            <input
              className="w-full p-2 border rounded"
              type="text"
              placeholder="Start State"
              value={startState}
              onChange={(e) => setStartState(e.target.value)}
            />
            <input
              className="w-full p-2 border rounded"
              type="text"
              placeholder="Final States (comma-separated)"
              value={finalStates}
              onChange={(e) => setFinalStates(e.target.value)}
            />
            <input
              className="w-full p-2 border rounded"
              type="text"
              placeholder="Input Alphabets (comma-separated)"
              value={inputAlphabets}
              onChange={(e) => setInputAlphabets(e.target.value)}
            />
            <button
              onClick={convertNFAtoDFA}
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
            >
              Convert NFA to DFA
            </button>
            {dfaResult && (
              <div
                className={`mt-4 p-2 rounded ${
                  dfaResult.error
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {dfaResult.error ? dfaResult.error : "Conversion Successful!"}
              </div>
            )}
          </div>
          <svg width="800" height="600"></svg>
        </div>
      </div>
    </div>
  );
};

export default NFAtoDFAConverter;

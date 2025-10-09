import { createFileRoute } from "@tanstack/react-router";
import logo from "../logo.svg";
import * as Plot from "@observablehq/plot"; // observable plot library
import { useEffect, useRef, useState } from "react"; //react hooks
console.log("working 1");
export const Route = createFileRoute("/")({
	component: App,
});

function App() {
  console.log("its working 2");
  const chartCall = useRef<HTMLDivElement | null>(null); // points to div where chart will be drawn
  const [data, setData] = useState<{ time: number; value: number }[]>([]); // create a array-like variable(lowkey idk but it works) to store time and a value that will be displayed on the graph

  useEffect(() => {
    const eventSource = new EventSource("http://localhost:8000/events"); //once the components mount it will open an Server-Sent event to the FastAPI also prob might need to change whats in the brackets

    eventSource.onmessage = (event) => { //Everytime server sents a message(with data) it will be parsed as JSON and be added to our array-liked structure
      try {
        const parsed = JSON.parse(event.data);
        setData((prev) => [...prev, parsed].slice(-100)); // prevents the chart overflowing after 100+ points !!!!!CHANGE THIS LINE before launch ITS TEMPORARY!!!!!!
      } catch (err) {
        console.error("Data not Received/Bad", err); //error message in case data sucks
      }
    };

    return () => {
      eventSource.close(); //close Server Sent Event connection
    };
  }, []); // idk what this is for. My code wasnt running and the internet told me to add it and now it works :D

  useEffect(() => {
    if (chartCall.current) {
      chartCall.current.innerHTML = ""; // clears div and run everytime the data changes
      
      const chart = Plot.plot({ //this bit is just the graph building very similar to math.plot
        width: 600,
        height: 300,
        x: { label: "Time" },
        y: { label: "Value" },
        marks: [
          Plot.line(data, { x: "time", y: "value", stroke: "steelblue" }),
          Plot.dot(data, { x: "time", y: "value", fill: "red" }),
        ],
      });

      chartCall.current.appendChild(chart); //adds chart to div
    }
  }, [data]);
	return <div ref={chartCall} style={{ border: "1px solid black", width: "700px", height: "400px" }}>GSGW </div>;
} 


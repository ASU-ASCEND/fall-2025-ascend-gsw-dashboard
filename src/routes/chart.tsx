import * as Plot from '@observablehq/plot';
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from 'react';

export const Route = createFileRoute("/chart")({
    component: App,
});

function App() {
    const chartRef = useRef<HTMLDivElement>(null);
    const [data, setData] = useState<any[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [dataCount, setDataCount] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Start/stop real-time data generation
    const startRealTimeData = () => {
        if (intervalRef.current) return; // Already running

        setIsRunning(true);
        setData([]); // Clear existing data
        setDataCount(0);

        intervalRef.current = setInterval(() => {
            setData(prevData => {
                const newCount = prevData.length + 1;
                const timestamp = Date.now();
                const value = Math.sin(newCount * 0.2) * 10 + Math.random() * 5 + 20; // Sine wave with noise

                const newPoint = {
                    x: timestamp,
                    y: value,
                    category: 'Real-time Data'
                };
                // Keep only the last 50 points for performance
                const updatedData = [...prevData, newPoint];
                return updatedData.length > 50 ? updatedData.slice(-50) : updatedData;
            });
            setDataCount(prev => prev + 1);
        }, 1000); // Add new point every second
    };

    const stopRealTimeData = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsRunning(false);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    // Create the chart
    useEffect(() => {
        if (!chartRef.current) return;

        // Calculate time domain for real-time scrolling window
        const now = Date.now();
        const timeWindow = 60000; // 60 seconds window
        const timeDomain = [now - timeWindow, now];

        const plot = Plot.plot({
            title: isRunning ? "Real-time Line Chart" : "Line Chart (Stopped)",
            height: 400,
            marginLeft: 60,
            marginRight: 20,
            marginTop: 30,
            marginBottom: 40,
            x: {
                label: "Time",
                type: "linear",
                domain: timeDomain,
                tickFormat: (d: number) => new Date(d).toLocaleTimeString()
            },
            y: {
                label: "Value",
                grid: true
            },
            color: { legend: true },
            marks: [
                data.length > 0 ? Plot.lineY(data, {
                    x: "x",
                    y: "y",
                    stroke: "#3b82f6",
                    strokeWidth: 2
                }) : null,
                data.length > 0 ? Plot.dot(data, {
                    x: "x",
                    y: "y",
                    fill: "#3b82f6",
                    r: 3
                }) : null,
                Plot.ruleY([0], { stroke: "#666", strokeDasharray: "2,2" })
            ].filter(Boolean) // Remove null marks
        });

        chartRef.current.innerHTML = '';
        chartRef.current.appendChild(plot);

        return () => {
            if (chartRef.current) {
                chartRef.current.innerHTML = '';
            }
        };
    }, [data, isRunning]);

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-4">Real-time Chart Visualization</h1>
                <p className="text-gray-600 mb-6">
                    A real-time line chart that adds new data points every second, demonstrating live data visualization.
                </p>
            </div>

            {/* Controls */}
            <div className="bg-white border rounded-lg p-4 mb-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-semibold">Chart Controls</h2>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${isRunning ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                            {isRunning ? 'Running' : 'Stopped'}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={startRealTimeData}
                            disabled={isRunning}
                            className={`px-4 py-2 rounded font-medium transition-colors ${isRunning
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-green-500 text-white hover:bg-green-600'
                                }`}
                        >
                            Start
                        </button>
                        <button
                            onClick={stopRealTimeData}
                            disabled={!isRunning}
                            className={`px-4 py-2 rounded font-medium transition-colors ${!isRunning
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-red-500 text-white hover:bg-red-600'
                                }`}
                        >
                            Stop
                        </button>
                        <button
                            onClick={() => {
                                stopRealTimeData();
                                setData([]);
                                setDataCount(0);
                            }}
                            className="px-4 py-2 bg-gray-500 text-white rounded font-medium hover:bg-gray-600 transition-colors"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white border rounded-lg p-6 shadow-sm">
                <div className="mb-4">
                    <h2 className="text-lg font-semibold mb-2">
                        {isRunning ? 'Real-time Data Chart' : 'Data Chart'}
                    </h2>
                    <p className="text-sm text-gray-600">
                        {isRunning
                            ? 'Chart is updating in real-time with new data points every second.'
                            : 'Chart is stopped. Click "Start" to begin real-time data generation.'
                        }
                    </p>
                </div>

                <div ref={chartRef} className="w-full"></div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-gray-50 p-3 rounded">
                        <p className="text-gray-600">Data Points</p>
                        <p className="text-xl font-bold text-blue-600">{data.length}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                        <p className="text-gray-600">Total Generated</p>
                        <p className="text-xl font-bold text-green-600">{dataCount}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                        <p className="text-gray-600">Value Range</p>
                        <p className="text-sm font-mono">
                            {data.length > 0
                                ? `${Math.min(...data.map(d => d.y)).toFixed(2)} to ${Math.max(...data.map(d => d.y)).toFixed(2)}`
                                : 'No data'
                            }
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

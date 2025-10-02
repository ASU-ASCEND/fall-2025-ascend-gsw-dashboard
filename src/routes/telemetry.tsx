import ADCO from "@/components/tabs/ADCO";
import ECLSS from "@/components/tabs/ECLSS";
import FIDO from "@/components/tabs/FIDO";
import MET from "@/components/tabs/MET";
import SYS from "@/components/tabs/SYS";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEventSource, useEventSourceListener } from "@react-nano/use-event-source";
import { createFileRoute } from "@tanstack/react-router";
import { useReducer, useState } from "react";

export const Route = createFileRoute("/telemetry")({
    component: Telemetry,
});

// Reducer for managing telemetry data
function dataReducer(state: any, action: { type: string; payload: any }) {
    switch (action.type) {
        case 'SET_DATA':
            return action.payload;
        case 'CLEAR_DATA':
            return null;
        default:
            return state;
    }
}

function Telemetry() {
    const [data, dispatchData] = useReducer(dataReducer, null);
    const [error, setError] = useState<string | null>(null);

    // Create EventSource connection
    const [eventSource, eventSourceStatus] = useEventSource('http://localhost:8000/telemetry-events', true);

    // Handle telemetry events
    useEventSourceListener(
        eventSource,
        ['telemetry'],
        (evt) => {
            try {
                const timestamp = new Date().getTime();
                console.log(`[${timestamp}ms] Telemetry event received:`, evt.data);

                const jsonData = JSON.parse(evt.data);
                dispatchData({ type: 'SET_DATA', payload: jsonData });
                setError(null);
                console.log(`[${timestamp}ms] Telemetry parsed data:`, jsonData);
            } catch (parseError) {
                console.error('Error parsing telemetry event data:', parseError);
                setError(`Telemetry Parse Error: ${parseError}`);
            }
        },
        [dispatchData]
    );

    const handleReconnect = () => {
        dispatchData({ type: 'CLEAR_DATA', payload: null });
        setError(null);
        // The library handles reconnection automatically
    };

    const getStatusColor = () => {
        switch (eventSourceStatus) {
            case 'open': return 'text-green-600';
            case 'init': return 'text-yellow-600';
            case 'error': return 'text-red-600';
            case 'closed': return 'text-gray-600';
            default: return 'text-gray-600';
        }
    };

    const getStatusText = () => {
        switch (eventSourceStatus) {
            case 'open': return 'CONNECTED';
            case 'init': return 'CONNECTING';
            case 'error': return 'ERROR';
            case 'closed': return 'DISCONNECTED';
            default: return 'UNKNOWN';
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-4">Telemetry Data</h1>

                {/* Connection Status */}
                <div className="flex items-center gap-4 mb-4">
                    <div className={`font-semibold ${getStatusColor()}`}>
                        Status: {getStatusText()}
                    </div>
                    {eventSourceStatus === 'error' && (
                        <button
                            onClick={handleReconnect}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                            Reconnect
                        </button>
                    )}
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        <strong>Error:</strong> {error}
                    </div>
                )}

                {/* Data Display */}
                <div className="bg-gray-50 border rounded-lg p-4 mb-6">
                    <h2 className="text-lg font-semibold mb-3">Live Data Stream</h2>
                    {data ? (
                        <pre className="bg-white p-4 rounded border overflow-auto max-h-96 text-sm">
                            {JSON.stringify(data, null, 2)}
                        </pre>
                    ) : (
                        <p className="text-gray-500 italic">
                            {eventSourceStatus === 'init'
                                ? 'Connecting to server...'
                                : 'No data received yet'
                            }
                        </p>
                    )}
                </div>

                {/* System Tabs */}
                <div className="bg-white border rounded-lg p-6">
                    <h2 className="text-lg font-semibold mb-4">System Components</h2>
                    <Tabs defaultValue="adco" className="w-full">
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="adco">ADCO</TabsTrigger>
                            <TabsTrigger value="eclss">ECLSS</TabsTrigger>
                            <TabsTrigger value="fido">FIDO</TabsTrigger>
                            <TabsTrigger value="met">MET</TabsTrigger>
                            <TabsTrigger value="sys">SYS</TabsTrigger>
                        </TabsList>
                        <TabsContent value="adco" className="mt-4">
                            <ADCO />
                        </TabsContent>
                        <TabsContent value="eclss" className="mt-4">
                            <ECLSS />
                        </TabsContent>
                        <TabsContent value="fido" className="mt-4">
                            <FIDO />
                        </TabsContent>
                        <TabsContent value="met" className="mt-4">
                            <MET />
                        </TabsContent>
                        <TabsContent value="sys" className="mt-4">
                            <SYS />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

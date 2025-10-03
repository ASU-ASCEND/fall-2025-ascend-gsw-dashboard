import { useDataAccumulator } from '@/hooks/useDataAccumulator';
import React from 'react';

interface ECLSSProps {
    telemetryData: any;
}

const ECLSS: React.FC<ECLSSProps> = ({ telemetryData }) => {
    const { dataPoints, latestData, chartData, dataCount } = useDataAccumulator(telemetryData, {
        maxDataPoints: 30,
        shouldAdd: (data) => data.eclss !== undefined, // Only add if ECLSS data exists
        extractData: (data) => data.eclss // Extract only ECLSS data
    });

    return (
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
                Environmental Control and Life Support
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white p-3 rounded border">
                    <p className="text-sm text-gray-600">Data Points Collected</p>
                    <p className="text-2xl font-bold text-orange-600">{dataCount}</p>
                </div>
                <div className="bg-white p-3 rounded border">
                    <p className="text-sm text-gray-600">Latest Update</p>
                    <p className="text-sm font-medium">
                        {latestData ? new Date(latestData.timestamp).toLocaleTimeString() : 'No data'}
                    </p>
                </div>
            </div>

            {latestData && (
                <div className="bg-white p-3 rounded border mb-4">
                    <p className="text-sm text-gray-600 mb-2">Latest ECLSS Data:</p>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                        {JSON.stringify(latestData.data, null, 2)}
                    </pre>
                </div>
            )}

            {chartData.length > 0 && (
                <div className="bg-white p-3 rounded border">
                    <p className="text-sm text-gray-600 mb-2">Chart Data Preview (Last 5 points):</p>
                    <div className="text-xs space-y-1">
                        {chartData.slice(-5).map((point, index) => (
                            <div key={index} className="flex justify-between">
                                <span>{new Date(point.x).toLocaleTimeString()}</span>
                                <span className="font-mono">
                                    {typeof point.y === 'object'
                                        ? JSON.stringify(point.y).slice(0, 50) + '...'
                                        : point.y
                                    }
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ECLSS;

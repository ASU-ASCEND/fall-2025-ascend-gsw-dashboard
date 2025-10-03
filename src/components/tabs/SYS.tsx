import { useDataAccumulator } from '@/hooks/useDataAccumulator';
import React from 'react';

interface SYSProps {
    telemetryData: any;
}

const SYS: React.FC<SYSProps> = ({ telemetryData }) => {
    const { dataPoints, latestData, chartData, dataCount } = useDataAccumulator(telemetryData, {
        maxDataPoints: 80,
        shouldAdd: (data) => data.sys !== undefined,
        extractData: (data) => data.sys
    });

    return (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
                System Operations
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white p-3 rounded border">
                    <p className="text-sm text-gray-600">Data Points Collected</p>
                    <p className="text-2xl font-bold text-blue-600">{dataCount}</p>
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
                    <p className="text-sm text-gray-600 mb-2">Latest SYS Data:</p>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                        {JSON.stringify(latestData.data, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default SYS;

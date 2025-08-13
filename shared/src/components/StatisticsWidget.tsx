import React from 'react';

export interface StatisticsWidgetProps {
  homeTeam: {
    id: string;
    name: string;
    color?: string;
  };
  awayTeam: {
    id: string;
    name: string;
    color?: string;
  };
  stats: {
    home: {
      goals: number;
      shots: number;
      possession: number;
      corners: number;
      fouls: number;
      yellowCards: number;
      redCards: number;
      passes?: number;
      passAccuracy?: number;
    };
    away: {
      goals: number;
      shots: number;
      possession: number;
      corners: number;
      fouls: number;
      yellowCards: number;
      redCards: number;
      passes?: number;
      passAccuracy?: number;
    };
  };
  showAdvanced?: boolean;
  compact?: boolean;
}

export function StatisticsWidget({
  homeTeam,
  awayTeam,
  stats,
  showAdvanced = false,
  compact = false
}: StatisticsWidgetProps) {
  const renderStatRow = (
    label: string,
    homeValue: number | string,
    awayValue: number | string,
    homeColor: string = '#3B82F6',
    awayColor: string = '#EF4444'
  ) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center space-x-3">
        <div 
          className="w-3 h-3 rounded-full" 
          style={{ backgroundColor: homeColor }}
        />
        <span className="text-sm font-medium text-gray-700">{homeValue}</span>
      </div>
      <span className="text-xs text-gray-500 font-medium">{label}</span>
      <div className="flex items-center space-x-3">
        <span className="text-sm font-medium text-gray-700">{awayValue}</span>
        <div 
          className="w-3 h-3 rounded-full" 
          style={{ backgroundColor: awayColor }}
        />
      </div>
    </div>
  );

  const renderPossessionBar = () => (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-600">{homeTeam.name}</span>
        <span className="text-xs text-gray-600">{awayTeam.name}</span>
      </div>
      <div className="flex h-3 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="bg-blue-600 transition-all duration-300 ease-out"
          style={{ width: `${stats.home.possession}%` }}
        />
        <div 
          className="bg-red-600 transition-all duration-300 ease-out"
          style={{ width: `${stats.away.possession}%` }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-blue-600 font-medium">{stats.home.possession}%</span>
        <span className="text-xs text-red-600 font-medium">{stats.away.possession}%</span>
      </div>
    </div>
  );

  const renderShotsComparison = () => (
    <div className="mt-4">
      <div className="text-xs text-gray-600 mb-2 text-center">Shots Comparison</div>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-600 w-16">{homeTeam.name}</span>
          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-blue-600 h-2 transition-all duration-300 ease-out"
              style={{ 
                width: `${Math.min((stats.home.shots / Math.max(stats.home.shots, stats.away.shots, 1)) * 100, 100)}%` 
              }}
            />
          </div>
          <span className="text-xs font-medium w-8 text-right">{stats.home.shots}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-600 w-16">{awayTeam.name}</span>
          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-red-600 h-2 transition-all duration-300 ease-out"
              style={{ 
                width: `${Math.min((stats.away.shots / Math.max(stats.home.shots, stats.away.shots, 1)) * 100, 100)}%` 
              }}
            />
          </div>
          <span className="text-xs font-medium w-8 text-right">{stats.away.shots}</span>
        </div>
      </div>
    </div>
  );

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        {/* Score Display */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.home.goals}</div>
            <div className="text-xs text-gray-600">{homeTeam.name}</div>
          </div>
          <div className="text-3xl font-bold text-gray-400">-</div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.away.goals}</div>
            <div className="text-xs text-gray-600">{awayTeam.name}</div>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-gray-900">{stats.home.shots}</div>
            <div className="text-xs text-gray-600">Shots</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">{stats.home.possession}%</div>
            <div className="text-xs text-gray-600">Possession</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">{stats.home.corners}</div>
            <div className="text-xs text-gray-600">Corners</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Match Statistics</h3>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
          <span className="text-sm text-gray-600">{homeTeam.name}</span>
          <div className="w-3 h-3 rounded-full bg-red-600"></div>
          <span className="text-sm text-gray-600">{awayTeam.name}</span>
        </div>
      </div>

      {/* Score */}
      <div className="text-center mb-6">
        <div className="text-4xl font-bold text-gray-900 mb-2">
          {stats.home.goals} - {stats.away.goals}
        </div>
        <div className="text-sm text-gray-600">Current Score</div>
      </div>

      {/* Basic Stats */}
      <div className="space-y-3">
        {renderStatRow('Goals', stats.home.goals, stats.away.goals)}
        {renderStatRow('Shots', stats.home.shots, stats.away.shots)}
        {renderStatRow('Corners', stats.home.corners, stats.away.corners)}
        {renderStatRow('Fouls', stats.home.fouls, stats.away.fouls)}
        {renderStatRow('Yellow Cards', stats.home.yellowCards, stats.away.yellowCards)}
        {renderStatRow('Red Cards', stats.home.redCards, stats.away.redCards)}
      </div>

      {/* Visual Elements */}
      {renderPossessionBar()}
      {renderShotsComparison()}

      {/* Advanced Stats */}
      {showAdvanced && stats.home.passes !== undefined && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Advanced Statistics</h4>
          <div className="space-y-3">
            {renderStatRow('Passes', stats.home.passes, stats.away.passes || 0)}
            {renderStatRow('Pass Accuracy', `${stats.home.passAccuracy || 0}%`, `${stats.away.passAccuracy || 0}%`)}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">{stats.home.shots}</div>
            <div className="text-xs text-gray-600">Total Shots</div>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <div className="text-lg font-bold text-red-600">{stats.away.shots}</div>
            <div className="text-xs text-gray-600">Total Shots</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatisticsWidget;

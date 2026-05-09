import React from 'react';

interface Insight {
  type: 'hotspot' | 'ownership' | 'churn' | 'stability' | 'milestone';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'info';
}

interface InsightsPanelProps {
  insights: Insight[];
  stabilityScore: number;
  story: string[];
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({ insights, stabilityScore, story }) => {
  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500/10 border-red-500/50 text-red-400';
      case 'medium': return 'bg-orange-500/10 border-orange-500/50 text-orange-400';
      case 'low': return 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400';
      default: return 'bg-blue-500/10 border-blue-500/50 text-blue-400';
    }
  };

  const getStabilityColor = (score: number) => {
    if (score > 80) return 'text-green-500';
    if (score > 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="flex flex-col h-full overflow-hidden space-y-6">
      {/* Stability Score Header */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
        <h3 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-2">File Stability</h3>
        <div className={`text-5xl font-black ${getStabilityColor(stabilityScore)}`}>
          {stabilityScore}%
        </div>
        <p className="text-[10px] text-gray-500 mt-2">Based on churn and author diversity</p>
      </div>

      {/* Insights List */}
      <div className="space-y-3">
        <h3 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold px-1">Key Observations</h3>
        <div className="space-y-2">
          {insights.map((insight, idx) => (
            <div key={idx} className={`p-3 border rounded-lg ${getSeverityStyles(insight.severity)}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-xs">{insight.title}</span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">{insight.description}</p>
            </div>
          ))}
          {insights.length === 0 && (
            <div className="text-center py-4 text-gray-500 text-xs italic">
              No significant patterns detected yet.
            </div>
          )}
        </div>
      </div>

      {/* Story Mode */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex-1 overflow-auto custom-scrollbar">
        <h3 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-3 sticky top-0 bg-transparent backdrop-blur-sm">File Evolution Story</h3>
        <div className="space-y-3">
          {story.map((para, idx) => (
            <p key={idx} className="text-xs leading-relaxed text-gray-300">
              {para}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InsightsPanel;

import React, { useState } from 'react';

interface SettingItem {
  id: string;
  label: string;
  description: string;
  type: 'toggle' | 'select' | 'number';
  value: boolean | string | number;
  options?: { label: string; value: string | number }[];
  min?: number;
  max?: number;
}

interface SettingsPanelProps {
  onSettingChange: (id: string, value: any) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onSettingChange }) => {
  const [settings, setSettings] = useState<Record<string, SettingItem>>({
    autoPlay: {
      id: 'autoPlay',
      label: 'Auto-play on selection',
      description: 'Automatically start replay when selecting a commit',
      type: 'toggle',
      value: false,
    },
    lineNumbers: {
      id: 'lineNumbers',
      label: 'Show line numbers',
      description: 'Display line numbers in code viewer',
      type: 'toggle',
      value: true,
    },
    syntaxHighlight: {
      id: 'syntaxHighlight',
      label: 'Syntax highlighting',
      description: 'Enable syntax highlighting in diffs',
      type: 'toggle',
      value: true,
    },
    theme: {
      id: 'theme',
      label: 'Color theme',
      description: 'Choose the color scheme for the interface',
      type: 'select',
      value: 'dark',
      options: [
        { label: 'Dark', value: 'dark' },
        { label: 'Light', value: 'light' },
        { label: 'Auto', value: 'auto' },
      ],
    },
    replaySpeed: {
      id: 'replaySpeed',
      label: 'Default replay speed',
      description: 'Set the default playback speed multiplier',
      type: 'select',
      value: '1',
      options: [
        { label: '0.5x', value: '0.5' },
        { label: '1x', value: '1' },
        { label: '2x', value: '2' },
        { label: '4x', value: '4' },
      ],
    },
    contextLines: {
      id: 'contextLines',
      label: 'Context lines in diff',
      description: 'Number of unchanged lines to show around changes',
      type: 'number',
      value: 3,
      min: 0,
      max: 10,
    },
  });

  const handleSettingChange = (id: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [id]: { ...prev[id], value },
    }));
    onSettingChange(id, value);
  };

  const sections = [
    {
      title: 'Playback',
      settings: ['autoPlay', 'replaySpeed'],
    },
    {
      title: 'Display',
      settings: ['lineNumbers', 'syntaxHighlight', 'theme'],
    },
    {
      title: 'Diff Viewer',
      settings: ['contextLines'],
    },
  ];

  return (
    <div className="space-y-8 p-6 max-w-2xl">
      {/* Header */}
      <div className="space-y-1 pb-6 border-b border-white/10">
        <h2 className="font-display text-2xl font-semibold text-white">Settings</h2>
        <p className="text-sm text-gray-500">
          Customize Git Wayback Machine to your preferences
        </p>
      </div>

      {/* Settings Sections */}
      {sections.map((section) => (
        <div key={section.title} className="space-y-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">
            {section.title}
          </h3>

          <div className="space-y-6 pl-2">
            {section.settings.map((settingId) => {
              const setting = settings[settingId];
              return (
                <div key={setting.id} className="flex items-start justify-between gap-6 pb-4 border-b border-white/5">
                  <div className="flex-1 space-y-1">
                    <label className="block text-sm font-semibold text-white">
                      {setting.label}
                    </label>
                    <p className="text-xs text-gray-500">{setting.description}</p>
                  </div>

                  <div className="flex-shrink-0">
                    {setting.type === 'toggle' && (
                      <button
                        onClick={() =>
                          handleSettingChange(setting.id, !setting.value)
                        }
                        className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                          setting.value
                            ? 'bg-blue-600'
                            : 'bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                            setting.value
                              ? 'translate-x-5'
                              : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    )}

                    {setting.type === 'select' && (
                      <select
                        value={String(setting.value)}
                        onChange={(e) =>
                          handleSettingChange(setting.id, e.target.value)
                        }
                        className="bg-white/10 border border-white/20 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-colors hover:bg-white/15 cursor-pointer"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 8px center',
                          paddingRight: '28px',
                        }}
                      >
                        <option style={{ backgroundColor: '#1e293b', color: '#ffffff' }} value="">
                          Select...
                        </option>
                        {setting.options?.map((opt) => (
                          <option
                            key={opt.value}
                            value={opt.value}
                            style={{ backgroundColor: '#1e293b', color: '#ffffff' }}
                          >
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}

                    {setting.type === 'number' && (
                      <input
                        type="number"
                        min={setting.min}
                        max={setting.max}
                        value={String(setting.value)}
                        onChange={(e) =>
                          handleSettingChange(
                            setting.id,
                            parseInt(e.target.value)
                          )
                        }
                        className="w-16 bg-white/10 border border-white/20 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-colors text-center hover:bg-white/15 cursor-pointer"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Footer */}
      <div className="pt-6 border-t border-white/10">
        <p className="text-xs text-gray-600 text-center">
          Settings are saved automatically and applied instantly
        </p>
      </div>
    </div>
  );
};

export default SettingsPanel;

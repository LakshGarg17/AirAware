import React, { useState } from 'react';
import { User, X, Check, AlertTriangle, RotateCcw, Trash2, Shield, Heart } from 'lucide-react';
import { storage } from '../storage/localStorageAdapter';

export default function ProfileDrawer({ isOpen, onClose, profile, onUpdateProfile, onResetProfile, warnings }) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    routine: profile?.routine || 'office_worker',
    commute: profile?.commute || 'public_transport',
    outdoor_activity: profile?.outdoor_activity || 'walking',
    household: profile?.household || ['general'],
    indoor: profile?.indoor || ['ventilation_options'],
    constraints: profile?.constraints || ['budget_conscious']
  });

  const toggleArrayItem = (field, value) => {
    setFormData(prev => {
      const current = prev[field] || [];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  const handleSave = () => {
    onUpdateProfile(formData);
    onClose();
  };

  const handleReset = () => {
    if (confirm("Reset profile to clean-air defaults?")) {
      onResetProfile();
      onClose();
    }
  };

  const handleClearAllData = () => {
    if (confirm("Permanently wipe all browser-stored data (profile, daily plan checks, impact action logs)? This cannot be undone.")) {
      storage.clearAllData();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end animate-in fade-in-50 duration-150">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-10">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Lifestyle Profile</h3>
              <p className="text-xs text-slate-400">Tailors routines and planner suggestions</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Privacy Note */}
          <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-3.5 text-xs text-sky-900 flex items-start space-x-2.5">
            <Shield className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Private & Stateless:</strong> Your profile is saved solely in this browser's localStorage. 
              No medical information or PII is requested, and data is never saved on remote servers.
            </p>
          </div>

          {/* Warnings */}
          {warnings && warnings.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1">
              <div className="flex items-center space-x-1 font-bold">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Validation Adjustments:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-amber-800">
                {warnings.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          )}

          {/* Daily Routine */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Primary Daily Schedule
            </label>
            <select
              value={formData.routine}
              onChange={(e) => setFormData({ ...formData, routine: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500"
            >
              <option value="office_worker">Office Worker (Standard Hours)</option>
              <option value="student">Student (School / University)</option>
              <option value="work_from_home">Work From Home / Remote</option>
              <option value="outdoor_worker">Outdoor Worker (Site / Delivery)</option>
              <option value="flexible">Flexible / Shift Work</option>
              <option value="other">Other Routine</option>
            </select>
          </div>

          {/* Primary Commute */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Primary Commute Mode
            </label>
            <select
              value={formData.commute}
              onChange={(e) => setFormData({ ...formData, commute: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500"
            >
              <option value="public_transport">Public Transit (Metro / Rail / Bus)</option>
              <option value="walking">Walking</option>
              <option value="bicycle">Bicycle</option>
              <option value="motorcycle">Motorcycle / Scooter (High Exposure)</option>
              <option value="car">Solo Car</option>
              <option value="carpool">Carpool / Shared Cab</option>
              <option value="work_from_home">No Commute (Remote)</option>
              <option value="other">Other Transit</option>
            </select>
          </div>

          {/* Outdoor Activity */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Outdoor Exercise Habit
            </label>
            <select
              value={formData.outdoor_activity}
              onChange={(e) => setFormData({ ...formData, outdoor_activity: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500"
            >
              <option value="walking">Brisk Walking</option>
              <option value="running">Running / Jogging (High Breathing Volume)</option>
              <option value="cycling">Cycling (Road / Commute)</option>
              <option value="outdoor_sports">Outdoor Team Sports (Football, Cricket)</option>
              <option value="regular_outdoor">Regular Outdoor Activity</option>
              <option value="mostly_indoor">Mostly Indoor / Gym</option>
            </select>
          </div>

          {/* Household Members */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Household Members (Select All That Apply)
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'children', label: 'Young Children' },
                { id: 'elderly', label: 'Senior Citizens (65+)' },
                { id: 'sensitive_people', label: 'Sensitive Individuals' },
                { id: 'general', label: 'Healthy Adults' }
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleArrayItem('household', item.id)}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    formData.household.includes(item.id)
                      ? 'bg-sky-50 border-sky-300 text-sky-800 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <span>{item.label}</span>
                  {formData.household.includes(item.id) && <Check className="w-3.5 h-3.5 text-sky-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Indoor Environment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Indoor Air Setup
            </label>
            <div className="space-y-1.5 text-xs">
              {[
                { id: 'air_purifier', label: 'Have Mechanical HEPA Purifier' },
                { id: 'no_air_purifier', label: 'No Air Purifier (Rely on Hacks/Sealing)' },
                { id: 'ac', label: 'Air Conditioning Available' },
                { id: 'ventilation_options', label: 'Good Cross-Ventilation Windows' }
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleArrayItem('indoor', item.id)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    formData.indoor.includes(item.id)
                      ? 'bg-sky-50 border-sky-300 text-sky-800 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <span>{item.label}</span>
                  {formData.indoor.includes(item.id) && <Check className="w-3.5 h-3.5 text-sky-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Practical Constraints */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Practical Realities & Constraints
            </label>
            <div className="space-y-1.5 text-xs">
              {[
                { id: 'budget_conscious', label: 'Budget-Conscious (Prefer zero/low-cost)' },
                { id: 'cannot_avoid_outdoor_work', label: 'Cannot Avoid Outdoor Work / Hours' },
                { id: 'limited_transport', label: 'Limited Public Transit Access' }
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleArrayItem('constraints', item.id)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    formData.constraints.includes(item.id)
                      ? 'bg-sky-50 border-sky-300 text-sky-800 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <span>{item.label}</span>
                  {formData.constraints.includes(item.id) && <Check className="w-3.5 h-3.5 text-sky-600" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 space-y-3 sticky bottom-0">
          <button
            onClick={handleSave}
            className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/20 transition-all flex items-center justify-center space-x-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Save Profile & Update Plan</span>
          </button>

          <div className="flex items-center justify-between pt-1 text-xs">
            <button
              onClick={handleReset}
              className="text-slate-500 hover:text-slate-800 flex items-center space-x-1 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <button
              onClick={handleClearAllData}
              className="text-rose-600 hover:text-rose-700 flex items-center space-x-1 font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Wipe Stored Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

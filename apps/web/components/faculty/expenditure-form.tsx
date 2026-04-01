'use client';

import React, { useState } from 'react';
import { X, DollarSign, Tag, FileText, Calendar } from 'lucide-react';
import { GlassCard } from '../v2/shared/cards';
import { IndustrialButton, IndustrialInput, IndustrialSelect } from '../v2/shared/inputs';
import { grantService } from '../../lib/services/grant-service';
import { useToast, Toast } from '../ui/toast-alert';

interface ExpenditureFormProps {
  grantId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  'Equipment',
  'Supplies',
  'Travel',
  'Personnel',
  'Software/Computing',
  'Publication Fees',
  'Other'
];

export const ExpenditureForm: React.FC<ExpenditureFormProps> = ({ 
  grantId, 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Supplies',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) {
      showToast('error', 'Amount and description are required');
      return;
    }

    try {
      setIsSubmitting(true);
      await grantService.logExpenditure(grantId, {
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        date: formData.date
      });
      showToast('success', 'Expenditure logged successfully');
      onSuccess();
    } catch (error) {
      showToast('error', 'Failed to log expenditure');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <GlassCard className="w-full max-w-md p-0 overflow-hidden border-zinc-800 shadow-2xl relative">
        <div className="p-6 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-900/40">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-400" />
            Log Expenditure
          </h3>
          <button onClick={onClose} className="p-1 text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Amount (USD)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <IndustrialInput 
                type="number" 
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e: any) => setFormData({...formData, amount: e.target.value})}
                className="pl-10"
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Category</label>
            <div className="relative text-zinc-100">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 z-10" />
              <IndustrialSelect 
                value={formData.category}
                onChange={(e: any) => setFormData({...formData, category: e.target.value})}
                className="pl-10"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat} className="bg-zinc-900 text-zinc-100">{cat}</option>
                ))}
              </IndustrialSelect>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Description</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
              <textarea 
                placeholder="What was this for?"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-md p-3 pl-10 h-24 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-zinc-700"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Spending Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <IndustrialInput 
                type="date" 
                value={formData.date}
                onChange={(e: any) => setFormData({...formData, date: e.target.value})}
                className="pl-10"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <IndustrialButton 
              type="button" 
              onClick={onClose}
              className="flex-1 bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700"
            >
              Cancel
            </IndustrialButton>
            <IndustrialButton 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white border-blue-500 hover:bg-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : 'Record Transaction'}
            </IndustrialButton>
          </div>
        </form>
      </GlassCard>
      
      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
};

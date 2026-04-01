'use client';

import React from 'react';
import { 
  X, 
  Download, 
  Save, 
  Eye, 
  Edit3,
  BookOpen
} from 'lucide-react';
import { GlassCard } from '../v2/shared/cards';
import { IndustrialButton } from '../v2/shared/inputs';
import { ResearchGrant } from '../../lib/services/grant-service';
import { motion, AnimatePresence } from 'framer-motion';

interface ProposalCanvasProps {
  grant: ResearchGrant;
  isOpen: boolean;
  onClose: () => void;
}

export const ProposalCanvas: React.FC<ProposalCanvasProps> = ({ grant, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = React.useState<'preview' | 'edit'>('preview');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 bg-black/80 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="w-full max-w-5xl h-full max-h-[90vh] flex flex-col"
        >
          <GlassCard className="flex-1 flex flex-col border-zinc-800 bg-zinc-950/90 overflow-hidden rounded-3xl shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white leading-tight">{grant.title}</h2>
                  <p className="text-xs text-zinc-400 uppercase tracking-widest font-black">{grant.agency} • Grant ID: {grant.id.slice(0, 8)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex bg-zinc-800/50 rounded-lg p-1 mr-4">
                  <button 
                    onClick={() => setActiveTab('preview')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'preview' ? 'bg-zinc-700 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    <Eye className="w-3.5 h-3.5 inline mr-1.5" /> Preview
                  </button>
                  <button 
                    onClick={() => setActiveTab('edit')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'edit' ? 'bg-zinc-700 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    <Edit3 className="w-3.5 h-3.5 inline mr-1.5" /> Edit
                  </button>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
                  <X className="w-6 h-6 text-zinc-500" />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8 md:p-12 font-serif text-lg leading-relaxed text-zinc-300 selection:bg-blue-500/30">
              {grant.proposalBody ? (
                <div className="max-w-3xl mx-auto space-y-8 whitespace-pre-wrap">
                  {grant.proposalBody}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-4">
                   <div className="p-6 rounded-full bg-zinc-900 border border-zinc-800 italic">No Proposal Draft Found</div>
                   <p className="text-sm font-sans font-medium">Use the "AI Draft" button in the control center to generate one.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-zinc-800 flex justify-between items-center bg-zinc-900/30">
               <p className="text-xs font-medium text-zinc-500">
                 Drafted by **Ollama Intelligent Agent** • {new Date().toLocaleDateString()}
               </p>
               <div className="flex gap-4">
                 <IndustrialButton variant="ghost" className="text-zinc-400 hover:text-white flex items-center gap-2">
                   <Download className="w-4 h-4" /> Export PDF
                 </IndustrialButton>
                 <IndustrialButton className="bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2 px-8">
                   <Save className="w-4 h-4" /> Save Final Draft
                 </IndustrialButton>
               </div>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

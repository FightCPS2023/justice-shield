import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import api, { API_URL } from '../../lib/api';
import {
  Shield, Scale, FileText, AlertTriangle, Users, BookOpen, Calendar,
  MessageSquare, Brain, Gavel, Search, ArrowRight, Menu, X, LogOut, LogIn,
  Home, Settings, Star, Check, ChevronDown, Play, Lock, CheckCircle2,
  Loader2, Upload, Clock, Eye, Download, Plus, Trash2, Edit2, Send,
  CreditCard, Crown, Building2, Zap, Mic, Radio, Volume2, Copy, Key,
  MapPin, Coins, BarChart3, User, ChevronRight, HelpCircle, Bot, RefreshCw,
  Save
} from 'lucide-react';

function DocumentAnalysisView({ document, onReanalyze, analyzing, queueInfo, onRefreshQueue }) {
  const analysis = document.analysis_result?.analysis || document.analysis;
  const queueStatus = queueInfo?.status || document.analysis_status;
  const queuePosition = queueInfo?.queue_position || document.analysis_result?.queue_position;
  const queueError = queueInfo?.error || document.analysis_error;
  
  if (!analysis) {
    return (
      <div className="text-center py-12" data-testid="document-analysis-empty">
        <AlertTriangle className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Analysis Available</h3>
        <p className="text-gray-400 mb-4">This document hasn't been analyzed yet</p>
        {queueStatus && (
          <div className="mb-4 text-sm text-gray-300" data-testid="document-analysis-queue-status">
            <p>Queue Status: <span className="text-blue-400">{queueStatus}</span></p>
            {queuePosition && (
              <p data-testid="document-analysis-queue-position">Position: {queuePosition}</p>
            )}
            {queueError && (
              <p className="text-red-400" data-testid="document-analysis-queue-error">Error: {queueError}</p>
            )}
          </div>
        )}
        {document.processing_log && document.processing_log.length > 0 && (
          <div className="mb-4 text-left bg-gray-900/60 border border-gray-700 rounded-xl p-4" data-testid="document-processing-log-empty">
            <h4 className="text-sm font-semibold mb-2">Processing Log</h4>
            <ul className="space-y-1 text-xs text-gray-300 max-h-40 overflow-auto">
              {document.processing_log.slice(-6).map((entry, idx) => (
                <li key={idx} data-testid={`processing-log-empty-${idx}`}>
                  {new Date(entry.timestamp).toLocaleString()} — {entry.message}
                </li>
              ))}
            </ul>
          </div>
        )}
        {document.archive_children && document.archive_children.length > 0 && (
          <div className="mb-4 text-left bg-gray-900/60 border border-gray-700 rounded-xl p-4" data-testid="archive-children-empty">
            <h4 className="text-sm font-semibold mb-2">Archive Contents</h4>
            <ul className="space-y-1 text-xs text-gray-300">
              {document.archive_children.map((child) => (
                <li key={child.doc_id}>{child.filename}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button 
            onClick={onReanalyze}
            disabled={analyzing}
            className="btn-punisher"
            data-testid="document-analysis-reanalyze-button"
          >
            {analyzing ? (
              <><Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Analyzing...</>
            ) : (
              <><Brain className="w-5 h-5 inline mr-2" /> Analyze Now</>
            )}
          </button>
          {onRefreshQueue && queueStatus && (
            <button
              onClick={onRefreshQueue}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
              data-testid="document-analysis-refresh-queue"
            >
              Refresh Queue
            </button>
          )}
        </div>
      </div>
    );
  }

  const data = typeof analysis === 'string' ? { raw_analysis: analysis } : analysis;

  return (
    <div className="space-y-6" data-testid="document-analysis">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{document.title}</h2>
          <p className="text-gray-400">{document.filename}</p>
        </div>
        <button 
          onClick={onReanalyze}
          disabled={analyzing}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2"
          data-testid="document-analysis-reanalyze-button-header"
        >
          {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
          Re-analyze
        </button>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="bg-gradient-to-r from-blue-900/30 to-gray-900 border border-blue-800/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Document Summary
          </h3>
          <p className="text-gray-300">{data.summary}</p>
          {data.document_type && (
            <p className="text-sm text-blue-400 mt-2">Document Type: {data.document_type}</p>
          )}
        </div>
      )}

      {/* Violations Found */}
      {data.violations && data.violations.length > 0 && (
        <div className="bg-gradient-to-r from-red-900/30 to-gray-900 border border-red-800/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Violations Identified ({data.violations.length})
          </h3>
          <div className="space-y-4">
            {data.violations.map((v, i) => (
              <div key={i} className="bg-black/30 rounded-lg p-4 border-l-4 border-red-500">
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      v.severity === 'high' ? 'bg-red-600' : 
                      v.severity === 'medium' ? 'bg-yellow-600' : 'bg-gray-600'
                    }`}>
                      {v.severity?.toUpperCase() || 'MEDIUM'}
                    </span>
                    <h4 className="font-semibold mt-2">{v.type?.replace(/_/g, ' ').toUpperCase()}</h4>
                  </div>
                </div>
                <p className="text-gray-300 mt-2">{v.description}</p>
                {v.legal_basis && (
                  <p className="text-sm text-red-400 mt-2">Legal Basis: {v.legal_basis}</p>
                )}
                {v.defense_strategy && (
                  <p className="text-sm text-green-400 mt-1">Defense: {v.defense_strategy}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Allegations */}
      {data.key_allegations && data.key_allegations.length > 0 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Scale className="w-5 h-5 text-yellow-500" />
            Key Allegations Against You
          </h3>
          <ul className="space-y-2">
            {data.key_allegations.map((allegation, i) => {
              const isObject = allegation && typeof allegation === 'object';
              const allegationText = isObject ? (allegation.allegation || allegation.claim || '') : allegation;
              const weaknesses = isObject ? allegation.weaknesses : null;
              const defense = isObject ? allegation.defense : null;
              return (
                <li key={i} className="flex items-start gap-2" data-testid={`key-allegation-item-${i}`}>
                  <span className="text-yellow-500">•</span>
                  <div>
                    <span className="text-gray-300" data-testid={`key-allegation-text-${i}`}>{String(allegationText || '')}</span>
                    {weaknesses && (
                      <p className="text-sm text-orange-300 mt-1" data-testid={`key-allegation-weaknesses-${i}`}>
                        Weaknesses: {String(weaknesses)}
                      </p>
                    )}
                    {defense && (
                      <p className="text-sm text-green-400 mt-1" data-testid={`key-allegation-defense-${i}`}>
                        Defense: {String(defense)}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Timeline Events */}
      {data.timeline_events && data.timeline_events.length > 0 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-500" />
            Timeline Events Extracted ({data.timeline_events.length})
          </h3>
          <div className="space-y-3">
            {data.timeline_events.map((event, i) => (
              <div key={i} className="flex items-start gap-4 border-l-2 border-purple-500/50 pl-4">
                <div className="text-purple-400 font-mono text-sm whitespace-nowrap">
                  {event.date || 'Unknown'}
                </div>
                <div>
                  <p className="text-gray-200">{event.event}</p>
                  {event.significance && (
                    <p className="text-sm text-gray-400 mt-1">{event.significance}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Named Individuals */}
      {data.named_individuals && data.named_individuals.length > 0 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Named Individuals
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {data.named_individuals.map((person, i) => (
              <div key={i} className="bg-black/30 rounded-lg p-3">
                <p className="font-semibold">{person.name}</p>
                <p className="text-sm text-blue-400">{person.role}</p>
                {person.actions && <p className="text-sm text-gray-400 mt-1">{person.actions}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Defense Opportunities & Recommended Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        {data.defense_opportunities && data.defense_opportunities.length > 0 && (
          <div className="bg-gradient-to-r from-green-900/30 to-gray-900 border border-green-800/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              Defense Opportunities
            </h3>
            <ul className="space-y-2">
              {data.defense_opportunities.map((opp, i) => {
                const isObject = opp && typeof opp === 'object';
                const opportunityText = isObject ? (opp.opportunity || opp.summary || '') : opp;
                const legalBasis = isObject ? opp.legal_basis : null;
                const likelihood = isObject ? opp.likelihood_of_success : null;
                return (
                  <li key={i} className="flex items-start gap-2" data-testid={`defense-opportunity-item-${i}`}>
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-gray-300" data-testid={`defense-opportunity-text-${i}`}>{String(opportunityText || '')}</span>
                      {legalBasis && (
                        <p className="text-sm text-green-300 mt-1" data-testid={`defense-opportunity-legal-${i}`}>
                          Legal Basis: {String(legalBasis)}
                        </p>
                      )}
                      {likelihood && (
                        <p className="text-sm text-yellow-300 mt-1" data-testid={`defense-opportunity-likelihood-${i}`}>
                          Likelihood: {String(likelihood)}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {data.recommended_actions && data.recommended_actions.length > 0 && (
          <div className="bg-gradient-to-r from-orange-900/30 to-gray-900 border border-orange-800/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-500" />
              Recommended Actions
            </h3>
            <ul className="space-y-2">
              {data.recommended_actions.map((action, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">{i + 1}.</span>
                  <span className="text-gray-300">{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Motions to Consider */}
      {data.motions_to_consider && data.motions_to_consider.length > 0 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Gavel className="w-5 h-5 text-red-500" />
            Motions to Consider Filing
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.motions_to_consider.map((motion, i) => (
              <span key={i} className="px-3 py-1 bg-red-600/20 text-red-400 rounded-full text-sm">
                {motion}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Processing Log */}
      {document.processing_log && document.processing_log.length > 0 && (
        <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-6" data-testid="document-processing-log">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            Processing Log
          </h3>
          <ul className="space-y-2 text-sm text-gray-300 max-h-60 overflow-auto">
            {document.processing_log.slice(-10).map((entry, idx) => (
              <li key={idx} className="flex items-start gap-2" data-testid={`processing-log-item-${idx}`}>
                <span className="text-gray-500">{new Date(entry.timestamp).toLocaleString()}</span>
                <span className={`px-2 py-0.5 rounded text-xs ${entry.level === 'error' ? 'bg-red-600/30 text-red-200' : entry.level === 'warn' ? 'bg-yellow-600/30 text-yellow-200' : 'bg-blue-600/30 text-blue-200'}`}>
                  {entry.level || 'info'}
                </span>
                <span>{entry.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Raw Analysis Fallback */}
      {data.raw_analysis && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Full Analysis</h3>
          <pre className="whitespace-pre-wrap text-gray-300 text-sm">{data.raw_analysis}</pre>
        </div>
      )}

      {/* Red Flags */}
      {data.red_flags && data.red_flags.length > 0 && (
        <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Red Flags & Concerns
          </h3>
          <ul className="space-y-2">
            {data.red_flags.map((flag, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-red-500">⚠</span>
                <span className="text-gray-300">{flag}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Timeline Tab

export default DocumentAnalysisView;

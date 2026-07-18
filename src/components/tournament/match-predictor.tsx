'use client';

import React from 'react';
import { BrainCircuit } from 'lucide-react';
import { MatchPrediction } from '@/types/index';

interface MatchPredictorProps {
  prediction: MatchPrediction;
}

/**
 * AI match prediction card.
 */
export function MatchPredictor({ prediction }: MatchPredictorProps) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm" role="article" aria-label={`AI Match Prediction: ${prediction.predictedOutcome} with ${Math.round(prediction.confidencePercentage)}% confidence, source ${prediction.source}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 text-primary">
          <BrainCircuit className="h-5 w-5" aria-hidden="true" />
          <h3 className="font-bold text-lg">AI Prediction</h3>
        </div>
        <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded-md uppercase">
          {prediction.source}
        </span>
      </div>
      
      <div className="mb-6">
        <p className="text-sm text-muted-foreground mb-1">Predicted Winner</p>
        <p className="text-2xl font-bold">{prediction.predictedOutcome}</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Confidence Score</span>
          <span className="font-bold">{Math.round(prediction.confidencePercentage)}%</span>
        </div>
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-1000 ease-out"
            style={{ width: `${prediction.confidencePercentage}%` }}
            role="progressbar"
            aria-valuenow={prediction.confidencePercentage}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>
    </div>
  );
}

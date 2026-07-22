import React from 'react';
import { NammakasaMapView } from './NammakasaMapView';
import { FraudCase, FraudRing } from '../types/fraud';

interface MapViewProps {
  cases: FraudCase[];
  rings: FraudRing[];
  onSelectRing: (ring: FraudRing) => void;
  onSelectCase: (c: FraudCase) => void;
  onOpenIntake: () => void;
  activeRingCount: number;
  totalAmountAtRisk: number;
}

export const MapView: React.FC<MapViewProps> = (props) => {
  return <NammakasaMapView {...props} />;
};

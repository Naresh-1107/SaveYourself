import { ProductRecord, MathProblem } from './types';

export const PRODUCT_RECORDS: ProductRecord[] = [
  {
    id: 'helmet-01',
    name: 'IndusShield Type-II Industrial Safety Helmet',
    sampleCode: 'SMPL-ISH-882',
    category: 'Personal Protective Equipment',
    standardSpec: 'IS-2925 (Simulated Specification: Industrial Safety Helmets)',
    requiredParameters: [
      'Impact shock absorption: Transmitted force must not exceed 5.0 kN',
      'Penetration resistance: 3.0 kg conical striker at 1.0 m drop must not pierce crown',
      'Electrical resistance: Dielectric leakage current under 3.0 mA at 440V AC'
    ],
    actualTestObservations: [
      'Peak transmitted impact force: 3.74 kN (Compliant)',
      'Penetration test: 0.0 mm shell breach observed (Compliant)',
      'Electrical leakage current: 1.15 mA measured (Compliant)'
    ],
    hasDiscrepancy: false,
    explanation: 'Test results align fully with standard parameters. The shock absorption, penetration resistance, and dielectric metrics are verified compliant.'
  },
  {
    id: 'valve-02',
    name: 'CryoVex 16A High-Pressure Thermal Relief Valve',
    sampleCode: 'SMPL-TRV-419',
    category: 'Pressure Vessels & Safety Fittings',
    standardSpec: 'IS-9890 (Simulated Specification: Safety Relief Valves)',
    requiredParameters: [
      'Rated relief trigger pressure: 1.60 MPa (Permissible variance ±0.05 MPa)',
      'Hydrostatic proof pressure: Must sustain 3.20 MPa burst threshold without seal leak',
      'Component metallurgy: Mandatory Grade 316-T heat-treated alloy certification'
    ],
    actualTestObservations: [
      'Relief trigger actuated prematurely at 0.88 MPa (Critical deviation from 1.60 MPa setpoint)',
      'Hydrostatic casing leak and gasket deformation observed at 1.45 MPa (Failed 3.20 MPa threshold)',
      'Material test: Unannealed sub-grade spring alloy; missing heat-treatment certification'
    ],
    hasDiscrepancy: true,
    explanation: 'Discrepancy confirmed: The pressure relief valve actuated prematurely at 0.88 MPa (standard requires 1.60 MPa) and suffered early hydrostatic seal failure at 1.45 MPa. Flagging this sample for verification prevents catastrophic industrial boiler overpressure.'
  },
  {
    id: 'strip-03',
    name: 'AeroVolt Flame-Retardant Industrial Power Strip',
    sampleCode: 'SMPL-FPS-303',
    category: 'Electrical Distribution & Wiring Accessories',
    standardSpec: 'IS-1293 (Simulated Specification: Plugs and Socket-Outlets Rated up to 16A)',
    requiredParameters: [
      'Glow-wire test: Enclosure must self-extinguish within 30 seconds at 750°C',
      'Ground continuity resistance: Maximum 0.050 Ω across protective earthing path',
      'Full-load temperature rise: Maximum 45.0°C rise at continuous 16A current'
    ],
    actualTestObservations: [
      'Glow-wire test: Polymer casing extinguished flame in 5.8 seconds (Compliant)',
      'Ground continuity: Measured 0.019 Ω (Compliant)',
      'Temperature rise: Peak 31.4°C rise recorded after continuous test cycle (Compliant)'
    ],
    hasDiscrepancy: false,
    explanation: 'Test results meet simulated safety requirements. Flammability self-extinguishing duration and earthing resistance satisfy standard thresholds.'
  }
];

export const MATH_PROBLEMS: MathProblem[] = [
  {
    id: 'math-01',
    title: 'Standard Load Distribution Calibration',
    scenario: 'An industrial overhead hoist must evenly distribute a verified load of 360 kg across 4 high-tensile steel cables. To satisfy safe working load standards, calculate the required capacity per individual cable.',
    formula: '360 kg ÷ 4 = ?',
    options: [
      { label: '80 kg', value: 80 },
      { label: '85 kg', value: 85 },
      { label: '90 kg', value: 90 },
      { label: '95 kg', value: 95 }
    ],
    correctAnswer: 90,
    unit: 'kg',
    explanation: 'Calculation verified: 360 kg ÷ 4 cables = 90 kg per cable. Balanced tension prevents cable fatigue and ensures structural safety.'
  },
  {
    id: 'math-02',
    title: 'Hydrostatic Proof Pressure Multiplier',
    scenario: 'Testing standards require hydrostatic proof testing at 1.5× the rated system operating pressure of 40 bar before equipment certification. Calculate the required proof test pressure.',
    formula: '40 bar × 1.5 = ?',
    options: [
      { label: '50 bar', value: 50 },
      { label: '55 bar', value: 55 },
      { label: '60 bar', value: 60 },
      { label: '65 bar', value: 65 }
    ],
    correctAnswer: 60,
    unit: 'bar',
    explanation: 'Calculation verified: 40 bar × 1.5 multiplier = 60 bar proof test pressure. Equipment withstands maximum test pressure without plastic deformation.'
  }
];

export const BIS_EDUCATIONAL_STATEMENT = 
  'Standards support product quality and safety. Verify applicable certification details through official BIS resources.';

export const BIS_DISCLAIMER = 
  'Educational simulation only. This game is not an official BIS application.';

export type TrainingPoint = {
  epoch: number;
  accuracy: number;
  valAccuracy: number;
  loss: number;
  valLoss: number;
};

export type ModelRun = {
  id: string;
  architecture: 'ANN' | 'CNN' | 'Freeze' | 'Unfreeze';
  optimizer: 'Adam' | 'SGD';
  trainingSeconds: number;
  points: TrainingPoint[];
};

export const datasetStats = {
  trainImages: 3457,
  valImages: 860,
  classCount: 5,
  classes: ['daisy', 'dandelion', 'rose', 'sunflower', 'tulip'],
};

export const modelRuns: ModelRun[] = [
  {
    id: 'ANN_Adam',
    architecture: 'ANN',
    optimizer: 'Adam',
    trainingSeconds: 135,
    points: [
      { epoch: 1, accuracy: 0.3329, valAccuracy: 0.3256, loss: 4.37, valLoss: 2.0472 },
      { epoch: 2, accuracy: 0.3868, valAccuracy: 0.3616, loss: 1.975, valLoss: 1.882 },
      { epoch: 3, accuracy: 0.4675, valAccuracy: 0.4267, loss: 1.5132, valLoss: 1.7121 },
    ],
  },
  {
    id: 'ANN_SGD',
    architecture: 'ANN',
    optimizer: 'SGD',
    trainingSeconds: 66,
    points: [
      { epoch: 1, accuracy: 0.3437, valAccuracy: 0.3791, loss: 1.473, valLoss: 1.4226 },
      { epoch: 2, accuracy: 0.429, valAccuracy: 0.4291, loss: 1.3379, valLoss: 1.3069 },
      { epoch: 3, accuracy: 0.4672, valAccuracy: 0.4058, loss: 1.2776, valLoss: 1.3359 },
    ],
  },
  {
    id: 'CNN_Adam',
    architecture: 'CNN',
    optimizer: 'Adam',
    trainingSeconds: 332,
    points: [
      { epoch: 1, accuracy: 0.4553, valAccuracy: 0.5616, loss: 1.3232, valLoss: 1.1107 },
      { epoch: 2, accuracy: 0.6176, valAccuracy: 0.5477, loss: 0.9804, valLoss: 1.1112 },
      { epoch: 3, accuracy: 0.7278, valAccuracy: 0.6023, loss: 0.746, valLoss: 1.0583 },
    ],
  },
  {
    id: 'CNN_SGD',
    architecture: 'CNN',
    optimizer: 'SGD',
    trainingSeconds: 330,
    points: [
      { epoch: 1, accuracy: 0.3118, valAccuracy: 0.2558, loss: 1.5658, valLoss: 1.5479 },
      { epoch: 2, accuracy: 0.3746, valAccuracy: 0.4105, loss: 1.4901, valLoss: 1.456 },
      { epoch: 3, accuracy: 0.4249, valAccuracy: 0.4314, loss: 1.416, valLoss: 1.3866 },
    ],
  },
  {
    id: 'Freeze_Adam',
    architecture: 'Freeze',
    optimizer: 'Adam',
    trainingSeconds: 226,
    points: [
      { epoch: 1, accuracy: 0.792, valAccuracy: 0.8628, loss: 0.5867, valLoss: 0.4254 },
      { epoch: 2, accuracy: 0.9196, valAccuracy: 0.8535, loss: 0.2453, valLoss: 0.4489 },
      { epoch: 3, accuracy: 0.954, valAccuracy: 0.8477, loss: 0.1543, valLoss: 0.4844 },
    ],
  },
  {
    id: 'Freeze_SGD',
    architecture: 'Freeze',
    optimizer: 'SGD',
    trainingSeconds: 232,
    points: [
      { epoch: 1, accuracy: 0.3483, valAccuracy: 0.5395, loss: 1.5534, valLoss: 1.1732 },
      { epoch: 2, accuracy: 0.6121, valAccuracy: 0.6965, loss: 1.0313, valLoss: 0.8939 },
      { epoch: 3, accuracy: 0.7165, valAccuracy: 0.7453, loss: 0.8194, valLoss: 0.7628 },
    ],
  },
  {
    id: 'Unfreeze_Adam',
    architecture: 'Unfreeze',
    optimizer: 'Adam',
    trainingSeconds: 358,
    points: [
      { epoch: 1, accuracy: 0.8105, valAccuracy: 0.8663, loss: 0.5539, valLoss: 0.4451 },
      { epoch: 2, accuracy: 0.9167, valAccuracy: 0.7884, loss: 0.2411, valLoss: 0.8737 },
      { epoch: 3, accuracy: 0.9604, valAccuracy: 0.7953, loss: 0.1313, valLoss: 0.8966 },
    ],
  },
  {
    id: 'Unfreeze_SGD',
    architecture: 'Unfreeze',
    optimizer: 'SGD',
    trainingSeconds: 348,
    points: [
      { epoch: 1, accuracy: 0.4235, valAccuracy: 0.6174, loss: 1.5249, valLoss: 1.0259 },
      { epoch: 2, accuracy: 0.6957, valAccuracy: 0.7256, loss: 0.8418, valLoss: 0.7654 },
      { epoch: 3, accuracy: 0.7877, valAccuracy: 0.7709, loss: 0.6405, valLoss: 0.6491 },
    ],
  },
];

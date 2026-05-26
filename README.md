# Model Comparison Dashboard

A modern Next.js web application for flower classification using deep learning models. This dashboard showcases the comparison of different neural network architectures (ANN, CNN, and MobileNet) trained with various optimizers. Includes comprehensive analytics and visualization tools.

## Features

### 🎯 Core Features
- **Model Performance Dashboard**: Compare accuracy of 8 different model configurations
- **Interactive Predictions**: Upload flower images and get predictions from different models
- **Real-time Metrics**: Display best model performance and accuracy percentages
- **Visual Analytics**: Bar chart visualization of model performance comparisons
- **Responsive Design**: Beautiful UI with custom styling and smooth animations
- **Confidence Scores**: View detailed confidence predictions for each flower class

### 📊 Advanced Analytics
- **Training History Visualization**: View training and validation accuracy/loss curves across epochs
- **Per-Class Accuracy**: Detailed breakdown of model performance for each flower class
- **Model Specifications**: View architecture details, layer count, parameters, and training config
- **Optimizer Comparison**: Compare Adam vs SGD optimizers across models
- **Architecture Comparison**: Performance metrics and trade-offs between different model types
- **Inference Performance**: Track inference time and model efficiency metrics

## Tech Stack

- **Framework**: Next.js 16.2.6 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Runtime**: Node.js
- **State Management**: React Hooks

## Project Structure

```
app/
├── components/
│   ├── PredictionDashboard.tsx      # Main dashboard component
│   ├── AnalyticsTabs.tsx            # Tabbed analytics interface
│   ├── ModelMetrics.tsx             # Metrics display component
│   ├── ImageUploader.tsx            # Image upload handler
│   ├── ModelSelector.tsx            # Model selection radio buttons
│   ├── ChartComponent.tsx           # Performance chart visualization
│   ├── TrainingHistory.tsx          # Training curves and metrics
│   ├── ClassAccuracy.tsx            # Per-class accuracy breakdown
│   ├── ModelSpecs.tsx               # Model architecture details
│   ├── OptimizerComparison.tsx      # Optimizer comparison metrics
│   └── ArchitectureComparison.tsx   # Architecture trade-off analysis
├── page.tsx                         # Main page entry point
├── layout.tsx                       # Root layout
└── globals.css                      # Global styles
lib/
└── mockData.ts                      # Mock model results, training history, and specifications
```
# PrimeTrade Task Management System

A scalable, secure, and premium Full-Stack application built for the Primetrade.ai Backend Developer Internship assignment.

## Tech Stack

### Backend
- **Node.js & Express**: Core runtime and framework.
- **Supabase (Postgres) & Prisma ORM**: Database and modern ORM.
- **JWT (JSON Web Tokens)**: Secure authentication.
- **Bcrypt.js**: Password hashing.
- **Joi**: Input validation.
- **Swagger**: API Documentation.
- **Helmet & Rate Limiting**: Security best practices.

### Frontend
- **Next.js 14+ (App Router)**: React framework.
- **Tailwind CSS**: Modern styling.
- **Framer Motion**: Premium animations.
- **Lucide React**: Icon system.
- **React Toastify**: Notifications.

---

## Features

- **Authentication**: Secure Register & Login with password hashing.
- **RBAC**: Role-Based Access Control (Admin vs User).
- **CRUD Operations**: Full Task management (Create, Read, Update, Delete).
- **Security**: Protected routes, JWT token handling, and input sanitization.
- **Premium UI**: Glassmorphism design, dark mode, and smooth transitions.
- **API Docs**: Integrated Swagger documentation at `/api-docs`.

---

## Getting Started

### Prerequisites
<<<<<<< HEAD
- Node.js 18+ and npm/yarn installed

### Installation

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Models

1. **ANN (Artificial Neural Network)**
   - Fully connected layers (5 layers, 3.3M parameters)
   - Optimizers: Adam, SGD

2. **CNN (Convolutional Neural Network)**
   - Convolutional and pooling layers (8 layers, 1.2M parameters)
   - Optimizers: Adam, SGD

3. **Transfer Learning - Frozen (MobileNet)**
   - Pre-trained base with frozen layers
   - Custom top layers (130 layers, 3.5M parameters)
   - Optimizers: Adam, SGD

4. **Transfer Learning - Fine-tuned (MobileNet)**
   - Pre-trained base with last 20 layers unfrozen
   - Fine-tuning approach for better accuracy
   - Optimizers: Adam, SGD

## Flower Classes

- 🌼 Daisy
- 🌻 Dandelion
- 🌹 Rose
- 🌞 Sunflower
- 🌷 Tulip

## Analytics Features

### 📈 Training History
View training and validation metrics across epochs:
- Accuracy curves (training vs validation)
- Loss curves (training vs validation)
- Training time
- Final accuracy metrics

### 🎯 Class-wise Accuracy
Per-class performance metrics:
- Individual accuracy for each flower class
- Average accuracy across all classes
- Visual progress bars for easy comparison

### ⚙️ Model Specifications
Detailed architecture information:
- Model type and description
- Total layers and parameters
- Optimizer and batch size
- Training epochs and configuration

### 🔧 Optimizer Comparison
Compare Adam vs SGD:
- Learning rates
- Average accuracy
- Training efficiency
- Loss metrics

### 🏗️ Architecture Comparison
Performance trade-offs:
- Accuracy vs inference time
- Model size and parameters
- Detailed comparison table
- Best model and fastest inference indicators

## Customization

### Styling
The dashboard uses a refined color scheme:
- Primary Gradient: `#A67A82` to `#8B6B73`
- Background: `#FAF7F5`
- Card Background: `#FFFFFF`
- Border Color: `#D4C5C1`

Modify colors in `app/globals.css` and component files.

### Mock Data
Update model results and specifications in `lib/mockData.ts`:
- `modelResults`: Accuracy scores
- `trainingHistory`: Training curves and metrics
- `modelSpecs`: Architecture specifications
- `classAccuracy`: Per-class performance
- `optimizerComparison`: Optimizer metrics
- `architectureComparison`: Architecture trade-offs

## Building for Production

```bash
npm run build
npm start
```

## API Integration

Currently, the dashboard uses mock data for predictions and analytics. To integrate with a real backend:

1. **For Predictions**:
   - Create an API endpoint that accepts image uploads
   - Update the `handlePredict` function in `PredictionDashboard.tsx`
   - Make HTTP requests to your backend model inference service

2. **For Training History**:
   - Export training history from your notebook
   - Replace mock data in `lib/mockData.ts` with real training logs
   - Update `TrainingHistory.tsx` if data format differs

3. **For Model Specifications**:
   - Fetch actual model specs from your training pipeline
   - Update `modelSpecs` object with real values
   - Parse model architecture programmatically if needed

## Example API Integration

```typescript
// Example: Connect to a backend API
async function handlePredict(image: string, modelName: string) {
  const formData = new FormData();
  formData.append('image', image);
  formData.append('model', modelName);

  const response = await fetch('/api/predict', {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();
  return {
    class: result.predicted_class,
    confidence: result.confidence_scores,
  };
}
```

## Performance Metrics

- **Load Time**: ~1-2 seconds
- **Prediction Time**: 5-38ms (depending on model)
- **Memory Usage**: ~50-100MB
- **Supported Image Formats**: JPG, PNG, WebP, GIF

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [React Hooks](https://react.dev/reference/react)
- [TensorFlow.js](https://www.tensorflow.org/js) (for client-side inference)

## Future Enhancements

- [ ] Real-time model training visualization
- [ ] Interactive confusion matrix
- [ ] ROC and AUC curves
- [ ] Model export/download functionality
- [ ] Batch prediction with CSV upload
- [ ] Real-time inference with TensorFlow.js
- [ ] Mobile app version
- [ ] Dark mode support

## License

This project is part of VIT Deep Learning Assignments.
=======
- Node.js installed.
- Supabase account and a Postgres database URI.

### 1. Backend Setup
```bash
cd backend
npm install
# Create a .env file based on the provided values
npx prisma db push # Syncs schema to Supabase
npm run start # Starts with nodemon
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## Scalability Note

To transform this monolithic architecture into a highly scalable enterprise system, the following strategies would be implemented:

### 1. Microservices Architecture
Break down the application into specialized services:
- **Auth Service**: Dedicated to identity and session management.
- **Task Service**: Handles core business logic.
- **Notification Service**: Manages email/push alerts.
- *Benefit*: Independent scaling and fault isolation.

### 2. Caching with Redis
- Implement Redis to cache frequently accessed tasks and user sessions.
- Reduce database load for high-traffic endpoints (e.g., `GET /tasks`).

### 3. Database Scaling
- **Read Replicas**: Distribute read queries across multiple database nodes.
- **Sharding**: Partition data across different servers based on `userId`.

### 4. Load Balancing
- Use Nginx or cloud-based load balancers (AWS ELB) to distribute traffic across multiple Node.js instances.
- Implement horizontal scaling using Docker and Kubernetes.

### 5. Asynchronous Processing
- Use Message Queues (RabbitMQ/Kafka) for heavy tasks like generating reports or sending bulk emails to prevent blocking the event loop.

---

## API Documentation
Once the backend is running, visit:
`http://localhost:5000/api-docs`

---

## Deployment

### Backend (Railway with Docker)
1. **Connect Repository**: Link your GitHub repo to Railway.
2. **Root Directory**: In Railway settings, set the **Root Directory** to `backend`.
3. **Environment Variables**: Add `JWT_SECRET`, `NODE_ENV=production`, and `PORT=5000`.
4. **Persistency**: Use a Volume or switch to a Managed Postgres if you need to persist SQLite data across restarts.

### Frontend (Railway or Vercel)
1. **Connect Repository**: Link the repo and set the **Root Directory** to `frontend`.
2. **Environment Variables**: Add `NEXT_PUBLIC_API_URL` pointing to your deployed Backend URL.

---

Built with for Primetrade.ai
>>>>>>> 8ca122fd361874eadf475f792dec5cf5c27d875b

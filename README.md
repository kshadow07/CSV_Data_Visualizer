# CSV Data Visualizer

A modern web application for visualizing and analyzing CSV data with interactive charts and data manipulation features.

## Features

- **CSV File Upload**: Easily upload and parse CSV files
- **Interactive Charts**: 
  - Multiple chart types (Line, Bar, Area)
  - Customizable chart colors
  - Grid display toggle
  - Dynamic data point visualization (20, 50, 100, or all points)
- **Data Analysis**:
  - Real-time data visualization
  - X and Y axis customization
  - Responsive design for all screen sizes
- **Chart Customization**:
  - Custom titles
  - Adjustable data points display
  - Interactive tooltips
  - Dynamic resizing

## Tech Stack

- React
- TypeScript
- Tailwind CSS
- Recharts
- Vite

## Prerequisites

- Node.js (v14 or higher)
- Docker (optional, for containerized deployment)

## Installation and Running Locally

1. Clone the repository:
```bash
git clone https://github.com/kshadow07/CSV_Data_Visualizer.git
cd CSV_Data_Visualizer
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Running with Docker

1. Build the Docker image:
```bash
docker build -t csv-visualizer .
```

2. Run the container:
```bash
docker run -p 80:80 csv-visualizer
```

3. Access the application at `http://localhost:80`

## Usage

1. Launch the application
2. Click on the upload button to select your CSV file
3. Choose your preferred chart type (Line, Bar, or Area)
4. Customize the visualization:
   - Select X and Y axis data columns
   - Choose chart color
   - Toggle grid display
   - Adjust number of visible data points
5. Interact with the chart:
   - Hover over data points for detailed information
   - Use the data point controls to adjust the view

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Try it Online

[Edit in StackBlitz ⚡️](https://stackblitz.com/~/github.com/kshadow07/CSV_Data_Visualizer)
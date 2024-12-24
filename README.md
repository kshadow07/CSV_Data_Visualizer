# CSV Data Visualizer

A modern web application for visualizing and analyzing CSV data with interactive charts, data cleaning tools, and statistical analysis.

## Features

- Interactive data visualization with multiple chart types
- Data preview with horizontal scrolling and modern pagination
- Data cleaning and transformation tools
- Statistical analysis
- Export options for charts and data
- Search and filter capabilities
- Responsive design for all devices

## Getting Started

### Prerequisites

- Node.js >= 16
- npm or yarn
- Docker (optional, for containerized deployment)

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/kshadow07/CSV_Data_Visualizer.git
cd CSV_Data_Visualizer
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

### Docker Deployment

1. Build the Docker image:
```bash
docker build -t csv-visualizer .
```

2. Run the container:
```bash
docker run -p 5173:5173 csv-visualizer
```

The application will be available at `http://localhost:5173`

#### Docker Configuration

The application uses the following Docker configuration:

- Base image: Node 16 Alpine for minimal size
- Exposed port: 5173 (Vite's default port)
- Production-optimized build
- Host configuration for external access

You can customize the port mapping when running the container:
```bash
docker run -p <host-port>:5173 csv-visualizer
```

## Development Commands

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
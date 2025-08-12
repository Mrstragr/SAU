# SAU Transport - Eco-Friendly Auto Rickshaw Management System

A comprehensive transportation management application for South Asian University's eco-friendly auto rickshaw service. This system helps coordinate between students and drivers to efficiently manage the 2km route from campus main gate to the main road.

## 🚀 Features

### For Students
- **Real-time Vehicle Tracking**: View all available vehicles and their current locations
- **Driver Information**: Access driver details, contact information, and ratings
- **Status Monitoring**: See vehicle status (waiting, confirm, offline) and passenger capacity
- **Feedback System**: Rate and review drivers after trips
- **Trip History**: View past trips and ratings
- **Contact Integration**: Direct calling and messaging to drivers

### For Drivers
- **Status Management**: Toggle between online/offline and waiting/confirm modes
- **Location Sharing**: Update current location in real-time
- **Passenger Management**: Track current passenger count
- **Trip Tracking**: Monitor daily trips and earnings
- **Battery Monitoring**: Track vehicle battery levels
- **Profile Management**: Update personal and vehicle information

### For Administrators
- **System Overview**: Dashboard with key metrics and statistics
- **Vehicle Management**: Add, edit, and remove vehicles from the fleet
- **Driver Management**: Monitor driver performance and manage accounts
- **Student Management**: View registered students and their usage
- **Trip Analytics**: Generate reports on trip data and performance
- **System Monitoring**: Track system health and uptime

## 🛠️ Technology Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router DOM
- **Forms**: React Hook Form
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Data Fetching**: React Query

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd university-transport-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔐 Demo Credentials

### Student Login
- **Email**: `student@sau.ac.in`
- **Password**: Any password (demo mode)

### Driver Login
- **Phone**: `+91 98765 43210`
- **Password**: Any password (demo mode)

### Admin Login
- **Email**: `admin@sau.ac.in`
- **Password**: Any password (demo mode)

## 🎯 Key Features Explained

### Real-time Coordination
The app solves the main problem of coordination between students and drivers by providing:

1. **Live Status Updates**: Students can see which vehicles are available and their current status
2. **Location Tracking**: Real-time location updates help students find nearby vehicles
3. **Capacity Management**: Drivers can update passenger count to show availability
4. **Status Communication**: Clear waiting/confirm status to avoid confusion

### User Experience
- **Intuitive Interface**: Clean, modern design with role-based dashboards
- **Mobile Responsive**: Works seamlessly on all devices
- **Real-time Updates**: Live data updates without page refresh
- **Quick Actions**: One-click calling and messaging features

### Data Management
- **Mock Data**: Comprehensive sample data for demonstration
- **State Persistence**: User sessions maintained across browser sessions
- **Role-based Access**: Different interfaces for students, drivers, and admins

## 📱 User Roles

### Student Interface
- View all available vehicles
- Check driver ratings and contact information
- Track vehicle locations and status
- Leave feedback and ratings
- View trip history

### Driver Interface
- Toggle online/offline status
- Update location and passenger count
- Manage trip status (waiting/confirm)
- View performance metrics
- Update profile information

### Admin Interface
- System overview and analytics
- Vehicle and driver management
- Student account management
- Trip monitoring and reporting
- System configuration

## 🗺️ Campus Integration

The system is designed specifically for South Asian University's campus layout:

- **Route**: Main Gate → Main Road (2km distance)
- **Service Hours**: 6:00 AM - 10:00 PM
- **Capacity**: 4 students per vehicle
- **Cost**: Free for students
- **Frequency**: Every 10-15 minutes
- **Eco-Friendly**: Battery-powered vehicles

## 🔧 Customization

### Adding New Features
1. **Real-time Maps**: Integrate Google Maps or OpenStreetMap for live tracking
2. **Push Notifications**: Add real-time notifications for vehicle availability
3. **Payment Integration**: Add payment processing for premium services
4. **Analytics Dashboard**: Enhanced reporting and analytics
5. **Mobile App**: Native mobile applications for iOS and Android

### Backend Integration
The current version uses mock data. To integrate with a real backend:

1. Replace mock data calls with API endpoints
2. Implement real authentication and authorization
3. Add real-time WebSocket connections for live updates
4. Integrate with GPS tracking systems
5. Add database persistence

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy Options
- **Vercel**: Easy deployment with `vercel --prod`
- **Netlify**: Drag and drop the `dist` folder
- **AWS S3**: Upload built files to S3 bucket
- **Heroku**: Deploy with Node.js buildpack

## 📊 Performance

- **Fast Loading**: Optimized with Vite for quick development and build times
- **Responsive Design**: Works on all screen sizes
- **Accessibility**: WCAG compliant design
- **SEO Optimized**: Meta tags and proper structure

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **South Asian University** for the transportation challenge
- **React Community** for the excellent ecosystem
- **Tailwind CSS** for the beautiful styling framework
- **Lucide** for the amazing icon set

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ for South Asian University**

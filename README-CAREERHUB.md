# CareerHub - Modern Recruitment Platform

A sophisticated recruitment platform with social networking features built with Angular 20, featuring zoneless change detection, standalone components, TailwindCSS 4, and Lucide icons.

## 🎨 Design System

### Color Palette
- **Primary Accent**: `#990000` (RGB: 153, 0, 0)
- **Gradient**: `#800000` to `#A61A1A` (RGB: 128, 0, 0 to 166, 26, 26)
- **Main Background**: `#F5F5F5` (RGB: 245, 245, 245)
- **Subtle Accents**: `#D3CCC6` (RGB: 211, 204, 198)
- **Dark Contrast**: `#333333` (RGB: 51, 51, 51)
- **Optional Accent**: `#C8A2C8` (RGB: 200, 162, 200)

### Typography
- Font Family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif

## 🚀 Features

### Core Platform Features
- **Job Seekers**: Complete profile management, application tracking, job search
- **Jobs**: Advanced job listing with filtering, bookmarking, and matching
- **Applications**: Application management and status tracking
- **Shortlisting**: Candidate shortlisting system for recruiters
- **Messages**: Real-time messaging system between users
- **Notifications**: Comprehensive notification system
- **Companies**: Company profiles and job postings
- **Social Features**: Posts, campaigns, news with comments and replies
- **Connections**: User networking and connection management
- **Public Profiles**: Professional profile viewing

### Technical Features
- **Angular 20** with zoneless change detection
- **Standalone Components** architecture
- **TailwindCSS 4** for styling
- **Lucide Icons** for consistent iconography
- **Responsive Design** for mobile and desktop
- **Modern UI/UX** with elegant animations and transitions

## 📁 Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── models/           # Data models and interfaces
│   │   │   ├── user.model.ts
│   │   │   ├── job.model.ts
│   │   │   └── social.model.ts
│   │   ├── services/         # Business logic services
│   │   ├── shared/           # Shared components and utilities
│   │   │   ├── layout.component.ts
│   │   │   └── common-provider.shared.ts
│   │   └── states/           # State management
│   ├── features/             # Feature components
│   │   ├── dashboard.component.ts
│   │   ├── jobs.component.ts
│   │   ├── profile.component.ts
│   │   └── messages.component.ts
│   └── public/               # Public assets
├── styles.css               # Global styles
└── index.html              # Main HTML file
```

## 🛠️ Development

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Angular CLI 20+

### Installation
```bash
npm install
```

### Development Server
```bash
npm start
```
The application will be available at `http://localhost:49002/`

### Build
```bash
npm run build
```

### Testing
```bash
npm test
```

## 📱 Components Overview

### Layout Component
- Responsive sidebar navigation
- Modern header with search functionality
- Mobile-friendly hamburger menu
- User profile section
- Notification badges

### Dashboard Component
- Welcome section with gradient background
- Statistics overview cards
- Social media feed with posts
- Job recommendations sidebar
- Upcoming events section

### Jobs Component
- Advanced job search with filters
- Job listing cards with match percentages
- Bookmark functionality
- Company ratings and reviews
- Salary and location filtering

### Profile Component
- Professional profile layout
- Experience and education sections
- Skills with endorsements
- Language proficiency
- Social links and resume download

### Messages Component
- Real-time conversation interface
- Contact list with online status
- Message threads with read receipts
- File attachment support
- Search functionality

## 🎯 Key Features Implemented

### User Experience
- **Elegant Design**: Professional and modern interface
- **Responsive Layout**: Works on all device sizes
- **Smooth Animations**: Subtle transitions and hover effects
- **Intuitive Navigation**: Clear and consistent navigation patterns

### Functionality
- **Job Matching**: Percentage-based job matching algorithm
- **Real-time Messaging**: Interactive messaging system
- **Profile Management**: Comprehensive profile sections
- **Application Tracking**: Job application status management
- **Social Features**: Posts, likes, comments, and sharing

### Technical Excellence
- **Performance**: Optimized with Angular 20's zoneless change detection
- **Modularity**: Standalone components for better tree-shaking
- **Accessibility**: Semantic HTML and ARIA labels
- **Type Safety**: Full TypeScript implementation with strict typing

## 🔧 Configuration

### TailwindCSS Configuration
The project includes a custom TailwindCSS configuration with:
- Extended color palette matching the design system
- Custom animation keyframes
- Elegant shadow utilities
- Responsive design breakpoints

### Angular Configuration
- Zoneless change detection enabled
- Standalone components architecture
- Lazy loading for optimal performance
- Modern build tools with Vite

## 📋 Future Enhancements

- [ ] Real-time notifications
- [ ] Video calling integration
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Progressive Web App (PWA) features
- [ ] Integration with external job boards
- [ ] AI-powered job recommendations
- [ ] Advanced search with Elasticsearch
- [ ] Mobile applications (iOS/Android)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Angular team for the amazing framework
- TailwindCSS for the utility-first CSS framework
- Lucide for the beautiful icon library
- The open-source community for inspiration and tools

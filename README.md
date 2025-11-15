# PollTrade - Predict & Trade on Real-World Events

A modern full-stack Next.js application for participating in polls and predicting outcomes of real-world events. Built with TypeScript and CSS Modules.

## 🚀 Features

### Site-Wide Layout
- **Sticky Header**: Fixed navigation bar with PollTrade branding
- **Login/Account Access**: Desktop shows full text, mobile shows icons
- **Comprehensive Footer**: Legal links, company info, support resources, and social media
- **Responsive Navigation**: Optimized for desktop, tablet, and mobile devices
- **Professional Design**: Consistent branding across all pages

### Homepage
- **20+ Live Polls**: From sports and finance to technology and entertainment
- **Smart Sorting**: Active polls displayed first, followed by expired polls
- **Visual Distinction**: Expired polls appear slightly grayed out with red expiry badges
- **Category Filtering**: Filter polls by Sports, Finance, Cryptocurrency, Technology, Politics, and more
- **Real-time Vote Percentages**: Visual progress bars showing voting trends
- **Clickable Poll Cards**: Navigate to detailed poll pages
- **Responsive Design**: Beautiful UI that works on all devices

### Poll Detail Pages
- **Detailed Poll View**: Full poll information with voting statistics
- **Expired Poll Detection**: Automatically detects and displays expired polls
- **Interactive Voting System**: Full voting functionality with radio buttons
  - Select from multiple options with radio buttons
  - Real-time vote percentage display with progress bars
  - One vote per user per poll (enforced at database level)
  - Vote counts update immediately after casting vote
  - Voted status persists - shows which option user selected
  - Disabled voting on already-voted polls with confirmation notice
- **Authentication-Gated Features**: Voting and commenting require user login
  - Not logged in: Shows "Login to Vote" and "Login to Comment" prompts
  - Logged in: Full access to voting and commenting
  - Return to same poll after login
- **Comments Section**: View and participate in discussions
- **Authenticated Comments**: Users must be logged in to comment (name auto-populated from profile)
- **Add Comments**: Share your thoughts and predictions (disabled on expired polls, requires login)
- **Real-time Comment Count**: See how many people are discussing
- **User Engagement**: Like counts on comments
- **Back Navigation**: Easy navigation back to homepage

### Authentication
- **Mobile-Based Login**: Secure OTP-based authentication
- **Three-Step Verification**: 
  1. Enter mobile number → Receive OTP
  2. Enter 4-digit OTP → Verify identity
  3. Enter name (new users only) → Create profile
- **Smart User Detection**: Existing users skip profile creation
- **JWT Token Authentication**: Secure bearer token system with temporary tokens for profile completion
- **Session Management**: Persistent login with localStorage
- **MongoDB Integration**: OTP and user data stored in MongoDB
- **Automatic OTP Expiry**: OTPs expire after 5 minutes (TTL index)
- **Rate Limiting**: Maximum 3 OTP verification attempts
- **Protected Routes**: Account page requires authentication
- **User Profile**: Name and mobile number display
- **Logout Functionality**: Secure session termination

### Backend APIs
- **POST /api/auth/send-otp** - Send OTP to mobile number
- **POST /api/auth/verify-otp** - Verify OTP (returns user+token OR tempToken for new users)
- **POST /api/auth/complete-profile** - Complete profile for new users
- **POST /api/seed-polls** - Seed database with 20 sample polls (development only)
- **GET /api/polls** - Fetch all polls from MongoDB
- **GET /api/polls/[id]** - Fetch specific poll details from MongoDB
- **GET /api/polls/[id]/vote** - Check if user has voted on poll (requires authentication)
- **POST /api/polls/[id]/vote** - Cast vote on poll (requires authentication, one vote per user)
- **GET /api/polls/[id]/comments** - Fetch comments for a poll from MongoDB
- **POST /api/polls/[id]/comments** - Add a new comment to MongoDB (rejected if poll is expired, requires authentication)

## 📋 Prerequisites

Before running this application, make sure you have:

- Node.js 18.x or higher
- npm or yarn package manager
- MongoDB (local installation or MongoDB Atlas account)

## 🔐 Environment Variables

Create a `.env.local` file in the root directory:

```
# MongoDB Connection String
# For local development:
MONGODB_URI=mongodb://localhost:27017/polltrade

# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority

# JWT Secret for authentication tokens
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Node Environment
NODE_ENV=development
```

**Important:**
- `MONGODB_URI`: Required. Connect to local MongoDB or MongoDB Atlas
- `JWT_SECRET`: Required for production. Generate using: `openssl rand -base64 32`
- `NODE_ENV`: Set to `production` for production deployments

## 🛠️ Installation

1. **Set up MongoDB**:

   **Option A - Local MongoDB:**
   - Install MongoDB: [MongoDB Installation Guide](https://docs.mongodb.com/manual/installation/)
   - Start MongoDB service:
     ```bash
     # macOS (Homebrew)
     brew services start mongodb-community
     
     # Linux (systemd)
     sudo systemctl start mongod
     
     # Windows
     net start MongoDB
     ```

   **Option B - MongoDB Atlas (Cloud):**
   - Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a new cluster
   - Get your connection string and add it to `.env.local`

2. **Install dependencies**:

```bash
npm install
```

or

```bash
yarn install
```

## 🏃 Running Locally

### Development Mode

1. **Start MongoDB** (if using local MongoDB):
   ```bash
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

2. **Seed the database with polls**:
   ```bash
   # Start the dev server first
   npm run dev
   
   # In another terminal, seed the database
   curl -X POST http://localhost:3000/api/seed-polls
   ```

3. **Access the application**:
   
   The application will be available at [http://localhost:3000](http://localhost:3000)

### Production Build

Build the application for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## 📁 Project Structure

```
polltrade/
├── components/
│   ├── Header.tsx                      # Sticky header with auth state
│   ├── Footer.tsx                      # Footer with legal links
│   └── Layout.tsx                      # Layout wrapper component
├── context/
│   └── AuthContext.tsx                 # Authentication context provider
├── lib/
│   └── mongodb.ts                      # MongoDB connection utility
├── models/
│   ├── Otp.ts                          # OTP Mongoose schema
│   ├── User.ts                         # User Mongoose schema
│   ├── Poll.ts                         # Poll Mongoose schema
│   ├── Comment.ts                      # Comment Mongoose schema
│   └── PollResponse.ts                 # PollResponse Mongoose schema
├── pages/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── send-otp.ts             # POST: Send OTP (MongoDB)
│   │   │   └── verify-otp.ts           # POST: Verify OTP (MongoDB + JWT)
│   │   ├── polls.ts                    # GET all polls
│   │   └── polls/
│   │       ├── [id].ts                 # GET single poll by ID
│   │       └── [id]/
│   │           └── comments.ts         # GET/POST comments
│   ├── polls/
│   │   └── [id].tsx                    # Poll detail page
│   ├── account.tsx                     # User account/profile page
│   ├── login.tsx                       # Login page (name + mobile + OTP)
│   ├── _app.tsx                        # App with AuthProvider
│   └── index.tsx                       # Home page with poll grid
├── types/
│   ├── auth.ts                         # Auth, User, JWT types
│   ├── poll.ts                         # Poll type definitions
│   └── comment.ts                      # Comment type definitions
├── utils/
│   └── api.ts                          # API utility with bearer token
├── styles/
│   ├── globals.css                     # Global styles
│   ├── Layout.module.css               # Layout styles
│   ├── Header.module.css               # Header styles
│   ├── Footer.module.css               # Footer styles
│   ├── Login.module.css                # Login page styles
│   ├── Account.module.css              # Account page styles
│   ├── Home.module.css                 # Home page styles
│   └── PollDetail.module.css           # Poll detail page styles
├── public/
│   └── favicon.ico                     # Favicon
├── package.json                        # Dependencies (includes jsonwebtoken)
├── tsconfig.json                       # TypeScript configuration
├── next.config.js                      # Next.js configuration
└── README.md                          # This file
```

## 🌐 API Endpoints

### Authentication APIs

#### POST /api/auth/send-otp

Send OTP to user's mobile number.

**Request Body:**
```json
{
  "mobileNumber": "9876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully to 9876543210",
  "expiresIn": 300,
  "otp": "1234"  // Only in development mode
}
```

**Validation:**
- Mobile number must be 10 digits
- Must start with 6, 7, 8, or 9
- OTP expires in 5 minutes

**Error Responses:**
- `400` - Invalid mobile number format
- `405` - Method not allowed

#### POST /api/auth/verify-otp

Verify OTP and check user status.

**Request Body:**
```json
{
  "mobileNumber": "9876543210",
  "otp": "1234"
}
```

**Response (Existing User):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "user_9876543210",
    "name": "John Doe",
    "mobileNumber": "9876543210",
    "createdAt": "2025-11-15T12:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (New User):**
```json
{
  "success": true,
  "message": "OTP verified. Please complete your profile.",
  "needsProfile": true,
  "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Validation:**
- OTP must be 4 digits
- Maximum 3 verification attempts
- OTP must not be expired

**Error Responses:**
- `400` - Invalid OTP, expired OTP, or OTP not found
- `400` - Maximum attempts exceeded
- `405` - Method not allowed

#### POST /api/auth/complete-profile

Complete profile for new users after OTP verification.

**Request Body:**
```json
{
  "name": "John Doe",
  "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile created successfully",
  "user": {
    "id": "user_9876543210",
    "name": "John Doe",
    "mobileNumber": "9876543210",
    "createdAt": "2025-11-15T12:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Validation:**
- Name is required (minimum 2 characters)
- Temporary token must be valid and not expired
- Temporary token expires in 10 minutes

**Error Responses:**
- `400` - Invalid name or user already exists
- `401` - Invalid or expired temporary token
- `405` - Method not allowed

### Seed API (Development Only)

#### POST /api/seed-polls

Seeds the database with 20 sample polls.

**Response:**
```json
{
  "success": true,
  "message": "Successfully seeded 20 polls",
  "count": 20
}
```

**Note:** This will clear all existing polls before seeding. Use only in development!

### Poll APIs

#### GET /api/polls

Returns all available polls from MongoDB with their options and vote percentages.

**Response:**
```json
[
  {
    "id": "1",
    "question": "Who will win the IPL 2025 Finals?",
    "options": [
      {
        "id": "1a",
        "text": "PBKS (Punjab Kings)",
        "votePercentage": 45
      },
      {
        "id": "1b",
        "text": "RCB (Royal Challengers Bangalore)",
        "votePercentage": 55
      }
    ],
    "totalVotes": 125847,
    "category": "Sports",
    "expiresAt": "2025-05-25T18:30:00Z"
  }
  // ... more polls
]
```

### GET /api/polls/[id]

Returns a specific poll by ID.

**Parameters:**
- `id` (string) - The poll ID

**Response:**
```json
{
  "id": "1",
  "question": "Who will win the IPL 2025 Finals?",
  "options": [...],
  "totalVotes": 125847,
  "category": "Sports",
  "expiresAt": "2025-05-25T18:30:00Z"
}
```

**Error Responses:**
- `404` - Poll not found
- `400` - Invalid poll ID

### GET /api/polls/[id]/comments

Returns all comments for a specific poll, sorted by newest first.

**Parameters:**
- `id` (string) - The poll ID

**Response:**
```json
[
  {
    "id": "1",
    "pollId": "1",
    "author": "Rajesh Kumar",
    "content": "PBKS has a stronger batting lineup this year!",
    "timestamp": "2025-11-14T10:30:00Z",
    "likes": 24
  }
  // ... more comments
]
```

### POST /api/polls/[id]/comments

Add a new comment to a poll.

**Parameters:**
- `id` (string) - The poll ID

**Request Body:**
```json
{
  "author": "John Doe",
  "content": "This is my prediction..."
}
```

**Validation:**
- `author` - Required, will be trimmed
- `content` - Required, 3-500 characters

**Response:**
```json
{
  "id": "123",
  "pollId": "1",
  "author": "John Doe",
  "content": "This is my prediction...",
  "timestamp": "2025-11-15T12:00:00Z",
  "likes": 0
}
```

**Error Responses:**
- `400` - Missing required fields or validation errors
- `403` - Poll has expired, comments are disabled
- `404` - Poll not found
- `405` - Method not allowed

## 📊 Poll Categories

The app includes polls from various categories:

- **Sports**: IPL, FIFA World Cup, NBA, Champions League, T20 World Cup
- **Finance**: Stock markets, Gold prices, Tesla, Crude oil, Nifty 50
- **Cryptocurrency**: Bitcoin, Ethereum predictions
- **Technology**: AI, SpaceX, Apple products, foldable phones
- **Politics**: US Presidential Elections
- **Entertainment**: Movies, streaming platforms, box office
- **Health**: COVID-19 and health-related predictions
- **Real Estate**: Housing market trends

## 🎨 Key Features in Detail

### Authentication System

**Login Flow:**
1. User enters full name and 10-digit mobile number
2. System validates inputs and sends 4-digit OTP
3. User receives OTP (via SMS in production, shown on screen in development)
4. User enters OTP within 5 minutes
5. System verifies OTP (max 3 attempts)
6. JWT token is generated and returned
7. User is logged in and redirected to homepage
8. Token stored in localStorage and AuthContext

**JWT Token Management:**
- Tokens generated using jsonwebtoken library
- Token payload includes: userId, name, mobileNumber
- Tokens expire in 7 days
- Tokens can be attached to API calls using bearer authentication
- Utility function provided for authenticated API requests

**Security Features:**
- OTP expires after 5 minutes
- Maximum 3 verification attempts per OTP
- Rate limiting on OTP generation (30 seconds between resends)
- JWT-based session management
- Mobile number validation (10 digits, starts with 6-9)
- Name validation (minimum 2 characters)
- Protected routes (redirect to login if not authenticated)

**User Experience:**
- Auto-focus on input fields
- Auto-advance between OTP digits
- Paste support for OTP
- Resend OTP with countdown timer
- Clear error messages
- Loading states on all actions
- Back button to change details
- Persistent login across page refreshes

**Account Page:**
- View profile (name, mobile number, join date)
- My Points (Coming Soon)
- My Contests (Coming Soon)
- Browse Polls link
- Logout button with confirmation

**Header Integration:**
- Shows "Login" button when not authenticated
- Shows "My Account" when authenticated
- Loading skeleton during auth state check
- Mobile-responsive with icons

**Mobile Responsive:**
- Large touch-friendly OTP inputs
- Optimized keyboard for number entry
- Smooth animations and transitions
- Avatar with user initials

### Expired Poll Handling
- **Automatic Detection**: Polls are automatically marked as expired based on their expiry date
- **Vote Button Disabled**: "Cast Your Vote" button is replaced with an expiry notice
- **Comments Disabled**: Comment form is hidden and replaced with an informative message
- **API Protection**: Backend rejects comment submissions on expired polls (403 error)
- **View-Only Mode**: Users can still view poll results and existing comments
- **Test Poll**: Poll ID "0" is an expired test poll for demonstration

### Interactive Poll Cards
- **Smart Sorting**: Active polls always appear before expired polls
- **Visual Distinction**: Expired polls have reduced opacity (75%) and grayed background
- **Expiry Badge Colors**: 
  - Active polls: Gray badge with time remaining
  - Expired polls: Red badge with "Expired" text
- Hover effects and smooth animations
- Visual progress bars for each option
- Vote counts with formatted numbers (K, M)
- Clickable cards that navigate to detail pages

### Poll Detail Page
- Comprehensive poll information
- Large, readable vote percentages
- Detailed statistics (total votes, comment count)
- Full comments section with discussions
- Time-based relative timestamps (e.g., "2h ago", "Just now")

### Comments System
- Display all comments for a poll
- Author avatars with initials
- Like counts for each comment
- Add new comments with validation
- Character count limits (3-500 characters)
- Real-time feedback on submission

### Site-Wide Components

**Header:**
- Sticky positioning stays visible while scrolling
- PollTrade branding links to homepage
- Login/My Account button on the right
- Mobile-responsive with icon-only view on small screens
- Gradient text logo with hover effects

**Footer:**
- Four-column layout with organized links
- Legal section (Terms, Privacy, Cookies, Disclaimer)
- Company section (About, Contact, Careers, Blog)
- Support section (Help Center, FAQ, Community, Report)
- Social media links (Twitter, Facebook, LinkedIn)
- Copyright information with current year
- Fully responsive grid layout

### Navigation
- Easy back button to return to homepage
- Category filtering on homepage
- Direct links to individual polls
- Smooth transitions between pages
- Consistent header and footer across all pages

## 🚢 Deployment

### Deploy to Vercel (Recommended)

Vercel is the platform created by the makers of Next.js and provides seamless deployment:

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts to deploy your application

Alternatively, you can:
- Push your code to GitHub/GitLab/Bitbucket
- Import your repository on [vercel.com](https://vercel.com)
- Vercel will automatically detect Next.js and configure the build settings

### Deploy to Netlify

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Build the application:
```bash
npm run build
```

3. Deploy:
```bash
netlify deploy --prod
```

### Deploy to Other Platforms

For deployment to other platforms (AWS, Google Cloud, Azure, etc.):

1. Build the application:
```bash
npm run build
```

2. The built files will be in the `.next` directory
3. Follow your hosting platform's guide for deploying Node.js applications
4. Make sure to run `npm start` to start the production server

## 🔧 Environment Variables

This application doesn't require any environment variables to run. However, if you need to add any in the future:

1. Create a `.env.local` file in the root directory
2. Add your variables:
```
NEXT_PUBLIC_API_URL=your_value_here
```
3. Access them in your code using `process.env.NEXT_PUBLIC_API_URL`

## 📝 Technologies Used

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: CSS Modules (No external CSS libraries)
- **Runtime**: Node.js
- **Package Manager**: npm

## 🎨 Customization

### Adding New Polls

Edit both API files to add new polls:
1. `pages/api/polls.ts` - Main polls list
2. `pages/api/polls/[id].ts` - Individual poll fetching

Add new poll objects:

```typescript
{
  id: '21',
  question: 'Your question here?',
  options: [
    { id: '21a', text: 'Option 1', votePercentage: 60 },
    { id: '21b', text: 'Option 2', votePercentage: 40 }
  ],
  totalVotes: 50000,
  category: 'Your Category',
  expiresAt: '2025-12-31T23:59:00Z'
}
```

### Adding Mock Comments

Edit `pages/api/polls/[id]/comments.ts` to add initial comments:

```typescript
{
  id: '11',
  pollId: '1', // Poll ID
  author: 'Your Name',
  content: 'Your comment here',
  timestamp: '2025-11-15T12:00:00Z',
  likes: 10
}
```

### Changing Styles

All styles are in CSS Modules:
- `styles/Home.module.css` - Homepage styles
- `styles/PollDetail.module.css` - Poll detail page styles
- `styles/globals.css` - Global styles

Customize:
- Colors and gradients
- Card layouts and spacing
- Progress bar styles
- Typography
- Animations and transitions

## 🐛 Troubleshooting

### Port Already in Use

If port 3000 is already in use, specify a different port:

```bash
npm run dev -- -p 3001
```

### TypeScript Errors

If you encounter TypeScript errors:

```bash
rm -rf .next
npm run dev
```

### Module Not Found

Clear the cache and reinstall dependencies:

```bash
rm -rf node_modules .next
npm install
```

### MongoDB Connection Issues

If you see MongoDB connection errors:

**For local MongoDB:**
```bash
# Check if MongoDB is running
mongosh

# If not, start MongoDB
brew services start mongodb-community  # macOS
sudo systemctl start mongod             # Linux
```

**For MongoDB Atlas:**
- Verify your connection string in `.env.local`
- Check if your IP is whitelisted in Atlas
- Ensure username/password are correct

### No Polls Appearing

Make sure you've seeded the database:

```bash
curl -X POST http://localhost:3000/api/seed-polls
```

### Cannot Vote or Comment

If you can't vote or add comments, make sure:
1. MongoDB is running
2. **You're logged in** - Both voting and commenting require authentication
3. The poll is not expired
4. Your comment is between 3-1000 characters (for comments)

**Note:** 
- You must be logged in to vote or comment on polls
- If not logged in, you'll see "Login to Vote" and "Login to Comment" buttons
- The system automatically uses your name from your profile for comments

## 💾 Database Schema

### Collections

#### OTP Collection (`otps`)

```typescript
{
  mobileNumber: string;     // Indexed
  otp: string;
  attempts: number;
  expiresAt: Date;          // TTL index (auto-delete)
  createdAt: Date;
}
```

#### User Collection (`users`)

```typescript
{
  name: string;
  mobileNumber: string;     // Unique, indexed
  createdAt: Date;          // Auto-generated
  updatedAt: Date;          // Auto-generated
}
```

#### Poll Collection (`polls`)

```typescript
{
  question: string;
  options: [
    {
      _id: ObjectId;        // Auto-generated, indexed
      text: string;
      voteCount: number;
    }
  ];
  totalVotes: number;
  category: string;         // Indexed
  expiresAt: Date;          // Indexed
  createdAt: Date;          // Auto-generated
  updatedAt: Date;          // Auto-generated
}
```

#### Comment Collection (`comments`)

```typescript
{
  pollId: ObjectId;         // Ref to Poll, indexed
  userId: ObjectId;         // Ref to User, indexed
  content: string;          // Max 1000 chars
  likeCount: number;
  createdAt: Date;          // Auto-generated
  updatedAt: Date;          // Auto-generated
}
```

#### PollResponse Collection (`pollresponses`)

```typescript
{
  pollId: ObjectId;         // Ref to Poll, indexed
  userId: ObjectId;         // Ref to User, indexed
  optionId: ObjectId;       // Ref to option._id in Poll, indexed
  createdAt: Date;          // Auto-generated
  updatedAt: Date;          // Auto-generated
}
```

**Database Features:**
- TTL (Time-To-Live) index on OTP expiry - MongoDB automatically deletes expired OTPs
- Compound indexes for efficient querying
- **Poll options use MongoDB ObjectIds (`_id`)** for better indexing and referencing
- Unique constraint on (pollId, userId) in PollResponse - one vote per user per poll
- Automatic timestamps on all models
- Connection pooling with Mongoose
- Population (joins) for user and poll references in comments
- Indexed optionId in PollResponse for fast vote counting and aggregation

## 🎯 Future Enhancements

Potential features to add:
- **Vote History**: Display user's voting history on profile page
- **Change Vote**: Allow users to change their vote before poll expires
- **Comment Likes**: Allow users to like/unlike comments
- **Poll Creation**: Allow users to create their own polls
- **Real-time Updates**: WebSocket integration for live updates
- **Trading Mechanism**: Buy/sell predictions like a prediction market
- **Leaderboards**: Track top predictors
- **Social Features**: Follow users, share polls
- **Analytics Dashboard**: Poll statistics and trends
- **Email Notifications**: Notify users of poll results
- **Rich Text Comments**: Markdown support in comments
- **Comment Replies**: Threaded discussions
- **Moderation Tools**: Report and moderate content

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📧 Support

If you have any questions or need help, please open an issue in the repository.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: CSS Modules (no Tailwind)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Backend**: Next.js API Routes
- **State Management**: React Context API

---

Built with ❤️ using Next.js, TypeScript, MongoDB, and CSS Modules

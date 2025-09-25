
interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface Session {
  id: string;
  topic: string;
  date: string;
  collaborators: string[];
  summaries: Summary[];
  document: string;
  messages: Message[];
  comments: Comment[];
}

interface Summary {
  id: string;
  content: string;
  source: string;
  timestamp: string;
}


interface Message {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
  type: "user" | "bot";
}


interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
  resolved: boolean;
  summaryId: string;
}

interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar: string;
}



export const mockUsers: User[] = [
  {
    id: "1",
    name: "Alex Chen",
    email: "alex@example.com",
    avatar: "/professional-avatar.png",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    avatar: "/professional-avatar.png",
  },
  {
    id: "3",
    name: "Mike Rodriguez",
    email: "mike@example.com",
    avatar: "/professional-avatar.png",
  },
]

export const mockSummaries: Summary[] = [
  {
    id: "1",
    content:
      "Renewable energy adoption has increased by 45% globally in 2024, with solar and wind leading the transition.",
    source: "https://energy-report.org/2024",
    timestamp: "2024-09-23T10:30:00Z",
  },
  {
    id: "2",
    content:
      "Battery storage technology costs have decreased by 30% year-over-year, making grid-scale storage more viable.",
    source: "https://tech-energy.com/storage-trends",
    timestamp: "2024-09-23T10:35:00Z",
  },
  {
    id: "3",
    content:
      "Government incentives for renewable energy projects have expanded to include small-scale residential installations.",
    source: "https://policy-tracker.gov/renewable-incentives",
    timestamp: "2024-09-23T10:40:00Z",
  },
]

export const mockMessages: Message[] = [
  {
    id: "1",
    userId: "1",
    userName: "Alex Chen",
    content: "Great insights on the renewable energy trends!",
    timestamp: "2024-09-23T10:45:00Z",
    type: "user",
  },
  {
    id: "2",
    userId: "bot",
    userName: "AI Assistant",
    content:
      "Based on the data, would you like me to analyze the correlation between government incentives and adoption rates?",
    timestamp: "2024-09-23T10:46:00Z",
    type: "bot",
  },
]

export const mockComments: Comment[] = [
  {
    id: "1",
    userId: "2",
    userName: "Sarah Johnson",
    content: "This statistic seems outdated. Can we verify the source?",
    timestamp: "2024-09-23T10:50:00Z",
    resolved: false,
    summaryId: "1",
  },
]

export const mockSessions: Session[] = [
  {
    id: "1",
    topic: "Renewable Energy Trends 2024",
    date: "2024-09-23",
    collaborators: ["alex@example.com", "sarah@example.com"],
    summaries: mockSummaries,
    document: "This research session focuses on analyzing the latest trends in renewable energy adoption worldwide...",
    messages: mockMessages,
    comments: mockComments,
  },
  {
    id: "2",
    topic: "AI in Healthcare Applications",
    date: "2024-09-22",
    collaborators: ["mike@example.com"],
    summaries: [],
    document: "Exploring the current applications of artificial intelligence in healthcare...",
    messages: [],
    comments: [],
  },
  {
    id: "3",
    topic: "Climate Change Policy Analysis",
    date: "2024-09-21",
    collaborators: ["alex@example.com", "sarah@example.com", "mike@example.com"],
    summaries: [],
    document: "Comprehensive analysis of recent climate change policies...",
    messages: [],
    comments: [],
  },
]

export const mockCollaborators: Collaborator[] = [
  {
    id: "1",
    name: "Alex Chen",
    email: "alex@example.com",
    role: "editor",
    status: "active",
    avatar: "/professional-avatar.png",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    role: "editor",
    status: "active",
    avatar: "/professional-avatar.png",
  },
  {
    id: "3",
    name: "Mike Rodriguez",
    email: "mike@example.com",
    role: "viewer",
    status: "offline",
    avatar: "/professional-avatar.png",
  },
]

// Mock API functions
export const mockApiCall = async (endpoint: string, data?: any): Promise<any> => {
  console.log(`[Mock API] ${endpoint}`, data)

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  switch (endpoint) {
    case "auth/login":
      return { success: true, user: mockUsers[0] }
    case "auth/signup":
      return { success: true, user: { ...data, id: Date.now().toString() } }
    case "sessions/create":
      return { success: true, sessionId: Date.now().toString() }
    case "ai/summarize":
      return {
        success: true,
        summary: `AI-generated summary for: ${data.topic}. This is a mock response with key insights and trends.`,
      }
    case "ai/chat":
      return {
        success: true,
        response: `Based on your query "${data.message}", here are some relevant insights and suggestions for your research.`,
      }
    default:
      return { success: true, data: "Mock response" }
  }
}

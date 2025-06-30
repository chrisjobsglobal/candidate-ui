import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  LucideAngularModule,
  Search,
  Send,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  Plus,
  Users,
  Edit3
} from 'lucide-angular';

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  type: 'text' | 'image' | 'file';
}

interface Conversation {
  id: string;
  participantName: string;
  participantRole: string;
  participantCompany: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  avatar: string;
  messages: Message[];
}

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="max-w-7xl mx-auto h-[calc(100vh-200px)]">
      <div class="bg-white rounded-xl shadow-elegant overflow-hidden h-full flex">
        <!-- Conversations List -->
        <div class="w-1/3 border-r border-background-subtle flex flex-col">
          <!-- Header -->
          <div class="p-6 border-b border-background-subtle">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-semibold text-text-primary">Messages</h2>
              <button class="p-2 text-text-secondary hover:text-text-primary transition-colors">
                <lucide-angular [img]="Edit3Icon" size="20"></lucide-angular>
              </button>
            </div>
            
            <!-- Search -->
            <div class="relative">
              <lucide-angular 
                [img]="SearchIcon" 
                size="20" 
                class="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
              ></lucide-angular>
              <input 
                type="text" 
                placeholder="Search conversations..."
                [(ngModel)]="searchQuery"
                class="w-full pl-10 pr-4 py-2 border border-background-subtle rounded-lg focus:ring-2 focus:ring-primary-900 focus:border-transparent outline-none transition-all text-sm"
              >
            </div>
          </div>

          <!-- Conversations -->
          <div class="flex-1 overflow-y-auto">
            <div class="p-2">
              <div 
                *ngFor="let conversation of filteredConversations()" 
                class="flex items-center space-x-3 p-4 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                [class.bg-primary-50]="selectedConversation()?.id === conversation.id"
                (click)="selectConversation(conversation)"
              >
                <!-- Avatar -->
                <div class="relative flex-shrink-0">
                  <div class="w-12 h-12 bg-gradient-to-r from-gradient-start to-gradient-end rounded-full flex items-center justify-center">
                    <span class="text-white font-semibold">{{ conversation.participantName.charAt(0) }}</span>
                  </div>
                  <div 
                    *ngIf="conversation.isOnline" 
                    class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"
                  ></div>
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between mb-1">
                    <h3 class="font-semibold text-text-primary truncate">{{ conversation.participantName }}</h3>
                    <span class="text-xs text-text-secondary">{{ conversation.lastMessageTime }}</span>
                  </div>
                  <p class="text-sm text-text-secondary truncate mb-1">{{ conversation.participantRole }} at {{ conversation.participantCompany }}</p>
                  <p class="text-sm text-text-secondary truncate">{{ conversation.lastMessage }}</p>
                </div>

                <!-- Unread Badge -->
                <div 
                  *ngIf="conversation.unreadCount > 0" 
                  class="w-5 h-5 bg-primary-900 text-white text-xs rounded-full flex items-center justify-center font-medium"
                >
                  {{ conversation.unreadCount }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Chat Area -->
        <div class="flex-1 flex flex-col" *ngIf="selectedConversation(); else noConversation">
          <!-- Chat Header -->
          <div class="p-6 border-b border-background-subtle">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div class="relative">
                  <div class="w-10 h-10 bg-gradient-to-r from-gradient-start to-gradient-end rounded-full flex items-center justify-center">
                    <span class="text-white font-semibold">{{ selectedConversation()!.participantName.charAt(0) }}</span>
                  </div>
                  <div 
                    *ngIf="selectedConversation()!.isOnline" 
                    class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"
                  ></div>
                </div>
                <div>
                  <h3 class="font-semibold text-text-primary">{{ selectedConversation()!.participantName }}</h3>
                  <p class="text-sm text-text-secondary">{{ selectedConversation()!.participantRole }} at {{ selectedConversation()!.participantCompany }}</p>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <button class="p-2 text-text-secondary hover:text-text-primary transition-colors">
                  <lucide-angular [img]="PhoneIcon" size="20"></lucide-angular>
                </button>
                <button class="p-2 text-text-secondary hover:text-text-primary transition-colors">
                  <lucide-angular [img]="VideoIcon" size="20"></lucide-angular>
                </button>
                <button class="p-2 text-text-secondary hover:text-text-primary transition-colors">
                  <lucide-angular [img]="MoreVerticalIcon" size="20"></lucide-angular>
                </button>
              </div>
            </div>
          </div>

          <!-- Messages -->
          <div class="flex-1 overflow-y-auto p-6 space-y-4">
            <div *ngFor="let message of selectedConversation()!.messages" class="flex" 
                 [class.justify-end]="message.senderId === currentUserId()">
              <div class="max-w-xs lg:max-w-md">
                <div 
                  class="px-4 py-2 rounded-2xl"
                  [class.bg-primary-900]="message.senderId === currentUserId()"
                  [class.text-white]="message.senderId === currentUserId()"
                  [class.bg-background-subtle]="message.senderId !== currentUserId()"
                  [class.text-text-primary]="message.senderId !== currentUserId()"
                >
                  <p class="text-sm">{{ message.content }}</p>
                </div>
                <div class="flex items-center mt-1 space-x-1"
                     [class.justify-end]="message.senderId === currentUserId()">
                  <span class="text-xs text-text-secondary">{{ formatTime(message.timestamp) }}</span>
                  <div *ngIf="message.senderId === currentUserId()" class="flex items-center">
                    <lucide-angular 
                      [img]="message.isRead ? CheckCheckIcon : CheckIcon" 
                      size="12" 
                      [class.text-primary-900]="message.isRead"
                      [class.text-text-secondary]="!message.isRead"
                    ></lucide-angular>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Message Input -->
          <div class="p-6 border-t border-background-subtle">
            <div class="flex items-center space-x-4">
              <button class="p-2 text-text-secondary hover:text-text-primary transition-colors">
                <lucide-angular [img]="PaperclipIcon" size="20"></lucide-angular>
              </button>
              <div class="flex-1 relative">
                <input 
                  type="text" 
                  placeholder="Type your message..."
                  [(ngModel)]="newMessage"
                  (keyup.enter)="sendMessage()"
                  class="w-full px-4 py-3 border border-background-subtle rounded-full focus:ring-2 focus:ring-primary-900 focus:border-transparent outline-none transition-all"
                >
                <button class="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-text-secondary hover:text-text-primary transition-colors">
                  <lucide-angular [img]="SmileIcon" size="18"></lucide-angular>
                </button>
              </div>
              <button 
                class="p-3 bg-primary-900 text-white rounded-full hover:bg-primary-800 transition-colors"
                (click)="sendMessage()"
              >
                <lucide-angular [img]="SendIcon" size="18"></lucide-angular>
              </button>
            </div>
          </div>
        </div>

        <!-- No Conversation Selected -->
        <ng-template #noConversation>
          <div class="flex-1 flex items-center justify-center bg-gray-50">
            <div class="text-center">
              <div class="w-16 h-16 bg-background-subtle rounded-full flex items-center justify-center mx-auto mb-4">
                <lucide-angular [img]="UsersIcon" size="24" class="text-text-secondary"></lucide-angular>
              </div>
              <h3 class="text-lg font-semibold text-text-primary mb-2">Select a conversation</h3>
              <p class="text-text-secondary">Choose from your existing conversations or start a new one</p>
              <button class="mt-4 px-6 py-2 bg-primary-900 text-white rounded-lg hover:bg-primary-800 transition-colors">
                Start New Conversation
              </button>
            </div>
          </div>
        </ng-template>
      </div>
    </div>
  `
})
export class MessagesComponent {
  readonly SearchIcon = Search;
  readonly SendIcon = Send;
  readonly PhoneIcon = Phone;
  readonly VideoIcon = Video;
  readonly MoreVerticalIcon = MoreVertical;
  readonly PaperclipIcon = Paperclip;
  readonly SmileIcon = Smile;
  readonly CheckIcon = Check;
  readonly CheckCheckIcon = CheckCheck;
  readonly PlusIcon = Plus;
  readonly UsersIcon = Users;
  readonly Edit3Icon = Edit3;

  searchQuery = signal('');
  newMessage = signal('');
  currentUserId = signal('current-user');
  selectedConversation = signal<Conversation | null>(null);

  conversations = signal<Conversation[]>([
    {
      id: '1',
      participantName: 'Sarah Johnson',
      participantRole: 'Senior Recruiter',
      participantCompany: 'Google',
      lastMessage: 'Thanks for your interest in the Senior Developer position...',
      lastMessageTime: '2m ago',
      unreadCount: 2,
      isOnline: true,
      avatar: '',
      messages: [
        {
          id: '1',
          senderId: 'sarah-johnson',
          content: 'Hi John! I saw your profile and I think you would be a great fit for our Senior Developer position.',
          timestamp: new Date(Date.now() - 3600000),
          isRead: true,
          type: 'text'
        },
        {
          id: '2',
          senderId: 'current-user',
          content: 'Thank you for reaching out! I\'m very interested in learning more about the position.',
          timestamp: new Date(Date.now() - 3300000),
          isRead: true,
          type: 'text'
        },
        {
          id: '3',
          senderId: 'sarah-johnson',
          content: 'Great! The role involves working with Angular and Node.js. Would you be available for a quick call this week?',
          timestamp: new Date(Date.now() - 1800000),
          isRead: false,
          type: 'text'
        },
        {
          id: '4',
          senderId: 'sarah-johnson',
          content: 'Thanks for your interest in the Senior Developer position. Let me know when you\'re available!',
          timestamp: new Date(Date.now() - 120000),
          isRead: false,
          type: 'text'
        }
      ]
    },
    {
      id: '2',
      participantName: 'Mike Chen',
      participantRole: 'Tech Lead',
      participantCompany: 'Microsoft',
      lastMessage: 'Looking forward to our interview tomorrow',
      lastMessageTime: '1h ago',
      unreadCount: 0,
      isOnline: false,
      avatar: '',
      messages: [
        {
          id: '1',
          senderId: 'mike-chen',
          content: 'Hi John, we received your application for the Full Stack position.',
          timestamp: new Date(Date.now() - 86400000),
          isRead: true,
          type: 'text'
        },
        {
          id: '2',
          senderId: 'current-user',
          content: 'Thank you! I\'m excited about the opportunity.',
          timestamp: new Date(Date.now() - 82800000),
          isRead: true,
          type: 'text'
        },
        {
          id: '3',
          senderId: 'mike-chen',
          content: 'Looking forward to our interview tomorrow at 2 PM.',
          timestamp: new Date(Date.now() - 3600000),
          isRead: true,
          type: 'text'
        }
      ]
    },
    {
      id: '3',
      participantName: 'Emma Davis',
      participantRole: 'Hiring Manager',
      participantCompany: 'StartupXYZ',
      lastMessage: 'Welcome to the team!',
      lastMessageTime: '2 days ago',
      unreadCount: 0,
      isOnline: true,
      avatar: '',
      messages: [
        {
          id: '1',
          senderId: 'emma-davis',
          content: 'Congratulations! We\'d like to offer you the position.',
          timestamp: new Date(Date.now() - 259200000),
          isRead: true,
          type: 'text'
        },
        {
          id: '2',
          senderId: 'current-user',
          content: 'Thank you so much! I\'m thrilled to accept.',
          timestamp: new Date(Date.now() - 255600000),
          isRead: true,
          type: 'text'
        },
        {
          id: '3',
          senderId: 'emma-davis',
          content: 'Welcome to the team! Looking forward to working with you.',
          timestamp: new Date(Date.now() - 172800000),
          isRead: true,
          type: 'text'
        }
      ]
    }
  ]);

  filteredConversations = signal<Conversation[]>([]);

  constructor() {
    this.filteredConversations.set(this.conversations());
  }

  selectConversation(conversation: Conversation) {
    this.selectedConversation.set(conversation);
    // Mark messages as read
    const updated = this.conversations().map(c => 
      c.id === conversation.id ? { ...c, unreadCount: 0 } : c
    );
    this.conversations.set(updated);
    this.filteredConversations.set(updated);
  }

  sendMessage() {
    const messageText = this.newMessage().trim();
    if (!messageText || !this.selectedConversation()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: this.currentUserId(),
      content: messageText,
      timestamp: new Date(),
      isRead: false,
      type: 'text'
    };

    const currentConv = this.selectedConversation()!;
    const updatedConv = {
      ...currentConv,
      messages: [...currentConv.messages, newMessage],
      lastMessage: messageText,
      lastMessageTime: 'now'
    };

    const updatedConversations = this.conversations().map(c => 
      c.id === currentConv.id ? updatedConv : c
    );

    this.conversations.set(updatedConversations);
    this.filteredConversations.set(updatedConversations);
    this.selectedConversation.set(updatedConv);
    this.newMessage.set('');
  }

  formatTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }
}

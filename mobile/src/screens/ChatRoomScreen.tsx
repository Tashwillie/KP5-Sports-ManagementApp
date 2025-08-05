import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { communicationService } from '../services/communicationService';
import { Message, ChatRoom, MessageType, MessageAttachment } from '@shared/types/communication';

interface ChatRoomScreenProps {
  route: {
    params: {
      chatRoomId: string;
      chatRoom: ChatRoom;
    };
  };
  navigation: any;
}

export default function ChatRoomScreen({ route, navigation }: ChatRoomScreenProps) {
  const { chatRoomId, chatRoom } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadMessages();
    const unsubscribe = communicationService.subscribeToChatRoom(
      chatRoomId,
      (newMessages) => {
        setMessages(newMessages);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [chatRoomId]);

  useEffect(() => {
    navigation.setOptions({
      title: chatRoom.name,
      headerRight: () => (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate('ChatSettings', { chatRoom })}
        >
          <Ionicons name="ellipsis-vertical" size={24} color="#007AFF" />
        </TouchableOpacity>
      ),
    });
  }, [chatRoom, navigation]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const messageList = await communicationService.getMessages(chatRoomId);
      setMessages(messageList);
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || sending) return;

    try {
      setSending(true);
      await communicationService.sendMessage(chatRoomId, inputText.trim());
      setInputText('');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleAttachment = () => {
    // Implementation for file attachment
    Alert.alert('Attachment', 'File attachment feature coming soon');
  };

  const handleReaction = async (messageId: string, reaction: string) => {
    try {
      await communicationService.addMessageReaction(chatRoomId, messageId, reaction);
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.senderId === 'currentUserId'; // Replace with actual user ID
    const isDeleted = item.isDeleted;

    return (
      <View style={[styles.messageContainer, isOwnMessage && styles.ownMessage]}>
        {!isOwnMessage && (
          <View style={styles.messageHeader}>
            <Text style={styles.senderName}>{item.senderName}</Text>
            <Text style={styles.messageTime}>
              {formatMessageTime(item.createdAt)}
            </Text>
          </View>
        )}

        <View style={[styles.messageBubble, isOwnMessage && styles.ownMessageBubble]}>
          {isDeleted ? (
            <Text style={styles.deletedMessage}>This message was deleted</Text>
          ) : (
            <>
              <Text style={[styles.messageText, isOwnMessage && styles.ownMessageText]}>
                {item.content}
              </Text>

              {item.attachments.length > 0 && (
                <View style={styles.attachmentsContainer}>
                  {item.attachments.map((attachment) => (
                    <View key={attachment.id} style={styles.attachment}>
                      {attachment.type === 'image' && (
                        <Image source={{ uri: attachment.url }} style={styles.attachmentImage} />
                      )}
                      {attachment.type === 'document' && (
                        <TouchableOpacity style={styles.documentAttachment}>
                          <Ionicons name="document" size={24} color="#007AFF" />
                          <Text style={styles.documentName}>{attachment.name}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>
              )}

              {item.isEdited && (
                <Text style={styles.editedIndicator}>edited</Text>
              )}
            </>
          )}
        </View>

        {!isDeleted && (
          <View style={styles.messageActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleReaction(item.id, '👍')}
            >
              <Text style={styles.reactionButton}>👍</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleReaction(item.id, '❤️')}
            >
              <Text style={styles.reactionButton}>❤️</Text>
            </TouchableOpacity>
            {isOwnMessage && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleEditMessage(item)}
              >
                <Ionicons name="create-outline" size={16} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  const handleEditMessage = (message: Message) => {
    setInputText(message.content);
    // Focus on input and scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const formatMessageTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
    return timestamp.toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        inverted
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptySubtitle}>
              Start the conversation by sending a message
            </Text>
          </View>
        }
      />

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachmentButton} onPress={handleAttachment}>
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          multiline
          maxLength={1000}
          onFocus={() => setIsTyping(true)}
          onBlur={() => setIsTyping(false)}
        />

        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!inputText.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerButton: {
    padding: 8,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  ownMessage: {
    alignSelf: 'flex-end',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginRight: 8,
  },
  messageTime: {
    fontSize: 10,
    color: '#999',
  },
  messageBubble: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  ownMessageBubble: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  messageText: {
    fontSize: 16,
    color: '#1a1a1a',
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#fff',
  },
  deletedMessage: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  attachmentsContainer: {
    marginTop: 8,
  },
  attachment: {
    marginTop: 4,
  },
  attachmentImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },
  documentAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 8,
  },
  documentName: {
    marginLeft: 8,
    fontSize: 14,
    color: '#007AFF',
  },
  editedIndicator: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  messageActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 8,
  },
  actionButton: {
    marginRight: 12,
    padding: 4,
  },
  reactionButton: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
  },
  attachmentButton: {
    padding: 8,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
}); 
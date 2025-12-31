'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FiX, FiSend, FiMessageCircle } from 'react-icons/fi';

interface Message {
  id: string;
  type: 'bot' | 'user';
  text: string;
  casts?: any[];
  timestamp: Date;
}

interface ConversationState {
  step: number;
  preferences: {
    age?: string;
    bodyType?: string;
    features?: string[];
    mood?: string;
  };
}

export default function AINavigator() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversation, setConversation] = useState<ConversationState>({
    step: 0,
    preferences: {},
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // 初回メッセージ
      addBotMessage(
        'こんにちは！キャスト選びのお手伝いをさせていただきます。😊\n\nご希望の条件を教えていただけますか？'
      );
      setTimeout(() => {
        askNextQuestion();
      }, 1000);
    }
  }, [isOpen]);

  const addBotMessage = (text: string, casts?: any[]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'bot',
      text,
      casts,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const addUserMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const askNextQuestion = () => {
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      
      if (conversation.step === 0) {
        addBotMessage(
          '年齢層はどれくらいがお好みですか？\n\n1. 20代前半（18-24歳）\n2. 20代後半（25-29歳）\n3. 30代（30-39歳）\n4. 40代以上\n5. こだわらない'
        );
        setConversation((prev) => ({ ...prev, step: 1 }));
      } else if (conversation.step === 1) {
        addBotMessage(
          'スタイルのご希望はありますか？\n\n1. スレンダー（細身）\n2. グラマラス（豊満）\n3. 普通\n4. こだわらない'
        );
        setConversation((prev) => ({ ...prev, step: 2 }));
      } else if (conversation.step === 2) {
        addBotMessage(
          '特徴やオプションのご希望はありますか？（複数選択可）\n\n1. 新人\n2. 3P可能\n3. 自宅訪問OK\n4. お泊まりOK\n5. 即尺OK\n6. こだわらない'
        );
        setConversation((prev) => ({ ...prev, step: 3 }));
      } else if (conversation.step === 3) {
        // 最終ステップ：キャスト検索と提案
        searchAndRecommendCasts();
      }
    }, 500);
  };

  const searchAndRecommendCasts = async () => {
    setIsTyping(true);
    
    try {
      // APIからキャストを取得
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/casts?limit=5`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const casts = data.casts || [];
        
        setIsTyping(false);
        
        if (casts.length > 0) {
          addBotMessage(
            `ご希望に合いそうなキャストさんを${casts.length}名ご紹介します！✨`,
            casts
          );
          
          setTimeout(() => {
            addBotMessage(
              '他にもたくさんのキャストさんが在籍しております。\n\nもう一度条件を変えて検索しますか？\n\n「もう一度」と入力すると最初からやり直せます。'
            );
          }, 1000);
        } else {
          addBotMessage(
            '申し訳ございません。条件に合うキャストが見つかりませんでした。\n\n条件を変えて再度お試しください。'
          );
        }
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.error('キャスト検索エラー:', error);
      setIsTyping(false);
      addBotMessage(
        '申し訳ございません。エラーが発生しました。\n\nもう一度お試しください。'
      );
    }
    
    // 会話をリセット
    setConversation({ step: 0, preferences: {} });
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userInput = inputValue.trim();
    addUserMessage(userInput);
    setInputValue('');

    // 「もう一度」で会話をリセット
    if (userInput.includes('もう一度') || userInput.includes('最初')) {
      setConversation({ step: 0, preferences: {} });
      setMessages([]);
      addBotMessage(
        'かしこまりました。最初からやり直しましょう！😊'
      );
      setTimeout(() => {
        askNextQuestion();
      }, 1000);
      return;
    }

    // ユーザーの回答を処理
    processUserResponse(userInput);
  };

  const processUserResponse = (input: string) => {
    const step = conversation.step;
    
    if (step === 1) {
      // 年齢層の回答
      let age = '';
      if (input.includes('1') || input.includes('20代前半')) age = '18-24';
      else if (input.includes('2') || input.includes('20代後半')) age = '25-29';
      else if (input.includes('3') || input.includes('30代')) age = '30-39';
      else if (input.includes('4') || input.includes('40代')) age = '40+';
      
      setConversation((prev) => ({
        ...prev,
        preferences: { ...prev.preferences, age },
      }));
      
      setTimeout(() => askNextQuestion(), 500);
    } else if (step === 2) {
      // スタイルの回答
      let bodyType = '';
      if (input.includes('1') || input.includes('スレンダー')) bodyType = 'slim';
      else if (input.includes('2') || input.includes('グラマラス')) bodyType = 'curvy';
      else if (input.includes('3') || input.includes('普通')) bodyType = 'average';
      
      setConversation((prev) => ({
        ...prev,
        preferences: { ...prev.preferences, bodyType },
      }));
      
      setTimeout(() => askNextQuestion(), 500);
    } else if (step === 3) {
      // 特徴の回答（複数選択可）
      const features: string[] = [];
      if (input.includes('1') || input.includes('新人')) features.push('new');
      if (input.includes('2') || input.includes('3P')) features.push('threesome');
      if (input.includes('3') || input.includes('自宅')) features.push('home_visit');
      if (input.includes('4') || input.includes('お泊まり')) features.push('overnight');
      if (input.includes('5') || input.includes('即尺')) features.push('immediate');
      
      setConversation((prev) => ({
        ...prev,
        preferences: { ...prev.preferences, features },
      }));
      
      setTimeout(() => askNextQuestion(), 500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* 浮遊ボタン */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 animate-bounce"
        >
          <FiMessageCircle className="text-3xl" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            AI
          </span>
        </button>
      )}

      {/* チャットウィンドウ */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* ヘッダー */}
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FiMessageCircle className="text-2xl" />
              <div>
                <h3 className="font-bold text-lg">AIキャストナビゲーター</h3>
                <p className="text-xs opacity-90">あなたにぴったりのキャストを探します</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <FiX className="text-xl" />
            </button>
          </div>

          {/* メッセージエリア */}
          <div className="h-96 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.type === 'user'
                      ? 'bg-pink-500 text-white'
                      : 'bg-white text-gray-800 shadow-md'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  
                  {/* キャスト提案カード */}
                  {message.casts && message.casts.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.casts.map((cast) => (
                        <Link
                          key={cast.id}
                          href={`/casts/${cast.id}`}
                          className="block bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-3 hover:shadow-lg transition-shadow"
                        >
                          <div className="flex items-center space-x-3">
                            <img
                              src={
                                cast.primary_image ||
                                `https://placehold.co/100x130/FFB6C1/FFFFFF?text=${encodeURIComponent(
                                  cast.name
                                )}`
                              }
                              alt={cast.name}
                              className="w-16 h-20 object-cover rounded"
                            />
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-800">{cast.name}</h4>
                              <p className="text-xs text-gray-600">
                                {cast.age}歳 / T{cast.height}cm
                              </p>
                              <p className="text-xs text-pink-600 font-medium mt-1">
                                詳細を見る →
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString('ja-JP', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* タイピングインジケーター */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 shadow-md rounded-2xl px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 入力エリア */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="メッセージを入力..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="bg-pink-500 text-white p-2 rounded-full hover:bg-pink-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <FiSend className="text-xl" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

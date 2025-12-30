'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Clock, User, MapPin, CreditCard, Phone, AlertCircle, CheckCircle } from 'lucide-react'
import api from '@/lib/api'

interface Cast {
  id: number
  name: string
  age: number
  height: number
  bust: number
  waist: number
  hip: number
  cup_size: string
  main_image: string
}

export default function ReservationForm() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [casts, setCasts] = useState<Cast[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    cast_id: '',
    date: '',
    time: '',
    duration: '60',
    location: '',
    options: [] as string[],
    notes: '',
    phone: '',
  })

  useEffect(() => {
    // ログインチェック
    const userStr = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    
    if (!userStr || !token) {
      router.push('/login')
      return
    }
    
    setUser(JSON.parse(userStr))

    // キャスト一覧取得
    fetchCasts()
  }, [])

  const fetchCasts = async () => {
    try {
      const response = await api.get('/casts')
      if (response.data.success) {
        setCasts(response.data.data)
      }
    } catch (err) {
      console.error('Failed to fetch casts:', err)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleOptionChange = (option: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.includes(option)
        ? prev.options.filter(o => o !== option)
        : [...prev.options, option]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // バリデーション
      if (!formData.cast_id) {
        throw new Error('キャストを選択してください')
      }
      if (!formData.date) {
        throw new Error('日付を選択してください')
      }
      if (!formData.time) {
        throw new Error('時間を選択してください')
      }
      if (!formData.phone) {
        throw new Error('電話番号を入力してください')
      }

      // 予約リクエスト
      const reservationData = {
        cast_id: parseInt(formData.cast_id),
        date: formData.date,
        start_time: formData.time,
        duration: parseInt(formData.duration),
        location: formData.location || '店舗',
        options: formData.options.join(','),
        notes: formData.notes,
        phone: formData.phone,
      }

      const response = await api.post('/reservations', reservationData)
      
      if (response.data.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/mypage')
        }, 2000)
      } else {
        throw new Error(response.data.message || '予約に失敗しました')
      }
    } catch (err: any) {
      setError(err.message || '予約に失敗しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  // 今日の日付を取得（最小値として設定）
  const today = new Date().toISOString().split('T')[0]

  // 料金計算
  const calculatePrice = () => {
    const basePrices: { [key: string]: number } = {
      '60': 15000,
      '90': 22000,
      '120': 28000,
      '150': 35000,
      '180': 42000,
    }
    
    const optionPrices: { [key: string]: number } = {
      '3P': 10000,
      'コスプレ': 3000,
      '出張': 3000,
      '甘えプレイ': 5000,
    }

    let total = basePrices[formData.duration] || 0
    formData.options.forEach(option => {
      total += optionPrices[option] || 0
    })

    return total.toLocaleString()
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full text-center">
          <div className="mb-6">
            <CheckCircle className="mx-auto text-green-500" size={64} />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">予約完了</h2>
          <p className="text-gray-600 mb-8">
            ご予約ありがとうございます。<br />
            確認のお電話を差し上げますので、<br />
            しばらくお待ちください。
          </p>
          <Link
            href="/mypage"
            className="inline-block bg-gradient-to-r from-pink-600 to-pink-500 text-white px-8 py-3 rounded-full font-bold hover:shadow-lg transition-shadow"
          >
            マイページへ
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-pink-500 text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">ご予約フォーム</h1>
          <p className="text-pink-100 text-lg">お気軽にご予約ください</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8 flex items-center">
            <AlertCircle className="mr-3 flex-shrink-0" size={24} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* キャスト選択 */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <User className="mr-3 text-pink-600" size={28} />
              キャスト選択
            </h2>
            
            <select
              name="cast_id"
              value={formData.cast_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent text-lg"
            >
              <option value="">キャストを選択してください</option>
              {casts.map(cast => (
                <option key={cast.id} value={cast.id}>
                  {cast.name} ({cast.age}歳 / T{cast.height}cm / {cast.cup_size}カップ)
                </option>
              ))}
            </select>

            <Link
              href="/casts"
              className="inline-block mt-4 text-pink-600 hover:text-pink-700 font-semibold"
            >
              キャスト一覧から探す →
            </Link>
          </div>

          {/* 日時選択 */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Calendar className="mr-3 text-pink-600" size={28} />
              日時選択
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  ご希望日
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={today}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  ご希望時間
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-gray-700 font-semibold mb-2">
                コース時間
              </label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent text-lg"
              >
                <option value="60">60分 - ¥15,000</option>
                <option value="90">90分 - ¥22,000</option>
                <option value="120">120分 - ¥28,000</option>
                <option value="150">150分 - ¥35,000</option>
                <option value="180">180分 - ¥42,000</option>
              </select>
            </div>
          </div>

          {/* 場所 */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <MapPin className="mr-3 text-pink-600" size={28} />
              ご利用場所
            </h2>
            
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="例: ホテル○○、自宅（西船橋駅から徒歩5分）"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
            <p className="text-gray-500 text-sm mt-2">
              ※出張の場合は具体的な場所をご記入ください
            </p>
          </div>

          {/* オプション */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <CreditCard className="mr-3 text-pink-600" size={28} />
              オプション
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { value: '3P', label: '3Pプレイ', price: '+¥10,000' },
                { value: 'コスプレ', label: 'コスプレ', price: '+¥3,000' },
                { value: '出張', label: '出張', price: '+¥3,000' },
                { value: '甘えプレイ', label: '甘え・Mプレイ', price: '+¥5,000' },
              ].map(option => (
                <label
                  key={option.value}
                  className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.options.includes(option.value)
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 hover:border-pink-300'
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.options.includes(option.value)}
                      onChange={() => handleOptionChange(option.value)}
                      className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
                    />
                    <span className="ml-3 font-semibold text-gray-800">{option.label}</span>
                  </div>
                  <span className="text-pink-600 font-bold">{option.price}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 連絡先 */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Phone className="mr-3 text-pink-600" size={28} />
              連絡先
            </h2>
            
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="090-1234-5678"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
            <p className="text-gray-500 text-sm mt-2">
              ※確認のお電話を差し上げます
            </p>
          </div>

          {/* 備考 */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              ご要望・備考
            </h2>
            
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={5}
              placeholder="その他ご要望があればご記入ください"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
            />
          </div>

          {/* 料金表示 */}
          <div className="bg-gradient-to-r from-pink-600 to-pink-500 rounded-2xl shadow-xl p-8 text-white">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold">合計金額</span>
              <span className="text-4xl font-bold">¥{calculatePrice()}</span>
            </div>
            <p className="text-pink-100 text-sm mt-4">
              ※料金は税込価格です。お支払いは現金・クレジットカード・電子マネーがご利用いただけます。
            </p>
          </div>

          {/* 送信ボタン */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-600 to-pink-500 text-white py-5 rounded-full text-xl font-bold hover:shadow-2xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? '予約中...' : '予約を確定する'}
          </button>

          <p className="text-center text-gray-600 text-sm">
            予約確定後、確認のお電話を差し上げます。<br />
            キャンセルは前日までにお願いいたします。
          </p>
        </form>
      </div>
    </div>
  )
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiSave, FiArrowLeft, FiUpload } from 'react-icons/fi';
import api from '@/lib/api';

export default function NewCastPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    height: '',
    bust: '',
    waist: '',
    hip: '',
    cup_size: '',
    blood_type: '',
    cast_comment: '',
    manager_comment: '',
    profile_text: '',
    is_new: true,
    is_available: true,
    smoking_ok: false,
    tattoo: false,
    has_children: false,
    threesome_ok: false,
    home_visit_ok: false,
    clothing_request_ok: false,
    overnight_ok: false,
    sweet_sadist_ok: false,
    hairless: false,
    deep_kiss: false,
    body_lip: false,
    sixtynine: false,
    fellatio: false,
    sumata: false,
    rotor: false,
    vibrator: false,
    no_panties_visit: false,
    no_bra_visit: false,
    pantyhose: false,
    pantyhose_rip: false,
    instant_cunnilingus: false,
    instant_fellatio: false,
    night_crawling_set: false,
    lotion_bath: false,
    mini_electric_massager: false,
    remote_vibrator_meetup: false,
    holy_water: false,
    anal_fuck: false,
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const validFiles = newFiles.filter(file => {
      const isValid = file.type.startsWith('image/');
      if (!isValid) {
        alert(`${file.name} は画像ファイルではありません`);
      }
      return isValid;
    });

    setImages(prev => [...prev, ...validFiles]);

    // プレビュー生成
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrls: string[] = [];

      // 画像がある場合はアップロード
      if (images.length > 0) {
        const formDataUpload = new FormData();
        images.forEach((image) => {
          formDataUpload.append('images', image);
        });

        const token = localStorage.getItem('token');
        const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/cast-images`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formDataUpload,
        });

        const uploadData = await uploadResponse.json();

        if (!uploadData.success) {
          throw new Error(uploadData.message || '画像のアップロードに失敗しました');
        }

        imageUrls = uploadData.images.map((url: string) => 
          url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${url}`
        );
      }

      // キャスト情報を登録
      const response = await api.post('/casts', {
        ...formData,
        age: parseInt(formData.age),
        height: parseInt(formData.height),
        bust: parseInt(formData.bust),
        waist: parseInt(formData.waist),
        hip: parseInt(formData.hip),
        image_urls: imageUrls,
      });

      if (response.data.success) {
        alert('キャストを登録しました');
        router.push('/admin/casts');
      } else {
        throw new Error(response.data.message || '登録に失敗しました');
      }
    } catch (error: any) {
      console.error('登録エラー:', error);
      alert(error.message || '登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* ヘッダー */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">新規キャスト登録</h1>
          <p className="text-gray-600">キャスト情報を入力してください</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本情報 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">基本情報</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                名前 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="例: さくら"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                年齢 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                min="18"
                max="99"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="例: 28"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                身長 (cm) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                required
                min="140"
                max="200"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="例: 158"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                血液型
              </label>
              <select
                name="blood_type"
                value={formData.blood_type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="">選択してください</option>
                <option value="A">A型</option>
                <option value="B">B型</option>
                <option value="O">O型</option>
                <option value="AB">AB型</option>
              </select>
            </div>
          </div>
        </div>

        {/* スリーサイズ */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">スリーサイズ</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                バスト (cm) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="bust"
                value={formData.bust}
                onChange={handleChange}
                required
                min="70"
                max="150"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="例: 88"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ウエスト (cm) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="waist"
                value={formData.waist}
                onChange={handleChange}
                required
                min="50"
                max="120"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="例: 58"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ヒップ (cm) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="hip"
                value={formData.hip}
                onChange={handleChange}
                required
                min="70"
                max="150"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="例: 85"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                カップ <span className="text-red-500">*</span>
              </label>
              <select
                name="cup_size"
                value={formData.cup_size}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="">選択</option>
                {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].map(cup => (
                  <option key={cup} value={cup}>{cup}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* オプション対応 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">対応可能オプション</h2>
          
          {/* 基本オプション */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">基本オプション</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'threesome_ok', label: '3P可能' },
                { name: 'home_visit_ok', label: '自宅訪問OK' },
                { name: 'clothing_request_ok', label: '服装リクエストOK' },
                { name: 'overnight_ok', label: 'お泊まりOK' },
                { name: 'sweet_sadist_ok', label: '甘サドプレイOK' },
                { name: 'hairless', label: 'パイパン' },
              ].map(option => (
                <label key={option.name} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    name={option.name}
                    checked={formData[option.name as keyof typeof formData] as boolean}
                    onChange={handleChange}
                    className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* プレイ内容 */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">プレイ内容</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'deep_kiss', label: 'Dキス' },
                { name: 'body_lip', label: '全身リップ' },
                { name: 'sixtynine', label: '69' },
                { name: 'fellatio', label: 'フェラ' },
                { name: 'sumata', label: '素股' },
                { name: 'instant_cunnilingus', label: '即クンニ' },
                { name: 'instant_fellatio', label: '即尺' },
                { name: 'anal_fuck', label: 'アナルファックAF' },
              ].map(option => (
                <label key={option.name} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    name={option.name}
                    checked={formData[option.name as keyof typeof formData] as boolean}
                    onChange={handleChange}
                    className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* グッズ */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">グッズ使用</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'rotor', label: 'ローター' },
                { name: 'vibrator', label: 'バイブ' },
                { name: 'mini_electric_massager', label: 'ミニ電マ' },
                { name: 'remote_vibrator_meetup', label: 'とびっこ待ち合わせ' },
              ].map(option => (
                <label key={option.name} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    name={option.name}
                    checked={formData[option.name as keyof typeof formData] as boolean}
                    onChange={handleChange}
                    className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 特殊オプション */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-3">特殊オプション</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'no_panties_visit', label: 'ノーパン訪問' },
                { name: 'no_bra_visit', label: 'ノーブラ訪問' },
                { name: 'pantyhose', label: 'パンスト' },
                { name: 'pantyhose_rip', label: 'パンスト破き' },
                { name: 'night_crawling_set', label: '夜這いセット' },
                { name: 'lotion_bath', label: 'ローション風呂' },
                { name: 'holy_water', label: '聖水' },
              ].map(option => (
                <label key={option.name} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    name={option.name}
                    checked={formData[option.name as keyof typeof formData] as boolean}
                    onChange={handleChange}
                    className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 画像アップロード */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">画像アップロード</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              写真を追加 (JPEG, PNG, GIF対応)
            </label>
            <input
              type="file"
              accept="image/*,.gif"
              multiple
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
            />
            <p className="text-xs text-gray-500 mt-2">
              ※ GIF画像も対応しています。複数枚選択可能です。
            </p>
          </div>

          {/* 画像プレビュー */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`preview ${index + 1}`}
                    className="w-full aspect-[3/4] object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    ×
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                    {images[index]?.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* コメント */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">コメント</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                キャストコメント
              </label>
              <textarea
                name="cast_comment"
                value={formData.cast_comment}
                onChange={handleChange}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                placeholder="キャスト本人からのメッセージを入力してください..."
              />
              <p className="text-xs text-gray-500 mt-1">
                キャスト本人からお客様へのメッセージ
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                店長コメント
              </label>
              <textarea
                name="manager_comment"
                value={formData.manager_comment}
                onChange={handleChange}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                placeholder="店長からのキャスト紹介コメントを入力してください..."
              />
              <p className="text-xs text-gray-500 mt-1">
                店長からキャストの魅力や特徴を紹介
              </p>
            </div>
          </div>
        </div>

        {/* その他情報 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">その他情報</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'has_children', label: '出産経験あり' },
              { name: 'smoking_ok', label: '喫煙する' },
              { name: 'tattoo', label: '刺青あり' },
            ].map(option => (
              <label key={option.name} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  name={option.name}
                  checked={formData[option.name as keyof typeof formData] as boolean}
                  onChange={handleChange}
                  className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
                />
                <span className="text-sm font-medium text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* ステータス */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">ステータス</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                name="is_new"
                checked={formData.is_new}
                onChange={handleChange}
                className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
              />
              <span className="text-sm font-medium text-gray-700">新人として表示</span>
            </label>

            <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                name="is_available"
                checked={formData.is_available}
                onChange={handleChange}
                className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
              />
              <span className="text-sm font-medium text-gray-700">稼働中</span>
            </label>
          </div>
        </div>

        {/* 送信ボタン */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-bold transition-colors"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-pink-500 text-white py-3 rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSave />
            {loading ? '登録中...' : 'キャストを登録'}
          </button>
        </div>
      </form>
    </div>
  );
}

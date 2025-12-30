'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiSave, FiArrowLeft, FiUpload, FiX, FiImage } from 'react-icons/fi';
import api, { castApi } from '@/lib/api';

interface CastImage {
  id: number;
  image_url: string;
  is_primary: number;
  display_order: number;
}

interface Cast {
  id: number;
  name: string;
  age: number;
  height: number;
  weight?: number;
  bust: number;
  waist: number;
  hip: number;
  cup_size: string;
  blood_type?: string;
  hobby?: string;
  specialty?: string;
  profile?: string;
  cast_comment?: string;
  manager_comment?: string;
  profile_text?: string;
  is_new: number;
  is_available?: number;
  smoking_ok: number;
  tattoo: number;
  has_children: number;
  threesome_ok: number;
  home_visit_ok: number;
  clothing_request_ok: number;
  overnight_ok: number;
  sweet_sadist_ok: number;
  hairless: number;
  deep_kiss: number;
  body_lip: number;
  sixtynine: number;
  fellatio: number;
  sumata: number;
  rotor: number;
  vibrator: number;
  no_panties_visit: number;
  no_bra_visit: number;
  pantyhose: number;
  pantyhose_rip: number;
  instant_cunnilingus: number;
  instant_fellatio: number;
  night_crawling_set: number;
  lotion_bath: number;
  mini_electric_massager: number;
  remote_vibrator_meetup: number;
  holy_water: number;
  anal_fuck: number;
  anal_ok?: number;
  sm_ok?: number;
  cosplay_ok?: number;
  toy_ok?: number;
  lotion_ok?: number;
  status?: string;
  images?: CastImage[];
}

export default function EditCastPage() {
  const router = useRouter();
  const params = useParams();
  const castId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cast, setCast] = useState<Cast | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    height: '',
    weight: '',
    bust: '',
    waist: '',
    hip: '',
    cup_size: '',
    blood_type: '',
    hobby: '',
    specialty: '',
    profile: '',
    cast_comment: '',
    manager_comment: '',
    profile_text: '',
    is_new: false,
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
    anal_ok: false,
    sm_ok: false,
    cosplay_ok: false,
    toy_ok: false,
    lotion_ok: false,
    status: 'available',
  });

  const [existingImages, setExistingImages] = useState<CastImage[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);

  useEffect(() => {
    if (castId) {
      fetchCast();
    }
  }, [castId]);

  const fetchCast = async () => {
    try {
      const response = await castApi.getCastById(Number(castId));
      const castData = response.data.cast;
      setCast(castData);

      // フォームデータに変換
      setFormData({
        name: castData.name || '',
        age: String(castData.age || ''),
        height: String(castData.height || ''),
        weight: String(castData.weight || ''),
        bust: String(castData.bust || ''),
        waist: String(castData.waist || ''),
        hip: String(castData.hip || ''),
        cup_size: castData.cup_size || '',
        blood_type: castData.blood_type || '',
        hobby: castData.hobby || '',
        specialty: castData.specialty || '',
        profile: castData.profile || '',
        cast_comment: castData.cast_comment || '',
        manager_comment: castData.manager_comment || '',
        profile_text: castData.profile_text || '',
        is_new: Boolean(castData.is_new),
        is_available: Boolean(castData.is_available ?? true),
        smoking_ok: Boolean(castData.smoking_ok),
        tattoo: Boolean(castData.tattoo),
        has_children: Boolean(castData.has_children),
        threesome_ok: Boolean(castData.threesome_ok),
        home_visit_ok: Boolean(castData.home_visit_ok),
        clothing_request_ok: Boolean(castData.clothing_request_ok),
        overnight_ok: Boolean(castData.overnight_ok),
        sweet_sadist_ok: Boolean(castData.sweet_sadist_ok),
        hairless: Boolean(castData.hairless),
        deep_kiss: Boolean(castData.deep_kiss),
        body_lip: Boolean(castData.body_lip),
        sixtynine: Boolean(castData.sixtynine),
        fellatio: Boolean(castData.fellatio),
        sumata: Boolean(castData.sumata),
        rotor: Boolean(castData.rotor),
        vibrator: Boolean(castData.vibrator),
        no_panties_visit: Boolean(castData.no_panties_visit),
        no_bra_visit: Boolean(castData.no_bra_visit),
        pantyhose: Boolean(castData.pantyhose),
        pantyhose_rip: Boolean(castData.pantyhose_rip),
        instant_cunnilingus: Boolean(castData.instant_cunnilingus),
        instant_fellatio: Boolean(castData.instant_fellatio),
        night_crawling_set: Boolean(castData.night_crawling_set),
        lotion_bath: Boolean(castData.lotion_bath),
        mini_electric_massager: Boolean(castData.mini_electric_massager),
        remote_vibrator_meetup: Boolean(castData.remote_vibrator_meetup),
        holy_water: Boolean(castData.holy_water),
        anal_fuck: Boolean(castData.anal_fuck),
        anal_ok: Boolean(castData.anal_ok),
        sm_ok: Boolean(castData.sm_ok),
        cosplay_ok: Boolean(castData.cosplay_ok),
        toy_ok: Boolean(castData.toy_ok),
        lotion_ok: Boolean(castData.lotion_ok),
        status: castData.status || 'available',
      });

      if (castData.images) {
        setExistingImages(castData.images);
      }
    } catch (error) {
      console.error('キャスト情報取得エラー:', error);
      alert('キャスト情報の取得に失敗しました');
      router.push('/admin/casts');
    } finally {
      setLoading(false);
    }
  };

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

    setNewImages(prev => [...prev, ...validFiles]);

    // プレビュー生成
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imageId: number) => {
    if (confirm('この画像を削除しますか？')) {
      setDeletedImageIds(prev => [...prev, imageId]);
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
    }
  };

  const setPrimaryImage = async (imageId: number) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cast-images/${imageId}/primary`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      // ローカル状態を更新
      setExistingImages(prev =>
        prev.map(img => ({
          ...img,
          is_primary: img.id === imageId ? 1 : 0,
        }))
      );
      
      alert('メイン画像を設定しました');
    } catch (error) {
      console.error('メイン画像設定エラー:', error);
      alert('メイン画像の設定に失敗しました');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // 1. 新しい画像をアップロード
      let newImageUrls: string[] = [];
      if (newImages.length > 0) {
        const formDataUpload = new FormData();
        newImages.forEach((image) => {
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

        newImageUrls = uploadData.images.map((url: string) => 
          url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${url}`
        );
      }

      // 2. キャスト情報を更新
      const response = await api.put(`/casts/${castId}`, {
        ...formData,
        age: parseInt(formData.age),
        height: parseInt(formData.height),
        weight: formData.weight ? parseInt(formData.weight) : null,
        bust: parseInt(formData.bust),
        waist: parseInt(formData.waist),
        hip: parseInt(formData.hip),
      });

      if (!response.data.success) {
        throw new Error(response.data.message || '更新に失敗しました');
      }

      // 3. 削除された画像を削除
      if (deletedImageIds.length > 0) {
        const token = localStorage.getItem('token');
        await Promise.all(
          deletedImageIds.map(imageId =>
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/cast-images/${imageId}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            })
          )
        );
      }

      // 4. 新しい画像を保存
      if (newImageUrls.length > 0) {
        const token = localStorage.getItem('token');
        await Promise.all(
          newImageUrls.map((imageUrl, index) =>
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/cast-images`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                cast_id: castId,
                image_url: imageUrl,
                is_primary: existingImages.length === 0 && index === 0 ? 1 : 0,
                display_order: existingImages.length + index,
              }),
            })
          )
        );
      }

      alert('キャスト情報を更新しました');
      router.push('/admin/casts');
    } catch (error: any) {
      console.error('更新エラー:', error);
      alert(error.message || '更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!cast) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">キャストが見つかりませんでした</p>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            キャスト編集: {cast.name}
          </h1>
          <p className="text-gray-600">キャスト情報を編集してください</p>
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
                体重 (kg)
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                min="30"
                max="150"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="例: 48"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                趣味
              </label>
              <input
                type="text"
                name="hobby"
                value={formData.hobby}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="例: 映画鑑賞、料理"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                特技
              </label>
              <input
                type="text"
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="例: ピアノ、英会話"
              />
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

        {/* 画像管理 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">画像管理</h2>
          
          {/* 既存画像 */}
          {existingImages.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-600 mb-3">既存の画像</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {existingImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.image_url}
                      alt="cast"
                      className="w-full aspect-[3/4] object-cover rounded-lg"
                    />
                    {image.is_primary === 1 && (
                      <div className="absolute top-2 left-2 bg-pink-600 text-white text-xs px-2 py-1 rounded">
                        メイン
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      {image.is_primary !== 1 && (
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(image.id)}
                          className="bg-pink-600 text-white px-3 py-1 rounded text-sm hover:bg-pink-700"
                        >
                          <FiImage className="inline mr-1" />
                          メインに
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeExistingImage(image.id)}
                        className="bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        <FiX />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 新しい画像 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              新しい写真を追加
            </label>
            <input
              type="file"
              accept="image/*,.gif"
              multiple
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
            />
            <p className="text-xs text-gray-500 mt-2">
              ※ 複数枚選択可能です。GIF画像も対応しています。
            </p>
          </div>

          {/* 新しい画像のプレビュー */}
          {newImagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {newImagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`new preview ${index + 1}`}
                    className="w-full aspect-[3/4] object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <FiX />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                    NEW
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* プロフィール */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">プロフィール</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                プロフィール文
              </label>
              <textarea
                name="profile"
                value={formData.profile}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                placeholder="キャストのプロフィールを入力してください..."
              />
            </div>

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
                { name: 'anal_ok', label: 'アナルOK' },
                { name: 'sm_ok', label: 'SM OK' },
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
                { name: 'toy_ok', label: 'おもちゃOK' },
                { name: 'cosplay_ok', label: 'コスプレOK' },
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
                { name: 'lotion_ok', label: 'ローションOK' },
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ステータス
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="available">稼働中</option>
                <option value="unavailable">休止中</option>
                <option value="retired">退店</option>
              </select>
            </div>
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
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-pink-500 text-white py-3 rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSave />
            {saving ? '保存中...' : '変更を保存'}
          </button>
        </div>
      </form>
    </div>
  );
}

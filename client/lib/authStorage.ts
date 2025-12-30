import Cookies from 'js-cookie';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

// Cookie options
const COOKIE_OPTIONS = {
  expires: 30, // 30 days
  sameSite: 'strict' as const,
  secure: process.env.NODE_ENV === 'production'
};

/**
 * 認証情報を保存（localStorage, sessionStorage, cookieの3箇所に保存）
 */
export const saveAuth = (token: string, user: any) => {
  const userStr = typeof user === 'string' ? user : JSON.stringify(user);
  
  console.log('[authStorage] 認証情報を保存開始...');
  
  const results = {
    localStorage: { token: false, user: false },
    sessionStorage: { token: false, user: false },
    cookie: { token: false, user: false }
  };
  
  // localStorage に保存
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, userStr);
    results.localStorage.token = localStorage.getItem(TOKEN_KEY) === token;
    results.localStorage.user = localStorage.getItem(USER_KEY) === userStr;
    console.log('[authStorage] localStorage保存:', results.localStorage);
  } catch (error) {
    console.error('[authStorage] localStorage保存エラー:', error);
  }
  
  // sessionStorage に保存
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, userStr);
    results.sessionStorage.token = sessionStorage.getItem(TOKEN_KEY) === token;
    results.sessionStorage.user = sessionStorage.getItem(USER_KEY) === userStr;
    console.log('[authStorage] sessionStorage保存:', results.sessionStorage);
  } catch (error) {
    console.error('[authStorage] sessionStorage保存エラー:', error);
  }
  
  // Cookie に保存
  try {
    Cookies.set(TOKEN_KEY, token, COOKIE_OPTIONS);
    Cookies.set(USER_KEY, userStr, COOKIE_OPTIONS);
    results.cookie.token = Cookies.get(TOKEN_KEY) === token;
    results.cookie.user = Cookies.get(USER_KEY) === userStr;
    console.log('[authStorage] Cookie保存:', results.cookie);
  } catch (error) {
    console.error('[authStorage] Cookie保存エラー:', error);
  }
  
  console.log('[authStorage] 保存結果:', results);
  
  // 全て失敗した場合はfalseを返す
  const anySuccess = results.localStorage.token || results.sessionStorage.token || results.cookie.token;
  return anySuccess;
};

/**
 * 認証情報を取得（優先度: localStorage → sessionStorage → cookie）
 */
export const getAuth = (): { token: string | null; user: any | null; source: string } => {
  console.log('[authStorage] 認証情報を取得開始...');
  
  // localStorage から取得
  let token = localStorage.getItem(TOKEN_KEY);
  let userStr = localStorage.getItem(USER_KEY);
  
  if (token && userStr) {
    console.log('[authStorage] localStorageから取得成功');
    try {
      return { token, user: JSON.parse(userStr), source: 'localStorage' };
    } catch (error) {
      console.error('[authStorage] localStorageのユーザーデータ解析エラー:', error);
    }
  }
  
  // sessionStorage から取得
  token = sessionStorage.getItem(TOKEN_KEY);
  userStr = sessionStorage.getItem(USER_KEY);
  
  if (token && userStr) {
    console.log('[authStorage] sessionStorageから取得成功');
    try {
      // localStorageにも同期
      try {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, userStr);
        console.log('[authStorage] localStorageに同期完了');
      } catch (e) {
        console.error('[authStorage] localStorage同期エラー:', e);
      }
      return { token, user: JSON.parse(userStr), source: 'sessionStorage' };
    } catch (error) {
      console.error('[authStorage] sessionStorageのユーザーデータ解析エラー:', error);
    }
  }
  
  // Cookie から取得
  token = Cookies.get(TOKEN_KEY) || null;
  userStr = Cookies.get(USER_KEY) || null;
  
  if (token && userStr) {
    console.log('[authStorage] Cookieから取得成功');
    try {
      const user = JSON.parse(userStr);
      // localStorage と sessionStorage にも同期
      try {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, userStr);
        sessionStorage.setItem(TOKEN_KEY, token);
        sessionStorage.setItem(USER_KEY, userStr);
        console.log('[authStorage] storage全体に同期完了');
      } catch (e) {
        console.error('[authStorage] storage同期エラー:', e);
      }
      return { token, user, source: 'cookie' };
    } catch (error) {
      console.error('[authStorage] Cookieのユーザーデータ解析エラー:', error);
    }
  }
  
  console.log('[authStorage] 認証情報が見つかりません');
  return { token: null, user: null, source: 'none' };
};

/**
 * 認証情報をクリア（全て削除）
 */
export const clearAuth = () => {
  console.log('[authStorage] 認証情報をクリア...');
  
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('[authStorage] localStorageクリアエラー:', error);
  }
  
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('[authStorage] sessionStorageクリアエラー:', error);
  }
  
  try {
    Cookies.remove(TOKEN_KEY);
    Cookies.remove(USER_KEY);
  } catch (error) {
    console.error('[authStorage] Cookieクリアエラー:', error);
  }
  
  console.log('[authStorage] クリア完了');
};

/**
 * トークンのみ取得
 */
export const getToken = (): string | null => {
  const { token } = getAuth();
  return token;
};

/**
 * ユーザー情報のみ取得
 */
export const getUser = (): any | null => {
  const { user } = getAuth();
  return user;
};

/**
 * デバッグ: 全ストレージの状態を取得
 */
export const getStorageStatus = () => {
  const status = {
    localStorage: {
      token: !!localStorage.getItem(TOKEN_KEY),
      user: !!localStorage.getItem(USER_KEY)
    },
    sessionStorage: {
      token: !!sessionStorage.getItem(TOKEN_KEY),
      user: !!sessionStorage.getItem(USER_KEY)
    },
    cookie: {
      token: !!Cookies.get(TOKEN_KEY),
      user: !!Cookies.get(USER_KEY)
    }
  };
  
  console.log('[authStorage] ストレージ状態:', status);
  return status;
};

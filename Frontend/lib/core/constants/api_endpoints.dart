import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ApiEndpoints {
  // Configurable base URL:
  // Android Emulator: http://10.0.2.2:8080/api
  // Real Device / LAN: http://192.168.x.x:8080/api
  // Web / Desktop: http://localhost:8080/api
  static const String defaultAndroidBaseUrl = 'http://10.0.2.2:8080/api';
  static const String defaultDesktopBaseUrl = 'http://localhost:8080/api';

  static String _baseUrl = kIsWeb ? defaultDesktopBaseUrl : defaultAndroidBaseUrl;

  static String get baseUrl => _baseUrl;

  static Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    final customUrl = prefs.getString('custom_api_base_url');
    if (customUrl != null && customUrl.isNotEmpty) {
      _baseUrl = customUrl;
    } else if (kIsWeb) {
      _baseUrl = defaultDesktopBaseUrl;
    }
  }

  static Future<void> setBaseUrl(String url) async {
    _baseUrl = url.endsWith('/') ? url.substring(0, url.length - 1) : url;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('custom_api_base_url', _baseUrl);
  }

  // Auth endpoints
  static String get login => '$_baseUrl/auth/login';
  static String get register => '$_baseUrl/auth/register';
  static String get verifyOtp => '$_baseUrl/auth/verify-register-otp';
  static String get forgotPassword => '$_baseUrl/auth/forgot-password';
  static String get resetPassword => '$_baseUrl/auth/reset-password';
  static String get refreshToken => '$_baseUrl/auth/refresh';
  static String get logout => '$_baseUrl/auth/logout';

  // Novels endpoints
  static String get novels => '$_baseUrl/novels';
  static String novelDetail(dynamic id) => '$_baseUrl/novels/$id';
  static String novelChapters(dynamic novelId) => '$_baseUrl/novels/$novelId/chapters';
  static String chapterDetail(dynamic novelId, dynamic chapterId) =>
      '$_baseUrl/novels/$novelId/chapters/$chapterId';
  static String readChapter(dynamic novelId, dynamic chapterId) =>
      '$_baseUrl/novels/$novelId/chapters/$chapterId/read';
  static String unlockChapter(dynamic novelId, dynamic chapterId) =>
      '$_baseUrl/novels/$novelId/chapters/$chapterId/unlock';

  // Categories
  static String get categories => '$_baseUrl/categories';

  // Bookmarks
  static String get bookmarks => '$_baseUrl/bookmarks';
  static String bookmarkByNovel(dynamic novelId) => '$_baseUrl/bookmarks/$novelId';

  // Profile & Coin
  static String get profile => '$_baseUrl/profile';
  static String get coinPackages => '$_baseUrl/coin-packages';
  static String get coinTransactions => '$_baseUrl/profile/transactions';
}

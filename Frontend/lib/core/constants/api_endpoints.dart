import 'package:shared_preferences/shared_preferences.dart';

class ApiEndpoints {
  // Configurable base URL:
  // Cloud (Azure Demo): https://luminovels-prm393-demo.japaneast.cloudapp.azure.com/api
  // Android Emulator (Local): http://10.0.2.2:8080/api
  // Real Device / LAN (Local): http://192.168.x.x:8080/api
  // Web / Desktop (Local): http://localhost:8080/api
  static const String defaultAzureBaseUrl =
      'https://luminovels-prm393-demo.japaneast.cloudapp.azure.com/api';
  static const String defaultAndroidBaseUrl = 'http://10.0.2.2:8080/api';
  static const String defaultDesktopBaseUrl = 'http://localhost:8080/api';

  static String _baseUrl = defaultAzureBaseUrl;

  static String get baseUrl {
    if (_baseUrl.contains('localhost') ||
        _baseUrl.contains('127.0.0.1') ||
        _baseUrl.contains('10.0.2.2')) {
      _baseUrl = defaultAzureBaseUrl;
    }
    return _baseUrl;
  }

  static Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    final customUrl = prefs.getString('custom_api_base_url');
    if (customUrl != null &&
        customUrl.isNotEmpty &&
        !customUrl.contains('localhost') &&
        !customUrl.contains('127.0.0.1') &&
        !customUrl.contains('10.0.2.2')) {
      _baseUrl = customUrl;
    } else {
      _baseUrl = defaultAzureBaseUrl;
      if (customUrl != null) {
        await prefs.remove('custom_api_base_url');
      }
    }
  }

  static Future<void> setBaseUrl(String url) async {
    _baseUrl = url.endsWith('/') ? url.substring(0, url.length - 1) : url;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('custom_api_base_url', _baseUrl);
  }

  // Auth endpoints
  static String get login => '$baseUrl/auth/login';
  static String get register => '$baseUrl/auth/register';
  static String get verifyOtp => '$baseUrl/auth/verify-register-otp';
  static String get forgotPassword => '$baseUrl/auth/forgot-password';
  static String get resetPassword => '$baseUrl/auth/reset-password';
  static String get refreshToken => '$baseUrl/auth/refresh';
  static String get logout => '$baseUrl/auth/logout';

  // Novels endpoints
  static String get novels => '$baseUrl/novels';
  static String novelDetail(dynamic id) => '$baseUrl/novels/$id';
  static String novelChapters(dynamic novelId) => '$baseUrl/novels/$novelId/chapters';
  static String chapterDetail(dynamic novelId, dynamic chapterId) =>
      '$baseUrl/novels/$novelId/chapters/$chapterId';
  static String readChapter(dynamic novelId, dynamic chapterId) =>
      '$baseUrl/novels/$novelId/chapters/$chapterId/read';
  static String unlockChapter(dynamic novelId, dynamic chapterId) =>
      '$baseUrl/novels/$novelId/chapters/$chapterId/unlock';
  static String chapterAudio(dynamic novelId, dynamic chapterId) =>
      '$baseUrl/novels/$novelId/chapters/$chapterId/audio';

  // Categories
  static String get categories => '$baseUrl/categories';

  // Bookmarks
  static String get bookmarks => '$baseUrl/bookmarks';
  static String bookmarkByNovel(dynamic novelId) => '$baseUrl/bookmarks/$novelId';

  // Profile & Coin
  static String get profile => '$baseUrl/profile';
  static String get coinPackages => '$baseUrl/coin-packages';
  static String get coinTransactions => '$baseUrl/profile/transactions';
}
